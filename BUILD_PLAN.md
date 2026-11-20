# Build plan

Ordered tasks for the December 8, 2026 prototype. Each task lists what "done" means. Requirement IDs refer to `docs/requirements.md`. Tasks 1 to 7 cover the approved project description; task 8 adds the brief's extras.

## 0. Setup (Shane)

- [x] Repo created in SU-SWS: `WHM-proto`. Settings → Pages → Source: "GitHub Actions".
- [x] Actions secrets added: `SITEIMPROVE_API_USER`, `SITEIMPROVE_API_KEY`.
- [x] `siteimproveSiteId` filled in for sitesuserguide in `data/registry.json`.
- [x] The four project docs exported into `docs/` (see `docs/README.md`).

## 1. Scaffold and stack check

- Create the Next.js 16 app (TypeScript, App Router). Decline the create-next-app Tailwind option, because it installs Tailwind v4.
- Install `tailwindcss@3.4`, `postcss`, `autoprefixer`, `decanter@7.5.3`. Add `presets: [require('decanter')]` to `tailwind.config.js`.
- `next.config`: `output: 'export'`, `basePath: '/[INSERT REPO NAME]'`, `images: { unoptimized: true }`, `trailingSlash: true`.
- Add a `noindex` meta tag to the root layout and `public/robots.txt` with `Disallow: /`.
- Add `.github/workflows/deploy.yml`: on push to `main`, run `npm ci`, `next build`, `actions/upload-pages-artifact` (path `out`), `actions/deploy-pages`.

**Done when:** a page styled with Decanter classes deploys to GitHub Pages under the basePath.

## 2. Data layer

- TypeScript types for every file in `docs/data-contract.md`.
- Loaders that read `data/published/` at build time. Seed `data/published/` as a copy of `data/sample/`.
- One helper that formats data age and source for any section (AD-4).

**Done when:** the build reads all three sites' data and prints each site's name, Site Target Score and source.

## 3. Owner pages (match `reference/whm-demo.html`)

- `/` portfolio rollup, ordered by need (AC-3).
- `/sites/[site]`:
  - verdict and lede, plus readings in this order: Site Target Score, accessibility score, broken links, pages not updated in a year (simulated), search descriptions (SP-1, SP-7)
  - issue list with "Prioritized for me" and "Show everything plainly", category labels on every row, and "Being handled by SWS" (SP-3, SP-4, SP-5)
  - trend charts for Site Target Score (goal line at 100), accessibility score, broken links and page views, each with a table alternative (SP-6)
  - most visited pages with engagement, labeled sample (CT-2)
  - content report summary, labeled sample (CT-4); site search terms, labeled sample (CT-5); speed check, optional (SP-8)
- `/sites/[site]/issues/[issue]`: what it is, why it matters, what to do, who fixes it, SWS note, affected pages, "Open in Siteimprove" link, data age (SP-2, SP-5, AD-4).
- `/sites/[site]/report`: the sample AI content report, clearly labeled.

**Done when:** every owner screen in the reference demo exists on sample data, keyboard-operable, with source and data age shown.

## 4. SWS and admin pages

- `/sws`: every client site ranked by need, with owners, open owner items and latest data (AC-8).
- `/admin`: registry table from `data/registry.json`; a "Start data run" link that opens the refresh workflow in GitHub Actions (Option A); run status from `status.json` (AD-1, AD-2, AD-3).

**Done when:** an administrator can follow "Start data run" to the workflow and see each site's last result on the admin page.

## 5. Refresh workflow (sample mode)

- `.github/workflows/refresh-data.yml`: `workflow_dispatch` with input `site` (default `all`), plus a weekly schedule. It runs `scripts/refresh.mjs`, commits `data/published/`, then builds and deploys **in the same workflow**, because commits made with the default token don't trigger other workflows.
- `scripts/refresh.mjs` in sample mode copies `data/sample/` to `data/published/` and writes `status.json`.

**Done when:** a manual run updates `status.json`, redeploys, and the admin page shows the new result.

## 6. Live Siteimprove data (sitesuserguide only)

Verify each endpoint first: call it once, save the real response to `data/fixtures/siteimprove/`, then write code against the fixture. See `docs/siteimprove-endpoints.md`. In order:

1. Site Target Score: `GET /sites/{site_id}/a11y/overview/site_target/overview` (used by an earlier SWS script; save a fixture first). History: `a11y/overview/site_target/history` (daily from Aug 2025; fixture saved).
2. Accessibility and other headline scores with history (SI-02 to SI-04).
3. Traffic and top pages from Siteimprove Analytics (SI-27, SI-28).
4. Broken links count, trend and list (SI-11, SI-13).
5. Accessibility issues and the pages they're on (SI-05, SI-08).
6. Stanford policies and matches, dropping SWS-only policies (SI-23, SI-24, AD-7).

Then:

- URL normalization (Q-5) and traffic-weighted ranking (SP-3, X-01).
- "Open in Siteimprove" links from each response's `_siteimprove` section (SP-2).
- Merge each live section over its sample section and record `source: "live"`.
- On failure, keep the last good data and record the reason in `status.json` (Q-7).

**Done when:** one run refreshes sitesuserguide from Siteimprove, and every section that isn't live is still labeled sample.

**Status (Nov 20):** built in `scripts/lib/live-site.mjs` and tested against `scripts/dev/mock-siteimprove.mjs`, which serves the saved fixtures. Live: both scores and their trends, broken links (count, trend, issues), accessibility issues, page views and top pages, search descriptions, and the check date. First real run published Nov 20. The daily recorder is retired (the API has the history). "Open in Siteimprove" links are on, per page, with `impmd` stripped. Stanford policies are live for allowlisted policies (Nov 20). Task 6 is complete apart from SWS review of the drafted wording.

## 7. Check and rehearse

- Run an axe check on every page, test keyboard-only use and phone width, and confirm every chart has a table alternative (Q-1).
- Confirm no secrets, names or emails appear in the repo or in the published files.
- Write a short demo script, including a note that GA4 sections and the AI report are samples. Do two rehearsals.

## 8. After the approved items

- Per-page tracking: To do, Waiting for next check, Still correct, Set aside until [date]; bulk select; a status filter; an issue-level summary; stored in `localStorage` with try/catch (TR-1, TR-2).
- Notes shared with co-owners (TR-3). SWS notes from `data/annotations.json` (TR-4, TR-5).
- "Viewing as" switch driven by registry owners (AC-2).
- Static email view (AC-4) and share view (AC-6).

**Status (Nov 20):** built, then revised to keep one system of record (TR-1 and TR-2 revised, decisions Nov 20). Editorial issues (content freshness) are reviewed page by page in `components/Tracking.tsx`, saved in the browser only. Issues Siteimprove detects have no WHM fix status: the data run compares each check with the last and shows “N pages fixed since the check of [date], N new,” and owners fix and recheck in Siteimprove. Notes stay on every issue. “Viewing as” (`components/Viewer.tsx`) starts as the SWS administrator, filters “Your sites”, and gates site, SWS and admin pages. The admin page lists the SWS specialist notes. Email view: `/email/[site]`. Share view: `/sites/[site]/share`, printable, top 5 changes.

## Parallel work

After task 2, three workstreams meet only at the data contract, so they can run as parallel subagents:

- pages (tasks 3, 4 and 8)
- workflows (task 1's deploy file and task 5)
- live fetch (task 6)
