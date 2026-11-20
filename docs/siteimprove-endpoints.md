# Siteimprove endpoints for the prototype

Drawn from the SWS data inventory (Oct 15, 2026) and the prototype plan. "Confirmed" means the path appears in Siteimprove's documentation or client library. "Inferred" means it is a reasoned guess. "Used by SWS" means an earlier SWS Google Apps Script called it successfully against Stanford's account (shared Nov 19); the response shape is known only from the fields that script read. **Call every endpoint once and save the real response to `data/fixtures/siteimprove/` before code depends on it.**

## Access

- **Base URL:** `https://api.us.siteimprove.com/v2` for Stanford's account (Nov 19), and the earlier SWS script used it. This differs from the `https://api.siteimprove.com/v2` and `https://api.eu.siteimprove.com/v2` shown in Siteimprove's documentation. Confirm it with the first call (`GET /sites`) and save that response as a fixture. Keep the base URL in one place in the fetch script so it can be changed easily.
- **Auth:** HTTP Basic, with the API user's email as the username and the API key as the password. The API user has the same permissions as that user has in the platform, so it must have access to sitesuserguide.stanford.edu.
- **Paging:** `page` and `page_size` query parameters.
- **Deep links:** responses include a `_siteimprove` section with links into the Siteimprove web app. Use these for "Open in Siteimprove" (SP-2).
- **API reference:** https://developer.siteimprove.com/api-reference.html. The Swagger UI requires signing in as the API user.

## Endpoints, in build order

| # | What | Endpoint | Inventory ID | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 | Site list and IDs | `GET /sites` | SI-01 | Confirmed, used by SWS | Finds `site_id` for sitesuserguide. Returns `items[]` with `id`, `url`, `site_name`, `pages`, `visits`. The SWS script paged with `page_size=500` and stopped when a page came back short. |
| 0 | One site | `GET /sites/{site_id}` | SI-01 | Used by SWS | Same fields as an item in `/sites` |
| 1 | Site Target Score (current) | `GET /sites/{site_id}/a11y/overview/site_target/overview` | none | Used by SWS | Returns `site_target_percentage` (the Site Target Score) and `accessibility_dci_score`. Other fields unknown until a fixture is saved. The SWS script read missing values with `\|\| ''`, which would also blank a real score of 0; don't copy that. |
| 1 | Site Target Score history | `[CONFIRM ENDPOINT]` | none | Unknown | The endpoint above gives the current value only, as far as the SWS script shows. Check the fixture and Swagger for a history or date parameter. If none exists, history has to be built up from our own weekly runs. |
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
- **Retries and failures:** retry with backoff. The SWS script hit HTTP 429 (rate limited) when calling many sites, and spaced its calls out; one live site in the prototype shouldn't, but handle 429 the same way. If a slice fails, keep that section's last good data and record the reason in `status.json`.
- **Score methodology:** scores are Siteimprove's, not Stanford's, except the Site Target Score. Label them accordingly.
