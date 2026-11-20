// URL normalization (Q-5): every page is stored as a path on its site, with a
// lowercase host check, no query string or fragment, and no trailing slash
// except the home page "/". Siteimprove Analytics and QA write the home page
// differently ("…stanford.edu" and "…stanford.edu/"); both become "/".

export function normalizePath(url, siteUrl) {
  let u;
  try {
    u = new URL(url, siteUrl);
  } catch {
    return null;
  }
  const site = new URL(siteUrl);
  if (u.host.toLowerCase() !== site.host.toLowerCase()) return null; // another site's page
  let p;
  try {
    p = decodeURI(u.pathname).toLowerCase();
  } catch {
    p = u.pathname.toLowerCase(); // malformed escape; keep it encoded
  }
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
}
