// Build-time loaders. Pages read only data/published/ (what scripts/refresh.mjs
// writes) plus the hand-edited files at the top of data/. The browser never
// fetches these; they're baked into the static export.

import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  Annotations,
  IssueTypes,
  Portfolio,
  Registry,
  Report,
  SiteData,
  Status,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLISHED_DIR = path.join(DATA_DIR, "published");

const cache = new Map<string, unknown>();

// Reads a JSON file once per build and fails the build on a schema mismatch,
// so a bad data file never reaches the published site.
function readJson<T extends { schemaVersion: number }>(file: string): T {
  if (cache.has(file)) return cache.get(file) as T;
  let data: T;
  try {
    data = JSON.parse(readFileSync(file, "utf8")) as T;
  } catch (err) {
    throw new Error(`Couldn't read ${path.relative(process.cwd(), file)}: ${(err as Error).message}`);
  }
  if (data.schemaVersion !== 1) {
    throw new Error(
      `${path.relative(process.cwd(), file)} has schemaVersion ${data.schemaVersion}; this build expects 1. See docs/data-contract.md.`,
    );
  }
  cache.set(file, data);
  return data;
}

export function getRegistry(): Registry {
  return readJson<Registry>(path.join(DATA_DIR, "registry.json"));
}

export function getIssueTypes(): IssueTypes {
  return readJson<IssueTypes>(path.join(DATA_DIR, "issue-types.json"));
}

export function getAnnotations(): Annotations {
  return readJson<Annotations>(path.join(DATA_DIR, "annotations.json"));
}

export function getPortfolio(): Portfolio {
  return readJson<Portfolio>(path.join(PUBLISHED_DIR, "portfolio.json"));
}

export function getStatus(): Status {
  return readJson<Status>(path.join(PUBLISHED_DIR, "status.json"));
}

/** Site keys from the registry, in registry order. */
export function getSiteKeys(): string[] {
  return getRegistry().sites.map((s) => s.key);
}

export function getSite(siteKey: string): SiteData {
  const site = readJson<SiteData>(path.join(PUBLISHED_DIR, "sites", `${siteKey}.json`));
  if (site.siteKey !== siteKey) {
    throw new Error(`data/published/sites/${siteKey}.json has siteKey "${site.siteKey}".`);
  }
  return site;
}

export function getAllSites(): SiteData[] {
  return getSiteKeys().map(getSite);
}

export function getReport(siteKey: string): Report {
  const report = readJson<Report>(path.join(PUBLISHED_DIR, "reports", `${siteKey}.json`));
  if (report.siteKey !== siteKey) {
    throw new Error(`data/published/reports/${siteKey}.json has siteKey "${report.siteKey}".`);
  }
  return report;
}
