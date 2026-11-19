# WHM Roadmap

Nov 12, 2026 · @Someone

## At a glance

The roadmap moves from a fair prototype to client discovery, an MVP pilot, and then expansion. Each move depends on a gate being passed. Like any roadmap in the Pragmatic Framework, it is a plan, not a commitment.

&#91;embedded content: WHM roadmap · 4 phases, 3 gates\]

Phase 0 is the current phase. The gate criteria are listed in each phase section below.

## Phase 0: Prototype for the Dec 8 fair

By Dec 8, the prototype runs the owner experience end to end with live Siteimprove data for one site, sitesuserguide.stanford.edu, including traffic if Siteimprove Analytics is on for it. Google Analytics data and the AI content report appear as labeled samples and go live in the MVP (decision, Nov 13). This covers part of the approved initial deliverable, and the fair version should say so. The other two demo sites run on labeled sample data. Weekly dates are proposed.

**Scope (requirements tagged Prototype):** Built first, because the approved description names them: SP-1 to SP-8, AC-3, AC-8, AD-1 to AD-4, AD-7, CT-2, CT-4 (labeled sample), CT-5 (labeled sample), Q-1 to Q-5, Q-7. Shown in the clickable demo and built after those: TR-1 to TR-5, AC-2 (concept), AC-4 (static email), AC-6, CT-1 (simulated).

| Week of | Focus | Done when |
| --- | --- | --- |
| Nov 16 | Decisions and setup: Siteimprove API user for sitesuserguide.stanford.edu; endpoint checks, including where the Site Target Score lives and whether Siteimprove Analytics is on; SU-SWS repo, registry file, Decanter v7 scaffold | Siteimprove API calls return data for the live site |
| Nov 23 (Thanksgiving, Nov 26 to 27) | Approved-scope screens on sample data: rollup, site summary, both list views, issue detail, trends for Site Target Score, accessibility, broken links and traffic, SWS all-sites view; static email and share views | All approved-scope screens clickable on sample data |
| Nov 30 | Live Siteimprove data: fetch for the live site, including Siteimprove Analytics traffic if available; URL normalization; run button and status; labeled sample Google Analytics sections and AI report in place; top-3-page speed check if time allows | One run refreshes the live site from Siteimprove |
| Dec 7 | Brief-driven additions if time allows (tracking states, notes, specialist notes), then freeze and rehearse: accessibility check, demo script, fallback to last good data | Two rehearsals done by Dec 7 |

**Gate 1, ready for the fair:**

- The live site shows live Siteimprove data, trend charts and the issue feed. Google Analytics data and the AI content report appear as labeled samples.
- An administrator registers a site in the sheet, starts a run, and sees it complete.
- SWS can see all demo sites ranked by need.
- Every view shows data age and source.
- The demo still works if live data fails.

## Phase 1: Client discovery with the prototype

After the fair, the prototype becomes the prop for follow-up interviews. This phase ends when MVP scope is agreed. Proposed timing: Dec 9 to \[INSERT END DATE\].

**Who to talk to.** The nine respondents who agreed to a call, in the findings report's priority order: R6, R10, R5, R7, R12, R9, R2, R1, R8. R3, R4, R11, R13 and R14 declined and should not be contacted.

**What to learn**

- Whether owners read the headline and fix list as intended (SP-1, SP-3) and when they switch to the plain view (SP-4).
- What "frequency" means to them, and what would make an alert worth receiving (AC-5).
- What an approver needs to see to say yes (AC-6, Persona 3).
- Whether Persona 4's needs go beyond the plain view (it stays a separate persona, decision Nov 13).
- Answers to the open questions in the requirements doc: who can edit notes, whether "still correct" expires, what happens when a "set aside" date arrives, and what happens to items left "waiting for the next check."

**What to settle on the data side**

- A source for content freshness (SI-17 or a fallback such as the Stanford Sites last-changed date).
- Which Siteimprove endpoints exist in practice, including whether Core Wins (SI-31) or dismissed-issue states are exposed.
- For each metric, whether Siteimprove covers it or GA4 is needed (Q-4). Get GA4 service-account access and a Claude API key in place before the MVP build starts.

**Gate 2, MVP scope agreed:**

- Pilot sites and owners chosen: \[INSERT NUMBER OF PILOT SITES\].
- A freshness approach chosen, or explicitly deferred.
- Targets set for the pilot success measures (see Phase 2).
- An SWS owner named for the plain-language issue library (OT-04).

