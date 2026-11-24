import Link from "next/link";
import type { ReactNode } from "react";
import { BUSIEST, MOST_VISITED } from "@/scripts/lib/window.mjs";

// The mark for a site's 5 busiest pages (decisions, Nov 23): a cardinal star
// before the page, in "Most visited pages" and in issue page lists. It's a
// shape, not just a color, and screen readers hear "one of your 5 busiest pages".

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="inline-block size-[1.6rem] fill-current align-[-0.2rem] text-cardinal-red">
      <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L10 14.9l-5.3 2.9 1.1-5.9L1.4 7.8l6-.8z" />
    </svg>
  );
}

/** A page label, starred when it's one of the busiest pages. */
export function BusiestLabel({ busiest, children }: { busiest: boolean; children: ReactNode }) {
  if (!busiest) return <>{children}</>;
  return (
    <span className="font-semibold">
      <StarIcon /> <span className="sr-only">One of your {BUSIEST} busiest pages: </span>
      {children}
    </span>
  );
}

/** The key for the star, above or below a list that uses it. */
export function BusiestKey({ children, className = "meta" }: { children?: ReactNode; className?: string }) {
  return (
    <p className={className}>
      <StarIcon /> <span className="sr-only">A star</span> marks your {BUSIEST} busiest pages, the {BUSIEST} with the most
      page views. {children}
    </p>
  );
}

/**
 * Issue pages: why the busiest pages are pointed out, with a link to the 10 most
 * visited. With stars in the list, it starts with the key.
 */
export function BusiestExplainer({ siteKey, starred }: { siteKey: string; starred: boolean }) {
  const why = (
    <>
      WHM points them out so you can start with the issues that reach the most visitors.{" "}
      <Link href={`/sites/${siteKey}/#most-visited`}>See your {MOST_VISITED} most visited pages</Link>.
    </>
  );
  if (starred) return <BusiestKey className="meta mt-8">{why}</BusiestKey>;
  return (
    <p className="meta mt-8">
      Your busiest pages are the {BUSIEST} with the most page views. {why}
    </p>
  );
}
