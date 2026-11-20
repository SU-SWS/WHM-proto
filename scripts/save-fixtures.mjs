// Saves real Siteimprove responses for review, before code depends on them
// (CLAUDE.md: endpoints are checked against a saved response first).
//
// Usage: node scripts/save-fixtures.mjs DIR
//
// Run by the "Save Siteimprove fixtures" workflow, which uploads DIR as a
// short-lived artifact. Nothing is committed: review the files, then copy the
// ones you want into data/fixtures/siteimprove/.
//
// Before saving, every response is cleaned: impmd is stripped from links
// (decisions, Nov 20), and staff-name fields (created_by, edited_by) are
// replaced with "[REMOVED]", because the repo is public and holds no names.
// Never add personal ID numbers, email addresses or phone numbers here (AD-7).
//
// To verify something new, add it to probes() below. Earlier rounds are saved
// as data/fixtures/siteimprove/probe-*.json and probe2-*.json.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, scrubImpmd } from "./lib/siteimprove.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!outDir) {
  console.error("Usage: node scripts/save-fixtures.mjs DIR");
  process.exit(1);
}
const client = createClient();
if (!client) {
  console.error("SITEIMPROVE_API_USER and SITEIMPROVE_API_KEY must be set.");
  process.exit(1);
}

const NAME_FIELDS = new Set(["created_by", "edited_by"]);
const clean = (v) => {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, NAME_FIELDS.has(k) ? "[REMOVED]" : clean(x)]));
  return v;
};

async function save(name, target) {
  let data;
  try {
    data = await client.get(target);
  } catch (err) {
    data = { _whm_error: err.message };
  }
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(clean(scrubImpmd(data)), null, 2) + "\n");
  console.log(`Saved ${name}.json${data._whm_error ? ` (${data._whm_error})` : ""}`);
  return data._whm_error ? null : data;
}

const limit = (href, n) => `${href}${href.includes("?") ? "&" : "?"}page_size=${n}`;
/** Allowlisted policies only (decisions, Nov 20). */
const ALLOWED = /^(\[(qa|a11y|seo)\])+|^(qa|a11y):/i;

/** Round 3 (Nov 20): what Stanford policy matches look like (task 6, SI-24). */
async function probes(id) {
  const policies = await client.get(`/sites/${id}/policy/policies?page_size=200`);
  // Policies about email addresses or phone numbers are skipped: their matches would hold personal contact details.
  const allowed = (policies.items ?? []).filter((p) => ALLOWED.test(p.name) && !/e-?mail|phone/i.test(p.name) && p.matches > 0);
  // One policy per match category (content, media, documents), choosing the one
  // with the fewest matches so the file stays small.
  const byCategory = new Map();
  for (const p of allowed.sort((a, b) => a.matches - b.matches)) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, p);
  }
  for (const [category, p] of byCategory) {
    if (p._links?.matches) await save(`probe3-policy-matches-${category}`, limit(p._links.matches.href, 10));
    if (p._links?.history) await save(`probe3-policy-history-${category}`, limit(p._links.history.href, 10));
  }
  console.log(`Policies probed: ${[...byCategory.values()].map((p) => `${p.name} (${p.category}, ${p.matches} matches)`).join("; ")}`);
}

const registry = JSON.parse(await readFile(path.join(ROOT, "data", "registry.json"), "utf8"));
const sites = registry.sites.filter((s) => s.live && s.siteimproveSiteId);
for (const site of sites) await probes(site.siteimproveSiteId);
console.log(`Done: ${client.calls()} API calls.`);
