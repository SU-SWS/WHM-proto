# WHM Prototype Plan

Nov 12, 2026 · @Someone

## Architecture at a glance

A GitHub Actions workflow does all data gathering and writes JSON. The Next.js site on GitHub Pages only reads that JSON, so no credentials reach the browser.

&#91;embedded content: prototype architecture · data run to static site\]

The admin page's "Start data run" starts the workflow. Owner tracking state stays in the browser for the prototype.

## Components and decisions

The prototype is a static Next.js site on GitHub Pages. All secrets and API calls live in a GitHub Actions workflow, which writes JSON files that the site reads.

| Component | What it does | Prototype choice | MVP direction |
| --- | --- | --- | --- |
| Registry | Sites, owners, source IDs, SWS annotations, issue-type text (AD-1, TR-4, OT-04, X-06) | JSON files in the repo (decision, Nov 13): `data/registry.json` for sites, owners (role labels) and source IDs; `data/annotations.json` for SWS notes; `data/issue-types.json` for plain-language issue text. Edited by committing changes. | A database with an admin screen (AD-8) |
| Data run | Reads the registry, calls the sources, writes JSON and the AI report | GitHub Actions workflow, `workflow_dispatch` with a `site` input, plus a weekly schedule for a continuous picture | Scheduled jobs plus on-demand runs |
| Source data | Siteimprove: health scores, issues, pages, crawl dates. GA4: traffic, engagement, landing pages, site search. | Siteimprove API v2 (`https://api.siteimprove.com/v2`), Basic auth, including Siteimprove Analytics (SI-27, SI-28) for traffic if it is on for the site. No Google Analytics in the prototype (decision, Nov 13). | Adds the GA4 Data API (`runReport`) through a service account, and a freshness source chosen at Gate 2 |
| Processing | URL normalization; traffic-weighted priority (Siteimprove issue pages joined to page views from Siteimprove Analytics, or from GA4 once the MVP adds it); owner or SWS fixable; admin-only filter (Q-5, X-01, X-06, AD-7) | Node script in the repo, run by the workflow | Same logic as a service |
| AI content report | Compares public page text with GA4 top pages, landing pages, engagement and search terms; recommends changes (CT-4) | A labeled sample `report.json` (decision, Nov 13); no Claude API call in the prototype | Script fetches the text of the top pages and sends it with GA4 data to Claude Sonnet 5.5 (`claude-sonnet-5-5`) through the Claude API; SWS reviews it before owners see it |
| Speed check | PageSpeed Insights for the top 3 pages (SP-8) | Optional script step, live site only | Wider coverage (Phase 3) |
| Published data | One JSON file per site, plus a portfolio file and a status file | Committed to the repo and deployed with the site | API behind sign-in |
| Web front end | Owner views, SWS all-sites view, share view, email views, admin page | Next.js 16 static export, Tailwind 3.4, `decanter@7.5.3` preset, Source Sans 3 and Source Serif 4 | Next.js with server rendering and Stanford sign-in |
| Owner state | Status for each affected page (to do, waiting for next check, still correct, set aside), a progress summary per issue, and notes (TR-1 to TR-3) | Browser `localStorage`: one browser only, for demonstration | Database, shared across co-owners |
| Access concept | Which owner sees which sites (AC-2) | A "Viewing as" switch driven by the owners in the registry file; not enforced | Stanford SSO plus per-site permissions |
| Sample mode | Lets the demo run without live data | Sample JSON with `"source": "sample"` for the two non-live sites, and for the live site's Google Analytics sections and AI report, labeled on every screen | Removed |

**What is public.** A GitHub Pages site from a public repo is visible to anyone, and so are the committed JSON files.

- The published JSON carries only site URLs, scores, issue counts, page paths, traffic numbers and the AI report. Owners appear only as role labels; no names or emails are stored in the repo.
- SWS-only items (AD-7) are dropped before anything is written.
- The sample AI report is public too, and is labeled as a sample wherever it appears.
- Private Pages isn't available to SU-SWS (confirmed Nov 13), so the fair site is public, including live Siteimprove findings for sitesuserguide.stanford.edu. Every page carries a noindex tag and the site has a robots.txt asking search engines not to index it. That keeps it out of search results but doesn't restrict who can open it. The registry file is public too, so its owner entries hold role labels only.

## The run button

A static page can't hold a secret, so the button has to start the GitHub workflow in a way that keeps the Siteimprove credentials inside GitHub. The build uses Option A (decided Nov 13). Option B stays documented in case the extra click in GitHub becomes a problem.

|  | Option A: open the workflow in GitHub | Option B: start it from the page |
| --- | --- | --- |
| What the admin does | Selects "Start data run"; GitHub opens the workflow page; the admin selects "Run workflow" there | Pastes a fine-grained GitHub token (Actions: write, this repo only) once per session, then selects "Start data run" |
| How it works | Link to the workflow's page in the repo's Actions tab | The page calls the workflow dispatch endpoint of the GitHub REST API with the token |
| Who can run it | Anyone with write access to the repo | Anyone holding a valid token |
| Token handling | None | Kept in page memory only; never saved or committed |
| Fit with AD-2 | One extra click, in GitHub | Fully in the prototype |

