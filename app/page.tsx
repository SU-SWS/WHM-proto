import Link from "next/link";
import { BusiestMark, BusiestNote, mentionsBusiest } from "@/components/BusiestNote";
import { PortfolioHeadline, VisibleSite } from "@/components/PortfolioViews";
import { SourceNote } from "@/components/SourceNote";
import { getPortfolio, getStatus } from "@/lib/data/load";
import { byNeed } from "@/lib/data/view";
import { formatNumber, hostOf } from "@/lib/format";

// Portfolio rollup, ordered by need (AC-3), showing the sites the current
// "Viewing as" person owns (AC-2).
export default function Portfolio() {
  const portfolio = getPortfolio();
  const status = getStatus();
  const sites = [...portfolio.sites].sort(byNeed);

  return (
    <>
      <h1 className="eyebrow">Your sites</h1>
      <PortfolioHeadline sites={sites.map((s) => ({ key: s.key, state: s.state }))} />
      <p className="meta">
        Sites are listed with the one that needs the most attention first. Each line comes from that site’s
        latest Siteimprove check.
      </p>
      <ul className="m-0 list-none p-0">
        {sites.map((s) => (
          <VisibleSite key={s.key} siteKey={s.key}>
          <li
            className="mb-0 grid gap-x-24 gap-y-8 border-t border-black-20 py-18 last:border-b md:grid-cols-[1fr_auto]"
          >
            <div>
              <h2 className="m-0 text-20 font-bold leading-tight">{s.name}</h2>
              <span className="text-15 text-black-80">{hostOf(s.url)}</span>
              <p className="my-6 max-w-[60ch] font-serif text-19">
                {s.verdict}
                <BusiestMark text={s.verdict} />
              </p>
              <ul className="m-0 flex list-none flex-wrap gap-x-20 gap-y-4 p-0 text-16 text-black-80">
                <li className="mb-0">Site Target Score {formatNumber(s.siteTargetScore)}</li>
                <li className="mb-0">Accessibility score {formatNumber(s.accessibilityScore)}</li>
                <li className="mb-0">{formatNumber(s.brokenLinks)} broken links</li>
                <li className="mb-0">
                  {s.openOwnerIssues} {s.openOwnerIssues === 1 ? "item" : "items"} for you to fix
                </li>
              </ul>
              <SourceNote
                className="mb-0 mt-4 text-15 text-black-80"
                provider="siteimprove"
                source={s.source}
                date={s.checkedAt}
                run={status.sites[s.key]}
              />
            </div>
            <div>
              <Link className="btn" href={`/sites/${s.key}/`}>
                Open {s.name}
              </Link>
            </div>
          </li>
          </VisibleSite>
        ))}
      </ul>
      {sites.some((s) => mentionsBusiest(s.verdict)) && <BusiestNote className="meta mt-16" />}
    </>
  );
}
