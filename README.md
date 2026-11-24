# Website Health Monitoring (WHM) prototype

A dashboard from Stanford Web Services (SWS) that turns Siteimprove and Google Analytics data into a plain-language picture of each site's health: what's wrong, what to fix first, and who fixes it. It summarizes and links to Siteimprove rather than replacing it. Built for the December 8, 2026 innovation fair.

- **Site:** https://su-sws.github.io/WHM-proto/ (public, not indexed)
- **How it works, in plain language:** [docs/how-it-works.md](docs/how-it-works.md)
- **Getting the data ready for the demo:** [docs/demo-prep.md](docs/demo-prep.md)
- **For Claude Code:** [CLAUDE.md](CLAUDE.md) (rules) and [BUILD_PLAN.md](BUILD_PLAN.md) (tasks and status)

## What's live

Only **sitesuserguide.stanford.edu** has live data: Siteimprove scores, issues, policies and checks; and page views, engagement and site search from Google Analytics 4 (a site with no GA4 property would use Siteimprove Analytics instead). The other two sites, the AI content report, the speed check and content freshness are labeled samples or simulations. Every section on the site says which.

## How it runs

| Part | What it does | Where |
| --- | --- | --- |
| **Data run** | Fetches Siteimprove data for live sites, merges the latest GA4 export, writes `data/published/`, commits it, then builds and deploys the site. Daily at about 3 a.m. Pacific (after the nightly GA4 export) and on demand, with a site choice and a “Publish” checkbox for previewing a run first. | `.github/workflows/refresh-data.yml`, `scripts/refresh.mjs`, `scripts/lib/` |
| **Deploy** | Builds and publishes the site on every push to `main`. | `.github/workflows/deploy.yml` |
| **GA4 export** | A Google Apps Script, run as an SWS account, that writes `data/ga4/<site>.json` daily: page views, names and engagement per page, monthly page views, and privacy-filtered site search terms. | `scripts/apps-script/ga4-export.gs`; setup in [docs/ga4-setup.md](docs/ga4-setup.md) |
| **Save Siteimprove fixtures** | Saves real API responses as a short-lived download for review before code depends on them. Commits nothing. | `.github/workflows/save-fixtures.yml`, `scripts/save-fixtures.mjs` |
| **Website** | Next.js static export with the Decanter 7 design system. Reads only `data/` at build time; the browser never calls Siteimprove or Google. | `app/`, `components/`, `lib/` |

Secrets: `SITEIMPROVE_API_USER` and `SITEIMPROVE_API_KEY` are Actions secrets. The GA4 script keeps its GitHub token in its own script properties. Nothing secret is in the repo.

The data run and the GA4 script commit to `main` on their own, so run `git pull --rebase` before you push.

## Working locally

Needs Node 22.

```
npm ci
npm run dev            # site at http://localhost:3000/WHM-proto/
npm run build          # static site in out/
npm run lint
```

To try a data run without credentials, start the mock Siteimprove API in one terminal and run the refresh against it in another. It serves the saved responses in `data/fixtures/siteimprove/`:

```
npm run mock
npm run refresh:mock -- --site sitesuserguide
```

This overwrites `data/published/`. Put it back with `git checkout data/published` before committing.

## What's where

| Path | What it is |
| --- | --- |
| `data/registry.json` | Sites, owners (role labels only), Siteimprove and GA4 IDs, which site is live |
| `data/issue-types.json` | Plain-language text for each issue type, mapped to Siteimprove rules and policies. Draft, not yet reviewed by SWS |
| `data/annotations.json` | SWS accessibility specialist notes |
| `data/sample/` | Sample data for every site. Scripts never write here |
| `data/published/` | What the site builds from. Written by the data run |
| `data/ga4/` | GA4 exports from the Apps Script |
| `data/fixtures/siteimprove/` | Reviewed real Siteimprove responses, for writing and testing code |
| `docs/` | Decisions, data contract, endpoint notes, verdict rules, setup guides and the project docs: requirements, plan, roadmap, personas ([index](docs/README.md)) |
| `reference/whm-demo.html` | The original clickable demo: the UI and wording reference |
