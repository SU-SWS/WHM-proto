import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { Readings } from "@/components/Readings";
import { SourceNote } from "@/components/SourceNote";
import { SiteGate } from "@/components/Viewer";
import { getSite, getSiteKeys } from "@/lib/data/load";
import { formatDate } from "@/lib/data/provenance";
import { prioritized } from "@/lib/data/view";
import { hostOf } from "@/lib/format";

export const dynamicParams = false;

/** A summary for an approver: the top few changes, not the full list. */
const TOP = 5;

export function generateStaticParams() {
  return getSiteKeys().map((site) => ({ site }));
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/share">): Promise<Metadata> {
  const { site } = await params;
  return { title: `Summary, ${getSite(site).name}` };
}

// Share view (AC-6): a printable summary for someone who approves changes
// (Persona 3). Owner notes are left out.
export default async function SharePage({ params }: PageProps<"/sites/[site]/share">) {
  const { site: siteKey } = await params;
  const site = getSite(siteKey);
  const { owner } = prioritized(site);

  return (
    <SiteGate siteKey={siteKey} siteName={site.name}>
      <p className="crumbs print:hidden">
        <Link href={`/sites/${siteKey}/`}>Back to {site.name}</Link>
      </p>
      <h1 className="eyebrow">
        Website health summary for {hostOf(site.url)}, {formatDate(site.checkedAt)}
      </h1>
      <p className="verdict">{site.verdict}</p>
      <p className="lede">{site.lede}</p>
      <Readings site={site} />

      <h2 className="section-heading">Recommended changes, in order</h2>
      {owner.length === 0 ? (
        <p>No changes needed right now.</p>
      ) : (
        <>
          <ol className="max-w-[768px]">
            {owner.slice(0, TOP).map((v) => (
              <li key={v.issue.type} className="mb-8">
                <strong>{v.type.title}.</strong> {v.issue.scope} {v.type.why}
              </li>
            ))}
          </ol>
          {owner.length > TOP && (
            <p>
              And {owner.length - TOP} more, listed on the site’s Website Health page in order of how many visitors they
              affect.
            </p>
          )}
        </>
      )}
      <SourceNote provider="siteimprove" source={site.source} date={site.checkedAt}>
        Owner notes aren’t included.
      </SourceNote>
      <p className="print:hidden">
        <PrintButton />
      </p>
    </SiteGate>
  );
}
