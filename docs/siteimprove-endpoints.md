# Siteimprove endpoints for the prototype

Drawn from the SWS data inventory (Oct 15, 2026) and the prototype plan. "Confirmed" means the path appears in Siteimprove's documentation or client library. "Inferred" means it is a reasoned guess. **Call every endpoint once and save the real response to `data/fixtures/siteimprove/` before code depends on it.**

## Access

- **Base URL:** `https://api.siteimprove.com/v2`. The documentation also shows `https://api.eu.siteimprove.com/v2`. `[CONFIRM BASE URL FOR STANFORD'S ACCOUNT]`
- **Auth:** HTTP Basic, with the API user's email as the username and the API key as the password. The API user has the same permissions as that user has in the platform, so it must have access to sitesuserguide.stanford.edu.
- **Paging:** `page` and `page_size` query parameters.
- **Deep links:** responses include a `_siteimprove` section with links into the Siteimprove web app. Use these for "Open in Siteimprove" (SP-2).
- **API reference:** https://developer.siteimprove.com/api-reference.html. The Swagger UI requires signing in as the API user.

## Endpoints, in build order

| # | What | Endpoint | Inventory ID | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 | Site list and IDs | `GET /sites` | SI-01 | Confirmed | Finds `site_id` for sitesuserguide |
| 1 | Site Target Score and history | `[CONFIRM ENDPOINT]` | none | Unknown | Stanford's primary score, set up with Siteimprove. Not in the inventory. Also confirm whether history is available. |
| 2 | Headline scores (DCI overview) | `GET /sites/{site_id}/dci/overview` | SI-02, SI-04 | Inferred | Overall plus accessibility, QA and SEO components |
| 2 | Score history | `GET /sites/{site_id}/dci/history` | SI-03 | Confirmed | Supports `group_id`, `page`, `page_size`. Check how far back it goes. |
| 2 | Accessibility score history | under `/sites/{site_id}/a11y/…` | SI-09 | Inferred | If absent, derive from DCI history |
| 3 | Page views and visits | `GET /sites/{site_id}/analytics/content/…` | SI-27 | Partly confirmed | Siteimprove Analytics is on for sitesuserguide (Nov 13). Exact path to verify. |
| 3 | Traffic sources | `GET /sites/{site_id}/analytics/traffic_sources/…` | SI-28 | Confirmed | Optional for the prototype |
| 4 | QA check history | `GET /sites/{site_id}/quality_assurance/overview/check_history` | SI-13 | Confirmed | Broken link and misspelling counts by check; `history_id` keys into detail endpoints; the latest date gives data age (SI-33) |
| 4 | Broken links list | `GET /sites/{site_id}/quality_assurance/links/broken` | SI-11 | Inferred | Link URL, status, source pages |
| 5 | Confirmed accessibility issues | `GET /sites/{site_id}/a11y/issue_kinds/confirmed/issues` | SI-05 | Confirmed | Use these A11YNextGen endpoints, not the legacy accessibility ones. Filters: `conformance`, `group_id`. |
| 5 | Pages for an issue | `…/a11y/issue_kinds/{kind}/issues/{issue_id}/pages` | SI-08 | Inferred | Page URL, occurrences |
| 6 | Policy list | Policy endpoints | SI-23 | Partly confirmed | 109 Stanford policies. In a sample, every priority was "high", so priority can't rank them. Name prefixes such as [QA], [A11y], [SWS], ADMIN and TEMP can drive categories. |
| 6 | Policy matches | `GET /sites/{site_id}/policy/policies/{policy_id}/content` (or `/media`) | SI-24 | Confirmed | The path depends on the policy's category |
| – | Page inventory | `GET /sites/{site_id}/quality_assurance/inventory/pages` | SI-16 | Confirmed | Check whether it returns a last-modified date. That would answer content freshness (SI-17), which is unknown. |

## Rules for the fetch script

- **SWS-only content:** drop SWS admin policies (for example "Old Analytics Code" and saml link exclusions) and any personal ID number findings (SI-20) before writing published data (AD-7).
- **Joining to traffic:** normalize URLs before joining issue pages to Siteimprove Analytics page views (Q-5). Where a page can't be matched, rank by how often the issue occurs.
- **Retries and failures:** retry with backoff. If a slice fails, keep that section's last good data and record the reason in `status.json`.
- **Score methodology:** scores are Siteimprove's, not Stanford's, except the Site Target Score. Label them accordingly.
