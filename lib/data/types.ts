// Types for every file in docs/data-contract.md. Keep the two in step: change
// a type here only together with the doc, and bump schemaVersion when a
// field's meaning changes.

export type Source = "live" | "sample";
export type IsoDate = string; // "2026-11-10"
export type IsoDateTime = string; // "2026-11-10T14:05:00Z"

// data/registry.json
export interface Registry {
  schemaVersion: 1;
  owners: { key: string; label: string }[]; // role labels only
  sites: RegistrySite[];
}

export interface RegistrySite {
  key: string;
  name: string;
  url: string;
  live: boolean; // true only for sitesuserguide in the prototype
  siteimproveSiteId: number | null;
  ga4PropertyId: string | null; // MVP
  owners: string[]; // owner keys
}

// data/issue-types.json
export interface IssueTypes {
  schemaVersion: 1;
  types: IssueType[];
}

export interface IssueType {
  key: string;
  title: string;
  category: string;
  fixer: "owner" | "sws";
  editorial: boolean; // true allows "Still correct" and "Set aside"
  what: string;
  why: string;
  todo: string;
  siteimproveIds: string[];
  reviewedBySws: boolean;
}

// data/annotations.json
export interface Annotations {
  schemaVersion: 1;
  annotations: Annotation[];
}

export interface Annotation {
  issueType: string;
  appliesTo: "all" | string; // "all" or a site key
  note: string;
  swsHandling: boolean;
  author: string;
  reviewedBySws: boolean;
}

// data/{sample|published}/sites/<siteKey>.json
export interface Reading {
  value: number;
  change: number | null; // null when there's no earlier check to compare with
  source: Source;
}

export interface Series {
  source: Source;
  values: (number | null)[]; // null: no data for that month (before tracking began, or not complete yet)
}

export interface IssuePageCount {
  path: string;
  views: number;
  count: number;
  /** This page's report in Siteimprove (needs a Siteimprove account). impmd is stripped. */
  siteimproveUrl?: string | null;
}

export interface IssuePageStale {
  path: string;
  views: number;
  monthsSinceUpdate: number;
}

export type IssuePage = IssuePageCount | IssuePageStale;

export interface SiteIssue {
  type: string; // key into issue-types.json
  scope: string;
  reason: string;
  rank: number | null; // owner-fixable issues are ranked; SWS-handled issues are null
  fixer?: "owner" | "sws"; // overrides the type's fixer, e.g. "sws" when the issue comes from the template
  /** Pages that left or joined this issue since the previous Siteimprove check (TR-1, revised). */
  progress?: { since: IsoDate; fixed: number; added: number };
  siteimproveUrl: string | null;
  source: Source;
  pages: IssuePage[];
}

export type SiteState = "attention" | "ok" | "good";

export interface SiteData {
  schemaVersion: 2;
  siteKey: string;
  name: string;
  url: string;
  source: Source; // "live" if any section is live
  checkedAt: IsoDate; // date of the Siteimprove check the data comes from
  state: SiteState;
  verdict: string;
  lede: string;
  readings: {
    siteTargetScore: Reading & { goal: 100 };
    accessibilityScore: Reading;
    brokenLinks: Reading;
    stalePages: Reading & { total: number; simulated: boolean };
    missingSearchDescriptions: Reading;
  };
  trends: {
    months: string[]; // "2026-04" … "2026-11"
    siteTargetScore: Series;
    accessibilityScore: Series;
    brokenLinks: Series;
    pageViews: Series;
  };
  topPages: {
    viewsSource: Source;
    periodDays?: number; // window the page views cover; absent in sample files, which use 30
    engagementSource: Source; // GA4, from the Apps Script export when live (decisions, Nov 20)
    engagementAsOf?: IsoDate; // last day of the GA4 period
    pages: {
      path: string;
      views: number;
      engagementRate: number | null;
      openIssues: number;
    }[];
  };
  issues: SiteIssue[];
  siteSearch: { source: Source; asOf?: IsoDate; periodDays?: number; terms: { term: string; count: number }[] }; // GA4; asOf is the last day of its period
  speed: { source: Source; pages: { path: string; score: number }[] }; // optional
}

// data/{sample|published}/reports/<siteKey>.json
export interface Report {
  schemaVersion: 1;
  siteKey: string;
  source: "sample" | "generated"; // "sample" throughout the prototype
  status: string; // e.g. "Not yet reviewed by SWS"
  generatedAt: IsoDate;
  findings: { title: string; evidence: string; recommendation: string }[];
}

// data/{sample|published}/portfolio.json
export interface PortfolioSite {
  key: string;
  name: string;
  url: string;
  state: SiteState;
  verdict: string;
  siteTargetScore: number;
  accessibilityScore: number;
  brokenLinks: number;
  openOwnerIssues: number;
  checkedAt: IsoDate;
  source: Source;
}

export interface Portfolio {
  schemaVersion: 1;
  generatedAt: IsoDate;
  sites: PortfolioSite[];
}

// data/{sample|published}/status.json
export interface SiteRunStatus {
  result: "complete" | "failed" | "sample";
  reason: string | null;
  finishedAt: IsoDateTime | null;
  source: Source;
}

export interface Status {
  schemaVersion: 1;
  runId: string | null;
  startedAt: IsoDateTime | null;
  finishedAt: IsoDateTime | null;
  sites: Record<string, SiteRunStatus>;
}
