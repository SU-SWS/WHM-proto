# WHM Personas

Nov 12, 2026 · @Someone

*The repo copy is the place of record (Nov 23). Last updated Nov 23, 2026; `decisions.md` has the reasons for each change.*

## About these personas

Six personas: four site-side user personas built from 14 survey responses, and two SWS internal roles built from the project brief and the data inventory.

- **Survey base (n=14):** R1 to R13 as numbered in the Oct 27 findings report, plus the Oct 30 response as R14. Counts below are out of 14 unless stated.
- **Nov 6 response:** same email address as R9. Not counted; used only as qualitative notes, marked where it appears.
- **Labels, not names:** personas use role labels rather than invented names, so nothing reads as a real person.
- **Mapping:** each respondent has one primary persona; some have a secondary one (see the map at the end).
- **Quotes:** verbatim from the responses sheet.
- **Confidence:** directional only. The sample is small and recommended rather than random, and only 7 of 14 hold final say over content. The internal personas have no survey evidence and should be checked with the SWS staff in those roles.

## At a glance

The four user personas differ mainly on three things: how many sites they manage, whether they hold final say, and whether they want the report to set priorities for them.

| Persona | Type | Primary respondents | Core need | Delivery asked for | Default view |
| --- | --- | --- | --- | --- | --- |
| 1. Portfolio site manager | User | R1, R5, R6, R8, R10 | Know which of several sites needs attention and what to fix first | Dashboard + email; some want real-time alerts | Prioritized |
| 2. Single-site owner, light data user | User | R7, R9, R11 | A short, plain answer to "is my site OK, and what do I do?" | Email; Slack or real-time alerts as second choice | Prioritized (R11: plain) |
| 3. Contributor who needs sign-off | User | R2, R12, R13, R14 | Evidence and a shareable summary for the person who approves changes | Dashboard + email or Slack | Mostly prioritized (R12: plain) |
| 4. Self-directed analyst | User | R3, R4 (R8, R12 secondary) | All key findings laid out plainly, with links into the source tools | Dashboard + email or Slack | Plain |
| 5. SWS administrator | Internal | Project brief | Register sites and data sources, start data runs, confirm they finished | Admin registry (Google Sheet for the prototype) | n/a |
| 6. SWS accessibility specialist | Internal | Project brief, data inventory | Add notes to issues and mark platform issues so owners see accurate, actionable items | Issue annotation | n/a |

## Persona 1: Portfolio site manager

Holds final say over several sites with different goals, and wants to be told which site and which issue need attention first.

**Profile.** Final say over content. Manages 2 to 10 sites and makes most changes personally. Checks Google Analytics and Siteimprove occasionally (R1, R6, R10) or uses data heavily (R5).

**Evidence**

- 11 of 14 respondents manage more than one site; this persona holds most of the final-say multi-site cases.
- Goals differ by site. R6 gave two sites with two goals. R10: "For a service and support oriented website like uit.stanford.edu, I want people to find the content, get in and get out quickly." For community sites, "it's okay for people to explore different resources and dwell on the site."
- R10 asked for an "Aggregate of user tracking and web analytics across uit.stanford.edu and services.stanford.edu."
- R1 wants "Problem pages, slow pages, pages with low interaction."
- R5 reviews data "Only when prompted" despite a large data role, and wants "AEO data."

**Frustrations**

- Digging through Siteimprove to find issues. R6: "it would be great to be notified automatically."
- Flags that are wrong. R6 is flagged for missing alt text "when we already supplied alt text when uploading the image."
- Data that can't be trusted. R6: "GA is less useful now because of bot traffic."

**What this persona needs from WHM**

- A rollup across all their sites, with each site's health stated in one line.
- A fix list per site, ordered by visitor impact.
- Per-site goal context, since one standard doesn't fit every site.
- Notification when something changes, with few false alarms.

**Delivery.** Dashboard plus email for R5 and R6; email only for R1; dashboard plus real-time alert for R10. R1, R5, R6 and R10 want the report prioritized for them. R8 gave no delivery preference and wants it plain, which overlaps with Persona 4. Frequency is weekly (R1, R5), monthly (R6) or real-time (R10); R8 chose weekly.

## Persona 2: Single-site owner, light data user

Runs one site, looks at data rarely or never, and needs a plain answer about what to do and whether they can do it themselves.

**Profile.** Responsible for one site and makes changes personally or "depending on the change." R7 and R9 hold final say; R11 does not. Data plays some role for R7 and little or none for R9. R11 doesn't look it up at all.

**Evidence**

