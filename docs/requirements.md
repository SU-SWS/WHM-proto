# WHM Requirements

Nov 12, 2026 · @Someone

*The repo copy is the place of record (Nov 23). Last updated Nov 23, 2026; `decisions.md` has the reasons for each change.*

## How to read this

WHM should give each site owner a short, prioritized account of their site's health that they can act on, track and share. Each requirement below says who needs it, why, what data supports it, and in which phase it lands.

- **Phases.** *Prototype* means the Dec 8 fair build. *MVP* means the first version real clients use. *Later* means after MVP. The roadmap will set dates. Within Prototype, items named in the approved project description are built first. TR-1 to TR-5, AC-2, AC-4 and AC-6 come from the project brief: they are shown in the clickable demo, but built only after the approved items.
- **IDs.** Requirements are numbered by area: SP (summary and prioritization), TR (tracking and notes), AC (access and delivery), AD (administration), CT (content), Q (quality).
- **Personas.** P1 portfolio site manager, P2 single-site owner, P3 contributor who needs sign-off, P4 self-directed analyst, P5 SWS administrator, P6 SWS accessibility specialist.
- **Evidence.** Survey respondents are R1 to R14 (n=14), as in the personas doc. Data element IDs (SI-, GA-, X-, OT-) refer to the Oct 15 data inventory.
- **Wording.** Following the Pragmatic Framework, scenarios describe the problem without prescribing a solution. Requirements state what a user must be able to do or know, not how the screen looks.
- **Data source roles.** Each source has a defined role. Siteimprove covers health scores, issues and check data. GA4 covers traffic, engagement, landing pages and site search. Each metric comes from one source only. In the prototype, Siteimprove and GA4 data are live for one site (decisions, Nov 20 and Nov 23). A site with a GA4 property gets all its traffic, engagement and site search from GA4; Siteimprove Analytics is used only for a site with no GA4 property. The AI report is a labeled sample until the MVP.

## Use scenarios

Twelve scenarios describe the problems WHM has to solve. Requirements below cite them by ID.

| ID | Persona | Scenario | Evidence |
| --- | --- | --- | --- |
| US1 | P1 | Manages several sites with different goals. To find out which site needs attention, has to open each one in Siteimprove and dig, and still can't tell which issue affects the most visitors. | R1, R6, R10; 11 of 14 manage more than one site |
| US2 | P1 | Supplied alt text when uploading images, but keeps getting flagged for missing alt text. Starts to doubt every flag. | R6 |
| US3 | P2 | Rarely or never looks at analytics. Wants to know whether the site is in good shape and what to do, but the tools use terms they don't use. | R9, R11; Nov 6 note |
| US4 | P2 | Sees an issue but can't tell whether it is theirs to fix or comes from the platform, so it waits on IT. | R9 and R14 cite IT or developer availability |
| US5 | P3 | Has drafted changes and is waiting on approval. The approver asks why the change matters, and the contributor has nothing concrete to show. | R12; 5 of 7 without final say cite approval waits |
| US6 | P3 | Reports site performance to a supervisor or client and puts the numbers together by hand each time. | R2, R12, R13 report up; 10 of 12 asked report occasionally or regularly |
| US7 | P1, P3 | Works through issues over several sessions. A week later, can't recall which were fixed, which were put off, and why. | Project brief |
| US8 | P2, P3 | Content that looks old is correct on purpose, such as a page updated once a year. It is flagged as stale again and again. | R14; project brief |
| US9 | P4 | Wants all findings laid out unranked and checks the numbers against their own tools, but can't tell where a number came from or how current it is. | R3, R4; 5 of 14 want plain presentation |
| US10 | P5 | A new client signs up. The administrator has to connect the site to its Siteimprove and GA4 IDs and confirm data arrived, without a developer's help. | Project brief; SI-01, GA-01 |
| US11 | P6 | Finds that a flagged issue is a platform bug. Every owner of an affected site still sees it as their own task. | Project brief; X-06 |
| US12 | P2, P3 | The same content lives in several places on the site. Updating one copy leaves the others out of date. | R14 |

