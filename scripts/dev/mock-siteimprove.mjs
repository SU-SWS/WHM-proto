// A stand-in for the Siteimprove API, built from data/fixtures/siteimprove/,
// for testing the data run without credentials:
//
//   node scripts/dev/mock-siteimprove.mjs            # listens on :8899
//   SITEIMPROVE_BASE_URL=http://localhost:8899 SITEIMPROVE_API_USER=x \
//     SITEIMPROVE_API_KEY=x node scripts/refresh.mjs --site sitesuserguide
//
// MOCK_FAIL=<text> returns HTTP 500 for any path containing that text, to test
// the fallback to last good data. Detail lists the fixtures don't cover (pages
// for each broken link or rule) are filled in from the page inventory fixture.

import http from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.MOCK_PORT ?? 8899);
const SELF = `http://localhost:${PORT}`;
const DIR = path.resolve(import.meta.dirname, "../../data/fixtures/siteimprove");
const load = (name) => JSON.parse(readFileSync(path.join(DIR, name), "utf8"));
// Point every link at the mock, and drop "next" pages the fixtures don't have.
const serve = (data) =>
  JSON.parse(JSON.stringify(data).replaceAll("https://api.us.siteimprove.com/v2", SELF), (k, v) =>
    k === "next" ? undefined : v,
  );

const checks = load("probe-quality_assurance-overview-check_history.json");
const inventory = load("probe2-qa-inventory-pages.json").items;
const pick = (id, n) =>
  Array.from({ length: n }, (_, i) => inventory[(Number(String(id).slice(-4)) + i * 3) % inventory.length]);

const routes = [
  [/\/quality_assurance\/overview\/check_history\/(\d+)\/broken_links\?page_size=1$/, ([, id]) => {
    const c = checks.items.find((x) => String(x.id) === id);
    return { items: [], total_items: c ? c.broken_links - 11 : 0, total_pages: 1, links: {} };
  }],
  [/\/quality_assurance\/overview\/check_history\/\d+\/broken_links/, () => load("probe2-check-broken_links.json")],
  [/\/quality_assurance\/overview\/check_history/, () => checks],
  [/\/quality_assurance\/links\/broken_links\/(\d+)\/pages/, ([, id]) => {
    const items = pick(id, 1 + (Number(id) % 3)).map((p) => ({ ...p, broken_links: 1 }));
    return { items, total_items: items.length, total_pages: 1, links: {} };
  }],
  [/\/a11y\/overview\/site_target\/history/, () => load("probe2-site_target-history-page_size_500.json")],
  [/\/analytics\/content\/most_popular_pages/, () => load("probe2-analytics-most_popular_pages-30_days.json")],
  [/\/analytics\/overview\/history/, () => load("probe2-analytics-overview-history-since_april.json")],
  [/\/a11y\/issue_kinds\/confirmed\/issues\/113\/pages/, () => load("probe2-a11y-issue-pages-few.json")],
  [/\/a11y\/issue_kinds\/confirmed\/issues\/(111|73|66)\/pages/, () => load("probe2-a11y-issue-pages-most.json")],
  [/\/a11y\/issue_kinds\/confirmed\/issues\/(\d+)\/pages/, ([, rule]) => {
    const items = pick(rule, 4).map((p) => ({ id: p.id, title: p.title, url: p.url, occurrences: 1 }));
    return { items, total_items: items.length, total_pages: 1, links: {} };
  }],
  [/\/a11y\/issue_kinds\/confirmed\/issues/, () => load("probe-a11y-issue_kinds-confirmed-issues.json")],
  [/\/seov2\/issues/, () => load("probe2-seov2-issues.json")],
];

http
  .createServer((req, res) => {
    const fail = process.env.MOCK_FAIL;
    if (fail && req.url.includes(fail)) {
      res.writeHead(500);
      return res.end();
    }
    for (const [re, handler] of routes) {
      const m = req.url.match(re);
      if (m) {
        res.writeHead(200, { "content-type": "application/json" });
        return res.end(JSON.stringify(serve(handler(m))));
      }
    }
    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => console.log(`Mock Siteimprove API on ${SELF}${process.env.MOCK_FAIL ? ` (failing "${process.env.MOCK_FAIL}")` : ""}`));
