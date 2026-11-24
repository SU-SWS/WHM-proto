// Builds one live site's data file from Siteimprove (task 6). Every endpoint
// used here has a saved response in data/fixtures/siteimprove/, and
// docs/siteimprove-endpoints.md explains each field.
//
// Sections are fetched one at a time. A section that fails keeps its last good
// published version if that was live, or the sample otherwise, and the reason
// is returned for status.json (Q-7). If the check history itself fails there's
// no check date to show, so the whole site fails and keeps its published file.

import { normalizePath } from "./normalize.mjs";
import { siteimproveLink } from "./siteimprove.mjs";
import { assessEngagement } from "./ga4.mjs";
import { BUSIEST, MOST_VISITED, WINDOW_DAYS } from "./window.mjs";
import { verdictFor } from "./verdict.mjs";
import { fixerFor } from "./fixer.mjs";

/** Share of a site's pages at which an issue counts as coming from the template (decisions, Nov 20). */
const TEMPLATE_SHARE = 0.9;
/** A check covering fewer pages than this share of the usual count is partial and skipped. */
const PARTIAL_CHECK = 0.95;
/**
 * Stanford Sites platform pages, shared by every site on the platform: search,
 * sign-in/account pages, and the "page not found" page (GA4 records it as
 * /404.html). They're left out when picking a site's busiest pages, because the
 * owner doesn't write them. Open question (decisions, Nov 20): they still matter
 * to visitors, so platform-wide reporting is needed later.
 */
export const PLATFORM_PAGES = [/^\/search(\/|$)/, /^\/user(\/|$)/, /^\/404(\.html)?$/];
const isPlatformPage = (path) => PLATFORM_PAGES.some((re) => re.test(path));
/** Policies that may be published: [QA], [A11y], [SEO] in any combination, QA: or A11y: (decisions, Nov 20). */
export const ALLOWED_POLICY = /^(\[(qa|a11y|seo)\]\s*)+|^(qa|a11y):/i;

