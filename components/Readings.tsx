import type { Reading, SiteData } from "@/lib/data/types";
import { changeText, changeTone, formatNumber } from "@/lib/format";
import { sourceLabel } from "@/lib/data/provenance";

// Headline readings in the order SP-1 and SP-7 set: the Site Target Score
// first, accessibility second, then content measures.
export function Readings({ site }: { site: SiteData }) {
  const r = site.readings;
  const items: { label: string; reading: Reading; lowerIsBetter: boolean; note?: string }[] = [
    { label: "Site Target Score, goal 100", reading: r.siteTargetScore, lowerIsBetter: false },
    { label: "Accessibility score, out of 100", reading: r.accessibilityScore, lowerIsBetter: false },
    { label: "Broken links", reading: r.brokenLinks, lowerIsBetter: true },
    {
      label: "Pages not updated in a year",
      reading: r.stalePages,
      lowerIsBetter: true,
      note: `of ${formatNumber(r.stalePages.total)} pages${r.stalePages.simulated ? " (simulated check)" : ""}`,
    },
    { label: "Pages missing a search description", reading: r.missingSearchDescriptions, lowerIsBetter: true },
  ];
  // Label each reading's source only when they differ; otherwise the page's source note covers them.
  const mixed = new Set(items.map((i) => i.reading.source)).size > 1;

  return (
    <dl className="m-0 grid grid-cols-2 border-y border-black-20 md:grid-cols-[repeat(auto-fit,minmax(208px,1fr))]">
      {items.map(({ label, reading, lowerIsBetter, note }, i) => {
        const tone = changeTone(reading.change, lowerIsBetter);
        return (
          <div
            key={label}
            className={`py-12 pr-16 ${i > 0 ? "md:border-l md:border-black-20 md:pl-16" : ""}`}
          >
            <dt className="text-16 text-black-80">{label}</dt>
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
