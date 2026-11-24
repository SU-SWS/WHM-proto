import type { Metadata } from "next";
import Link from "next/link";
import { SiteGate } from "@/components/Viewer";
import { getSite, getSiteKeys } from "@/lib/data/load";
import { describeSection } from "@/lib/data/provenance";
import { prioritized } from "@/lib/data/view";
import { formatNumber, hostOf } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSiteKeys().map((site) => ({ site }));
}

export async function generateMetadata({ params }: PageProps<"/email/[site]">): Promise<Metadata> {
  const { site } = await params;
  return { title: `Email preview, ${getSite(site).name}` };
}

// Static email view (AC-4). The prototype doesn't send email.
export default async function EmailPage({ params }: PageProps<"/email/[site]">) {
  const { site: siteKey } = await params;
  const site = getSite(siteKey);
  const { owner } = prioritized(site);
  const r = site.readings;
  const origin = describeSection({ provider: "siteimprove", source: site.source, date: site.checkedAt });

  return (
    <SiteGate siteKey={siteKey} siteName={site.name}>
      <p className="crumbs">
        <Link href="/email/">Email preview</Link> / {site.name}
      </p>
      <h1 className="eyebrow">Email preview</h1>
      <p className="lede">A static view of the summary {site.name}’s owners would receive. The prototype doesn’t send email.</p>

      <section aria-label="Email preview" className="max-w-[608px] overflow-hidden rounded border border-black-20">
        <div className="h-6 bg-cardinal-red" />
        <div className="bg-fog-light px-16 py-12 text-16">
          <div>
            <strong>From:</strong> Stanford Web Services, Website Health
          </div>
          <div>
            <strong>Subject:</strong> {hostOf(site.url)} {site.state === "attention" ? "needs attention" : "is in good shape"}
          </div>
        </div>
        <div className="px-20 pb-24 pt-20">
          <p className="mb-10 font-serif text-[2.4rem] font-semibold leading-tight">{site.verdict}</p>
          <p>{site.lede}</p>
          <p>
            <strong>Site Target Score:</strong> {formatNumber(r.siteTargetScore.value)} (goal: 100).{" "}
            <strong>Accessibility score:</strong> {formatNumber(r.accessibilityScore.value)} out of 100.{" "}
            <strong>Broken links:</strong> {formatNumber(r.brokenLinks.value)}.
          </p>
          {owner.length > 0 && (
            <>
              <p className="mb-6">
                <strong>Start with these:</strong>
              </p>
              <ol>
                {owner.slice(0, 3).map((v) => (
                  <li key={v.issue.type}>
                    {v.type.title}. {v.issue.scope}
                  </li>
                ))}
              </ol>
            </>
          )}
          <p>
            <Link className="btn" href={`/sites/${siteKey}/`}>
              Open your dashboard
            </Link>
          </p>
          <p className="mb-0 text-15 text-black-80">
            Data from the {origin.origin} {origin.sourceLabel}. In the full version, you’ll choose how often you get this
            email.
          </p>
        </div>
      </section>
    </SiteGate>
  );
}
