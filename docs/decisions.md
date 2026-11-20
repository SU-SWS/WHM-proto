# Decisions

Newest decisions take priority over anything in the exported docs. Dates are 2026.

## Scope and data

| Date | Decision |
| --- | --- |
| Nov 13 | Live data in the prototype comes from **Siteimprove only**. Google Analytics data and the AI content report are labeled samples until the MVP. |
| Nov 13 | The live site is **sitesuserguide.stanford.edu**, switched from webservices.stanford.edu. The other two demo sites use sample data. |
| Nov 13 | Traffic in the prototype comes from **Siteimprove Analytics**, which is confirmed on for sitesuserguide. |
| Nov 19 | The Site Target Score comes from `GET /sites/{site_id}/a11y/overview/site_target/overview` (field `site_target_percentage`), as used by an earlier SWS script. To be confirmed with a saved fixture. |
| Nov 19 | The Siteimprove API is believed to have no Site Target Score history. WHM builds its own history by saving the score on every data run. |
| Nov 20 | First fixtures saved. The base URL is confirmed, and `site_target_percentage` is on a 0–100 scale (98.38). `GET /sites/{id}` links to `a11y/overview/site_target/history`, so the API may have history after all. The daily recorder keeps running until that response is checked. |
| Nov 20 | **The Site Target Score history is in the API**: `a11y/overview/site_target/history`, daily from Aug 25, 2025. The trend uses it, so the “live points only” fallback isn’t needed. The daily recorder stays as a backup until task 6 reads the API history, then it can be retired. |
| Nov 20 | The accessibility score comes from the same response as the Site Target Score (`accessibility_dci_score`), so both have one source and matching dates (Q-4). DCI history isn't used for it. |
| Nov 20 | “Siteimprove check of [date]” uses the latest `check_date` from the QA check history. |
| Nov 20 | Issues that come from the shared template are shown as **“SWS is handling this”**, not as owner issues. That covers rules found on all or nearly all pages (such as the AAA target size, line height and enhanced contrast rules) and broken links in the shared Stanford header or footer. |
| Nov 20 | Live sites get their state, verdict and lede from fixed rules in `docs/verdict-rules.md` (draft for SWS review). Sample sites keep their hand-written text. |
| Nov 20 | “Nearly all pages” for template issues means **at least 90%** of the site’s pages. |
| Nov 20 | Siteimprove Analytics takes a `period` parameter; page views use the last 30 days, to match the page’s wording. |
| Nov 20 | Stanford policies are in scope for the fair. The policy list is saved for review first, and SWS-only policies are agreed by name before any match is published (AD-7). |
| Nov 20 | Policies are published only from an **allowlist**: names starting with `[QA]`, `[A11y]` or `[SEO]` (in any combination, so `[QA][SOM]` counts), `QA:` or `A11y:`. Everything else is dropped (AD-7). |
| Nov 20 | Broken links use the **per-check link list** for the reading, the trend and the issue, so they always agree (Q-4). |
| Nov 20 | A live site shows **live issues only**. Sample issues name sample pages, so they come back only if their whole section falls back to sample. Pages not updated in a year stays a labeled, simulated reading. |
| Nov 20 | A Siteimprove accessibility rule with no WHM issue type is left out and noted in `status.json`, rather than published in Siteimprove's own wording. |
| Nov 20 | Site data files move to `schemaVersion: 2`: changes and trend values can be empty (no earlier check, or no data that month), and an issue can be marked SWS-handled on its own. |
| Nov 20 | The first live data run is reviewed before it's published: the Data run workflow has a `publish` checkbox that, when unticked, saves the result as a download instead of committing and deploying it. |
| Nov 20 | The broken-links trend shows only months whose per-check link list Siteimprove still keeps (October on, for now), leaving earlier months as no data. It grows as new checks come in. |
| Nov 20 | **Platform pages are left out of owner reports (temporary).** Stanford Sites search and sign-in/account pages (`/search`, `/user/…`) are shared by every site on the platform, so they're excluded when picking a site's busiest pages: the "Most visited pages" table, the "busiest pages" notes, and the busiest-pages test in the verdict. Issues found on those pages are still listed. The site page says they're left out. See "Still open". |
| Nov 20 | On issue pages and in “Most visited pages”, page paths from live data link to the page on the site (same tab). Sample paths stay plain text, since those pages don't exist. Links are rebuilt from normalized paths, so a page reached through a query string (such as `?page=1`) links to its base address. |
| Nov 20 | *(Replaced below.)* `_siteimprove` deep links carry an `impmd=` value. Fixtures store it redacted, and no deep link is published until SWS confirms it isn't a credential. |
| Nov 20 | **GA4 data comes in early, through Google Apps Script** (changes the Nov 13 decision that GA4 stays sample until the MVP). An Apps Script run as an SWS account (`scripts/apps-script/ga4-export.gs`, setup in `docs/ga4-setup.md`) uses the Analytics Data advanced service, so no service account is needed, and commits `data/ga4/<site>.json` weekly with a fine-grained GitHub token (this repo, Contents only). It exports **engagement rate per page** and **site search terms** only; page views stay with Siteimprove Analytics (Q-4). The data run merges an export under 14 days old; otherwise those sections stay labeled samples. sitesuserguide's GA4 property is 331314616. |
| Nov 20 | **Published search terms are filtered for privacy**, because the repo and site are public: only terms searched at least 5 times in the period, and none containing an @, 5 or more digits in a row, or a web address. The Apps Script filters, and the data run filters again. The site page says what's left out. |
| Nov 20 | *(Replaced below.)* Tracking confirms fixes against Siteimprove (TR-1): a page marked “Waiting for next check” before the latest check counts as **confirmed fixed** if that check no longer finds it, and goes back to To do (“Still found by the latest check”) if it does. Pages a later check adds start as To do. |
| Nov 20 | **TR-1 and TR-2 are revised: one system of record.** `requirements.md` was re-exported with this wording on Nov 20. **TR-1 (revised):** for issues Siteimprove detects, WHM doesn't keep its own fix status. Owners fix and recheck in Siteimprove; WHM shows progress from Siteimprove's checks (such as “6 pages fixed since the last check, 2 new”) and links each page to Siteimprove. **TR-2 (revised):** for editorial issues only (ones Siteimprove doesn't manage: content freshness, duplicate content, low-traffic pages), an owner can mark each page “I updated this page,” “still correct,” or “set aside until [date],” one page or several at once, kept between visits, with a summary such as “4 of 38 pages reviewed.” TR-3 to TR-5 are unchanged. |
| Nov 20 | **Content freshness stays WHM's, as a conversation starter.** Siteimprove's DCI has a Quality Assurance “freshness” component, but it isn't clear it matches what WHM's stale-content review asks owners to think about. The simulated freshness issue and its editorial tracking stay in the prototype to learn what owners want and would use (Phase 1). |
| Nov 20 | The share view (AC-6) lists the top 5 recommended changes and says how many more there are, in keeping with “summarize and link”. |
| Nov 20 | Task 8: “Viewing as” starts as **SWS administrator** (every site visible), and the presenter switches to an owner to show the owner view. Tracking and notes have no reset; clear the browser's site data if needed. |
| Nov 20 | **WHM summarizes and links; Siteimprove holds item-level detail.** Site owners have Siteimprove accounts, so WHM shows *which pages* have each issue, ranked by visitors and explained in plain language, with an “Open in Siteimprove” link per page. It doesn't copy item-by-item detail that Siteimprove shows better in context, such as each broken address, matched files, or highlighted content. In line with that: broken addresses are no longer listed under each page; template issues (on nearly every page, handled by SWS) list no pages; media and document policies are summaries that name the policy to open in Siteimprove; and “Prioritized for me” shows the top 5 with a button for the rest. Page lists stay, because per-page tracking (TR-1) needs them. |
| Nov 20 | **Stanford policies are live** for allowlisted policies with matches. Each policy is its own issue with drafted plain-language text (not yet reviewed by SWS). Policies on 90% of pages are SWS-handled. Left out until SWS supplies wording or a reason: [QA] Google Docs, [QA] Google Docs Forms, [QA] Links to Stanford Digital Repository, [A11y] [QA] Documents and [A11y] Captions Project: YouTube Links. [QA] Homepages with broken links is left out because the broken-links issue already covers it. Vague Link Text uses the existing link-text issue. Policy matches list pages only, never the matched text, so email-address policies can't publish an email address. |
| Nov 20 | **The daily Site Target Score recorder is retired.** The data run reads the score's history from the API (`a11y/overview/site_target/history`), so WHM no longer keeps its own copy; `data/history/` is removed. Saving fixtures moves to its own manual workflow, **Save Siteimprove fixtures** (`scripts/save-fixtures.mjs`), which strips `impmd` and staff-name fields and commits nothing. |
| Nov 20 | **`impmd` is stripped from every Siteimprove link on ingestion, and “Open in Siteimprove” links are published without it.** Links tested without `impmd` open the right report for a signed-in user. Whatever `impmd` is (likely session or account context), passing it on could only cause trouble, and it shouldn't sit in a public repo. `stripImpmd` in `scripts/lib/siteimprove.mjs` removes it before anything is stored, including fixtures. Links are per page (each page's report), and the page notes that a Siteimprove account is needed. |
| Nov 19 | Unreviewed SWS notes show a “Draft, not yet reviewed by SWS” label until `reviewedBySws` is true. |
| Nov 19 | The Siteimprove API base URL for Stanford's account is **`https://api.us.siteimprove.com/v2`**, not the one in the exported prototype plan. To be confirmed with the first live call. |
| Nov 13 | The **Site Target Score** is the primary score (goal 100); the accessibility score is second. Its API location is still to be found. |
| Nov 13 | Source roles: Siteimprove for health scores, issues and checks; GA4 (from the MVP) for traffic, engagement, landing pages and site search. One source per metric. |
| Nov 13 | The AI report, from the MVP on, uses Claude Sonnet 5.5 (`claude-sonnet-5-5`) through the Claude API. |