const round = (n, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;
const day = (ts) => ts.slice(0, 10); // "2026-11-16 06:50:38Z" or ISO → "2026-11-16"
const ymd = (d) => d.toISOString().slice(0, 10).replaceAll("-", "");

/** The 8 months ending with the current one: ["2026-04", …, "2026-11"]. */
function monthWindow(now) {
  const out = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

export async function buildLiveSite({ site, sample, previous, issueTypes, annotations = null, client, ga4 = null, now = new Date() }) {
  const id = site.siteimproveSiteId;
  const base = `/sites/${id}`;
  const months = monthWindow(now);
  const sections = {}; // name → { source: "live" | "kept" | "sample", reason? }
  const notes = [];

  /** Runs a section; on failure returns the fallback and records why. */
  async function section(name, fn, fallback) {
    try {
      const value = await fn();
      sections[name] = { source: "live" };
      return value;
    } catch (err) {
      const kept = fallback();
      sections[name] = { source: kept.from, reason: err.message };
      console.error(`${site.key}: ${name} failed (${err.message}); using ${kept.from === "kept" ? "last good published" : "sample"} data`);
      return kept.value;
    }
  }
  /** Last good published value if it was live, else the sample. */
  const keepOr = (prevValue, prevIsLive, sampleValue) =>
    prevValue !== undefined && prevIsLive ? { from: "kept", value: prevValue } : { from: "sample", value: sampleValue };

  // --- Checks: the date the data comes from, and which checks are complete. Required.
  const checks = await client.getAll(`${base}/quality_assurance/overview/check_history?page_size=100`);
  const usual = median(checks.map((c) => c.all_pages));
  const valid = checks.filter((c) => c.all_pages >= usual * PARTIAL_CHECK); // newest first
  if (!valid.length) throw new Error("no complete Siteimprove check found");
  const latest = valid[0];
  const prevCheck = valid[1] ?? null;
  const checkedAt = day(latest.check_date);
  const sitePages = latest.all_pages;

  // --- Scores: Site Target Score and accessibility score, from one response (Q-4).
  const scores = await section(
    "scores",
    async () => {
      const points = await client.getAll(`${base}/a11y/overview/site_target/history?page_size=500`);
      const series = (field) => {
        // Points before tracking began are 0; treat that leading run as no data.
        const first = points.findIndex((p) => p[field] > 0);
        return first < 0 ? [] : points.slice(first).map((p) => ({ date: day(p.timestamp), value: p[field] }));
      };
      const reading = (s) => {
        if (!s.length) throw new Error("no score history");
        const current = s.at(-1).value;
        const atPrev = prevCheck ? s.filter((p) => p.date <= day(prevCheck.check_date)).at(-1)?.value : undefined;
        return { value: current, change: atPrev === undefined ? null : round(current - atPrev), source: "live" };
      };
      const monthly = (s) => months.map((m) => s.filter((p) => p.date.startsWith(m)).at(-1)?.value ?? null);
      const sts = series("site_target_percentage");
      const a11y = series("accessibility_dci_score");
      return {
        siteTargetScore: { ...reading(sts), goal: 100 },
        accessibilityScore: reading(a11y),
        stsTrend: { source: "live", values: monthly(sts) },
        a11yTrend: { source: "live", values: monthly(a11y) },
      };
    },
    () => {
      const live = previous?.readings?.siteTargetScore?.source === "live";
      return keepOr(
        previous && {
          siteTargetScore: previous.readings.siteTargetScore,
          accessibilityScore: previous.readings.accessibilityScore,
          stsTrend: previous.trends.siteTargetScore,
          a11yTrend: previous.trends.accessibilityScore,
        },
        live,
        {
          siteTargetScore: sample.readings.siteTargetScore,
          accessibilityScore: sample.readings.accessibilityScore,
          stsTrend: sample.trends.siteTargetScore,
          a11yTrend: sample.trends.accessibilityScore,
        },
      );
    },
  );

  // --- Traffic: page views per page over the window, per month, and page names.
  // The registry decides the provider (decisions, Nov 23): a site with a GA4
  // property takes all of its analytics from the GA4 export, even when that
  // export is old or missing; only a site with no GA4 property uses Siteimprove
  // Analytics. One provider per site, so numbers never mix (Q-4).
  const provider = site.ga4PropertyId ? "ga4" : "siteimproveAnalytics";
  const yesterday = new Date(now.getTime() - 86_400_000);
  const windowPeriod = `${ymd(new Date(now.getTime() - WINDOW_DAYS * 86_400_000))}_${ymd(yesterday)}`;
  const current = now.toISOString().slice(0, 7);
  /** Months before analytics was on are no data, not zero; the current month isn't complete yet. */
  const monthlyValues = (byMonth) => {
    const firstData = months.findIndex((m) => (byMonth.get(m) ?? 0) > 0);
    return months.map((m, i) => (firstData < 0 || i < firstData || m === current ? null : (byMonth.get(m) ?? 0)));
  };
  const fromSiteimprove = async () => {
    const top = await client.getAll(`${base}/analytics/content/most_popular_pages?period=${windowPeriod}&page_size=500`);
    const views = new Map();
    const titles = new Map();
    for (const p of top) {
      const path = normalizePath(p.url, site.url);
      if (!path) continue;
      views.set(path, (views.get(path) ?? 0) + p.page_views);
      // "Create Jump Links Using ID Tags | Stanford Sites User Guide" → the page's own name
      if (p.title && !titles.has(path)) titles.set(path, p.title.split(" | ")[0].trim());
    }
    const history = await client.get(`${base}/analytics/overview/history?period=${months[0].replace("-", "")}01_${ymd(yesterday)}`);
    const byMonth = new Map((history.items ?? []).map((i) => [i.timestamp.slice(0, 7), i.page_views]));
    return { views, titles, pageViews: { source: "live", values: monthlyValues(byMonth) }, asOf: day(yesterday.toISOString()), stale: false };
  };
  const fromGa4 = async () => {
    if (!ga4) throw new Error("no usable GA4 export");
    if (!ga4.views || !ga4.monthly) throw new Error("the GA4 export has no page views");
    return { views: ga4.views, titles: ga4.titles, pageViews: { source: "live", values: monthlyValues(ga4.monthly) }, asOf: ga4.asOf, stale: ga4.stale };
  };
  const traffic = await section("traffic", provider === "ga4" ? fromGa4 : fromSiteimprove, () => {
    // Keep the last good numbers only if they came from this site's provider.
    const prevProvider = previous?.analytics?.provider ?? "siteimproveAnalytics"; // files before Nov 23 used Siteimprove
    const live = previous?.trends?.pageViews?.source === "live" && prevProvider === provider;
    // Last good page views, so issues still rank by visitors.
    const views = new Map();
    for (const p of [...(previous?.topPages?.pages ?? []), ...(previous?.issues ?? []).flatMap((i) => i.pages)]) {
      if (!views.has(p.path)) views.set(p.path, p.views);
    }
    return keepOr(
      previous && { views, titles: null, pageViews: previous.trends.pageViews, asOf: previous.analytics?.asOf, stale: true, kept: true },
      live,
      { views: null, titles: null, pageViews: sample.trends.pageViews, sample: true },
    );
  });
  const views = traffic.views ?? new Map();
  // For Siteimprove Analytics sites, Siteimprove's per-page count fills gaps (same
  // provider). For GA4 sites it never does: a page GA4 didn't list counts as 0.
  const viewsOf = (path, siteimproveViews) => views.get(path) ?? (provider === "siteimproveAnalytics" ? (siteimproveViews ?? 0) : 0);
  const busiest = [...views.entries()]
    .filter(([p]) => !isPlatformPage(p))
    .sort((a, b) => b[1] - a[1])
    .slice(0, BUSIEST)
    .map(([p]) => p);

  /** "Includes your busiest page." / "Includes 2 of your 5 busiest pages." / "None are on your 5 busiest pages." */
  const busiestNote = (paths) => {
    if (!busiest.length) return "";
    const hits = busiest.filter((p) => paths.includes(p));
    if (!hits.length) return `None are on your ${BUSIEST} busiest pages.`;
    if (hits.length === 1 && hits[0] === busiest[0]) return "Includes your busiest page.";
    return `Includes ${hits.length} of your ${BUSIEST} busiest pages.`;
  };
  const sumViews = (pages) => pages.reduce((n, p) => n + p.views, 0);

  // --- Broken links: count, trend and issues, all from the per-check link lists (decisions, Nov 20).
  const typeKeys = new Set(issueTypes.types.map((t) => t.key));
  const links = await section(
    "brokenLinks",
    async () => {
      const list = await client.getAll(`${base}/quality_assurance/overview/check_history/${latest.id}/broken_links?page_size=500`);
      // Siteimprove empties the link lists of older checks. An empty list for a check
      // whose summary reports broken links means "no data", not zero.
      const countFor = async (check) => {
        const n = (await client.get(`${base}/quality_assurance/overview/check_history/${check.id}/broken_links?page_size=1`)).total_items;
        return n === 0 && check.broken_links > 0 ? null : n;
      };
      const prevCount = prevCheck ? await countFor(prevCheck) : null;
      const trend = [];
      for (const m of months) {
        const check = valid.find((c) => day(c.check_date).startsWith(m)); // newest complete check in that month
        trend.push(check ? (check.id === latest.id ? list.length : await countFor(check)) : null);
      }

      const template = list.filter((l) => l.pages >= sitePages * TEMPLATE_SHARE);
      const owner = list.filter((l) => l.pages < sitePages * TEMPLATE_SHARE);
      const pages = new Map();
      for (const link of owner) {
        let on;
        try {
          on = await client.getAll(`${base}/quality_assurance/links/broken_links/${link.id}/pages?page_size=100`);
        } catch (err) {
          if (err.status === 404) continue; // fixed since the check
          throw err;
        }
        for (const p of on) {
          const path = normalizePath(p.url, site.url);
          if (!path) continue;
          const entry = pages.get(path) ?? {
            path,
            views: viewsOf(path, p.page_views),
            count: 0,
            siteimproveUrl: siteimproveLink(p._siteimprove?.page_report?.href),
          };
          entry.count++;
          pages.set(path, entry);
        }
      }
      const ownerPages = [...pages.values()].sort((a, b) => b.views - a.views);
      const issues = [];
      if (owner.length) {
        issues.push({
          type: "broken",
          scope: `${owner.length} broken ${owner.length === 1 ? "link" : "links"} on ${ownerPages.length} ${ownerPages.length === 1 ? "page" : "pages"}.`,
          reason: busiestNote(ownerPages.map((p) => p.path)),
          rank: null,
          siteimproveUrl: null,
          source: "live",
          pages: ownerPages,
        });
      }
      if (template.length && typeKeys.has("broken-template")) {
        issues.push({
          type: "broken-template",
          scope: `${template.length} ${template.length === 1 ? "link" : "links"} in the shared Stanford header or footer ${template.length === 1 ? "is" : "are"} reported broken on every page.`,
          reason: "They come from the site template.",
          rank: null,
          siteimproveUrl: null,
          source: "live",
          pages: [], // on every page; SWS handles it, so pages aren't listed (decisions, Nov 20)
        });
      }
      return {
        reading: { value: list.length, change: prevCount === null ? null : list.length - prevCount, source: "live" },
        trend: { source: "live", values: trend },
        issues,
      };
    },
    () => {
      const live = previous?.readings?.brokenLinks?.source === "live";
      const prevIssues = (previous?.issues ?? []).filter((i) => i.type === "broken" || i.type === "broken-template");
      return keepOr(
        previous && { reading: previous.readings.brokenLinks, trend: previous.trends.brokenLinks, issues: prevIssues },
        live,
        { reading: sample.readings.brokenLinks, trend: sample.trends.brokenLinks, issues: null },
      );
    },
  );

  // --- Accessibility issues: confirmed issues, mapped to WHM issue types by rule ID.
  const typeByRule = new Map();
  for (const t of issueTypes.types) for (const sid of t.siteimproveIds ?? []) typeByRule.set(sid, t);
  const a11y = await section(
    "accessibilityIssues",
    async () => {
      const rules = await client.getAll(`${base}/a11y/issue_kinds/confirmed/issues?page_size=100`);
      const issues = [];
      for (const rule of rules) {
        const type = typeByRule.get(`a11y-rule:${rule.rule_id}`);
        if (!type) {
          // No reviewed plain-language text for this rule yet; leave it out rather than publish Siteimprove's wording.
          notes.push(`accessibility rule ${rule.rule_id} (“${rule.help?.title ?? "untitled"}”) has no WHM issue type`);
          continue;
        }
        const fromTemplate = rule.pages >= sitePages * TEMPLATE_SHARE;
        // Template issues are SWS's and on every page, so their pages aren't fetched or listed.
        const found = fromTemplate ? [] : await client.getAll(`${rule._links.pages.href}${rule._links.pages.href.includes("?") ? "&" : "?"}page_size=500`);
        const pages = new Map();
        for (const p of found) {
          const path = normalizePath(p.url, site.url);
          if (!path) continue;
          const entry = pages.get(path) ?? {
            path,
            views: viewsOf(path),
            count: 0,
            siteimproveUrl: siteimproveLink(p._siteimprove?.page_report?.href),
          };
          entry.count += p.occurrences ?? 1;
          pages.set(path, entry);
        }
        const list = [...pages.values()].sort((a, b) => b.views - a.views || b.count - a.count);
        const n = rule.occurrences;
        issues.push({
          type: type.key,
          ...(fromTemplate && type.fixer === "owner" ? { fixer: "sws" } : {}),
          scope: `Found ${n.toLocaleString("en-US")} ${n === 1 ? "time" : "times"} on ${rule.pages} ${rule.pages === 1 ? "page" : "pages"}.`,
          reason: fromTemplate ? "It’s on nearly every page, so it comes from the site template." : busiestNote(list.map((p) => p.path)),
          rank: null,
          siteimproveUrl: null,
          source: "live",
          pages: list,
        });
      }
      return issues;
    },
    () => {
      const categoryOf = (key) => issueTypes.types.find((t) => t.key === key)?.category;
      const prevIssues = (previous?.issues ?? []).filter((i) => categoryOf(i.type) === "Accessibility" && i.source === "live");
      return keepOr(prevIssues.length ? prevIssues : undefined, true, null);
    },
  );

  // --- Stanford policies (SI-23, SI-24). Allowlisted names only (AD-7). Content
  // policies list their pages; media and document policies match files, which
  // Siteimprove lists itself, so WHM only summarizes them (decisions, Nov 20).
  const typeByPolicy = new Map();
  for (const t of issueTypes.types) for (const sid of t.siteimproveIds ?? []) if (sid.startsWith("policy:")) typeByPolicy.set(sid, t);
  const policyIssues = await section(
    "policies",
    async () => {
      const policies = await client.getAll(`${base}/policy/policies?page_size=200`);
      const issues = [];
      for (const policy of policies) {
        if (!ALLOWED_POLICY.test(policy.name) || !(policy.matches > 0)) continue;
        const type = typeByPolicy.get(`policy:${policy.id}`);
        if (!type) {
          notes.push(`policy “${policy.name}” has no WHM issue type`);
          continue;
        }
        const n = policy.matches;
        if (policy.category !== "content") {
          const what = policy.category === "media" ? ["image", "images"] : ["document", "documents"];
          issues.push({
            type: type.key,
            scope: `${n.toLocaleString("en-US")} ${n === 1 ? `${what[0]} matches` : `${what[1]} match`} this Stanford policy.`,
            reason: `In Siteimprove, open Policy and find “${policy.name.trim()}” to see each one.`,
            rank: null,
            siteimproveUrl: null,
            source: "live",
            pages: [],
          });
          continue;
        }
        const fromTemplate = n >= sitePages * TEMPLATE_SHARE;
        const pages = new Map();
        if (!fromTemplate) {
          const href = policy._links.matches.href;
          for (const m of await client.getAll(`${href}${href.includes("?") ? "&" : "?"}page_size=500`)) {
            const path = normalizePath(m.url, site.url);
            if (!path || pages.has(path)) continue;
            pages.set(path, { path, views: viewsOf(path, m.page_views), count: 1, siteimproveUrl: siteimproveLink(m._siteimprove?.page_report?.href) });
          }
        }
        const list = [...pages.values()].sort((a, b) => b.views - a.views);
        issues.push({
          type: type.key,
          ...(fromTemplate ? { fixer: "sws" } : {}),
          scope: `Found on ${n.toLocaleString("en-US")} ${n === 1 ? "page" : "pages"}.`,
          reason: fromTemplate ? "It’s on nearly every page, so it comes from the site template." : busiestNote(list.map((p) => p.path)),
          rank: null,
          siteimproveUrl: null,
          source: "live",
          pages: list,
        });
      }
      return issues;
    },
    () => {
      const policyTypes = new Set([...typeByPolicy.values()].map((t) => t.key));
      const prev = (previous?.issues ?? []).filter((i) => policyTypes.has(i.type) && i.source === "live");
      return keepOr(prev.length ? prev : undefined, true, []);
    },
  );

  // --- Search descriptions: pages missing one (SEO), as a reading and an issue
  // (SP-2). The issue's "details" link lists the pages (verified Nov 23,
  // fixtures/probe4-seov2-meta-desc-missing.json). Its history isn't verified
  // yet, so there's no change since the last check.
  const searchDescType = issueTypes.types.find((t) => t.key === "searchdesc");
  const searchDesc = await section(
    "searchDescriptions",
    async () => {
      const issues = await client.getAll(`${base}/seov2/issues?page_size=100`);
      const missing = issues.find((i) => i.issue_name === "meta_desc_missing");
      if (!missing) throw new Error("meta_desc_missing not in SEO issues");
      const reading = { value: missing.occurrences, change: null, source: "live" };
      const n = missing.occurrences;
      if (!searchDescType || !(n > 0)) return { reading, issue: null };
      const fromTemplate = n >= sitePages * TEMPLATE_SHARE;
      const pages = new Map();
      if (!fromTemplate) {
        const href = missing._links?.details?.href;
        if (!href) throw new Error("meta_desc_missing has no details link");
        for (const m of await client.getAll(`${href}${href.includes("?") ? "&" : "?"}page_size=100`)) {
          const path = normalizePath(m.url, site.url);
          if (!path || pages.has(path)) continue;
          // m.page_views is Siteimprove's count: viewsOf uses it only for sites without GA4.
          pages.set(path, { path, views: viewsOf(path, m.page_views), count: 1, siteimproveUrl: siteimproveLink(m._siteimprove?.page_report?.href) });
        }
      }
      const list = [...pages.values()].sort((a, b) => b.views - a.views);
      return {
        reading,
        issue: {
          type: "searchdesc",
          ...(fromTemplate ? { fixer: "sws" } : {}),
          scope: `Found on ${n.toLocaleString("en-US")} ${n === 1 ? "page" : "pages"}.`,
          reason: fromTemplate ? "It’s on nearly every page, so it comes from the site template." : busiestNote(list.map((p) => p.path)),
          rank: null,
          siteimproveUrl: null,
          source: "live",
          pages: list,
        },
      };
    },
    () => {
      const live = previous?.readings?.missingSearchDescriptions?.source === "live";
      const reading = keepOr(previous?.readings?.missingSearchDescriptions, live, sample.readings.missingSearchDescriptions);
      // Keep the last good live issue; sample pages would contradict live data.
      const issue = (previous?.issues ?? []).find((i) => i.type === "searchdesc" && i.source === "live") ?? null;
      return { from: reading.from, value: { reading: reading.value, issue } };
    },
  );

  // --- Issues: live only. Sample issues name sample pages, so they'd contradict
  // live data; one comes back only when its whole section fell back to sample.
  // The exception is content freshness: no source exists yet, so its simulated,
  // labeled issue stays, to show editorial tracking (TR-2) on the live site (decisions, Nov 23).
  const categoryOf = (key) => issueTypes.types.find((t) => t.key === key)?.category;
  // SWS specialist notes can move an issue to SWS (TR-5); same rule as the site uses.
  const fixerOf = (i) => fixerFor({ siteKey: site.key, issue: i, types: issueTypes.types, annotations });
  // A policy issue can share a type with an accessibility issue (Vague Link Text uses
  // "linktext"); keep the first so each issue page has one source.
  const seen = new Set();
  const liveIssues = [...(links.issues ?? []), ...(a11y ?? []), ...policyIssues, ...(searchDesc.issue ? [searchDesc.issue] : [])].filter((i) =>
    seen.has(i.type) ? false : (seen.add(i.type), true),
  );
  const sampleFallback = (i) =>
    (links.issues === null && (i.type === "broken" || i.type === "broken-template")) ||
    (a11y === null && categoryOf(i.type) === "Accessibility") ||
    i.type === "stale";
  const issues = [...liveIssues, ...sample.issues.filter(sampleFallback)];
  // Owner issues ranked by the page views of the pages they're on (SP-3), then by
  // how many pages; live first, then sample.
  const owner = issues
    .filter((i) => fixerOf(i) === "owner")
    .sort((a, b) =>
      a.source === b.source ? sumViews(b.pages) - sumViews(a.pages) || b.pages.length - a.pages.length : a.source === "live" ? -1 : 1,
    );
  owner.forEach((i, n) => (i.rank = n + 1));
  for (const i of issues) if (fixerOf(i) !== "owner") i.rank = null;
  const ordered = [...owner, ...issues.filter((i) => fixerOf(i) !== "owner")];

  // --- Most visited pages, with how many issues each has, and GA4 engagement.
  // Low engagement is flagged (CT-2). Kept or sample traffic keeps its own table.
  const openIssuesOn = (path) => owner.filter((i) => i.pages.some((p) => p.path === path)).length; // the owner's own issues
  const engagementData = provider === "ga4" ? ga4 : null;
  const engagement = assessEngagement(engagementData);
  const mostVisited = [...views.entries()]
    .filter(([p]) => !isPlatformPage(p))
    .sort((a, b) => b[1] - a[1])
    .slice(0, MOST_VISITED)
    .map(([p]) => p);
  let topPages;
  if (traffic.kept) {
    topPages = { ...previous.topPages, pages: previous.topPages.pages.map((p) => ({ ...p, openIssues: openIssuesOn(p.path) })) };
  } else if (traffic.sample || !mostVisited.length) {
    topPages = sample.topPages;
  } else {
    topPages = {
      viewsSource: "live",
      periodDays: WINDOW_DAYS,
      engagementSource: engagementData ? "live" : "sample",
      ...(engagementData ? { engagementAsOf: engagementData.asOf } : {}),
      typicalEngagement: engagement.typical,
      pages: mostVisited.map((path) => ({
        path,
        ...(traffic.titles?.get(path) ? { title: traffic.titles.get(path) } : {}),
        views: viewsOf(path),
        engagementRate: engagementData?.engagement.get(path)?.rate ?? null,
        ...(engagement.isLow(path) ? { lowEngagement: true } : {}),
        openIssues: openIssuesOn(path),
      })),
    };
    if (engagementData && engagement.typical === null) notes.push("GA4 export has no session counts, so low engagement isn't checked; re-run the Apps Script export");
  }
  // Which provider the traffic numbers come from, how old they are, and whether
  // they're out of date: an old GA4 export, or last good data kept after a failure (Q-7).
  const analytics =
    traffic.sample
      ? { provider, source: "sample" }
      : {
          provider,
          source: "live",
          ...(traffic.asOf ? { asOf: traffic.asOf } : {}),
          periodDays: topPages.periodDays ?? WINDOW_DAYS,
          ...(traffic.stale ? { stale: true } : {}),
        };
  // Site search comes only from GA4. Without a usable export, keep the last good terms.
  const siteSearch =
    provider === "ga4" && ga4
      ? { source: "live", asOf: ga4.asOf, periodDays: WINDOW_DAYS, ...(ga4.stale ? { stale: true } : {}), terms: ga4.terms }
      : provider === "ga4" && previous?.siteSearch?.source === "live"
        ? { ...previous.siteSearch, stale: true }
        : sample.siteSearch;
  const lowPage = topPages.pages.find((p) => p.lowEngagement);

  // --- Progress from Siteimprove's own checks (TR-1, revised Nov 20): compare each
  // issue's pages with the last published run. No fix status is kept by WHM.
  if (previous?.source === "live") {
    for (const issue of ordered) {
      if (issue.source !== "live" || !issue.pages.length) continue;
      const before = previous.issues.find((i) => i.type === issue.type && i.source === "live");
      if (!before) continue;
      if (previous.checkedAt === checkedAt) {
        // Same Siteimprove check as last run: keep what that run worked out.
        if (before.progress) issue.progress = before.progress;
        continue;
      }
      if (!before.pages.length) continue;
      const was = new Set(before.pages.map((p) => p.path));
      const now = new Set(issue.pages.map((p) => p.path));
      issue.progress = {
        since: previous.checkedAt,
        fixed: [...was].filter((p) => !now.has(p)).length,
        added: [...now].filter((p) => !was.has(p)).length,
      };
    }
  }

  const onBusiest = owner.some((i) => i.source === "live" && i.pages.some((p) => busiest.includes(p.path)));
  // Name the busiest page that has an owner issue (CT-2).
  const hitPath = busiest.find((b) => owner.some((i) => i.source === "live" && i.pages.some((p) => p.path === b)));
  const nameOf = (path) => {
    if (path === "/") return "your home page";
    const title = traffic.titles?.get(path) ?? topPages.pages.find((p) => p.path === path)?.title;
    return `“${title ?? path}”`;
  };
  const { state, verdict, lede } = verdictFor({
    score: scores.siteTargetScore.value,
    change: scores.siteTargetScore.change,
    ownerIssues: owner.length,
    swsIssues: ordered.length - owner.length,
    onBusiest,
    busiestIssuePage: hitPath ? { name: nameOf(hitPath), top: hitPath === busiest[0] } : null,
    lowEngagementPage: lowPage ? (lowPage.path === "/" ? "your home page" : `“${lowPage.title ?? lowPage.path}”`) : null,
  });

  const data = {
    ...sample,
    schemaVersion: 2,
    siteKey: site.key,
    name: site.name,
    url: site.url,
    source: "live",
    checkedAt,
    state,
    verdict,
    lede,
    readings: {
      siteTargetScore: scores.siteTargetScore,
      accessibilityScore: scores.accessibilityScore,
      brokenLinks: links.reading,
      stalePages: sample.readings.stalePages, // simulated: no freshness source yet (SI-17)
      missingSearchDescriptions: searchDesc.reading,
    },
    trends: {
      months,
      siteTargetScore: scores.stsTrend,
      accessibilityScore: scores.a11yTrend,
      brokenLinks: links.trend,
      pageViews: traffic.pageViews,
    },
    analytics,
    topPages,
    issues: ordered,
    siteSearch,
    speed: sample.speed, // optional; not fetched in the prototype
  };
  return { data, sections, notes };
}