## Summary and prioritization

Owners first get a plain verdict on each site's health, with detail and source data one step away. The Site Target Score is the primary score: Stanford set it with Siteimprove, and every site is expected to reach 100. The accessibility score comes second.

| ID | Requirement | Why | Personas | Data | Phase |
| --- | --- | --- | --- | --- | --- |
| SP-1 | Each site has a one-sentence health verdict, plus a small set of indicators: the Site Target Score first, then the accessibility score, then content quality, findability and content freshness. | 13 of 14 want a headline with drill-down; US1, US3. The Site Target Score is Stanford's own bar, so it leads. | P1, P2, P3 | Site Target Score (API location to confirm); SI-02, SI-04, SI-11, SI-13 | Prototype |
| SP-2 | Every headline item opens its detail, and every detail links to the matching page in Siteimprove or GA4. | Approved description (direct links to third-party systems); US9 | All | SI-08, SI-24 | Prototype (Siteimprove links); MVP (GA4 links; see decisions, Nov 23) |
| SP-3 | The default view ranks issues by visitor impact (traffic on affected pages) and by whether the owner can fix them. | 9 of 14 want prioritization; US1 | P1, P2, P3 | X-01, X-06; GA-03 where the site has a GA4 property, otherwise SI-27 (Siteimprove Analytics) | Prototype |
| SP-4 | An owner can switch to a plain view showing the same findings unranked and grouped by category. | 5 of 14 want plain presentation; US9 | P4, P3 | Same as SP-3 | Prototype |
| SP-5 | Each issue says what it is, why it matters, what to do, and who fixes it (owner or SWS). | Approved description (plain-language summary of issues); US3, US4 | All | OT-04, SI-26, X-06 | Prototype, for the issue types shown |
| SP-6 | Site Target Score, accessibility score, broken links and traffic each have a trend chart showing whether they are getting better or worse over a chosen period. The Site Target Score chart shows the goal of 100. | Approved description (trend visualizations); project brief | P1, P3, P4 | Site Target Score history (`a11y/overview/site_target/history`); SI-03, SI-09, SI-13, GA-02 | Prototype (traffic from GA4, or from Siteimprove Analytics for sites without GA4; the period is a fixed 8 months for now) |
| SP-7 | Content and findability lead the summary; technical performance comes after. | 13 of 14 put content in their top two quality priorities; 3 chose technical performance | All | — | Prototype |
| SP-8 | A basic speed check for the site's 3 most visited pages, shown after content and findability. | The approved description names performance. The survey ranks it low (3 of 14), so it stays small and secondary. | P4, P1 | OT-01 (PageSpeed Insights); GA-03 to pick the pages | Prototype (optional, live site only); fuller performance later |

## Tracking, notes and SWS annotations

Owners can leave and come back to find where they left off. Putting an issue off is allowed only for editorial choices, and SWS notes look clearly different from an owner's own notes.

| ID | Requirement | Why | Personas | Data | Phase |
| --- | --- | --- | --- | --- | --- |
| TR-1 | For issues Siteimprove detects, WHM doesn't keep its own fix status. Owners fix and recheck in Siteimprove. WHM shows progress from Siteimprove's checks: for example, "6 pages fixed since the last check, 2 new". It links each page to Siteimprove. | Project brief; US7 | P1, P2, P3 | WHM's own storage | Prototype |
| TR-2 | **TR-2 (revised):** For editorial issues only, meaning those Siteimprove doesn't manage (content freshness, duplicate content, low-traffic pages), an owner can mark each page:<br>• "I updated this page"<br>• "still correct"<br>• "set aside until \[date\]"<br>This works one page at a time or several at once, is kept between visits, and the issue shows a summary such as "4 of 38 pages reviewed." | Project brief limits putting off to editorial choices; US8 | P1, P2, P3 | WHM's own storage | Prototype |
| TR-3 | An owner can add a note to any issue. The note is labeled as their own and as visible to every owner of that site, with who wrote it and when. It is not sent to SWS. | Project brief | P1, P2, P3 | WHM's own storage | Prototype |
| TR-4 | The accessibility specialist can attach a note to an issue type for all sites or for one site. Owners see it, and it carries over from one check to the next. | Project brief; US11 | P6 | Keyed by WHM issue type, which maps to Siteimprove rule or policy IDs (SI-05, SI-23) | Prototype (entered in `data/annotations.json`) |
| TR-5 | SWS can mark an issue "SWS is handling this," which moves it out of the owner's fix list into a separate, visible list. | US4, US11; X-06 | P6, P2 | X-06 | Prototype |
| TR-6 | An owner can see progress over a period: issues fixed, put off and still open. | US6, US7 | P1, P3 | WHM's own storage plus check history | MVP |