## Platform and access

| Date | Decision |
| --- | --- |
| Nov 12 | Decanter **v7** (`decanter@7.5.3`, Tailwind 3.4), not v8. |
| Nov 12 | Next.js with static export on GitHub Pages; no sign-in for the fair version. |
| Nov 13 | Private Pages isn't available to SU-SWS, so the site is **public**. The data isn't sensitive. Pages carry `noindex` and the site has a `robots.txt`. |
| Nov 13 | Data runs start by opening the workflow in GitHub Actions (**Option A**). For now only Shane Cyr has write access, so only he can start runs. |
| Nov 13 | The registry is a **file in the repo** (`data/registry.json`), not a Google Sheet. |

## Product

| Date | Decision |
| --- | --- |
| Nov 12 | Owner notes are shared with all owners of a site. They are not sent to SWS. |
| Nov 12 | WHM's own text targets an 8th-grade reading level. |
| Nov 13 | Approved-description items are built first; tracking states, notes, "Viewing as", email and share views come after. |
| Nov 13 | Progress is tracked per page within an issue. Statuses: To do; Waiting for next check; Still correct; Set aside until [date]. Only editorial issues can be "Still correct" or "Set aside". |
| Nov 13 | An issue marked fixed counts as fixed only after the next Siteimprove check no longer finds it. |
| Nov 13 | User-facing text says "check", not "crawl". |
| Nov 13 | The categories (Accessibility, Content quality, and so on) appear on every issue row in both list views. |
| Nov 13 | Persona 4 (self-directed analyst) stays a separate persona. Personas use role labels, not invented names. |
| Nov 13 | Pilot measures: email opens, issues confirmed fixed, owners' rating of usefulness, and the change in support requests. Targets are set at Gate 2. |

