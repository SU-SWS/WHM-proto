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
| Nov 20 | `_siteimprove` deep links carry an `impmd=` value. Fixtures store it redacted, and no deep link is published until SWS confirms it isn't a credential. |
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

- Whether `impmd` in Siteimprove deep links is safe to publish.
- The verdict rules in `docs/verdict-rules.md`, including whether an accessibility score drop should also mean “needs attention.”
- Which policy name prefixes are SWS-only.
- What happens when a "Set aside" revisit date arrives (a Phase 1 interview question).