## Access, multiple sites and delivery

Owners see only their own sites, get a rollup when they have several, and receive results by dashboard and email. SWS sees every site, so it can act before owners ask.

| ID | Requirement | Why | Personas | Data | Phase |
| --- | --- | --- | --- | --- | --- |
| AC-1 | Only signed-in Stanford users can reach WHM. | Project brief | All | Stanford SSO | MVP. The fair prototype on GitHub Pages has no sign-in (decision, Nov 12). |
| AC-2 | An owner sees only the sites assigned to them. One owner can have many sites, and one site can have many owners. | Project brief | P1 to P4 | Registry (AD-1) | Prototype shows the concept (a "Viewing as" switch); MVP enforces it |
| AC-3 | An owner with more than one site sees a rollup of all their sites, ordered by which needs attention most. | Approved description (consolidated overview); 11 of 14 manage more than one site; R10 | P1, P3 | SI-01 plus per-site results | Prototype |
| AC-4 | Owners receive a summary email: the headline, top items, data date, and a link to the dashboard. | 9 of 14 chose email and 9 chose a dashboard | P1, P2, P3 | Same as SP-1 | Prototype as a static view; MVP sends it |
| AC-5 | Owners choose how often they get the summary, and separately whether to be alerted to new high-priority issues. | Weekly 5, monthly 5, real-time 4. The findings report notes the frequency question was likely read as notification frequency. | P1, P2, P3 | — | MVP (frequency); Later (alerts) |
| AC-6 | An owner can produce a summary for a supervisor or approver that shows only that site and no notes. | US5, US6; 10 of 12 asked report data up | P3, P1 | Same as SP-1 | Prototype (shareable or printable view) |
| AC-7 | Slack delivery. | 3 of 14, each only as a second choice alongside a dashboard | P1, P3, P4 | — | Later |
| AC-8 | SWS staff see every client site in one list, ordered by need, with each site's owners and its last data run, so SWS can contact owners before problems grow. | Approved description: SWS gains a proactive maintenance and client communication tool | P5, P6 | Per-site results; registry | Prototype |

## Administration and data runs

An SWS administrator registers a site, starts a data run from the prototype, and can see when it finished and how current the data is.

| ID | Requirement | Why | Personas | Data | Phase |
| --- | --- | --- | --- | --- | --- |
| AD-1 | A registry holds, for each site: name, URL, Siteimprove site ID, GA4 property ID (optional), owners and goals. | US10; project brief | P5 | SI-01, GA-01, OT-03 | Prototype (JSON file in the repo) |
| AD-2 | An administrator can start a data run for one site or all sites from a button in the prototype. | Project decision, Nov 12 | P5 | — | Prototype |
| AD-3 | Each run reports in progress, complete or failed, with the reason for a failure and the time it finished. | Project brief ("know when it is complete") | P5 | SI-33, GA-15 | Prototype |
| AD-4 | Every owner view shows how old its data is and which source it came from. | US9; the earlier WHM example shows data age; SI-33 | All | SI-33, GA-15 | Prototype |
| AD-5 | WHM checks the IDs and access at registration or at the first run, and gives an error message that names the specific problem. | US10; Siteimprove API access depends on the API user's permissions (SI-01) | P5 | SI-01, GA-01 | MVP (prototype gives basic errors) |
| AD-6 | Key numbers from each run are kept so trends don't depend only on what the source tools keep. | Project brief (historical data) | P5, all owners | SI-03, SI-13, SI-25 | MVP (prototype may simulate) |
| AD-7 | SWS-only items never appear in owner views. These include SWS admin policies and documents flagged for personal ID numbers. | SI-23, SI-20 | P5, P6 | SI-20, SI-23 | Prototype |
| AD-8 | Administrators can register and update many sites at once. | Stanford Sites alone hosts more than 1,200 sites | P5 | SI-01 | Later |

