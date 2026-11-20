// Shaping published data for the screens. Pure functions over the contract
// types, so pages stay mostly markup.

import { getAnnotations, getIssueTypes } from "./load";
import type { Annotation, IssueType, PortfolioSite, SiteData, SiteIssue, SiteState } from "./types";

const NEED_ORDER: Record<SiteState, number> = { attention: 0, ok: 1, good: 2 };

/** Most need first: state, then lower Site Target Score, then more open owner items (AC-3, AC-8). */
export function byNeed(a: PortfolioSite, b: PortfolioSite): number {
  return (
    NEED_ORDER[a.state] - NEED_ORDER[b.state] ||
    a.siteTargetScore - b.siteTargetScore ||
    b.openOwnerIssues - a.openOwnerIssues ||
    a.name.localeCompare(b.name)
  );
}

export function getIssueType(key: string): IssueType {
  const type = getIssueTypes().types.find((t) => t.key === key);
  if (!type) throw new Error(`Issue type "${key}" isn't in data/issue-types.json.`);
  return type;
}

export interface IssueView {
  issue: SiteIssue;
  type: IssueType;
}

export function issueViews(site: SiteData): IssueView[] {
  return site.issues.map((issue) => ({ issue, type: getIssueType(issue.type) }));
}

/** "Prioritized for me": owner-fixable issues in rank order, then SWS-handled ones (SP-3, SP-5). */
export function prioritized(site: SiteData): { owner: IssueView[]; sws: IssueView[] } {
  const views = issueViews(site);
  const owner = views
    .filter((v) => v.type.fixer === "owner")
    .sort((a, b) => (a.issue.rank ?? Infinity) - (b.issue.rank ?? Infinity));
  return { owner, sws: views.filter((v) => v.type.fixer === "sws") };
}

/** "Show everything plainly": every issue, grouped by category, no ranking (SP-4). */
export function byCategory(site: SiteData): { category: string; items: IssueView[] }[] {
  const groups = new Map<string, IssueView[]>();
  for (const v of issueViews(site)) {
    groups.set(v.type.category, [...(groups.get(v.type.category) ?? []), v]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}

/** SWS specialist notes for an issue type on a site (TR-4). */
export function notesFor(siteKey: string, issueType: string): Annotation[] {
  return getAnnotations().annotations.filter(
    (a) => a.issueType === issueType && (a.appliesTo === "all" || a.appliesTo === siteKey),
  );
}
