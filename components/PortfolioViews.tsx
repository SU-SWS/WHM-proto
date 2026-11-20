"use client";

import { useViewer } from "./Viewer";

/** The rollup headline for the sites the current viewer owns (AC-2, AC-3). */
export function PortfolioHeadline({ sites }: { sites: { key: string; state: string }[] }) {
  const { canSee } = useViewer();
  const mine = sites.filter((s) => canSee(s.key));
  const need = mine.filter((s) => s.state === "attention").length;
  const text =
    need === 0
      ? `All of your ${mine.length === 1 ? "site is" : "sites are"} in good shape this week.`
      : need === 1
        ? `One of your ${mine.length} sites needs attention this week.`
        : `${need} of your sites need attention this week.`;
  return <p className="verdict">{text}</p>;
}

/** Renders a site's row only for viewers who own it. */
export function VisibleSite({ siteKey, children }: { siteKey: string; children: React.ReactNode }) {
  const { canSee } = useViewer();
  return canSee(siteKey) ? <>{children}</> : null;
}
