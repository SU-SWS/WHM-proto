// Traffic settings shared by the data run and the site.

/**
 * The rolling window for every traffic-based number: page views per page,
 * busiest pages, issue ranking, and (via the Apps Script) GA4 engagement and
 * site search. One window for all, so they always line up (decisions, Nov 20).
 * Keep in step with WINDOW_DAYS in scripts/apps-script/ga4-export.gs;
 * the data run refuses a GA4 export with a different window.
 */
export const WINDOW_DAYS = 90;

/**
 * Busiest pages: the 5 with the most page views (platform pages left out). An
 * owner issue on one sets the verdict to "Needs attention" (docs/verdict-rules.md).
 * Kept small on purpose, to point owners at the issues that reach the most
 * visitors. "Most visited pages" lists 10 for context; its first 5 rows are the
 * busiest pages (decisions, Nov 23).
 */
export const BUSIEST = 5;
/** Rows in "Most visited pages"; the low-engagement check looks at these (CT-2). */
export const MOST_VISITED = 10;