**How completion is shown (AD-3), either option:**

1. The workflow writes `status.json` with the run ID and, for each site, the result (complete or failed, with the reason), the finish time, and whether the data is live or sample.
2. While a run is active, the admin page checks the GitHub REST API's workflow-runs list for the repo about every 15 seconds. It shows queued, running, or finished.
3. When the deploy step finishes, the page reloads `status.json`. Once its run ID matches, each site's row shows its result and the time.

For a public repo, the workflow-runs list can be read without a token. With a private repo, the page relies on status.json alone, because reading the runs list needs a token.

## Implementation plan: sample data on GitHub Pages

These steps produce a working fair site. Steps 1 to 6 and 9 cover the approved deliverable and come first; step 7 adds the brief's tracking features if time allows.

1. **Create the repo.** Name it `SU-SWS/[INSERT REPO NAME]`. Set Settings → Pages → Source to "GitHub Actions."
2. **Scaffold the app.** Run `create-next-app` with TypeScript and the App Router, and decline its Tailwind option, because it installs Tailwind v4. Then:
   1. Install `tailwindcss@3.4`, `postcss`, `autoprefixer` and `decanter@7.5.3`.
   2. Add `presets: [require('decanter')]` to `tailwind.config.js`.
   3. Load Source Sans 3 and Source Serif 4.
3. **Set up the static export.** In `next.config`, set `output: 'export'`, `basePath: '/[INSERT REPO NAME]'`, `images: { unoptimized: true }` and `trailingSlash: true`.
4. **Add the sample data.** Add `data/sample/portfolio.json`, `data/sample/sites/<site-key>.json`, `data/sample/reports/<site-key>.json` and `data/status.json`, using the same structure the live fetch will write. Base the content on the demo, with `"source": "sample"` in every file.
5. **Build the owner pages**, using `generateStaticParams` for site and issue IDs:
   - `/`: portfolio rollup with the "Viewing as" switch.
   - `/sites/[site]`: verdict, category indicators, issue feed (prioritized and plain), trends for Site Target Score, accessibility, broken links and traffic, each with a table alternative, plus the speed check.
   - `/sites/[site]/report`: the AI content report, with its review status.
   - `/sites/[site]/issues/[issue]`: what it is, why it matters, what to do, who fixes, SWS note, affected pages, Siteimprove link.
6. **Build the SWS and supporting pages:**
   - `/sws`: all client sites ranked by need, with owners and last run (AC-8).
   - `/admin`: registry table, a "Start data run" link to the workflow in GitHub Actions (Option A), run status.
   - `/sites/[site]/share` and `/email/[site]`: share and email views.
7. **Add tracking state (brief, after the approved items).** A small client-side store saves the status of each affected page, keyed by site, issue and normalized page URL (waiting for next check, still correct, set aside), plus notes, to `localStorage`, wrapped in try/catch. Notes are labeled as visible to all owners of the site.
8. **Deploy.** Add `.github/workflows/deploy.yml`: on push to `main`, run `npm ci`, `next build`, `actions/upload-pages-artifact` (path `out`) and `actions/deploy-pages`.
9. **Add the data workflow.** Add `.github/workflows/refresh-data.yml` with a `workflow_dispatch` input `site` (default `all`) and a weekly schedule. It runs `scripts/refresh.mjs`, commits `data/`, then builds and deploys. On sample data, the script copies the sample files and writes `status.json`, so the button works before live data exists.
10. **Check and rehearse.** Run an axe check on every page, test keyboard-only use, and test at phone width. Then do two rehearsals using the demo script.

**Subagents.** When the build moves to Claude Code, three parts can run in parallel because they meet only at the JSON structure: the page build (steps 5 to 7), the workflows (steps 8 and 9), and the live fetch (next section).

## Adding live Siteimprove data

Live data comes in for one site, sitesuserguide.stanford.edu (switched from webservices.stanford.edu, Nov 13), from Siteimprove only, one slice at a time. Each slice works on its own, and any slice that isn't live yet falls back to labeled sample data. Google Analytics data and the AI report stay as labeled samples until the MVP; their slices are kept in the table below for the MVP build.

**Setup (once)**

