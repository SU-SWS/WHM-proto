import type { Metadata } from "next";
import { TableWrap } from "@/components/TableWrap";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SourceNote } from "@/components/SourceNote";
import { getSite, getSiteKeys, getStatus } from "@/lib/data/load";
import { displayPath } from "@/lib/data/paths";
import type { IssuePage } from "@/lib/data/types";
import { getIssueType, notesFor } from "@/lib/data/view";
import { formatNumber } from "@/lib/format";

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
  const issue = site.issues.find((i) => i.type === issueKey);
  if (!issue) notFound();
  const type = getIssueType(issue.type);
  const notes = notesFor(siteKey, issue.type);
  const owner = (issue.fixer ?? type.fixer) === "owner";
  // An owner-type issue moved to SWS because it's on nearly every page (template).
  const fromTemplate = issue.fixer === "sws" && type.fixer === "owner";
  const isStale = issue.pages.some((p) => "monthsSinceUpdate" in p);
  // Broken-link issues from live data carry the broken addresses on each page.
  const hasLinks = issue.pages.some((p) => "links" in p && (p.links?.length ?? 0) > 0);

  return (
    <>
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

      <div className={owner ? "" : "grid gap-32 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]"}>
        <div className="max-w-[768px]">
          <h2 className="subheading">What it is</h2>
          <p>{type.what}</p>
          <h2 className="subheading">Why it matters</h2>
          <p>{type.why}</p>
          <h2 className="subheading">What to do</h2>
          <p>
            {fromTemplate
              ? "No action needed from you. This is on nearly every page, so it comes from the site template, and SWS is handling it."
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

        {!owner && (
          <aside className="self-start rounded bg-fog-light px-18 py-16" aria-labelledby="who-fixes">
            <h2 id="who-fixes" className="mb-6 mt-0 text-18 font-bold">
              Your progress
            </h2>
            <p className="mb-0">Nothing for you to do. This item stays in the “Being handled by SWS” list until the fix ships.</p>
          </aside>
        )}
      </div>

      <h2 className="section-heading">Where it is</h2>
      {hasLinks && (
        <p className="mb-12 max-w-[62ch]">
          Each page shows the broken addresses it links to. Find each link on the page by its address, then update it or
          remove it.
        </p>
      )}
      <TableWrap label="Pages with this issue">
        <table className="data-table">
          <caption className="sr-only">Pages with this issue</caption>
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col" className="num">Page views, last 30 days</th>
              <th scope="col" className="num">{isStale ? "Last updated" : hasLinks ? "Broken links" : "Times found"}</th>
            </tr>
          </thead>
          <tbody>
            {issue.pages.map((p) => (
              <tr key={p.path}>
                <td>
                  {displayPath(p.path)}
                  {"links" in p && p.links && p.links.length > 0 && (
                    <ul className="mb-0 mt-6 list-none p-0 text-16">
                      {p.links.map((l) => (
                        <li key={l.url} className="mb-4 text-black-80">
                          <span className="break-all">{l.url}</span>
                          {l.status !== null && <span className="ml-6 whitespace-nowrap">({statusText(l.status)})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="num">{formatNumber(p.views)}</td>
                <td className="num">{third(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <SourceNote className="meta mt-8" provider="siteimproveAnalytics" source={site.topPages.viewsSource} date={site.checkedAt} />

      <p>
        {issue.siteimproveUrl ? (
          <a href={issue.siteimproveUrl}>Open this issue in Siteimprove</a>
        ) : (
          <span className="text-black-80">
            {issue.source === "live"
              ? "“Open in Siteimprove” links are turned off for now, while SWS checks that they’re safe to publish."
              : "“Open in Siteimprove” links appear here once this site’s data comes from Siteimprove."}
          </span>
        )}
      </p>

      <p className="mt-32">
        <Link className="btn-secondary" href={`/sites/${siteKey}/`}>
          Back to {site.name}
        </Link>
      </p>
    </>
  );
}

/** HTTP status in words: 404 → "not found". */
function statusText(status: number): string {
  if (status === 404) return "not found";
  if (status === 410) return "removed";
  if (status === 401 || status === 403) return "access denied";
  if (status >= 500) return `server error ${status}`;
  return `error ${status}`;
}

function third(p: IssuePage): string {
  if ("monthsSinceUpdate" in p) return `${p.monthsSinceUpdate} months ago`;
  return formatNumber(p.count);
}