- R7 measures success by "reduced support tickets and broader adoption of the platform," not by analytics.
- R9: "The website needs to be accessible and people need to find what they are looking for with easy navigation."
- R11 wrote "I don't look it up - but I would love to," and wants "Analytics and number views on each page (external or internal Stanford)- for the past year."
- R7 wants "Better data on campus visitors (as opposed to non-Stanford visitors)."
- None of the three report data to a supervisor; R9 skipped that question.
- *Nov 6 note (same address as R9, not counted):* the later response wants "to learn about what data is available to me and the team." It also preferred "Everything at once" and "Presented plainly," which conflicts with R9's answers.

**Frustrations**

- Time and consistency. R7: "Finding time, enforcing consistency."
- Volume. R9: "There is too much content."
- Dependence on others. R9's only stall reason is waiting on IT or developer availability.

**What this persona needs from WHM**

- A short summary in plain language, with no analytics vocabulary needed to understand it.
- Each issue marked as something they can fix, or something SWS or IT has to fix.
- Page views over time for their own pages.
- A short explanation of what each data source can tell them. (This comes from the Nov 6 note and is unconfirmed.)

**Delivery.** Email for R9 and R11, each paired with real-time alerts. Dashboard plus Slack for R7. R7 and R9 want a prioritized report; R11 wants it plain. Monthly for R7 and R11; real-time for R9.

## Persona 3: Contributor who needs sign-off

Edits several sites but someone else approves changes, so the report has to help make the case to that person.

**Profile.** Contributes to decisions; someone else has final say. Manages 2 to 5 sites and mostly makes changes personally. Data role is some (R2, R12, R13) or little to none (R14).

**Evidence**

- Waiting on approval was cited by 5 of the 7 respondents without final say, compared with 4 of the 7 who have it.
- R12: "creating the content and then waiting for final approval can sometimes take too long."
- R2, R12 and R13 report data up to a supervisor or client; R12 does so regularly. R14 skipped the question.
- Findability is the goal for most. R13: "Success looks like users find answers to their questions quickly and without needing to follow up with a person."
- R14 manages three sites with different update rhythms; one changes "once a year when content refreshes for the printed book."
- R12 wants "Real-time user sentiment... as in, did this help you, or did you find what you needed?"

**Frustrations**

- Approval wait times (R12).
- Duplicate content. R14: "sometimes same content lives in multiple places on website."
- Platform limits. R2 names "Our backend."

**What this persona needs from WHM**

- A summary that can be forwarded to an approver or supervisor as it is.
- Evidence attached to each recommended change (traffic, standard broken, visitor impact), so the approver has a reason to say yes.
- A way to track what was fixed, deferred or is waiting on someone else.
- Different expectations per site, so a once-a-year site isn't flagged as stale.

**Delivery.** Dashboard plus email for R2 and R12; dashboard plus Slack for R13; email only for R14. R2, R13 and R14 want prioritized; R12 wants plain. Frequency is monthly (R2, R14) or real-time (R12, R13).

## Persona 4: Self-directed analyst

Already uses several data tools and wants the findings laid out plainly so they can set priorities themselves.

**Profile.** Contributes to decisions (R3) or doesn't make content decisions (R4), but works close to the data. Manages 2 to more than 10 sites. Names five or more tools. Calls their own changes proactive. Reviews data on a regular schedule.

**Evidence**

- 5 of 14 chose "Presented plainly, I'll decide" (R3, R4, R8, R11, R12). R4 is the only counted respondent who wanted "Everything at once"; the Nov 6 note says the same.
- R3 named Google Analytics, Hotjar/Content Square, Siteimprove, "Teneo for GEO (new)", Lighthouse and Vertex search usage.
- R4 named GA4, Google Search Console, Siteimprove, New Relic and Hotjar, and listed technical performance as a top quality priority (3 of 14 did).
- R3 on conflicting goals: "In UComm our business goals often eclipse user goals."
- R3 on what stakeholders ask for: "We don't have nearly as much event tracking on every little thing as people tend to want access to."

**Frustrations**

- Tool gaps. R4: "Lack of functionality to identify where images are used in the site."
- Unclear ownership. R4 is one of 2 respondents who cited "Unclear who owns the decision."

**What this persona needs from WHM**

- A plain view showing all key findings without ranking, available alongside the prioritized default.
- A direct link from each finding to the matching page in Siteimprove or Google Analytics.
- AI search (GEO/AEO) and technical performance as categories of their own.
- Clear labels showing where each number comes from, since they will compare it with their own tools.

**Delivery.** Dashboard plus Slack for R3; dashboard plus email for R4. Both weekly. Both want plain.

## Persona 5: SWS administrator (internal)

Sets up each client site in WHM, links it to its data sources and owners, and needs to know whether each data run finished and is current.

**Basis.** Project brief and data inventory; no survey evidence.

**Tasks**

