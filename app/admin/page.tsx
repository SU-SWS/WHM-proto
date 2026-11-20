import type { Metadata } from "next";
import { RunStatus } from "@/components/RunStatus";
import { TableWrap } from "@/components/TableWrap";
import { REFRESH_WORKFLOW_URL } from "@/lib/config";
import { getRegistry, getStatus } from "@/lib/data/load";
import type { SiteRunStatus } from "@/lib/data/types";
import { ownerLabels } from "@/lib/data/view";
import { formatDateTime, hostOf } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

// Admin (AD-1 to AD-3): the registry, a way to start a data run (Option A:
// open the workflow in GitHub Actions), and each site's last result.
export default function AdminPage() {
  const registry = getRegistry();
  const status = getStatus();

  return (
    <>
      <h1 className="eyebrow">Admin</h1>
      <p className="verdict">Register sites, start a data run, and check that it finished.</p>
      <p className="lede">
        In the prototype, the registry is a file in the repo, and “Start data run” opens the data run in GitHub
        Actions. Only SWS staff with write access to the repo can start it.
      </p>

      <h2 className="section-heading">Data run</h2>
      <ol className="mb-16 max-w-[62ch]">
        <li>Select “Start data run.” GitHub opens the data run workflow in a new tab.</li>
        <li>
          Select “Run workflow,” choose a site to refresh or leave it as <code>all</code>, and select “Run workflow”
          again.
        </li>
        <li>Come back to this page. It shows when the run finishes and the updated site is live.</li>
      </ol>
      <p>
        <a className="btn" href={REFRESH_WORKFLOW_URL} target="_blank" rel="noopener">
          Start data run<span className="sr-only"> (opens GitHub in a new tab)</span>
        </a>
      </p>
      <RunStatus initialStatus={status} />

      <h3 className="subheading">Last result for each site</h3>
      <TableWrap label="Last result for each site">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Site</th>
              <th scope="col">Data</th>
              <th scope="col">Result</th>
              <th scope="col">Finished</th>
            </tr>
          </thead>
          <tbody>
            {registry.sites.map((s) => {
              const r = status.sites[s.key];
              return (
                <tr key={s.key}>
                  <th scope="row" className="!bg-transparent font-normal">
                    {s.name}
                  </th>
                  <td>{r?.source === "live" ? "Live Siteimprove data" : "Sample data"}</td>
                  <td>{resultText(r, s.live)}</td>
                  <td>{r?.finishedAt ? formatDateTime(r.finishedAt) : "Not run yet"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>

      <h2 className="section-heading">Registry</h2>
      <p className="meta mb-12">
        From <code>data/registry.json</code>. To add or change a site, edit that file and commit it. Owners are
        listed by role only.
      </p>
      <TableWrap label="Registry">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Site</th>
              <th scope="col">URL</th>
              <th scope="col">Siteimprove site ID</th>
              <th scope="col">GA4 property</th>
              <th scope="col">Owners</th>
              <th scope="col">Data</th>
            </tr>
          </thead>
          <tbody>
            {registry.sites.map((s) => (
              <tr key={s.key}>
                <th scope="row" className="!bg-transparent font-normal">
                  {s.name}
                </th>
                <td>{hostOf(s.url)}</td>
                <td className="tabular-nums">{s.siteimproveSiteId ?? <span className="italic text-black-80">Not set</span>}</td>
                <td>{s.ga4PropertyId ?? <span className="italic text-black-80">Not used until the MVP</span>}</td>
                <td>{ownerLabels(s.key).join(", ")}</td>
                <td>{s.live ? "Live" : "Sample"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

function resultText(r: SiteRunStatus | undefined, live: boolean): string {
  if (!r) return "Not in the last run";
  if (r.result === "complete") return "Complete";
  if (r.result === "failed") return `Failed${r.reason ? `: ${r.reason}` : ""}. The site shows the last good data.`;
  return live
    ? "Not fetched live yet. The site shows sample data until the first live run."
    : "Sample data. This site isn’t fetched live.";
}