## Still open

- **What owners want from a content freshness review (Phase 1).** Whether Siteimprove's QA “freshness” measure covers it, what “out of date” means to owners, and whether they'd use “still correct” and “set aside” (see TR-2, revised Nov 20).
- *GA4 access without a service account: settled Nov 20 (Apps Script; see above). Kept for the record:* GA4's Data API always needs Google Cloud credentials. Options, untested: (1) a monthly manual CSV export from GA4, committed and read by the data run (no Cloud Console; real data with a date label); (2) an Apps Script using the Analytics Data advanced service, running as an SWS account and pushing JSON to the repo with a GitHub token (usually no Cloud Console, since Apps Script supplies its own project); (3) a service account, as planned. Also possible: take site search terms (`analytics/internal_searches`) and bounce rate from Siteimprove Analytics, which would change the Nov 13 source roles. GA4 sections stay labeled samples for the fair.
- *Link text for broken links: closed Nov 20.* WHM no longer lists broken addresses (see “WHM summarizes and links”); Siteimprove shows each link in context.
- **Platform pages (flagged Nov 20, to address after the fair).** Search and sign-in pages get real traffic (on sitesuserguide, `/search` was the 3rd most visited page and `/user/login` the 5th, last 30 days) and they matter to visitors, but no single site owner can fix them. They're left out of owner reports for now. Still to decide: who sees problems on platform pages (SWS, a platform-wide report, or both), whether the list of platform paths (`PLATFORM_PAGES` in `scripts/lib/live-site.mjs`) is complete, and whether it differs between platforms.

- The verdict rules in `docs/verdict-rules.md`, including whether an accessibility score drop should also mean “needs attention.”
- What happens when a "Set aside" revisit date arrives (a Phase 1 interview question).
