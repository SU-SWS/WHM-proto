// Display formatting. No data access, so client components can use it too.

/** "https://sitesuserguide.stanford.edu" → "sitesuserguide.stanford.edu" */
export function hostOf(url: string): string {
  return new URL(url).host;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-04" → "April" (long) or "Apr" (short). */
export function monthName(ym: string, style: "long" | "short" = "long"): string {
  const name = MONTH_NAMES[Number(ym.slice(5, 7)) - 1];
  return style === "short" ? name.slice(0, 3) : name;
}

/** "Up 3 since last check", "Down 0.6 since last check", "No change since last check". */
export function changeText(change: number | null): string {
  if (change === null) return "No earlier check to compare with";
  if (change === 0) return "No change since last check";
  // Two decimals, the precision Siteimprove reports scores in.
  const size = Math.round(Math.abs(change) * 100) / 100;
  return `${change > 0 ? "Up" : "Down"} ${formatNumber(size)} since last check`;
}

/** Whether a change is good news. Words carry the meaning; color only repeats it. */
export function changeTone(change: number | null, lowerIsBetter: boolean): "better" | "worse" | null {
  if (change === null || change === 0) return null;
  return change > 0 !== lowerIsBetter ? "better" : "worse";
}

/** "2026-11-20T14:17:03Z" → "Nov 20, 2026, 6:17 AM Pacific". */
export function formatDateTime(iso: string): string {
  const text = new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${text} Pacific`;
}
