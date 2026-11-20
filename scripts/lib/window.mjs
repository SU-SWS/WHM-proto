// Shared by the data run and the GA4 merge.

/**
 * The rolling window for every traffic-based number: page views per page,
 * busiest pages, issue ranking, and (via the Apps Script) GA4 engagement and
 * site search. One window for all, so they always line up (decisions, Nov 20).
 * Keep in step with WINDOW_DAYS in scripts/apps-script/ga4-export.gs;
 * the data run refuses a GA4 export with a different window.
 */
export const WINDOW_DAYS = 90;