## Phase 2: MVP pilot

The MVP turns the prototype's concepts into working parts for a small set of real client sites: enforced per-site access, stored issue state, and summary emails that are actually sent. Timing: \[INSERT MVP WINDOW\].

| Area | MVP adds | Requirement IDs |
| --- | --- | --- |
| Access | Per-user Stanford sign-in; owners see only their own sites | AC-1, AC-2 (enforced) |
| Delivery | Summary email sent on each owner's chosen schedule | AC-4, AC-5 (frequency only) |
| Tracking | Issue state, notes and history stored by WHM; progress over time | TR-1 to TR-5 (persisted), TR-6, AD-6 |
| Administration | ID and access checks with clear errors | AD-5 |
| Content | Real freshness flags if Gate 2 found a source; per-site goals; live Google Analytics data; AI report generated with the Claude API for every pilot site, reviewed by SWS before owners see it | CT-1, CT-3, CT-4, CT-5 |
| Trust | URL normalization for any site; low-noise flags; privacy rules | Q-5, Q-6, Q-8 |
| Measurement | Usage tracking on WHM itself, so the pilot can be judged | OT-05 |

**Gate 3, ready to expand:** pilot success measures were adopted Nov 13; targets for each are set at Gate 2: \[INSERT TARGETS\]. The measures are: the share of owners who open the summary email, the number of issues confirmed fixed per site, owners' own rating of usefulness in pilot interviews, and the change in support requests from pilot site owners (the approved description's goal of reducing support burden).

## Phase 3: Expansion toward the full service

After the pilot, WHM scales to many sites and adds the categories in the health definition that the MVP leaves out. The table is ordered by how many respondents asked for each item. The order is a starting point for Phase 3 planning, not a commitment.

| Enhancement | Requirement or data | Asked by |
| --- | --- | --- |
| Alerts for new high-priority issues | AC-5 | 4 chose real-time; R6 asked to be "notified automatically" |
| Bulk site administration and a Stanford Sites link for owners and dates | AD-8; Data gaps | Stanford Sites hosts more than 1,200 sites |
| Slack delivery | AC-7 | 3 of 14, each as a second choice |
| Performance beyond the top 3 pages | OT-01 | R1, R4 |
| Campus vs. non-campus visitors, after privacy review | Data gaps; Q-8 | R7, R11 |
| AI search referrals and visibility (GEO/AEO) | CT-8, GA-07 | R3, R5 |
| Low-traffic page review | CT-6, X-03 | R9 |
| Repeated content | CT-7 | R14 |
| Where an image is used | Data gaps | R4 |
| Visitor sentiment | Data gaps | R12 |
| Search Console data | OT-02 | 3 named it as a tool they use |

The Pragmatic Framework also covers go-to-market work such as launch, retention and stakeholder management. Those belong in this phase once the service model is set; this roadmap covers only the product.

## Dependencies and decisions

Rows needed by the week of Nov 16 block the prototype. The rest can wait until the gate they're tied to.

| Dependency or decision | Needed by | Owner |
| --- | --- | --- |
| Live demo site: sitesuserguide.stanford.edu (switched from webservices.stanford.edu, Nov 13) | Week of Nov 16 | \[INSERT OWNER\] |
| Siteimprove API service user with access to that site (SI-01) | Week of Nov 16 | \[INSERT OWNER\] |
| Where the Site Target Score is in the Siteimprove API, and whether its history is available | Week of Nov 16 | \[INSERT OWNER\] |
| Siteimprove Analytics is on for sitesuserguide.stanford.edu (SI-27, SI-28; confirmed Nov 13) | Week of Nov 16 | \[INSERT OWNER\] |
| GA4 property access through a service account, and a Claude API key (Anthropic) stored as a repo secret | Before the MVP build (Phase 1) | \[INSERT OWNER\] |
| Private Pages not available to SU-SWS (confirmed Nov 13), so the fair site is public | Week of Nov 16 | \[INSERT OWNER\] |
| Plain-language text for each issue type shown (OT-04) | Week of Nov 30 | \[INSERT OWNER\] |
| Content freshness source | Gate 2 | \[INSERT OWNER\] |
| Storage for issue state and history | Phase 2 start | \[INSERT OWNER\] |
| Approved email delivery service | Phase 2 start | \[INSERT OWNER\] |
| Privacy review for visitor segmentation | Phase 3 | \[INSERT OWNER\] |
