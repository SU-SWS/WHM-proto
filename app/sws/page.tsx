import type { Metadata } from "next";
import Link from "next/link";
import { SourceNote } from "@/components/SourceNote";
import { TableWrap } from "@/components/TableWrap";
import { getPortfolio, getStatus } from "@/lib/data/load";
import { byNeed, ownerLabels } from "@/lib/data/view";
import { formatNumber, hostOf } from "@/lib/format";

export const metadata: Metadata = { title: "All client sites" };

// SWS all-sites view (AC-8): every client site ranked by need, so SWS can
// contact owners before problems grow.
export default function SwsPage() {
  const portfolio = getPortfolio();
  const status = getStatus();
  const sites = [...portfolio.sites].sort(byNeed);
  const need = sites.filter((s) => s.state === "attention").length;

  return (
    <>
      <h1 className="eyebrow">All client sites</h1>
      <p className="verdict">
        {need} of {sites.length} client sites {need === 1 ? "needs" : "need"} attention.
      </p>
      <p className="lede">
        Sites are listed with the one that needs the most attention first, so SWS can contact owners before problems
        grow.
      </p>

      <TableWrap label="All client sites">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Site</th>
              <th scope="col">Verdict</th>
              <th scope="col" className="num">Site Target Score</th>
              <th scope="col" className="num">Open owner items</th>
              <th scope="col">Owners</th>
              <th scope="col">Latest data</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.key}>
                <th scope="row" className="!bg-transparent font-normal">
                  <Link href={`/sites/${s.key}/`} className="font-semibold">
                    {s.name}
                  </Link>
                  <br />
                  <span className="text-15 font-normal text-black-80">{hostOf(s.url)}</span>
                </th>
                <td className="min-w-[256px]">{s.verdict}</td>
                <td className="num">{formatNumber(s.siteTargetScore)}</td>
                <td className="num">{s.openOwnerIssues}</td>
                <td>{ownerLabels(s.key).join(", ")}</td>
                <td className="min-w-[224px]">
                  <SourceNote
                    className="m-0 text-16"
                    provider="siteimprove"
                    source={s.source}
                    date={s.checkedAt}
                    run={status.sites[s.key]}
                    showAge
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}
