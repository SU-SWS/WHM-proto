import type { Metadata } from "next";
import { TableWrap } from "@/components/TableWrap";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusiestExplainer, BusiestLabel } from "@/components/Busiest";
import { SourceNote } from "@/components/SourceNote";
import { SiteGate } from "@/components/Viewer";
import { Notes, ProgressPanel, TrackedTable, type TrackedPage } from "@/components/Tracking";
import { getSite, getSiteKeys, getStatus } from "@/lib/data/load";
import { displayPath } from "@/lib/data/paths";
import type { IssuePage } from "@/lib/data/types";
import { busiestPaths, getIssueType, issueViews, notesFor, trafficProvenance } from "@/lib/data/view";
import { formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/data/provenance";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSiteKeys().flatMap((site) => getSite(site).issues.map((i) => ({ site, issue: i.type })));
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/issues/[issue]">): Promise<Metadata> {
  const { site, issue } = await params;
  return { title: `${getIssueType(issue).title}, ${getSite(site).name}` };
}

// Issue detail (SP-2, SP-5, AD-4): what it is, why it matters, what to do, who
// fixes it, any SWS note, and the affected pages.
export default async function IssuePage({ params }: PageProps<"/sites/[site]/issues/[issue]">) {
  const { site: siteKey, issue: issueKey } = await params;
  const site = getSite(siteKey);
  const view = issueViews(site).find((v) => v.issue.type === issueKey);
  if (!view) notFound();
  const { issue, type } = view;
  const notes = notesFor(siteKey, issue.type);
  const owner = view.fixer === "owner";
  const isStale = issue.pages.some((p) => "monthsSinceUpdate" in p);
  // Per-page reports in Siteimprove, from live data (impmd stripped on ingestion).
  const hasReports = issue.pages.some((p) => "siteimproveUrl" in p && p.siteimproveUrl);
  const thirdHeader = isStale ? "Last updated" : issue.type === "broken" ? "Broken links" : "Times found";
  // Owners review editorial issues page by page here (TR-2, revised). Issues
  // Siteimprove detects are fixed and rechecked in Siteimprove (TR-1, revised).
  const tracksHere = owner && type.editorial && issue.pages.length > 0;
  // Sample pages on a live site (simulated freshness) aren't real pages, so they're never starred.
  const busiest = issue.source === "sample" && site.source === "live" ? new Set<string>() : busiestPaths(site);
  const starred = issue.pages.some((p) => busiest.has(p.path));
  // Explain the busiest pages when the list stars some, or the summary mentions them.
  const explainBusiest = starred || /busiest/i.test(issue.reason);
  const tracked: TrackedPage[] = issue.pages.map((p) => ({
    path: p.path,
    label: displayPath(p.path),
    // Live paths are real pages on the site. Sample paths are made up, so they stay plain text.
    href: issue.source === "live" ? new URL(p.path, site.url).href : null,
    views: p.views,
    third: third(p),
    siteimproveUrl: ("siteimproveUrl" in p && p.siteimproveUrl) || null,
    busiest: busiest.has(p.path),
  }));
  const trackProps = { siteKey, issueType: issue.type, checkedAt: site.checkedAt, pages: tracked };
  const progress = issue.progress;
  // A sample issue on a live site (simulated freshness) has sample page views too.
  const pageViewsNote = issue.source === "sample" ? { ...trafficProvenance(site), source: "sample" as const, stale: false } : trafficProvenance(site);

  return (
    <SiteGate siteKey={siteKey} siteName={site.name}>
      <p className="crumbs">
        <Link href="/">Your sites</Link> / <Link href={`/sites/${siteKey}/`}>{site.name}</Link> / {type.title}
      </p>
      <h1 className="eyebrow">{type.category}</h1>
      <p className="verdict">{type.title}</p>
      <p className="lede">
        {issue.scope} {issue.reason}
      </p>
      <SourceNote provider="siteimprove" source={issue.source} date={site.checkedAt} run={getStatus().sites[siteKey]} showAge />
      <p className="mb-16">
        {owner ? <span className="tag tag-you">You can fix this</span> : <span className="tag tag-sws">SWS is handling this</span>}
      </p>

      <div className="grid gap-32 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="max-w-[768px]">
          <h2 className="subheading">What it is</h2>
          <p>{type.what}</p>
          <h2 className="subheading">Why it matters</h2>
          <p>{type.why}</p>
          <h2 className="subheading">What to do</h2>
          <p>
            {view.swsBecause === "template"
              ? "No action needed from you. This is on nearly every page, so it comes from the site template, and SWS is handling it."
              : view.swsBecause === "note"
                ? "No action needed from you. SWS is handling this; see the note from SWS below."
                : type.todo}
          </p>

          {notes.map((n) => (
            <div key={n.note} className="note-sws">
              <strong className="text-plum">Note from the {n.author}</strong>
              {!n.reviewedBySws && <span className="tag tag-sample ml-8 align-middle">Draft, not yet reviewed by SWS</span>}
              <p className="mb-0 mt-4">{n.note}</p>
            </div>
          ))}
        </div>

        <aside className="self-start rounded bg-fog-light px-18 py-16" aria-label="Your progress and notes">
          {tracksHere ? (
            <ProgressPanel {...trackProps} />
          ) : (
            <>
              <h2 className="mb-6 mt-0 text-18 font-bold">Progress</h2>
              {!owner ? (
                <p className="mb-0">Nothing for you to do. This item stays in the “Being handled by SWS” list until the fix ships.</p>
              ) : (
                <>
                  {progress ? (
                    <p className="mb-8">
                      <strong>
                        Since the check of {formatDate(progress.since)}: {progress.fixed}{" "}
                        {progress.fixed === 1 ? "page" : "pages"} fixed, {progress.added} new.
                      </strong>
                    </p>
                  ) : (
                    <p className="mb-8">Progress shows here once two Siteimprove checks can be compared.</p>
                  )}
                  <p className="mb-0 text-16">
                    Fix these in Siteimprove and recheck the page there. Siteimprove keeps track of each item, and this
                    page updates after the next check.
                  </p>
                </>
              )}
            </>
          )}
          <Notes siteKey={siteKey} issueType={issue.type} />
        </aside>
      </div>

      <h2 className="section-heading">Where it is</h2>
      {issue.pages.length === 0 ? (
        <p className="max-w-[62ch]">
          {owner
            ? "Siteimprove lists each item for this issue. Open Siteimprove to see them and fix them."
            : "It’s on nearly every page of the site, so the pages aren’t listed one by one. SWS is handling it."}
        </p>
      ) : tracksHere ? (
        <>
          <TrackedTable {...trackProps} thirdHeader={thirdHeader} viewsHeader={`Page views, last ${site.topPages.periodDays ?? 30} days`} />
          <SourceNote className="meta mt-8" {...pageViewsNote} />
          {explainBusiest && <BusiestExplainer siteKey={siteKey} starred={starred} />}
        </>
      ) : (
      <>
      <TableWrap label="Pages with this issue">
        <table className="data-table">
          <caption className="sr-only">Pages with this issue</caption>
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col" className="num">Page views, last {site.topPages.periodDays ?? 30} days</th>
              <th scope="col" className="num">{thirdHeader}</th>
            </tr>
          </thead>
          <tbody>
            {issue.pages.map((p) => (
              <tr key={p.path}>
                <td>
                  <BusiestLabel busiest={busiest.has(p.path)}>
                    {/* Live paths are real pages on the site. Sample paths are made up, so they stay plain text. */}
                    {issue.source === "live" ? <a href={new URL(p.path, site.url).href}>{displayPath(p.path)}</a> : displayPath(p.path)}
                  </BusiestLabel>
                  {"siteimproveUrl" in p && p.siteimproveUrl && (
                    <a href={p.siteimproveUrl} className="mt-4 block text-16">
                      Open in Siteimprove<span className="sr-only">: report for {displayPath(p.path)}</span>
                    </a>
                  )}
                </td>
                <td className="num">{formatNumber(p.views)}</td>
                <td className="num">{third(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <SourceNote className="meta mt-8" {...pageViewsNote} />
      {explainBusiest && <BusiestExplainer siteKey={siteKey} starred={starred} />}
      </>
      )}

      {(issue.siteimproveUrl || hasReports || issue.source === "sample") && (
        <p>
          {issue.siteimproveUrl ? (
            <a href={issue.siteimproveUrl}>Open this issue in Siteimprove</a>
          ) : hasReports ? (
            <span className="text-black-80">
              “Open in Siteimprove” opens that page’s report in Siteimprove. You need a Siteimprove account to see it.
            </span>
          ) : (
            <span className="text-black-80">
              “Open in Siteimprove” links appear here once this site’s data comes from Siteimprove.
            </span>
          )}
        </p>
      )}

      <p className="mt-32">
        <Link className="btn-secondary" href={`/sites/${siteKey}/`}>
          Back to {site.name}
        </Link>
      </p>
    </SiteGate>
  );
}

function third(p: IssuePage): string {
  if ("monthsSinceUpdate" in p) return `${p.monthsSinceUpdate} months ago`;
  return formatNumber(p.count);
}
