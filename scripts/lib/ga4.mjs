// Reads the GA4 export that the Apps Script commits (scripts/apps-script/ga4-export.gs)
// and merges it into a site's data: engagement rate per page (CT-2) and site
// search terms (CT-5). Page views stay with Siteimprove Analytics (Q-4).
// If the export is missing or older than MAX_AGE_DAYS, those sections stay sample.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizePath } from "./normalize.mjs";
import { WINDOW_DAYS } from "./window.mjs";

const MAX_AGE_DAYS = 14;
/** Same rule as the Apps Script, applied again here before anything is published (decisions, Nov 20). */
const MIN_SEARCHES = 5;
export function isPublishableTerm(t) {
  if (!t?.term || !(t.count >= MIN_SEARCHES)) return false;
  if (t.term.includes("@")) return false;
  if (/\d{5,}/.test(t.term.replace(/[\s().-]/g, ""))) return false;
  if (/(https?:\/\/|www\.)/i.test(t.term)) return false;
  return true;
}

export async function readGa4(root, site, now = new Date()) {
  let file;
  try {
    file = JSON.parse(await readFile(path.join(root, "data", "ga4", `${site.key}.json`), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { data: null, note: null };
    return { data: null, note: `GA4 export unreadable (${err.message})` };
  }
  if (file.schemaVersion !== 1 || file.siteKey !== site.key) return { data: null, note: "GA4 export has the wrong schemaVersion or siteKey" };
  if (site.ga4PropertyId && String(file.propertyId) !== String(site.ga4PropertyId)) {
    return { data: null, note: "GA4 export is for a different property than the registry lists" };
  }
  // Engagement sits next to Siteimprove page views, so both must cover the same window.
  if ((file.periodDays ?? 30) !== WINDOW_DAYS) {
    return { data: null, note: `GA4 export covers ${file.periodDays ?? 30} days but the data run uses ${WINDOW_DAYS}; update WINDOW_DAYS in the Apps Script` };
  }
  const ageDays = (now - new Date(file.generatedAt)) / 86_400_000;
  if (!(ageDays <= MAX_AGE_DAYS)) return { data: null, note: `GA4 export is ${Math.floor(ageDays)} days old, so GA4 sections show sample data` };

  const engagement = new Map(); // path → { rate, sessions }
  for (const p of file.pages ?? []) {
    const key = normalizePath(p.path, site.url);
    if (key && !engagement.has(key) && Number.isFinite(p.engagementRate)) {
      engagement.set(key, { rate: p.engagementRate, sessions: Number.isFinite(p.sessions) ? p.sessions : null });
    }
  }
  const terms = (file.searchTerms ?? []).filter(isPublishableTerm).map((t) => ({ term: t.term, count: t.count }));
  return { data: { asOf: file.period?.end ?? file.generatedAt.slice(0, 10), engagement, terms }, note: null };
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

/** Puts GA4 site search into a site file. Engagement is merged by buildLiveSite. */
export function mergeGa4(site, ga4) {
  if (!ga4) return site;
  return { ...site, siteSearch: { source: "live", asOf: ga4.asOf, periodDays: WINDOW_DAYS, terms: ga4.terms } };
}
