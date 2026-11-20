// Records the Site Target Score for each live site, once per day, into
// data/history/<siteKey>.json. The Siteimprove API keeps no history for this
// score, so WHM builds its own (decisions.md, Nov 19).
//
// Usage:
//   node scripts/record-site-target.mjs                 record today's score
//   node scripts/record-site-target.mjs --fixtures DIR  also save the raw
//     responses to DIR for review before anything depends on them
//
// Needs SITEIMPROVE_API_USER and SITEIMPROVE_API_KEY in the environment.
// Values are stored exactly as Siteimprove returns them, under Siteimprove's
// field names, until a reviewed fixture shows what they mean (for example,
// whether the percentage is 0–100 or 0–1).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// docs/siteimprove-endpoints.md. The override is for testing against a mock server.
const BASE_URL = process.env.SITEIMPROVE_BASE_URL ?? "https://api.us.siteimprove.com/v2";
const ROOT = path.resolve(import.meta.dirname, "..");
const HISTORY_DIR = path.join(ROOT, "data", "history");

const user = process.env.SITEIMPROVE_API_USER;
const key = process.env.SITEIMPROVE_API_KEY;
if (!user || !key) {
  console.error("SITEIMPROVE_API_USER and SITEIMPROVE_API_KEY must be set.");
  process.exit(1);
}
const auth = `Basic ${Buffer.from(`${user}:${key}`).toString("base64")}`;

const fixturesArg = process.argv.indexOf("--fixtures");
const fixturesDir = fixturesArg > -1 ? path.resolve(process.argv[fixturesArg + 1] ?? "") : null;

/** GET a Siteimprove path, retrying rate limits and server errors with backoff. */
async function get(apiPath) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${BASE_URL}${apiPath}`, {
      headers: { Authorization: auth, Accept: "application/json" },
    });
    if (res.ok) return res.json();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === 4) {
      throw new Error(`GET ${apiPath} returned HTTP ${res.status}`);
    }
    const wait = Number(res.headers.get("retry-after")) * 1000 || 2 ** attempt * 1000;
    console.log(`GET ${apiPath}: HTTP ${res.status}, retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

async function saveFixture(name, data) {
  if (!fixturesDir) return;
  await mkdir(fixturesDir, { recursive: true });
  await writeFile(path.join(fixturesDir, name), JSON.stringify(data, null, 2) + "\n");
  console.log(`Saved fixture ${name}`);
}

// Endpoints to verify for task 6, taken from the `_links` in GET /sites/{id}
// (data/fixtures/siteimprove/site-sitesuserguide.json). Lists are kept short.
// Left out on purpose: policies (may include SWS-only items, AD-7), and
// personal ID numbers, email addresses and phone numbers (personal data).
const PROBES = [
  "a11y/overview/site_target/history",
  "a11y/overview/summary",
  "a11y/overview/progress/history",
  "a11y/issue_kinds/confirmed/issues?page_size=10",
  "dci/overview",
  "dci/history?page_size=10",
  "quality_assurance/overview/check_history?page_size=10",
  "quality_assurance/links/history?page_size=10",
  "quality_assurance/links/broken_links?page_size=10",
  "quality_assurance/links/pages_with_broken_links?page_size=10",
  "analytics/overview/history",
  "analytics/content/most_popular_pages?page_size=10",
  "content/crawl",
];

/** Saves each probe's response, or its HTTP error, without failing the run. */
async function probe(id) {
  for (const p of PROBES) {
    const name = `probe-${p.split("?")[0].replaceAll("/", "-")}.json`;
    try {
      await saveFixture(name, await get(`/sites/${id}/${p}`));
    } catch (err) {
      await saveFixture(name, { _whm_error: err.message });
    }
  }
}

async function readHistory(siteKey) {
  try {
    return JSON.parse(await readFile(path.join(HISTORY_DIR, `${siteKey}.json`), "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    return { schemaVersion: 1, siteKey, points: [] };
  }
}

const registry = JSON.parse(await readFile(path.join(ROOT, "data", "registry.json"), "utf8"));
const sites = registry.sites.filter((s) => s.live && s.siteimproveSiteId);
if (sites.length === 0) {
  console.error("No live site with a siteimproveSiteId in data/registry.json.");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
let failures = 0;

for (const site of sites) {
  const id = site.siteimproveSiteId;
  try {
    if (fixturesDir) {
      // The site list covers every Stanford site; keep only this one so the
      // fixture shows the response shape without listing other sites.
      const list = await get(`/sites?page=1&page_size=500`);
      const items = Array.isArray(list.items) ? list.items.filter((i) => i.id === id) : list.items;
      await saveFixture("sites.json", { ...list, items, _whm_note: "items trimmed to this site only" });
      await saveFixture(`site-${site.key}.json`, await get(`/sites/${id}`));
      await probe(id);
    }

    const overview = await get(`/sites/${id}/a11y/overview/site_target/overview`);
    await saveFixture(`site-target-overview-${site.key}.json`, overview);

    const history = await readHistory(site.key);
    const point = {
      date: today, // UTC day WHM recorded it, not necessarily the day Siteimprove checked
      site_target_percentage: overview.site_target_percentage ?? null,
      accessibility_dci_score: overview.accessibility_dci_score ?? null,
    };
    if (point.site_target_percentage === null) {
      throw new Error("response has no site_target_percentage");
    }
    // One point per day: a second run on the same day replaces the first.
    history.points = [...history.points.filter((p) => p.date !== today), point].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    await mkdir(HISTORY_DIR, { recursive: true });
    await writeFile(path.join(HISTORY_DIR, `${site.key}.json`), JSON.stringify(history, null, 2) + "\n");
    console.log(`${site.key}: site_target_percentage ${point.site_target_percentage} on ${today}`);
  } catch (err) {
    failures++;
    console.error(`${site.key}: ${err.message}. History left unchanged.`);
  }
}

process.exit(failures ? 1 : 0);
