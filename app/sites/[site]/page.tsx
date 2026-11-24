import type { Metadata } from "next";
import { TableWrap } from "@/components/TableWrap";
import Link from "next/link";
import { BusiestMark, BusiestNote, mentionsBusiest } from "@/components/BusiestNote";
import { Glossary } from "@/components/Glossary";
import { IssueList, type IssueRow } from "@/components/IssueList";
import { Readings } from "@/components/Readings";
import { SourceNote } from "@/components/SourceNote";
import { SiteGate } from "@/components/Viewer";
import { TrendChart, type TrendMetric } from "@/components/TrendChart";
import { getReport, getSite, getSiteKeys, getStatus } from "@/lib/data/load";
import { describeSection } from "@/lib/data/provenance";
import type { SiteData } from "@/lib/data/types";
import { byCategory, prioritized, trafficProvenance, type IssueView } from "@/lib/data/view";
import { displayPath } from "@/lib/data/paths";
import { formatNumber, formatPercent, hostOf } from "@/lib/format";
import { BUSIEST } from "@/scripts/lib/window.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSiteKeys().map((site) => ({ site }));
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]">): Promise<Metadata> {
  const { site } = await params;
  return { title: getSite(site).name };
}

export default async function SitePage({ params }: PageProps<"/sites/[site]">) {
  const { site: siteKey } = await params;
  const site = getSite(siteKey);
  const report = getReport(siteKey);
  const run = getStatus().sites[siteKey];
  const { owner, sws } = prioritized(site);
  const toRow = (v: IssueView): IssueRow => ({
    type: v.issue.type,
    title: v.type.title,
    category: v.type.category,
    fixer: v.fixer,
    summary: `${v.issue.scope} ${v.issue.reason}`,
    busiest: mentionsBusiest(v.issue.reason),
    sample: site.source === "live" && v.issue.source === "sample",
  });
  const checked = site.checkedAt;
  const toMostVisited = `/sites/${siteKey}/#most-visited`;
  const rowsMentionBusiest = [...owner, ...sws].some((v) => mentionsBusiest(v.issue.reason));
  const traffic = trafficProvenance(site);
  const platformNote =
    site.topPages.viewsSource === "live"
      ? "Search, sign-in and “page not found” pages are left out, because they’re part of the Stanford Sites platform rather than your content."
      : null;
  const engagementNote = (
    <>
      Engagement rate is the share of visits that lasted over 10 seconds, viewed 2 or more pages, or completed a key
      event.
      {typeof site.topPages.typicalEngagement === "number" &&
        ` The typical page on this site has ${formatPercent(site.topPages.typicalEngagement)}. Pages well below that, with enough visits to count, are marked.`}
    </>
  );

  return (
    <SiteGate siteKey={siteKey} siteName={site.name}>
      <p className="crumbs">
        <Link href="/">Your sites</Link> / {site.name}
      </p>
      <h1 className="eyebrow">
        {site.name}, {hostOf(site.url)}
      </h1>
      <p className="verdict">
        {site.verdict}
        <BusiestMark text={site.verdict} />
      </p>
      <p className="lede">
        {site.lede}
        <BusiestMark text={site.lede} />
      </p>
      <SourceNote provider="siteimprove" source={site.readings.siteTargetScore.source} date={checked} run={run} showAge />
      {(mentionsBusiest(site.verdict) || mentionsBusiest(site.lede)) && <BusiestNote href={toMostVisited} />}

      <Readings site={site} />
      <Glossary />
      <p className="mt-16 flex flex-wrap gap-10">
        <Link className="btn-secondary" href={`/sites/${siteKey}/share/`}>
          Share a summary
        </Link>
        <Link className="btn-secondary" href={`/email/${siteKey}/`}>
          Preview the email
        </Link>
      </p>

      <h2 className="section-heading">What to fix</h2>
      <IssueList
        siteKey={siteKey}
        owner={owner.map(toRow)}
        sws={sws.map(toRow)}
        groups={byCategory(site).map((g) => ({ category: g.category, items: g.items.map(toRow) }))}
      />
      {rowsMentionBusiest && <BusiestNote href={toMostVisited} className="meta mt-12" />}

      <h2 className="section-heading">Is it getting better or worse?</h2>
      <TrendChart months={site.trends.months} metrics={trendMetrics(site)} />

      <h2 id="most-visited" className="section-heading scroll-mt-24">
        Most visited pages
      </h2>
      <p className="meta">
        The first {BUSIEST} are your busiest pages. Issues on them are pointed out across WHM, because they reach the most
        visitors.
      </p>
      <TableWrap label="Most visited pages">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col" className="num">Page views, last {site.topPages.periodDays ?? 30} days</th>
              <th scope="col" className="num">Engagement rate</th>
              <th scope="col" className="num">Open issues</th>
            </tr>
          </thead>
          <tbody>
            {site.topPages.pages.map((p, i) => (
              <tr key={p.path}>
                <td>
                  {/* Live paths are real pages; sample paths are made up, so they stay plain text. */}
                  {site.topPages.viewsSource === "live" ? (
                    <a href={new URL(p.path, site.url).href}>{displayPath(p.path)}</a>
                  ) : (
                    displayPath(p.path)
                  )}
                  {i < BUSIEST && <span className="block text-15 text-black-80">One of your {BUSIEST} busiest pages</span>}
                </td>
                <td className="num">{formatNumber(p.views)}</td>
                <td className="num">
                  {p.engagementRate === null ? "Not available" : formatPercent(p.engagementRate)}
                  {p.lowEngagement && <span className="block text-15 text-digital-red">Fewer stay than on most pages</span>}
                </td>
                <td className="num">{p.openIssues}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      {traffic.provider === "ga4" ? (
        // Page views and engagement come from the same GA4 export: one note.
        <SourceNote className="meta mt-8" {...traffic}>
          {platformNote} {engagementNote}
        </SourceNote>
      ) : (
        <>
          <SourceNote className="meta mb-4 mt-8" {...traffic}>
            {platformNote}
          </SourceNote>
          <SourceNote provider="ga4" source={site.topPages.engagementSource} date={site.topPages.engagementAsOf ?? checked}>
            {engagementNote}
          </SourceNote>
        </>
      )}

      <h2 className="section-heading">Does the content meet visitor needs?</h2>
      <div className="rounded border border-dashed border-black-80 px-16 py-14">
        <p className="mb-6 text-15 text-black-80">
          AI-generated report, sample. {report.status}.
        </p>
        {report.findings[0] && (
          <p className="mb-10">
            <strong>{report.findings[0].title}.</strong> {report.findings[0].recommendation}
          </p>
        )}
        <Link className="btn-secondary" href={`/sites/${siteKey}/report/`}>
          Read the full report ({report.findings.length} {report.findings.length === 1 ? "finding" : "findings"})
        </Link>
        <SourceNote
          className="mb-0 mt-10 text-15 text-black-80"
          provider="aiReport"
          source={report.source === "sample" ? "sample" : "live"}
          date={report.generatedAt}
        />
      </div>

      <h2 className="section-heading">What visitors search for</h2>
      {site.siteSearch.terms.length === 0 ? (
        <p>No search term was searched often enough to show for this period.</p>
      ) : (
      <TableWrap label="What visitors search for" className="max-w-[576px]">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Search term</th>
              <th scope="col" className="num">Searches, last {site.siteSearch.periodDays ?? 30} days</th>
            </tr>
          </thead>
          <tbody>
            {site.siteSearch.terms.map((t) => (
              <tr key={t.term}>
                <td>{t.term}</td>
                <td className="num">{formatNumber(t.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      )}
      <SourceNote className="meta mt-8" provider="ga4" source={site.siteSearch.source} date={site.siteSearch.asOf ?? checked} stale={site.siteSearch.stale}>
        {site.siteSearch.source === "live" &&
          "Only terms searched at least 5 times are shown, and anything that looks like an email address, phone number or web address is left out."}
      </SourceNote>

      {site.speed.pages.length > 0 && (
        <>
          <h2 className="section-heading">Speed check</h2>
          <p className="meta mb-12">
            {site.speed.source === "sample"
              ? "Sample scores, to show the idea. The full version checks your 3 most visited pages with PageSpeed Insights and scores each out of 100. Higher is better."
              : "PageSpeed Insights performance score for the 3 most visited pages, out of 100. Higher is better."}
          </p>
          <TableWrap label="Speed check" className="max-w-[576px]">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Page</th>
                  <th scope="col" className="num">Score</th>
                </tr>
              </thead>
              <tbody>
                {site.speed.pages.map((p) => (
                  <tr key={p.path}>
                    <td>{displayPath(p.path)}</td>
                    <td className="num">{p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          <SourceNote className="meta mt-8" provider="pagespeed" source={site.speed.source} date={checked} />
        </>
      )}
    </SiteGate>
  );
}

function trendMetrics(site: SiteData): TrendMetric[] {
  const t = site.trends;
  const note = (source: SiteData["source"]) => describeSection({ provider: "siteimprove", source, date: site.checkedAt }).text;
  const views = describeSection({ ...trafficProvenance(site), source: t.pageViews.source });
  return [
    {
      key: "siteTargetScore",
      label: "Site Target Score",
      values: t.siteTargetScore.values,
      maxIs100: true,
      goal: 100,
      sourceText: note(t.siteTargetScore.source),
    },
    {
      key: "accessibilityScore",
      label: "Accessibility score",
      values: t.accessibilityScore.values,
      maxIs100: true,
      sourceText: note(t.accessibilityScore.source),
    },
    {
      key: "brokenLinks",
      label: "Broken links",
      values: t.brokenLinks.values,
      sourceText: note(t.brokenLinks.source),
    },
    {
      key: "pageViews",
      label: "Page views per month",
      values: t.pageViews.values,
      sourceText: views.warning ? `${views.text} ${views.warning}` : views.text,
    },
  ];
}