1. Register a client site: name, URL and goals, if the owner has supplied them (OT-03).
2. Enter data source IDs: the Siteimprove `site_id` (SI-01) and, where used, the GA4 property ID (GA-01).
3. Link site owners to sites. One owner can have many sites and one site can have many owners.
4. Start a data-gathering run and confirm it completed, failed or is out of date (SI-33, GA-15). Then review all client sites ranked by need, and contact the owners of sites that need attention. This is the proactive maintenance role in the approved project description.

**Constraints and pain points**

- Scale. Stanford Sites alone hosts more than 1,200 sites (per webservices.stanford.edu). The prototype needs only one to three sites, but the registry design affects later scale.
- API permissions. The Siteimprove API user inherits that user's access, so it needs a service user that can see every client site (SI-01).
- Admin-only content. Some Siteimprove policies are SWS admin tasks and must not appear in owner views (SI-23).
- Data source choice. Each metric has one source, so the administrator never has to reconcile two traffic numbers. A site with a GA4 property gets its traffic from GA4; Siteimprove Analytics covers sites without one (decisions, Nov 23).

**What this persona needs from WHM**

- A single registry of sites, owners and source IDs. For the prototype this is a JSON file in the repo.
- A one-step way to start a run, and a visible status per site: last run, result, data age.
- Clear error messages when an ID is wrong or access is missing.

## Persona 6: SWS accessibility specialist (internal)

Reviews flagged accessibility issues and adds context, so owners act only on issues that are real and that they can fix.

**Basis.** Project brief and data inventory notes; no survey evidence. Owner-side evidence comes from R6.

**Tasks**

1. Review high-priority accessibility issues and policy matches before or after owners see them.
2. Mark an issue as a platform or template issue that SWS will fix, rather than the owner. The earlier WHM example (Sites User Guide mockup) shows one such case: low-contrast text that "comes from the site template."
3. Add a note to an issue that every owner of that site will see.
4. Keep the plain-language issue library current, reviewed quarterly (OT-04, seeded from Siteimprove policy notes, SI-26).
5. Keep the mapping of who can fix each issue type: owner or SWS (X-06).

**Constraints and pain points**

- False alarms damage trust. R6's alt-text complaint shows owners stop relying on flags that are wrong.
- Siteimprove scores and rules belong to Siteimprove, not Stanford. Some issues need human judgment before they reach owners (SI-02, SI-06).
- The data inventory records a request that reported issues be actionable, with prioritization weighted toward issues owners can fix (X-01, X-06).

**What this persona needs from WHM**

- Notes attached to an issue type or rule, so they carry over from one check to the next.
- A clear visual difference between a specialist note (shown to owners) and an owner's private note (shown only to that owner).
- A way to move an issue out of the owner's fix list into an "SWS is handling this" state.

## Respondent map and open questions

Every counted respondent maps to one primary persona. Use the R-number to look up the full profile in the findings report appendix; R14 is the Oct 30 response.

| Respondent | Final say | Sites | Data role | Primary persona | Secondary |
| --- | --- | --- | --- | --- | --- |
| R1 | Yes | 6 to 10 | Some | 1 Portfolio manager |  |
| R2 | Contributes | 2 to 5 | Some | 3 Contributor |  |
| R3 | Contributes | More than 10 | Large | 4 Analyst | 3 Contributor |
| R4 | No | 2 to 5 | Some | 4 Analyst |  |
| R5 | Yes | 2 to 5 | Large | 1 Portfolio manager |  |
| R6 | Yes | 2 to 5 | Some | 1 Portfolio manager |  |
| R7 | Yes | 1 | Some | 2 Single-site owner |  |
| R8 | Yes | 2 to 5 | Some | 1 Portfolio manager | 4 Analyst |
| R9 | Yes | 1 | Little or none | 2 Single-site owner |  |
| R10 | Yes | 6 to 10 | Some | 1 Portfolio manager |  |
| R11 | No | 1 | Large (contradicted) | 2 Single-site owner |  |
| R12 | Contributes | 2 to 5 | Some | 3 Contributor | 4 Analyst |
| R13 | Contributes | 2 to 5 | Some | 3 Contributor |  |
| R14 | Contributes | 2 to 5 | Little or none | 3 Contributor |  |

**Open questions to test in follow-up interviews**

- Persona 4 stays a separate persona (decision, Nov 13). Interviews should check whether its needs go beyond the plain view: five people want that view, but only two have the full analyst profile.
- Does Persona 2 not use data because they don't want to, or because they don't know what is available? R11's comment and the Nov 6 note both suggest the second.
- What would make an approver say yes faster (Persona 3)? R12 and R2 agreed to a call; R13 and R14 did not.
- Do the internal personas match how SWS staff work today? Check with the administrator and accessibility specialist roles before writing requirements.
