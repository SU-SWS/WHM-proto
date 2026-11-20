# Data contract

Every part of the prototype reads or writes these files. The pages, the workflows and the live fetch meet only here.

## Folders

| Path | Written by | Purpose |
| --- | --- | --- |
| `data/registry.json` | People, by commit | Sites, owners (role labels), source IDs, which site is live |
| `data/issue-types.json` | People, by commit | Plain-language text for each issue type (OT-04) |
| `data/annotations.json` | People, by commit | SWS accessibility specialist notes (TR-4, TR-5) |
| `data/sample/` | People, by commit | Sample data. Scripts never write here. |
| `data/published/` | `scripts/refresh.mjs` | What the site builds from. Starts as a copy of `data/sample/`. |
| `data/fixtures/siteimprove/` | People or scripts, once | Saved real API responses used to write and test code |
| `data/history/` | `scripts/record-site-target.mjs`, daily | Site Target Score history that WHM builds itself, because the API keeps none. Live sites only. |

**How the refresh merges data:** for each site, the script starts from that site's sample file. For a site with `live: true`, it replaces each section it fetched successfully and sets that section's `source` to `"live"`. If a section fails, the script keeps that section's last good published version. The result is written to `data/published/`. `portfolio.json` is then rebuilt from the published site files, so the rollup always matches the site pages; `openOwnerIssues` is the number of issues whose type has `fixer: "owner"`. `status.json`'s `runId` is the GitHub Actions run ID, which the admin page matches against GitHub to tell when a run's data is live.

## Types

```ts
type Source = "live" | "sample";
type IsoDate = string; // "2026-11-10"

// data/registry.json
interface Registry {
  schemaVersion: 1;
  owners: { key: string; label: string }[];   // role labels only
  sites: {
    key: string; name: string; url: string;
    live: boolean;                    // true only for sitesuserguide in the prototype
    siteimproveSiteId: number | null; // fill in before the first live run
    ga4PropertyId: string | null;     // MVP
    owners: string[];                 // owner keys
  }[];
}

// data/issue-types.json
interface IssueTypes {
  schemaVersion: 1;
  types: {
    key: string; title: string; category: string;
    fixer: "owner" | "sws";
    editorial: boolean;          // true allows "Still correct" and "Set aside"
    what: string; why: string; todo: string;
    siteimproveIds: string[];    // rule or policy IDs that map to this type; fill in from live data
    reviewedBySws: boolean;
  }[];
}

// data/annotations.json
interface Annotations {
  schemaVersion: 1;
  annotations: {
    issueType: string; appliesTo: "all" | string;   // "all" or a site key
    note: string; swsHandling: boolean; author: string; reviewedBySws: boolean;
  }[];
}

// data/{sample|published}/sites/<siteKey>.json
interface SiteData {
  schemaVersion: 1;
  siteKey: string; name: string; url: string;
  source: Source;              // "live" if any section is live
  checkedAt: IsoDate;          // date of the Siteimprove check the data comes from
  state: "attention" | "ok" | "good";
  verdict: string;             // one sentence
  lede: string;
  readings: {
    siteTargetScore:            Reading & { goal: 100 };
    accessibilityScore:         Reading;
    brokenLinks:                Reading;
    stalePages:                 Reading & { total: number; simulated: boolean };
    missingSearchDescriptions:  Reading;
  };
  trends: {
    months: string[];          // "2026-04" … "2026-11"
    siteTargetScore: Series; accessibilityScore: Series; brokenLinks: Series; pageViews: Series;
  };
  topPages: {
    viewsSource: Source; engagementSource: Source;   // engagement is GA4, so sample until the MVP
    pages: { path: string; views: number; engagementRate: number | null; openIssues: number }[];
  };
  issues: {
    type: string;              // key into issue-types.json
    scope: string; reason: string;
    rank: number | null;       // owner-fixable issues are ranked; SWS-handled issues are null
    siteimproveUrl: string | null;
    source: Source;
    pages: ({ path: string; views: number; count: number } |
             { path: string; views: number; monthsSinceUpdate: number })[];
  }[];
  siteSearch: { source: Source; terms: { term: string; count: number }[] };   // GA4, sample until the MVP
  speed:      { source: Source; pages: { path: string; score: number }[] };  // optional
}
interface Reading { value: number; change: number; source: Source }
interface Series  { source: Source; values: number[] }

// data/{sample|published}/reports/<siteKey>.json
interface Report {
  schemaVersion: 1; siteKey: string;
  source: "sample" | "generated";   // "sample" throughout the prototype
  status: string;                   // e.g. "Not yet reviewed by SWS"
  generatedAt: IsoDate;
  findings: { title: string; evidence: string; recommendation: string }[];
}

// data/{sample|published}/portfolio.json
interface Portfolio {
  schemaVersion: 1; generatedAt: IsoDate;
  sites: { key: string; name: string; url: string; state: SiteData["state"]; verdict: string;
           siteTargetScore: number; accessibilityScore: number; brokenLinks: number;
           openOwnerIssues: number; checkedAt: IsoDate; source: Source }[];
}

// data/history/<siteKey>.json — appended by the daily Record Site Target Score
// workflow. Values are Siteimprove's, unchanged, under Siteimprove's field names,
// until a reviewed fixture confirms their scale. One point per UTC day.
interface History {
  schemaVersion: 1;
  siteKey: string;
  points: {
    date: IsoDate;                          // the day WHM recorded it
    site_target_percentage: number;
    accessibility_dci_score: number | null;
  }[];
}

// data/{sample|published}/status.json
interface Status {
  schemaVersion: 1;
  runId: string | null; startedAt: string | null; finishedAt: string | null;  // ISO date-times
  sites: Record<string, {
    result: "complete" | "failed" | "sample";
    reason: string | null; finishedAt: string | null; source: Source;
  }>;
}
```

## Rules

- Increase `schemaVersion` when a field's meaning changes, and update this document in the same change.
- Never write owner names, emails or secrets into any data file.
- Page paths are normalized: lowercase host, no query string, consistent trailing slash (Q-5). The home page is stored as `/`; screens label it “/ (home)”.
- Browser-side per-page tracking state is not part of this contract. It lives in `localStorage`, keyed by site key, issue type and normalized page path (TR-1).
