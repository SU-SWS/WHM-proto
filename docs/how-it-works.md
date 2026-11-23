# How the WHM prototype works

*For updating the WHM presentation deck with an appendix. Current as of November 23, 2026. Prototype site: https://su-sws.github.io/WHM-proto/*

Website Health Monitoring (WHM) turns Siteimprove and Google Analytics data into a short, plain-language picture of each site's health: what's wrong, what to fix first, and who fixes it. It summarizes and links to the source tools rather than replacing them.

## 1. What's real and what's a sample

| | What it shows | Where it comes from |
| --- | --- | --- |
| **Live** (sitesuserguide.stanford.edu only) | Site Target Score and accessibility score, with monthly history; broken links; accessibility issues; Stanford policy issues; pages missing a search description; the date of the latest check | Siteimprove API |
| **Live** | Page views per page and per month; the most visited pages; engagement rate per page; what visitors search for on the site | Google Analytics 4 |
| **Sample, labeled** | Two other demo sites (Stanford Web Services, Decanter) | Written for the demo |
| **Sample, labeled** | AI content report; speed check | Written for the demo; planned for the MVP |
| **Simulated, labeled** | Pages not updated in a year (content freshness) | No reliable source yet; kept to start the conversation with owners |

Every section on every page says where its data came from and how old it is, for example “Siteimprove check of Nov 20, 2026. Live data.”

**One analytics source per site.** If a site has a GA4 property, all its visitor numbers come from GA4. Siteimprove Analytics is used only for a site without GA4, so it still gets some numbers. If the GA4 export is late or missing, WHM shows the last GA4 numbers it has and says they may be out of date; it never quietly swaps in Siteimprove's numbers, which are counted differently.

## 2. How data gets to the page

1. **Data run, weekly or on demand.** A GitHub Actions workflow calls the Siteimprove API with credentials stored as GitHub secrets, builds one data file per site, and publishes the site. An SWS administrator can start an extra run: the Admin page's “Start data run” opens it in GitHub, and the Admin page then follows the run step by step until the new data is live.
2. **GA4 export, daily.** A small Google Apps Script, run under an SWS Google account, pulls page views, engagement and site search from GA4 and adds them to the repo. The next data run merges them in.
3. **Static site.** The website is plain files on GitHub Pages. The browser never talks to Siteimprove or Google, so no credentials ever reach a visitor.

If part of a data run fails, that part keeps its last good data and the Admin page says what failed. Old numbers are never shown as current.

## 3. How WHM decides what matters

- **One verdict per site.** Rules, written in plain language for SWS review, set each site to “needs attention,” “in good shape, with fixes worth making,” or “in good shape”. For example, a site needs attention if its Site Target Score dropped since the last check, or an issue sits on one of its five busiest pages.
- **Ranked by visitors.** “Prioritized for me” orders the owner's issues by how many visitors see the affected pages. It shows the top five first. “Show everything plainly” lists every issue, unranked, by category.
- **Owner or SWS.** An issue found on nearly every page (90% or more) comes from the shared site template, so it moves to “Being handled by SWS” instead of the owner's list. Broken links in the shared Stanford footer are treated the same way.
- **Noise filtered out.** Incomplete Siteimprove checks are skipped. Platform pages that every Stanford Sites site shares, such as search, sign-in and “page not found,” are left out of “busiest pages.”
- **Plain language.** Each issue says what it is, why it matters, what to do, and who fixes it, at about an 8th-grade reading level. Draft wording is marked “not yet reviewed by SWS.”
- **Low engagement named.** A well-visited page where far fewer visitors stay than on the site's typical page is named in the summary.

## 4. Summarize and link: one system of record

Site owners already have Siteimprove accounts, so WHM doesn't rebuild Siteimprove:

- WHM shows **which pages** have each issue, ranked and explained, with an **“Open in Siteimprove”** link to each page's report. Siteimprove remains where owners see the exact item and fix it.
- WHM doesn't keep its own “fixed” status for issues Siteimprove detects. Instead, it compares each Siteimprove check with the last one and reports the difference, for example “Since the check of Nov 16: 6 pages fixed, 2 new.”
- The one place WHM tracks progress itself is **content freshness**, which Siteimprove doesn't manage. Owners mark pages “updated,” “still correct,” or “set aside until a date.”
- Owners can leave **notes** for their site's other owners. In the prototype, tracking and notes are saved only in the browser being used.

## 5. Who sees what

- **Site owners** see their own sites: a portfolio rollup, a page per site, a page per issue, a printable summary to share with an approver, and a preview of the summary email.
- **SWS staff** also see every client site ranked by need, and the Admin page: the site registry, the data run, and the accessibility specialist's notes.
- A **“Viewing as”** switch demonstrates this. Sign-in isn't set up in the prototype, so the switch shows the idea rather than enforcing it.

## 6. Privacy and safety

The prototype site and its code are public; the data isn't sensitive, and every page asks search engines not to index it.

- Owners appear only as role labels (“Owner A”). There are no names or email addresses.
- Site search terms are published only if at least 5 people searched them in 90 days and they don't look like an email address, phone or ID number, or web address. Of 323 terms in the first export, 12 met that bar.
- Only Stanford policies with an approved name prefix (QA, accessibility, SEO) are shown. Internal SWS and admin policies never are.
- Siteimprove links are cleaned of a session-style parameter before they're stored.
- Credentials live only in GitHub and Google's secure settings, never in the code.

## 7. Prototype now, MVP next

| Prototype (fair, Dec 8) | MVP (pilot) |
| --- | --- |
| One live site; two sample sites | A set of real pilot sites |
| No sign-in; “Viewing as” demonstrates access | Stanford sign-in; owners see only their own sites |
| Tracking and notes saved in one browser | Stored and shared across co-owners |
| AI content report is a labeled sample | Generated with the Claude API, reviewed by SWS before owners see it |
| Email is a static preview | Sent on each owner's chosen schedule |
| Content freshness is simulated | A real freshness source, chosen after talking with owners |

## 8. Open questions for after the fair

- **Content freshness:** what would owners actually use?
- **Platform pages:** who should see problems on pages shared by every site, like search and sign-in?
- **Report period:** a rolling 90 days on the dashboard, or calendar quarters for distributed reports?
- **Site search:** finding searches that return nothing needs a change to how Stanford Sites reports search to GA4.
- **Review:** SWS still needs to review the plain-language issue text and the verdict rules.

## Suggested appendix slides

1. **What's live, what's sample** (section 1 table)
2. **How data flows** (section 2: data run, GA4 export, static site; no credentials in the browser)
3. **How WHM decides what matters** (section 3, with one issue page as a screenshot)
4. **Summarize and link** (section 4: WHM ranks and explains; Siteimprove is where fixes happen)
5. **Privacy by design** (section 6)
6. **From prototype to MVP** (section 7 table, plus the open questions from section 8)
