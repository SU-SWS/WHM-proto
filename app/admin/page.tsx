import type { Metadata } from "next";
import { RunStatus } from "@/components/RunStatus";
import { TableWrap } from "@/components/TableWrap";
import { AdminGate } from "@/components/Viewer";
import { getAnnotations, getRegistry, getStatus } from "@/lib/data/load";
import { getIssueType, ownerLabels } from "@/lib/data/view";
import { hostOf } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

// Admin (AD-1 to AD-3): the registry, a way to start a data run (Option A:
// open the workflow in GitHub Actions), and each site's last result.
export default function AdminPage() {
  const registry = getRegistry();
  const status = getStatus();
  const notes = getAnnotations().annotations;
  const siteName = (key: string) => registry.sites.find((s) => s.key === key)?.name ?? key;

  return (
    <AdminGate title="Admin">
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
        <li>
          Come back to this page. The “Latest data run” box below follows the run step by step, and the table under
          it updates when the new data is live.
        </li>
      </ol>
      <RunStatus
        initialStatus={status}
        sites={registry.sites.map((s) => ({ key: s.key, name: s.name, live: s.live }))}
      />

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
                <td>{s.ga4PropertyId ?? <span className="italic text-black-80">None (uses Siteimprove Analytics)</span>}</td>
                <td>{ownerLabels(s.key).join(", ")}</td>
                <td>{s.live ? "Live" : "Sample"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      <h2 className="section-heading">Accessibility specialist notes</h2>
      <p className="meta mb-12">
        From <code>data/annotations.json</code>. Notes are attached to an issue type, so they carry over from one check to
        the next. Owners see them on the issue page (TR-4, TR-5).
      </p>
      <TableWrap label="Accessibility specialist notes">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Issue type</th>
              <th scope="col">Applies to</th>
              <th scope="col">Note shown to owners</th>
              <th scope="col">Who fixes</th>
              <th scope="col">Review</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((n) => (
              <tr key={`${n.issueType}-${n.appliesTo}`}>
                <th scope="row" className="!bg-transparent font-normal">
                  {getIssueType(n.issueType).title}
                </th>
                <td>{n.appliesTo === "all" ? "All sites" : siteName(n.appliesTo)}</td>
                <td className="min-w-[256px]">{n.note}</td>
                <td>{n.swsHandling ? "SWS is handling this" : "Owner fixes"}</td>
                <td>{n.reviewedBySws ? "Reviewed" : "Draft, not yet reviewed by SWS"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </AdminGate>
  );
}

