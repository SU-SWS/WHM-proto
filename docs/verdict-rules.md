# Verdict rules for live sites

**Draft for SWS review (Nov 20, 2026).** The data run uses these rules to write the state, verdict and lede for any site with live data. Sample sites keep their hand-written text. The fetch script uses exactly these sentences, so change them here and in `scripts/refresh.mjs` together.

## Terms

- **Owner issue:** an issue whose type has `fixer: "owner"`, after template issues are moved to SWS.
- **Template issue:** an issue found on at least 90% of the site's pages, or a broken link in the shared Stanford header or footer. Shown as "SWS is handling this" (decisions, Nov 20).
- **Busiest pages:** the 5 pages with the most page views, from the same page views used to rank issues, leaving out Stanford Sites platform pages (search and sign-in; see decisions, Nov 20).
- **Fell:** the Site Target Score is lower than at the previous Siteimprove check, by at least 0.1. Smaller moves count as no change.

## State

Checked in this order; the first match wins.

| State | When |
| --- | --- |
| `attention` | The Site Target Score fell, **or** an owner issue is on one of the busiest pages. |
| `good` | There are no owner issues. |
| `ok` | Anything else: owner issues exist, but none on the busiest pages, and the score didn't fall. |

## Verdict (one sentence)

| When | Verdict |
| --- | --- |
| `attention`, score fell and an owner issue is on a busiest page | Needs attention: your Site Target Score dropped since the last check, and issues sit on your busiest pages. |
| `attention`, score fell only | Needs attention: your Site Target Score dropped since the last check. |
| `attention`, busiest pages only | Needs attention: issues sit on some of your busiest pages. |
| `ok`, 1 owner issue | In good shape, with one fix worth making. |
| `ok`, 2 or more owner issues | In good shape, with {n} fixes worth making. |
| `good`, SWS is handling something | In good shape. {SWS count, as a word up to nine} {item is / items are} being handled by SWS. |
| `good`, nothing at all | In good shape. Nothing needs your attention. |

## Lede (one or two sentences)

Built from these parts, in this order, skipping any that don't apply:

1. **Score:** "Your Site Target Score is {score}, {up/down} {change} since the last check." If the change is under 0.1: "Your Site Target Score is {score}, the same as the last check." With no earlier check: "Your Site Target Score is {score}." Scores use two decimals, as on the page.
2. **Where to start:** with 2 or more owner issues, "Fixing the first two items helps the most visitors." With 1: "Fixing the item below helps the most visitors."
3. **SWS:** "{n} {item is / items are} being handled by SWS." (Leave out if none.)

Illustration only, using today's sitesuserguide score and made-up changes and counts:

> **Needs attention: your Site Target Score dropped since the last check, and issues sit on your busiest pages.**
> Your Site Target Score is 98.38, down 0.2 since the last check. Fixing the first two items helps the most visitors. 4 items are being handled by SWS.

## Questions for SWS

- Should an accessibility score drop also trigger `attention`, or only the Site Target Score?
- Is 0.1 the right size for "fell"? The daily history moves in steps of about 0.1 to 0.4.
