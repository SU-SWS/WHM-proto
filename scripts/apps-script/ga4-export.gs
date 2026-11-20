/**
 * WHM: export Google Analytics 4 data for one site to the WHM-proto repo.
 *
 * Runs in Google Apps Script as the signed-in SWS account, using the
 * "Google Analytics Data API" advanced service, so no service account or
 * Cloud Console setup is needed (decisions, Nov 20). Setup: docs/ga4-setup.md.
 *
 * Writes data/ga4/<siteKey>.json (shape in docs/data-contract.md):
 *   - engagement rate per page over the last WINDOW_DAYS days (CT-2)
 *   - site search terms over the same window (CT-5), with anything that looks personal
 *     removed and only terms searched at least MIN_SEARCHES times kept
 * Page views are NOT exported: they come from Siteimprove Analytics (Q-4).
 *
 * Script properties (Project settings → Script properties):
 *   GA4_PROPERTY_ID   numeric GA4 property ID for the site
 *   GITHUB_TOKEN      fine-grained token: SU-SWS/WHM-proto only, Contents read and write
 *
 * Functions to run:
 *   dryRun()           builds the file and logs it. Commits nothing. Run this first.
 *   exportAndCommit()  builds the file and commits it to the repo.
 *   exportToDrive()    builds the file and saves it to your Google Drive, for
 *                      committing by hand (for example while the token awaits approval).
 *   installWeeklyTrigger()  runs exportAndCommit every Sunday, before Monday's data run.
 */

var SITE_KEY = "sitesuserguide";
var REPO = "SU-SWS/WHM-proto";
var BRANCH = "main";
var MIN_SEARCHES = 5; // decisions, Nov 20
// One rolling window for all traffic numbers (decisions, Nov 20). Keep in step
// with WINDOW_DAYS in scripts/lib/live-site.mjs; the data run checks they match.
var WINDOW_DAYS = 90;
var MAX_PAGES = 500;
var MAX_TERMS = 50;

function dryRun() {
  var file = buildFile_();
  var d = file.dropped;
  // A summary, not the whole file: Apps Script's log cuts off long output.
  // Dropped terms are counted but never printed.
  Logger.log([
    "Dry run for " + file.siteKey + ", " + file.period.start + " to " + file.period.end + ". Nothing was committed.",
    "Pages: " + String(file.pages.length) + ". First 10:",
    file.pages.slice(0, 10).map(function (p) { return "  " + p.path + "  " + String(p.engagementRate); }).join("\n"),
    "Search terms kept: " + String(file.searchTerms.length),
    file.searchTerms.map(function (t) { return "  " + t.term + "  " + String(t.count); }).join("\n"),
    "Search terms dropped: " + String(d.searchTerms) + " (" + String(d.rare) + " searched fewer than " + String(MIN_SEARCHES) +
      " times, " + String(d.personal) + " looked personal)",
    "Dropped for rarity, by number of searches: " + Object.keys(d.rareByCount).sort(function (a, b) { return b - a; })
      .map(function (k) { return String(k) + "× " + String(d.rareByCount[k]) + " terms"; }).join(", ")
  ].join("\n"));
}

function exportAndCommit() {
  var file = buildFile_();
  commit_("data/ga4/" + SITE_KEY + ".json", JSON.stringify(file, null, 2) + "\n",
    "GA4 export for " + SITE_KEY + ", " + file.period.start + " to " + file.period.end);
  Logger.log("Committed: " + String(file.pages.length) + " pages, " + String(file.searchTerms.length) + " search terms.");
}

function exportToDrive() {
  var file = buildFile_();
  var name = "whm-ga4-" + SITE_KEY + ".json";
  var text = JSON.stringify(file, null, 2) + "\n";
  var existing = DriveApp.getFilesByName(name);
  var saved = existing.hasNext() ? existing.next().setContent(text) : DriveApp.createFile(name, text, "application/json");
  Logger.log("Saved " + name + " to your Google Drive: " + saved.getUrl() +
    "\nDownload it, save it in the repo as data/ga4/" + SITE_KEY + ".json, then commit and push." +
    "\n" + String(file.pages.length) + " pages, " + String(file.searchTerms.length) + " search terms.");
}

function installWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "exportAndCommit") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("exportAndCommit").timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(18).create();
  Logger.log("Weekly trigger installed: Sundays around 6 p.m. (script time zone).");
}

function buildFile_() {
  if (typeof AnalyticsData === "undefined") {
    throw new Error("Add the Google Analytics Data API service: Services → + → Google Analytics Data API, identifier AnalyticsData. See docs/ga4-setup.md.");
  }
  var propertyId = prop_("GA4_PROPERTY_ID");
  var property = "properties/" + propertyId;
  var range = { startDate: String(WINDOW_DAYS) + "daysAgo", endDate: "yesterday" };

  var pageReport = AnalyticsData.Properties.runReport({
    dateRanges: [range],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "engagementRate" }, { name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: MAX_PAGES
  }, property);
  var pages = (pageReport.rows || []).map(function (r) {
    return {
      path: r.dimensionValues[0].value,
      engagementRate: round_(Number(r.metricValues[0].value), 4)
    };
  });

  var searchReport = AnalyticsData.Properties.runReport({
    dateRanges: [range],
    dimensions: [{ name: "searchTerm" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "view_search_results" } } },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 1000
  }, property);
  var all = (searchReport.rows || []).map(function (r) {
    return { term: r.dimensionValues[0].value.trim().toLowerCase(), count: Number(r.metricValues[0].value) };
  });
  var kept = all.filter(function (t) { return isPublishable_(t); }).slice(0, MAX_TERMS);
  // Counts only, for the dry-run summary; the dropped terms themselves are never kept.
  var rare = 0, personal = 0, rareByCount = {};
  all.forEach(function (t) {
    if (isPublishable_(t)) return;
    if (looksPersonal_(t.term)) { personal++; return; }
    rare++;
    rareByCount[t.count] = (rareByCount[t.count] || 0) + 1;
  });

  var tz = "America/Los_Angeles";
  var day = 24 * 60 * 60 * 1000;
  return {
    schemaVersion: 1,
    siteKey: SITE_KEY,
    propertyId: propertyId,
    generatedAt: new Date().toISOString(),
    periodDays: WINDOW_DAYS,
    period: {
      start: Utilities.formatDate(new Date(Date.now() - WINDOW_DAYS * day), tz, "yyyy-MM-dd"),
      end: Utilities.formatDate(new Date(Date.now() - day), tz, "yyyy-MM-dd")
    },
    pages: pages,
    searchTerms: kept,
    dropped: { searchTerms: all.length - kept.length, rare: rare, personal: personal, rareByCount: rareByCount }
  };
}

/** Site search terms may be public only if they don't look personal and are common (decisions, Nov 20). */
function isPublishable_(t) {
  return !!t.term && t.count >= MIN_SEARCHES && !looksPersonal_(t.term);
}

function looksPersonal_(term) {
  if (term.indexOf("@") !== -1) return true; // email addresses
  if (/\d{5,}/.test(term.replace(/[\s().-]/g, ""))) return true; // phone, ID or card numbers
  if (/(https?:\/\/|www\.)/.test(term)) return true; // URLs
  return false;
}

function commit_(path, text, message) {
  var token = prop_("GITHUB_TOKEN");
  var url = "https://api.github.com/repos/" + REPO + "/contents/" + path;
  var headers = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  var existing = UrlFetchApp.fetch(url + "?ref=" + BRANCH, { headers: headers, muteHttpExceptions: true });
  var sha = existing.getResponseCode() === 200 ? JSON.parse(existing.getContentText()).sha : undefined;
  var res = UrlFetchApp.fetch(url, {
    method: "put",
    headers: headers,
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      message: message,
      content: Utilities.base64Encode(text, Utilities.Charset.UTF_8),
      branch: BRANCH,
      sha: sha
    })
  });
  if (res.getResponseCode() >= 300) {
    throw new Error("GitHub commit failed: HTTP " + res.getResponseCode() + " " + res.getContentText().slice(0, 300));
  }
}

function prop_(name) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  if (!v) throw new Error("Set the script property " + name + " (Project settings → Script properties).");
  return v;
}

function round_(n, dp) {
  var f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}
