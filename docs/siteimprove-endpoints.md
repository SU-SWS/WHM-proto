# Siteimprove endpoints for the prototype

Drawn from the SWS data inventory (Oct 15, 2026) and the prototype plan. "Confirmed" means the path appears in Siteimprove's documentation or client library. "Inferred" means it is a reasoned guess. "Used by SWS" means an earlier SWS Google Apps Script called it successfully against Stanford's account (shared Nov 19); the response shape is known only from the fields that script read. "Fixture" means a real response is saved in `data/fixtures/siteimprove/` (first set Nov 20). "Linked" means the path appears in the `_links` of `GET /sites/{site_id}` for sitesuserguide, so it exists for this site, but its response hasn't been saved yet. **Call every endpoint once and save the real response to `data/fixtures/siteimprove/` before code depends on it.**

## Access

- **Base URL:** `https://api.us.siteimprove.com/v2`. Confirmed by the Nov 20 fixtures: calls succeeded and every `_links` href uses it. This differs from the `https://api.siteimprove.com/v2` and `https://api.eu.siteimprove.com/v2` shown in Siteimprove's documentation. Keep it in one place in the fetch script.
- **Auth:** HTTP Basic, with the API user's email as the username and the API key as the password. The API user has the same permissions as that user has in the platform, so it must have access to sitesuserguide.stanford.edu.
- **Paging:** `page` and `page_size` query parameters. Responses carry `total_items`, `total_pages` and `links.next.href`; follow `links.next` until it's absent.
- **Deep links:** Siteimprove's API guidelines say responses include a `_siteimprove` section with links into the web app, for "Open in Siteimprove" (SP-2). **Not seen yet:** the Nov 20 fixtures have only `_links` (API links). Check the issue and broken-link responses for it. `[CONFIRM DEEP LINK FIELD]`
- **API reference:** https://developer.siteimprove.com/api-reference.html. The Swagger UI requires signing in as the API user.

## Endpoints, in build order

| # | What | Endpoint | Inventory ID | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 | Site list and IDs | `GET /sites` | SI-01 | Fixture | `items[]`, `total_items` (2,767 sites on Nov 20), `total_pages`, `links`. sitesuserguide isn't on page 1 at `page_size=500`, so the fixture's `items` is empty. The prototype doesn't need this call: the site ID is in the registry. |
| 0 | One site | `GET /sites/{site_id}` | SI-01 | Fixture | `id`, `site_name` ("[UIT] Site User Guides"), `url`, `pages` (351), `policies` (114), `product` (quality_assurance, accessibility, seo, analytics, policy), `visits`, and `_links` to every endpoint available for the site. That `_links` list is the best map of what exists. |
| 1 | Site Target Score (current) | `GET /sites/{site_id}/a11y/overview/site_target/overview` | none | Fixture | `site_target_percentage` (98.38, so the scale is 0–100), `accessibility_dci_score` (93), `accessibility_dci_target_score` (94.31). No check date in the response. The SWS script read missing values with `\|\| ''`, which would also blank a real score of 0; don't copy that. |
| 1 | Site Target Score history | `GET /sites/{site_id}/a11y/overview/site_target/history` | none | Linked | Appears in `_links` (Nov 20), though SWS believed there was no history. Save a response to see how far back it goes and what each point holds. Until then, the daily recorder keeps building WHM's own history. |
| 2 | Headline scores (DCI overview) | `GET /sites/{site_id}/dci/overview` | SI-02, SI-04 | Linked | Overall plus accessibility, QA and SEO components |
| 2 | Score history | `GET /sites/{site_id}/dci/history` | SI-03 | Confirmed | Supports `group_id`, `page`, `page_size`. Check how far back it goes. |
| 2 | Accessibility progress history | `GET /sites/{site_id}/a11y/overview/progress/history` | SI-09 | Linked | May give accessibility score history; otherwise derive it from DCI history |
| 3 | Traffic over time | `GET /sites/{site_id}/analytics/overview/history` | SI-27 | Linked | For the page views trend |
| 3 | Top pages | `GET /sites/{site_id}/analytics/content/most_popular_pages` | SI-27 | Linked | Also linked: `all_pages`, `entry_pages`, `pages_without_visits`, `internal_searches` (site search terms, which could replace the sample GA4 section) |
| 3 | Traffic sources | `GET /sites/{site_id}/analytics/traffic_sources/…` | SI-28 | Confirmed | Optional for the prototype |
| 4 | QA check history | `GET /sites/{site_id}/quality_assurance/overview/check_history` | SI-13 | Confirmed | Broken link and misspelling counts by check; `history_id` keys into detail endpoints; the latest date gives data age (SI-33) |
| 4 | Broken links list | `GET /sites/{site_id}/quality_assurance/links/broken_links` | SI-11 | Linked | The inventory guessed `links/broken`; `_links` shows `broken_links`. Also linked: `links/pages_with_broken_links`, `links/history`. |
| 5 | Confirmed accessibility issues | `GET /sites/{site_id}/a11y/issue_kinds/confirmed/issues` | SI-05 | Confirmed, linked | Use these A11YNextGen endpoints, not the legacy accessibility ones. Filters: `conformance`, `group_id`. |
| 5 | Pages for an issue | `…/a11y/issue_kinds/{kind}/issues/{issue_id}/pages` | SI-08 | Inferred | Page URL, occurrences |
| 6 | Policy list | `GET /sites/{site_id}/policy/policies` | SI-23 | Linked | 109 Stanford policies in the inventory; the site reports 114 (Nov 20). In a sample, every priority was "high", so priority can't rank them. Name prefixes such as [QA], [A11y], [SWS], ADMIN and TEMP can drive categories. |
| 6 | Policy matches | `GET /sites/{site_id}/policy/policies/{policy_id}/content` (or `/media`) | SI-24 | Confirmed | The path depends on the policy's category |
| – | Last check date | `GET /sites/{site_id}/content/crawl` | SI-33 | Linked | May give the date of the latest check, for data age (AD-4). The check history above is the fallback. |
| – | Page inventory | `GET /sites/{site_id}/quality_assurance/inventory/pages` | SI-16 | Confirmed | Check whether it returns a last-modified date. That would answer content freshness (SI-17), which is unknown. |

## Rules for the fetch script

- **Never fetch:** `quality_assurance/inventory/personal_id_numbers`, `email_addresses` and `phone_numbers` appear in `_links`. WHM doesn't need them, and personal ID findings are SWS-only (AD-7).
- **SWS-only content:** drop SWS admin policies (for example "Old Analytics Code" and saml link exclusions) and any personal ID number findings (SI-20) before writing published data (AD-7).
- **Joining to traffic:** normalize URLs before joining issue pages to Siteimprove Analytics page views (Q-5). Where a page can't be matched, rank by how often the issue occurs.
- **Retries and failures:** retry with backoff. The SWS script hit HTTP 429 (rate limited) when calling many sites, and spaced its calls out; one live site in the prototype shouldn't, but handle 429 the same way. If a slice fails, keep that section's last good data and record the reason in `status.json`.
- **Score methodology:** scores are Siteimprove's, not Stanford's, except the Site Target Score. Label them accordingly.
