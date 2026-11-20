// Siteimprove API client for the data run. Basic auth from Actions secrets;
// SITEIMPROVE_BASE_URL can point at scripts/dev/mock-siteimprove.mjs for testing.

export const BASE_URL = process.env.SITEIMPROVE_BASE_URL ?? "https://api.us.siteimprove.com/v2";

/**
 * A Siteimprove web app link ("Open in Siteimprove", SP-2), cleaned for publishing.
 * Removes the `impmd` parameter Siteimprove adds: the links work without it, and
 * it may carry session or account context that shouldn't be passed on or made
 * public (decisions, Nov 20). Returns null for anything not on siteimprove.com.
 */
export function siteimproveLink(href) {
  if (!href) return null;
  let u;
  try {
    u = new URL(href);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !/(^|\.)siteimprove\.com$/.test(u.hostname)) return null;
  return stripImpmd(href);
}

/** Removes any impmd parameter from a URL string; leaves anything else unchanged. */
export function stripImpmd(text) {
  if (!/impmd=/i.test(text)) return text;
  try {
    const u = new URL(text);
    for (const key of [...u.searchParams.keys()]) if (key.toLowerCase() === "impmd") u.searchParams.delete(key);
    return u.toString();
  } catch {
    return text.replace(/impmd=[^&#"\s]*/gi, "impmd=[REDACTED]");
  }
}

/** A copy of an API response with impmd stripped from every string (for fixtures). */
export function scrubImpmd(value) {
  if (typeof value === "string") return stripImpmd(value);
  if (Array.isArray(value)) return value.map(scrubImpmd);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubImpmd(v)]));
  return value;
}

export function createClient({ user = process.env.SITEIMPROVE_API_USER, key = process.env.SITEIMPROVE_API_KEY } = {}) {
  if (!user || !key) return null;
  const auth = `Basic ${Buffer.from(`${user}:${key}`).toString("base64")}`;
  let calls = 0;

  /** GET a path or a full href from a response's links. Retries 429 and 5xx with backoff. */
  async function get(target) {
    const url = target.startsWith("http") ? target : `${BASE_URL}${target}`;
    if (!url.startsWith(BASE_URL)) throw new Error(`Refusing to call ${url}: not the Siteimprove API`);
    for (let attempt = 1; ; attempt++) {
      calls++;
      const res = await fetch(url, { headers: { Authorization: auth, Accept: "application/json" } });
      if (res.ok) return res.json();
      if ((res.status !== 429 && res.status < 500) || attempt === 4) {
        const err = new Error(`GET ${url.replace(BASE_URL, "")} returned HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const wait = Number(res.headers.get("retry-after")) * 1000 || 2 ** attempt * 1000;
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  /** Every item from a paged list, following links.next. */
  async function getAll(target, { max = 5000 } = {}) {
    const items = [];
    let next = target;
    while (next && items.length < max) {
      const page = await get(next);
      items.push(...(page.items ?? []));
      next = page.links?.next?.href ?? null;
    }
    return items;
  }

  return { get, getAll, calls: () => calls };
}
