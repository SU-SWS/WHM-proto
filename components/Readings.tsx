import Link from "next/link";
import type { Reading, SiteData } from "@/lib/data/types";
import { changeText, changeTone, formatNumber } from "@/lib/format";
import { sourceLabel } from "@/lib/data/provenance";

// Headline readings in the order SP-1 and SP-7 set: the Site Target Score
// first, accessibility second, then content measures. With `siteKey`, a reading
// that has an issue page on this site links to it (SP-2). The two scores have no
// single issue page; the issue list below them is their detail.
export function Readings({ site, siteKey }: { site: SiteData; siteKey?: string }) {
  const r = site.readings;
  const items: { label: string; reading: Reading; lowerIsBetter: boolean; note?: string; issue?: string }[] = [
    { label: "Site Target Score, goal 100", reading: r.siteTargetScore, lowerIsBetter: false },
    { label: "Accessibility score, out of 100", reading: r.accessibilityScore, lowerIsBetter: false },
    { label: "Broken links", reading: r.brokenLinks, lowerIsBetter: true, issue: "broken" },
    {
      label: "Pages not updated in over a year",
      issue: "stale",
      reading: r.stalePages,
      lowerIsBetter: true,
      note: `of ${formatNumber(r.stalePages.total)} pages${r.stalePages.simulated ? " (simulated check)" : ""}`,
    },
    { label: "Pages missing a search description", reading: r.missingSearchDescriptions, lowerIsBetter: true, issue: "searchdesc" },
  ];
  // Label each reading's source only when they differ; otherwise the page's source note covers them.
  const mixed = new Set(items.map((i) => i.reading.source)).size > 1;

  return (
    <dl className="m-0 grid grid-cols-2 border-y border-black-20 md:grid-cols-[repeat(auto-fit,minmax(208px,1fr))]">
      {items.map(({ label, reading, lowerIsBetter, note, issue }, i) => {
        const tone = changeTone(reading.change, lowerIsBetter);
        const linked = siteKey && issue && site.issues.some((x) => x.type === issue);
        return (
          <div
            key={label}
            className={`py-12 pr-16 ${i > 0 ? "md:border-l md:border-black-20 md:pl-16" : ""}`}
          >
            <dt className="text-16 text-black-80">
              {linked ? <Link href={`/sites/${siteKey}/issues/${issue}/`}>{label}</Link> : label}
            </dt>
            <dd className="m-0">
              <span className="block text-[2.7rem] font-semibold leading-tight">{formatNumber(reading.value)}</span>
              <span className={`block text-16 ${note ? "text-black-80" : (tone ?? "")}`}>{note ?? changeText(reading.change)}</span>
              {mixed && <span className="tag tag-sample mt-4 inline-block">{sourceLabel(reading.source)}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
