// Reads the GA4 export that the Apps Script commits (scripts/apps-script/ga4-export.gs).
//
// A site with a GA4 property in the registry takes all of its analytics from
// GA4: page views per page and per month, page names, engagement rate (CT-2)
// and site search (CT-5). Siteimprove Analytics is used only for sites with no
// GA4 property (decisions, Nov 23). An old export is still used, marked stale;
// a missing or broken one gives no GA4 data, and buildLiveSite then keeps the
// last good GA4 numbers or shows sample data. It never switches to Siteimprove.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizePath } from "./normalize.mjs";
import { WINDOW_DAYS } from "./window.mjs";

/** An export older than this is still used, but marked out of date (Q-7). The export runs weekly. */
export const MAX_AGE_DAYS = 14;
/** Same rule as the Apps Script, applied again here before anything is published (decisions, Nov 20). */
const MIN_SEARCHES = 5;
export function isPublishableTerm(t) {
  if (!t?.term || !(t.count >= MIN_SEARCHES)) return false;
  if (t.term.includes("@")) return false;
  if (/\d{5,}/.test(t.term.replace(/[\s().-]/g, ""))) return false;
  if (/(https?:\/\/|www\.)/i.test(t.term)) return false;
  return true;
}

/**
 * Returns { data, note }. data is null when there's no usable export. Otherwise:
 * { asOf, generatedAt, stale, engagement: Map(path → {rate, sessions}),
 *   views: Map(path → views) | null, titles: Map(path → name),
 *   monthly: Map("2026-10" → views) | null, terms }.
 * views and monthly are null in exports made before page views were added.
 */
export async function readGa4(root, site, now = new Date()) {
  let file;
  try {
    file = JSON.parse(await readFile(path.join(root, "data", "ga4", `${site.key}.json`), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { data: null, note: "no GA4 export found in data/ga4; run the Apps Script export" };
    return { data: null, note: `GA4 export unreadable (${err.message})` };
  }
  if (![1, 2].includes(file.schemaVersion) || file.siteKey !== site.key) return { data: null, note: "GA4 export has the wrong schemaVersion or siteKey" };
  if (String(file.propertyId) !== String(site.ga4PropertyId)) {
    return { data: null, note: "GA4 export is for a different property than the registry lists" };
  }
  if ((file.periodDays ?? 30) !== WINDOW_DAYS) {
    return { data: null, note: `GA4 export covers ${file.periodDays ?? 30} days but the data run uses ${WINDOW_DAYS}; update WINDOW_DAYS in the Apps Script` };
  }
  const notes = [];
  const ageDays = (now - new Date(file.generatedAt)) / 86_400_000;
  const stale = !(ageDays <= MAX_AGE_DAYS);
  if (stale) notes.push(`GA4 export is ${Math.floor(ageDays)} days old, so its numbers are shown as out of date; run the Apps Script export`);

  const engagement = new Map(); // path → { rate, sessions }
  const hasViews = (file.pages ?? []).some((p) => Number.isFinite(p.views));
  const views = hasViews ? new Map() : null;
  for (const p of file.pages ?? []) {
    const key = normalizePath(p.path, site.url);
    if (!key) continue;
    // Paths that differ only by case or a trailing slash are one page (Q-5). The
    // export is sorted by views, so the first row is the main one for engagement.
    if (views && Number.isFinite(p.views)) views.set(key, (views.get(key) ?? 0) + p.views);
    if (!engagement.has(key) && Number.isFinite(p.engagementRate)) {
      engagement.set(key, { rate: p.engagementRate, sessions: Number.isFinite(p.sessions) ? p.sessions : null });
    }
  }

  const titles = new Map();
  for (const t of file.titles ?? []) {
    const key = normalizePath(t.path, site.url);
    // "Create Jump Links Using ID Tags | Stanford Sites User Guide" → the page's own name
    const name = t.title?.split(" | ")[0].trim();
    if (key && name && !titles.has(key)) titles.set(key, name);
  }
  const monthly = Array.isArray(file.monthly) ? new Map(file.monthly.map((m) => [m.month, m.views])) : null;

  const terms = (file.searchTerms ?? []).filter(isPublishableTerm).map((t) => ({ term: t.term, count: t.count }));
  return {
    data: {
      asOf: file.period?.end ?? file.generatedAt.slice(0, 10),
      generatedAt: file.generatedAt,
      stale,
      engagement,
      views,
      titles,
      monthly,
      terms,
    },
    note: notes.join("; ") || null,
  };
}

/**
 * Low engagement on well-visited pages (CT-2; rule in docs/verdict-rules.md).
 * A page is flagged when it has at least MIN_SESSIONS sessions and its rate is
 * at least LOW_BY below the site's typical rate (the median over pages with
 * enough sessions). Without session counts, nothing is flagged.
 */
export const MIN_SESSIONS = 30;
export const LOW_BY = 0.2;
export function assessEngagement(ga4) {
  if (!ga4) return { typical: null, isLow: () => false };
  const solid = [...ga4.engagement.values()].filter((e) => e.sessions !== null && e.sessions >= MIN_SESSIONS).map((e) => e.rate);
  if (solid.length < 5) return { typical: null, isLow: () => false };
  const sorted = solid.sort((a, b) => a - b);
  const typical = sorted[Math.floor(sorted.length / 2)];
  return {
    typical,
    isLow: (path) => {
      const e = ga4.engagement.get(path);
      return !!e && e.sessions !== null && e.sessions >= MIN_SESSIONS && e.rate <= typical - LOW_BY;
    },
  };
}