## Content, goals and freshness

The AI content report is a named deliverable in the approved description. Stale content is the most common trigger for changes (13 of 14), but WHM has no confirmed way to detect it yet.

| ID | Requirement | Why | Personas | Data | Phase |
| --- | --- | --- | --- | --- | --- |
| CT-1 | WHM flags pages that may be out of date, and the owner can confirm a page is still correct (see TR-2). | 13 of 14 ticked stale content as a trigger; US8 | P1, P2, P3 | SI-17 (unconfirmed); fallbacks listed under Data gaps | Prototype (simulated); MVP after research |
| CT-2 | Well-visited pages that have open issues or low engagement are named in the summary. | Approved description (user engagement); the earlier WHM example | P1, P2, P3 | X-01, X-02, GA-04 | Prototype |
| CT-3 | Each site's goals are recorded and used to frame its findings. For example, a quick-exit support site is judged differently from a site meant for browsing. | R2, R6, R10 describe different goals per site | P1, P3 | OT-03 | MVP (prototype shows one example) |
| CT-4 | A report compares the site's public page content with its analytics (top pages, landing pages, engagement, site search), and recommends changes that would close the gap between what visitors look for and what the site offers. It is generated by AI, labeled as AI-generated, and shows its SWS review status. | Named deliverable in the approved description; R13: success is users finding answers "without needing to follow up with a person" | P1, P2, P3 | X-05; SI-16; GA-03, GA-04, GA-05, GA-08; public page text | Prototype (labeled sample); MVP (generated with the Claude API, reviewed by SWS before owners see it) |
| CT-5 | Owners can see what visitors search for on the site. | Findability appears in 6 of 12 goal answers in the original report | P1, P3, P4 | GA-08 | Prototype (live for sites with a GA4 property; only terms searched at least 5 times, with personal-looking terms removed) |
| CT-6 | Pages with little or no traffic are listed for review, labeled "review," not "delete." | R9: "There is too much content"; X-03 | P1, P2 | X-03 | Later |
| CT-7 | WHM points out content repeated in several places on a site. | R14; US12 | P2, P3 | Not in inventory (see Data gaps) | Later |
| CT-8 | Owners can see visits that come from AI assistants and AI search. | R3 and R5 asked for GEO and AEO data; both existing dashboards already show AI referrals | P4, P1 | GA-07 | Later (prototype optional) |

## Quality requirements

WHM has to meet the standards it reports on, and every number has to be trustworthy, or owners will stop using it.

| ID | Requirement | Why | Phase |
| --- | --- | --- | --- |
| Q-1 | WHM meets WCAG 2.2 AA. Every chart has a data-table alternative. | WHM reports accessibility to owners; the inventory frames issues against WCAG 2.2 AA (SI-05) | Prototype |
| Q-2 | The web interface and emails use Decanter v7 and Stanford identity. | Project decision, Nov 12 | Prototype |
| Q-3 | Text uses plain language, and analytics terms are explained where they appear, with a glossary available. Reading level target: 8th grade. | US3; both existing dashboards include a glossary | Prototype |
| Q-4 | Each metric comes from one source, and WHM never shows two different values for the same measure. | Project decision, Nov 12 (source roles revised Nov 13 to match the approved description) | Prototype |
| Q-5 | The same page reached by different URLs is counted as one page. This covers trailing slashes, letter case, query strings and redirects. | Project brief; X-01 lists URL normalization as the main technical risk | Prototype for the demo sites; MVP in general |
| Q-6 | Alerts and new flags appear only for new or worsening high-priority issues. Issues SWS has confirmed as false positives can be hidden. | R6's alt-text complaint; US2 | MVP |
| Q-7 | When data is missing, late or failed, WHM says so rather than showing old numbers as current. | GA-15; SI-33; R6's doubts about GA bot traffic | Prototype |
| Q-8 | WHM shows only aggregate visitor data. Sensitive findings (SI-20) are SWS-only. Any campus vs. non-campus segmentation gets a privacy review first. | SI-20, GA-12 caveats | MVP |

