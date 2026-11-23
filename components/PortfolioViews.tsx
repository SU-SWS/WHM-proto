"use client";

import { useViewer } from "./Viewer";

/** The rollup headline for the sites the current viewer owns (AC-2, AC-3). */
export function PortfolioHeadline({ sites }: { sites: { key: string; state: string }[] }) {
  const { canSee } = useViewer();
  const mine = sites.filter((s) => canSee(s.key));
  const need = mine.filter((s) => s.state === "attention").length;
  const text =
    need === 0
      ? mine.length === 1
        ? "Your site is in good shape."
        : `All of your sites are in good shape.`
      : mine.length === 1
        ? "Your site needs attention."
        : need === 1
          ? `One of your ${mine.length} sites needs attention.`
          : `${need} of your ${mine.length} sites need attention.`;
  return <p className="verdict">{text}</p>;
}

/** Renders a site's row only for viewers who own it. */
export function VisibleSite({ siteKey, children }: { siteKey: string; children: React.ReactNode }) {
  const { canSee } = useViewer();
  return canSee(siteKey) ? <>{children}</> : null;
}