1. A Siteimprove account owner or administrator creates an API user with access to the live site, and an API key for it. API calls get that user's permissions ([Siteimprove help](https://help.siteimprove.com/support/solutions/articles/80000448206-how-to-connect-to-the-siteimprove-api)).
2. Add the Siteimprove site ID for sitesuserguide.stanford.edu to `data/registry.json` and commit it. Owner entries hold role labels only, because the repo and site are public.
3. Store the secrets in the repo: `SITEIMPROVE_API_USER` and `SITEIMPROVE_API_KEY`. A Google service account and `ANTHROPIC_API_KEY` are added for the MVP.
4. Sign in to the Siteimprove API documentation with the API user. Check each endpoint below in Swagger before writing code, and save one real response per endpoint as a test fixture ([API reference](https://developer.siteimprove.com/api-reference.html)).
5. Confirm the Siteimprove base URL for Stanford's account. The documentation shows both `api.siteimprove.com/v2` and `api.eu.siteimprove.com/v2` ([API docs](https://api.siteimprove.com/v2/documentation)).

**Slices, in order**

| # | Slice | Source and endpoint (inventory ID) | Feeds | Verified? |
| --- | --- | --- | --- | --- |
| 1 | Site Target Score and trend | Siteimprove; endpoint to find \[CONFIRM ENDPOINT\] | SP-1 (primary score), SP-6 | Not in the inventory; SWS confirms it can be retrieved |
| 2 | Accessibility and other headline scores, with trend | Siteimprove `/sites/{id}/dci/overview` and `/dci/history` (SI-02 to SI-04) | SP-1, SP-6 | History confirmed; overview path inferred |
| 3 | Traffic trend and top pages | Prototype: Siteimprove Analytics content and traffic sources (SI-27, SI-28), if on for the site. MVP: GA4 `runReport` (GA-02, GA-03) | SP-6, SP-3 weighting | Siteimprove Analytics confirmed on for sitesuserguide.stanford.edu (Nov 13); endpoint paths to verify |
| 4 | Broken links count and trend | Siteimprove QA `check_history` (SI-13); broken links list (SI-11) | SP-1, SP-6, issue feed | History confirmed; list path to verify |
| 5 | Accessibility issues and pages | Siteimprove `a11y/issue_kinds/confirmed/issues` (SI-05); pages per issue (SI-08) | Issue feed, issue detail | Issues confirmed; pages path inferred |
| 6 | Engagement, landing pages, site search | GA4 `runReport`: `engagementRate`, `landingPagePlusQueryString`, `searchTerm` (GA-04, GA-05, GA-08) | CT-2, CT-5, AI report | MVP; labeled sample in the prototype |
| 7 | AI content report | Public page text for the top 10 pages from slice 3, plus slices 3 and 6, sent to the Claude API | CT-4 | MVP; labeled sample in the prototype. Prompt to be written and tested |
| 8 | Stanford policies | Siteimprove policy list and matches (SI-23, SI-24), with SWS-only policies dropped | Issue feed, AD-7 | Confirmed |
| 9 | Speed check (optional) | PageSpeed Insights API for the top 3 pages (OT-01) | SP-8 | Not researched in the inventory |

**Script behavior**

- Page through results using `page` and `page_size` (Siteimprove) and `limit` and `offset` (GA4).
- Retry with backoff on failures.
- Use the deep links in each Siteimprove response's `_siteimprove` section for "Open in Siteimprove" (SP-2). Siteimprove's API guidelines describe that section as links into the web app ([API guidelines](https://developer.siteimprove.com/api-guidelines.html)).
- From the MVP on, the AI report prompt receives only the fetched page text and the GA4 numbers, and must cite the page and metric behind each finding. That lets SWS check each claim.
- If a slice fails, keep that site's last good data, and set `status.json` to failed with the reason and the age of the data being shown (Q-7).

## Risks and fallbacks

| Risk | Effect on the demo | Fallback |
| --- | --- | --- |
| API user or service account can't see the live site | No live data | Sample data, labeled; switch to another of the three sites |
| The Site Target Score endpoint isn't found by Nov 30, or has no history | The primary score shows as sample, or with no trend | Show the current score with sample history, labeled; keep looking with Siteimprove support |
| An endpoint path differs from the inventory's inferred path | A slice is late | Ship the slices already verified; others stay sample |
| Siteimprove Analytics page URLs don't match the URLs issues are reported on | Issues can't be ranked by visitor impact | Normalize URLs (Q-5); for any still unmatched, rank by how often the issue occurs |
| The AI report states something the data doesn't support | Misleading recommendations | Each finding cites its page and metric; "not yet reviewed by SWS" label until reviewed |
| The sample AI report is mistaken for real findings about the site | Viewers draw conclusions from sample content | Sample label on the report page and on its summary on the site page; say so in the demo script |
| Commits made with the workflow's default token don't trigger other workflows | Data commits but the site doesn't redeploy | Build and deploy in the same workflow |
| Public JSON exposes something it shouldn't | Owner details or SWS-only items become visible | Script writes only the agreed fields; the AD-7 filter runs before any write; review one output before the first public deploy |
| Live fetch fails on fair day | Demo can't refresh | Last good data stays deployed; demo script starts on already-deployed data |
| URL variants split traffic for one page | Wrong priority order | Normalize host, path, case and trailing slash (Q-5) |

**Open questions:** none right now.

**Settled Nov 13:** Siteimprove Analytics is on for sitesuserguide.stanford.edu. For now, only Shane Cyr has write access to the repo, so only he can start data runs (Option A). A public fair site is acceptable: the data it shows isn't sensitive. The registry is a file in the repo rather than a Google Sheet.
