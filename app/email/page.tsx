import type { Metadata } from "next";
import Link from "next/link";
import { VisibleSite } from "@/components/PortfolioViews";
import { getPortfolio } from "@/lib/data/load";
import { byNeed } from "@/lib/data/view";
import { hostOf } from "@/lib/format";

export const metadata: Metadata = { title: "Email preview" };

// Static email view (AC-4): pick a site to see the summary its owners would get.
export default function EmailIndex() {
  const sites = [...getPortfolio().sites].sort(byNeed);
  return (
    <>
      <h1 className="eyebrow">Email preview</h1>
      <p className="verdict">This is the summary an owner receives.</p>
      <p className="lede">A static view. The prototype doesn’t send email. Choose a site to see its summary.</p>
      <ul className="list-none p-0">
        {sites.map((s) => (
          <VisibleSite key={s.key} siteKey={s.key}>
            <li className="mb-8">
              <Link href={`/email/${s.key}/`}>
                {s.name}, {hostOf(s.url)}
              </Link>
            </li>
          </VisibleSite>
        ))}
      </ul>
    </>
  );
}
