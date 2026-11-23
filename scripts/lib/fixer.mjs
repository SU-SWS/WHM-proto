// Who fixes an issue on a site (SP-5, TR-5). Shared by the data run and the site,
// so the lists, the verdict and the rollup counts always agree (Q-4).
//
// In order: an accessibility specialist note marked swsHandling for this issue
// type (all sites or this one) moves it to SWS; then the issue's own override
// (template issues); then the issue type's fixer.

export function noteHandledBySws(annotations, siteKey, issueType) {
  return (annotations?.annotations ?? []).some(
    (a) => a.swsHandling && a.issueType === issueType && (a.appliesTo === "all" || a.appliesTo === siteKey),
  );
}

export function fixerFor({ siteKey, issue, types, annotations }) {
  if (noteHandledBySws(annotations, siteKey, issue.type)) return "sws";
  return issue.fixer ?? types.find((t) => t.key === issue.type)?.fixer ?? "owner";
}
