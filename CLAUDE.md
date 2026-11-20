# Website Health Monitoring (WHM) prototype

Stanford Web Services (SWS) innovation project. A dashboard that turns Siteimprove (and later Google Analytics) data into a plain-language picture of each site's health, with guidance and links to the source tools. The prototype is shown at an innovation fair on **December 8, 2026**.

## Read first

- `BUILD_PLAN.md`: ordered tasks. Work through them in order unless told otherwise.
- `docs/decisions.md`: the latest decisions. Where it disagrees with the exported docs, it is newer and wins.
- `docs/data-contract.md`: the JSON structure every part of the app shares. Change it only on purpose, and update the doc in the same change.
- `docs/siteimprove-endpoints.md`: what is known about each Siteimprove endpoint and what is still unverified.
- `docs/requirements.md`, `docs/prototype-plan.md`, `docs/roadmap.md`, `docs/personas.md`: exported project docs. Requirement IDs (SP-, TR-, AC-, AD-, CT-, Q-) come from `requirements.md`.
- `reference/whm-demo.html`: the clickable demo. It is the UI and content reference. Match its screens, flows and wording, not its code.

## Stack

- Next.js 16, App Router, TypeScript, static export (`output: 'export'`), deployed to GitHub Pages from the SU-SWS org.
- Tailwind CSS **3.4** with the **`decanter@7.5.3`** preset (Stanford's design system). Do not use Decanter v8 or Tailwind v4.
- Fonts: Source Sans 3 (body) and Source Serif 4 (headings and verdicts). Stanford cardinal `#8C1515`.
- Data gathering runs in GitHub Actions (`scripts/refresh.mjs`). The browser never calls Siteimprove.
- `basePath` is `/WHM-proto` (repo `SU-SWS/WHM-proto`). The site is at https://su-sws.github.io/WHM-proto/.

## Data rules

- **Live data is only for sitesuserguide.stanford.edu** (`live: true` in `data/registry.json`): Siteimprove, plus GA4 engagement and site search from an Apps Script export (`data/ga4/`, decisions Nov 20). Everything else uses the committed sample data.
- Page views come from **Siteimprove Analytics**; GA4 supplies only engagement rate and site search terms (one source per metric). The AI content report is a **labeled sample** until the MVP.
- GA4 site search terms are public once published: only terms searched at least 5 times, with anything that looks like an email, phone or ID number, or web address removed.
- Every section of every data file carries a `source` of `live` or `sample`. The UI shows it.
- Every screen shows how old its data is and where it came from (AD-4).
- If a live fetch fails, keep the last good published data and record the failure in `status.json` (Q-7). Never show old numbers as current.
- One source per metric (Q-4). Never show two different values for the same measure.
- Normalize URLs before joining issues to traffic: host, path, case, trailing slash, no query string (Q-5).
- SWS-only items (admin policies, personal ID number findings) never reach published data (AD-7).

## Public by design

- The repo and the Pages site are public. Private Pages is not available to SU-SWS. The data is not sensitive.
- Never commit secrets. Siteimprove credentials live only in Actions secrets: `SITEIMPROVE_API_USER`, `SITEIMPROVE_API_KEY`.
- Owners appear only as role labels ("Owner A"). No names or emails anywhere in the repo.
- Never add survey responses or respondent details to the repo.
- Every page has a `noindex` meta tag, and the site has a `robots.txt` that disallows indexing.

## Product rules

- The **Site Target Score** is the primary score (goal 100, Stanford's own bar). The accessibility score is second.
- Content and findability lead; technical performance comes after (SP-7).
- The issue list defaults to "Prioritized for me", ranked by visitor impact and whether the owner can fix it. "Show everything plainly" shows the same issues unranked, grouped by category (SP-3, SP-4).
- Each issue shows its category, what it is, why it matters, what to do, and who fixes it: "You can fix this" or "SWS is handling this" (SP-5).
- Progress is tracked **per page** within an issue. Statuses: To do; Waiting for next check; Still correct; Set aside until [date]. "Still correct" and "Set aside" exist only for editorial issues, such as content freshness (TR-1, TR-2).
- Owner notes are visible to every owner of the site and are not sent to SWS (TR-3).
- In user-facing text, say "check", not "crawl" ("Siteimprove check of Nov 10, 2026").
- Write user-facing text in plain language at an 8th-grade reading level. Use typographic quotes and apostrophes in visible text.
- Meet WCAG 2.2 AA. Every chart has a data-table alternative. Never rely on color alone.

## Build priority

Build the items named in the approved project description first: per-site health view, trends, issue feed, portfolio rollup, SWS all-sites view, admin and data runs, live Siteimprove data, sample AI report. Build the brief's extras only after those: tracking states and notes (TR-1 to TR-5), the "Viewing as" concept (AC-2), static email view (AC-4), share view (AC-6).

## Working agreements

- Don't invent data, endpoints or facts. Where something is unknown, use a bracketed placeholder such as `[CONFIRM ENDPOINT]` and say so.
- Ask clarifying questions when a task can't be done without guessing. Offer multiple-choice options where practical.
- Siteimprove endpoints marked "inferred" or "to verify" must be checked against a saved real response in `data/fixtures/siteimprove/` before code depends on them.
- When subagents would help, suggest them and say why. If asked to use subagents without a model named for each, ask which model to use and recommend one per subagent based on its task.
