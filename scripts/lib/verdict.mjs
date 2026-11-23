// State, verdict and lede for live sites. Mirrors docs/verdict-rules.md;
// change the wording there and here together.

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const word = (n) => (n < WORDS.length ? WORDS[n] : String(n));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// Same precision as the reading on the page (Siteimprove gives two decimals).
const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString("en-US");

/** A drop of at least 0.1 counts as "fell"; smaller moves are no change. */
export const FELL = 0.1;

/**
 * @param {object} p
 * @param {number} p.score       current Site Target Score
 * @param {number|null} p.change change since the previous check
 * @param {number} p.ownerIssues number of owner issues
 * @param {number} p.swsIssues   number of SWS-handled issues
 * @param {boolean} p.onBusiest  an owner issue is on one of the 5 busiest pages
 * @param {{name: string, top: boolean}|null} p.busiestIssuePage  the busiest page with an owner issue, name already
 *   quoted (or "your home page"); top = it's the single busiest page (CT-2)
 * @param {string|null} p.lowEngagementPage  the most visited page with low engagement, already quoted (CT-2)
 */
export function verdictFor({ score, change, ownerIssues, swsIssues, onBusiest, busiestIssuePage = null, lowEngagementPage = null }) {
  const fell = change !== null && change <= -FELL;
  const state = fell || onBusiest ? "attention" : ownerIssues === 0 ? "good" : "ok";

  let verdict;
  if (state === "attention") {
    verdict =
      fell && onBusiest
        ? "Needs attention: your Site Target Score dropped since the last check, and issues sit on your busiest pages."
        : fell
          ? "Needs attention: your Site Target Score dropped since the last check."
          : "Needs attention: issues sit on some of your busiest pages.";
  } else if (state === "ok") {
    verdict = ownerIssues === 1 ? "In good shape, with one fix worth making." : `In good shape, with ${ownerIssues} fixes worth making.`;
  } else {
    verdict =
      swsIssues > 0
        ? `In good shape. ${cap(word(swsIssues))} ${swsIssues === 1 ? "item is" : "items are"} being handled by SWS.`
        : "In good shape. Nothing needs your attention.";
  }

  const parts = [];
  if (change === null || Math.abs(change) < FELL) {
    parts.push(`Your Site Target Score is ${fmt(score)}${change === null ? "." : ", the same as the last check."}`);
  } else {
    parts.push(`Your Site Target Score is ${fmt(score)}, ${change > 0 ? "up" : "down"} ${fmt(Math.abs(change))} since the last check.`);
  }
  if (busiestIssuePage) {
    parts.push(`Issues sit on ${busiestIssuePage.name}, ${busiestIssuePage.top ? "your busiest page" : "one of your busiest pages"}.`);
  }
  if (lowEngagementPage) parts.push(`Fewer visitors stay on ${lowEngagementPage} than on most of your pages.`);
  if (ownerIssues >= 2) parts.push("Fixing the first two items helps the most visitors.");
  else if (ownerIssues === 1) parts.push("Fixing the item below helps the most visitors.");
  if (swsIssues > 0) parts.push(`${swsIssues} ${swsIssues === 1 ? "item is" : "items are"} being handled by SWS.`);

  return { state, verdict, lede: parts.join(" ") };
}
