// The data run. Writes data/published/, which the site builds from.
//
// Usage: node scripts/refresh.mjs [--site <siteKey>|all]
//
// Sites with `live: true` in the registry are fetched from Siteimprove
// (scripts/lib/live-site.mjs), starting from their sample file and replacing
// each section fetched successfully (docs/data-contract.md, "How the refresh
// merges data"). Other sites copy their files from data/sample/. Sites not
// chosen keep their published files and status.
//
// portfolio.json is rebuilt from the published site files every run, so the
// rollup can never disagree with the site pages (Q-4).

import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { readGa4 } from "./lib/ga4.mjs";
import { buildLiveSite } from "./lib/live-site.mjs";
import { fixerFor } from "./lib/fixer.mjs";
import { createClient } from "./lib/siteimprove.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.join(ROOT, "data");
const SAMPLE = path.join(DATA, "sample");
const PUBLISHED = path.join(DATA, "published");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

/** Writes via a temp file, so a failed run never leaves half a file behind. */
async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n");
  await rename(tmp, file);
}

async function readJsonOr(file, fallback) {
  try {
    return await readJson(file);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

const arg = process.argv.indexOf("--site");
const which = arg > -1 ? process.argv[arg + 1] : "all";

const registry = await readJson(path.join(DATA, "registry.json"));
const issueTypes = await readJson(path.join(DATA, "issue-types.json"));
const annotations = await readJson(path.join(DATA, "annotations.json"));
const known = registry.sites.map((s) => s.key);
if (which !== "all" && !known.includes(which)) {
  console.error(`Unknown site "${which}". Use "all" or one of: ${known.join(", ")}.`);
  process.exit(1);
}
const chosen = registry.sites.filter((s) => which === "all" || s.key === which);

const startedAt = new Date().toISOString();
const previous = await readJsonOr(path.join(PUBLISHED, "status.json"), { sites: {} });
const siteStatus = { ...previous.sites };

const client = createClient();

for (const site of chosen) {
  try {
    // The AI report is a labeled sample for every site until the MVP.
    await copyFile(path.join(SAMPLE, "reports", `${site.key}.json`), path.join(PUBLISHED, "reports", `${site.key}.json`));
    if (site.live) {
      siteStatus[site.key] = await refreshLive(site);
    } else {
      await copyFile(path.join(SAMPLE, "sites", `${site.key}.json`), path.join(PUBLISHED, "sites", `${site.key}.json`));
      siteStatus[site.key] = { result: "sample", reason: null, finishedAt: new Date().toISOString(), source: "sample" };
      console.log(`${site.key}: sample data published`);
    }
  } catch (err) {
    // Keep whatever was published before; never show old numbers as current (Q-7).
    siteStatus[site.key] = {
      result: "failed",
      reason: err.message,
      finishedAt: new Date().toISOString(),
      source: previous.sites?.[site.key]?.source ?? "sample",
    };
    console.error(`${site.key}: ${err.message}. Its last published data is kept.`);
  }
}

/** Fetches a live site. Throws (and keeps the published file) if it can't get a check date. */
async function refreshLive(site) {
  if (!client) throw new Error("Siteimprove credentials aren’t set, so live data couldn’t be fetched");
  if (!site.siteimproveSiteId) throw new Error("The registry has no Siteimprove site ID for this site");
  const sample = await readJson(path.join(SAMPLE, "sites", `${site.key}.json`));
  const published = await readJsonOr(path.join(PUBLISHED, "sites", `${site.key}.json`), null);
  // A site with a GA4 property takes all its analytics from the Apps Script export (decisions, Nov 23).
  const ga4 = site.ga4PropertyId ? await readGa4(ROOT, site) : { data: null, note: null };
  const { data, sections, notes } = await buildLiveSite({ site, sample, previous: published, issueTypes, annotations, client, ga4: ga4.data });
  if (ga4.note) notes.push(ga4.note);
  await writeJson(path.join(PUBLISHED, "sites", `${site.key}.json`), data);

  const fellBack = Object.entries(sections).filter(([, s]) => s.source !== "live");
  const reason = [
    ...fellBack.map(([name, s]) => `${name}: ${s.reason} (showing ${s.source === "kept" ? "last good" : "sample"} data)`),
    ...notes,
  ].join("; ");
  console.log(`${site.key}: live data published (${client.calls()} API calls)${reason ? `. ${reason}` : ""}`);
  return { result: "complete", reason: reason || null, finishedAt: new Date().toISOString(), source: "live" };
}

// Rebuild the rollup from what's now published, in registry order.
const portfolioSites = [];
for (const key of known) {
  const s = await readJsonOr(path.join(PUBLISHED, "sites", `${key}.json`), null);
  if (!s) continue;
  portfolioSites.push({
    key: s.siteKey,
    name: s.name,
    url: s.url,
    state: s.state,
    verdict: s.verdict,
    siteTargetScore: s.readings.siteTargetScore.value,
    accessibilityScore: s.readings.accessibilityScore.value,
    brokenLinks: s.readings.brokenLinks.value,
    openOwnerIssues: s.issues.filter((i) => fixerFor({ siteKey: s.siteKey, issue: i, types: issueTypes.types, annotations }) === "owner").length,
    checkedAt: s.checkedAt,
    source: s.source,
  });
}
await writeJson(path.join(PUBLISHED, "portfolio.json"), {
  schemaVersion: 1,
  generatedAt: startedAt.slice(0, 10),
  sites: portfolioSites,
});

await writeJson(path.join(PUBLISHED, "status.json"), {
  schemaVersion: 1,
  runId: process.env.GITHUB_RUN_ID ?? null, // matched by the admin page (AD-3)
  startedAt,
  finishedAt: new Date().toISOString(),
  sites: siteStatus,
});

const failed = chosen.filter((s) => siteStatus[s.key].result === "failed");
console.log(`Done: ${chosen.length - failed.length} of ${chosen.length} sites updated.`);
// A failed site is recorded in status.json and the run still publishes, so
// the other sites update and the failure is visible on the admin page.