## Data gaps

The largest gap is content freshness: owners name it most often and the inventory has no confirmed source. The table compares what owners and the approved description ask for with what the Oct 15 inventory covers. Possible sources are candidates to check, not confirmed options.

| Need | Asked by | Inventory coverage | Possible source to investigate |
| --- | --- | --- | --- |
| Site Target Score and its history | SWS: Stanford's primary score, set with Siteimprove; every site is expected to reach 100 | Not in the Oct 15 inventory. Shown in the IAIS dashboard (98.04) and the earlier WHM example (98.3) | Found Nov 20: `a11y/overview/site_target/overview`, with daily history from Aug 2025 in `a11y/overview/site_target/history` |
| Content age or freshness | 13 of 14 (stale-content trigger) | SI-17 unconfirmed | Stanford Sites (Drupal) last-changed date; HTTP Last-Modified header; sitemap lastmod |
| Public page text for the AI report | Approved description | SI-16 lists pages, not their text | Fetch the public pages directly during the data run |
| AI service for the report | Approved description | None | Claude API (Anthropic), decided Nov 13; used from the MVP on, not in the prototype |
| Site goals and page purpose | R2, R6, R10 | OT-03, manual only | Owner intake form; SI-19 meta tags, if Stanford Sites templates output them |
| Campus vs. non-campus visitors | R7, R11 | GA-12 has no campus dimension; SI-30 segments must be set up first | GA4 custom dimension or Siteimprove segment; needs privacy review |
| Visitor sentiment ("did this help you?") | R12 | None | A page-feedback feature on Stanford Sites, which would be a new data source |
| Where an image is used on the site | R4 | None | Drupal media usage data on Stanford Sites |
| Content repeated in several places | R14 | Partial: the earlier WHM example shows pages that share a title; SI-21 covers duplicate meta descriptions | Text comparison across the page inventory |
| AI search visibility (GEO/AEO) | R3, R5 | GA-07 covers AI referrals only | A GEO tool (R3 already uses one) |
| Performance | Approved description; R1, R4 | SI-32 unconfirmed; OT-01 not researched | PageSpeed Insights on the top 3 pages (SP-8) |
| False-positive handling | R6 | None | TR-4 and TR-5 annotations; Siteimprove's dismissed-issue state, if the API exposes it |
| Who owns which site | Project brief | None | Registry for now (AD-1); a Stanford Sites or directory source to be identified |
| Issue state (fixed, put off, notes) | Project brief | None | WHM's own storage |
| Sending email | 9 of 14 chose email | None | Email delivery service \[CONFIRM APPROVED STANFORD SERVICE\] |

## Out of scope and open questions

**Not in the prototype:**

- Per-user sign-in and enforced site access. The concept is shown; the fair site on GitHub Pages has no sign-in.
- Sending real email.
- Real-time alerts.
- Slack delivery.
- Bulk administration.
- Automated freshness detection.
- Generated AI reports. They appear as labeled samples.
- Siteimprove pre-publish checks (SI-34).
- GA4 realtime data (GA-16).

**Open questions**

- Can a site's co-owners edit or delete each other's notes, or only add their own?
- Can any owner put off an editorial issue, or only the owner with final say?
- Should "still correct" expire, so the page is flagged again after a set time?
- What should happen when Siteimprove hasn't checked a site for a long time?
- What do owners mean by report frequency? Interview question 1 in the findings report.
