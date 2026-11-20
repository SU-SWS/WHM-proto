// One place to say where a section's data came from and how old it is (AD-4).
// Every screen and section uses this, so the wording stays the same everywhere.

import type { IsoDate, SiteRunStatus, Source } from "./types";

/** Where a section's numbers come from (one source per metric, Q-4). */
export type Provider =
  | "siteimprove" // scores, issues, checks
  | "siteimproveAnalytics" // page views in the prototype
  | "ga4" // engagement and site search; sample until the MVP
  | "pagespeed" // speed check
  | "aiReport"; // content report; sample until the MVP

export interface Provenance {
  provider: Provider;
  source: Source;
  date: IsoDate;
  /** The site's entry in status.json, so a failed run is never shown as current (Q-7). */
  run?: SiteRunStatus;
}

export interface ProvenanceText {
  /** e.g. "Siteimprove check of Nov 10, 2026. Live data." */
  text: string;
  /** The first half of `text`: "Siteimprove check of Nov 10, 2026." */
  origin: string;
  /** "Live data" or "Sample data", for a badge. */
  sourceLabel: string;
  /** Set when the latest run failed and this is the last good data. */
  warning: string | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-10" → "Nov 10, 2026". Parsed as a plain date so time zones can't shift it. */
export function formatDate(date: IsoDate): string {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Not an ISO date: "${date}"`);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Whole days from `date` to `now`. Use in the browser, so the age is right on the day it's viewed. */
export function daysSince(date: IsoDate, now: Date = new Date()): number {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  // The viewer's local calendar day, so a Pacific evening doesn't count as tomorrow.
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - then) / 86_400_000));
}

/** "Checked today", "Checked 1 day ago", "Checked 9 days ago". */
export function formatAge(date: IsoDate, now: Date = new Date()): string {
  const days = daysSince(date, now);
  if (days === 0) return "Checked today";
  return `Checked ${days} ${days === 1 ? "day" : "days"} ago`;
}

export function sourceLabel(source: Source): string {
  return source === "live" ? "Live data" : "Sample data";
}

function originText(provider: Provider, date: string): string {
  switch (provider) {
    case "siteimprove":
      return `Siteimprove check of ${date}.`;
    case "siteimproveAnalytics":
      return `Page views from Siteimprove Analytics, as of ${date}.`;
    case "ga4":
      return `From Google Analytics 4, as of ${date}.`;
    case "pagespeed":
      return `Speed check of ${date}.`;
    case "aiReport":
      return `AI-generated report of ${date}.`;
  }
}

export function describeSection({ provider, source, date, run }: Provenance): ProvenanceText {
  const label = sourceLabel(source);
  const warning =
    run?.result === "failed"
      ? `The latest data run couldn’t update this site, so this is the last good data, from ${formatDate(date)}.`
      : null;
  const origin = originText(provider, formatDate(date));
  return {
    text: `${origin} ${label}.`,
    origin,
    sourceLabel: label,
    warning,
  };
}
