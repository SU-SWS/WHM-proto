// Siteimprove API client for the data run. Basic auth from Actions secrets;
// SITEIMPROVE_BASE_URL can point at scripts/dev/mock-siteimprove.mjs for testing.

export const BASE_URL = process.env.SITEIMPROVE_BASE_URL ?? "https://api.us.siteimprove.com/v2";

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
