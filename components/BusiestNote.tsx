import Link from "next/link";
import { BUSIEST, MOST_VISITED } from "@/scripts/lib/window.mjs";

/** Whether a verdict, lede or issue summary talks about the busiest pages. */
export function mentionsBusiest(text: string | null | undefined): boolean {
  return !!text && /busiest/i.test(text);
}

/** The asterisk after text that mentions the busiest pages. Screen readers get the footnote itself. */
export function BusiestMark({ text }: { text: string | null | undefined }) {
  return mentionsBusiest(text) ? <span aria-hidden="true">*</span> : null;
}

/**
 * The footnote that explains the asterisk: why WHM points to the 5 busiest pages,
 * with a link to the 10 most visited (decisions, Nov 23). With `href`, it's about
 * one site; without, it's a list of sites.
 */
export function BusiestNote({ href, className = "meta" }: { href?: string; className?: string }) {
  return (
    <p className={className}>
      <span aria-hidden="true">* </span>
      {href ? (
        <>
          Your busiest pages are the {BUSIEST} with the most page views. WHM points them out so you can start with the
          issues that reach the most visitors. <Link href={href}>See your {MOST_VISITED} most visited pages</Link>.
        </>
      ) : (
        <>
          A site’s busiest pages are the {BUSIEST} with the most page views. WHM points them out so you can start with
          the issues that reach the most visitors. Each site’s page lists its {MOST_VISITED} most visited pages.
        </>
      )}
    </p>
  );
}
