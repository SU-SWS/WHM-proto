// Saves real Siteimprove responses for review, before code depends on them
// (CLAUDE.md: endpoints are checked against a saved response first).
//
// Usage: node scripts/save-fixtures.mjs DIR
//
// Run by the "Save Siteimprove fixtures" workflow, which uploads DIR as a
// short-lived artifact. Nothing is committed: review the files, then copy the
// ones you want into data/fixtures/siteimprove/.
//
// Before saving, every response is cleaned: impmd is stripped from links
// (decisions, Nov 20), and staff-name fields (created_by, edited_by) are
// replaced with "[REMOVED]", because the repo is public and holds no names.
// Never add personal ID numbers, email addresses or phone numbers here (AD-7).
//
// To verify something new, replace the probe below. Earlier rounds are saved
// as data/fixtures/siteimprove/probe-*.json to probe3-*.json; their code is in git history.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, scrubImpmd } from "./lib/siteimprove.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!outDir) {
  console.error("Usage: node scripts/save-fixtures.mjs DIR");
  process.exit(1);
}
const client = createClient();
if (!client) {
  console.error("SITEIMPROVE_API_USER and SITEIMPROVE_API_KEY must be set.");
  process.exit(1);
}

const NAME_FIELDS = new Set(["created_by", "edited_by"]);
const clean = (v) => {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, NAME_FIELDS.has(k) ? "[REMOVED]" : clean(x)]));
  return v;
};

async function save(name, target) {
  let data;
  try {
    data = await client.get(target);
  } catch (err) {
    data = { _whm_error: err.message };
  }
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(clean(scrubImpmd(data)), null, 2) + "\n");
  console.log(`Saved ${name}.json${data._whm_error ? ` (${data._whm_error})` : ""}`);
  return data._whm_error ? null : data;
}

const limit = (href, n) => `${href}${href.includes("?") ? "&" : "?"}page_size=${n}`;
/**
 * Round 4 (Nov 23): pages missing a search description (SP-2). The page list
 * is verified and saved; this run saves its history, so a change since the
 * last check can be shown once checked.
 */
async function probesRound4(id) {
  const detail = await save("probe4-seov2-meta-desc-missing", `/sites/${id}/seov2/issues/meta_desc_missing?page_size=10`);
  // The page list is the response itself (saved Nov 23). Its history link is next to verify.
  const history = detail?.links?.history?.href;
  if (history) await save("probe4-seov2-meta-desc-missing-history", limit(history, 10));
}

const registry = JSON.parse(await readFile(path.join(ROOT, "data", "registry.json"), "utf8"));
const sites = registry.sites.filter((s) => s.live && s.siteimproveSiteId);
for (const site of sites) await probesRound4(site.siteimproveSiteId);
console.log(`Done: ${client.calls()} API calls.`);
