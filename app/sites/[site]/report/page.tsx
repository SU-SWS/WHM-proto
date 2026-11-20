import type { Metadata } from "next";
import Link from "next/link";
import { SourceNote } from "@/components/SourceNote";
import { getReport, getSite, getSiteKeys } from "@/lib/data/load";
import { hostOf } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSiteKeys().map((site) => ({ site }));
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/report">): Promise<Metadata> {
  const { site } = await params;
  return { title: `Content report, ${getSite(site).name}` };
}

// The AI content report (CT-4). A labeled sample throughout the prototype.
export default async function ReportPage({ params }: PageProps<"/sites/[site]/report">) {
  const { site: siteKey } = await params;
  const site = getSite(siteKey);
  const report = getReport(siteKey);
  const sample = report.source === "sample";

  return (
    <>
      <p className="crumbs">
        <Link href="/">Your sites</Link> / <Link href={`/sites/${siteKey}/`}>{site.name}</Link> / Content report
      </p>
      <h1 className="eyebrow">Content report for {hostOf(site.url)}</h1>
      <p className="verdict">Does the content meet visitor needs?</p>

      {sample && (
        <div className="note-sample">
          <strong>AI-generated sample report. {report.status}.</strong>
          <p className="mb-0 mt-4">
            This report is a sample written for the demo. It isn’t based on this site’s real content. From the MVP on,
            each data run will use the Claude API to write it from the text of the site’s 10 most visited public pages
            and its Google Analytics 4 page views, landing pages, engagement and site searches. Each finding will name
            the page and number behind it, so SWS can check it.
          </p>
        </div>
      )}
      <SourceNote provider="aiReport" source={sample ? "sample" : "live"} date={report.generatedAt} />

      {report.findings.map((f, i) => (
        <section key={f.title} aria-labelledby={`finding-${i}`}>
          <h2 id={`finding-${i}`} className="section-heading">
            {i + 1}. {f.title}
          </h2>
          <h3 className="subheading">What the data shows</h3>
          <p>{f.evidence}</p>
          <h3 className="subheading">Recommended change</h3>
          <p>{f.recommendation}</p>
        </section>
      ))}

      <p className="mt-32">
        <Link className="btn-secondary" href={`/sites/${siteKey}/`}>
          Back to {site.name}
        </Link>
      </p>
    </>
  );
}
