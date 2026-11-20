"use client";

import { useCallback, useEffect, useState } from "react";
import { TableWrap } from "./TableWrap";
import { BASE_PATH, REFRESH_WORKFLOW, REFRESH_WORKFLOW_URL, REPO } from "@/lib/config";
import type { SiteRunStatus, Status } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";

interface GitHubRun {
  id: number;
  status: string; // queued, waiting, pending, in_progress, completed
  conclusion: string | null; // success, failure, cancelled, …
  html_url: string;
  created_at: string;
}

type RunState =
  | { kind: "loading" }
  | { kind: "none" } // workflow exists, never run
  | { kind: "missing" } // workflow file not in the repo yet
  | { kind: "unavailable" } // GitHub API error or rate limit
  | { kind: "run"; run: GitHubRun };

export interface RunSite {
  key: string;
  name: string;
  live: boolean;
}

// GitHub allows 60 unauthenticated API calls an hour per visitor. Checking
// every 15 seconds while a run is expected uses about 40 calls for a typical
// 10-minute run; the watch stops on its own after 20 minutes.
const EVERY_MS = 15_000;
const WATCH_FOR_MS = 20 * 60_000;

/**
 * The data run panel (AD-2, AD-3): the "Start data run" link (Option A), the
 * latest run's progress from GitHub, and each site's last result from the
 * published status.json, all kept current while a run is going.
 */
export function RunStatus({ initialStatus, sites }: { initialStatus: Status; sites: RunSite[] }) {
  const [status, setStatus] = useState(initialStatus);
  const [gh, setGh] = useState<RunState>({ kind: "loading" });
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  // Set when the admin selects "Start data run": keep checking until a newer run shows up and goes live.
  const [expecting, setExpecting] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [runIdAtStart, setRunIdAtStart] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const [r, s] = await Promise.all([fetchLatestRun(), fetchStatus()]);
    setGh(r);
    if (s) setStatus(s);
    setCheckedAt(new Date());
  }, []);

  const run = gh.kind === "run" ? gh.run : null;
  const awaitingNewRun = expecting && (run?.id ?? null) === runIdAtStart;
  const stage = stageOf(run, status, awaitingNewRun);
  // Also covers a run that was already going when the page opened.
  const watching = !gaveUp && ["waiting", "queued", "running", "publishing"].includes(stage);

  // Check once on load, and again whenever the admin comes back to this tab.
  useEffect(() => {
    let live = true;
    Promise.all([fetchLatestRun(), fetchStatus()]).then(([r, s]) => {
      if (!live) return;
      setGh(r);
      if (s) setStatus(s);
      setCheckedAt(new Date());
    });
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // While a run is expected or going, check every 15 seconds, for up to 20 minutes.
  useEffect(() => {
    if (!watching) return;
    const stopAt = Date.now() + WATCH_FOR_MS;
    const t = setInterval(() => {
      if (Date.now() < stopAt) return void refresh();
      clearInterval(t);
      setGaveUp(true);
    }, EVERY_MS);
    return () => clearInterval(t);
  }, [watching, refresh]);

  return (
    <>
      <p>
        <a
          className="btn"
          href={REFRESH_WORKFLOW_URL}
          target="_blank"
          rel="noopener"
          onClick={() => {
            setRunIdAtStart(run?.id ?? null);
            setExpecting(true);
            setGaveUp(false);
          }}
        >
          Start data run<span className="sr-only"> (opens GitHub in a new tab)</span>
        </a>
      </p>

      <section aria-labelledby="run-heading" className="my-16 rounded border border-black-20 px-16 py-14">
        <h3 id="run-heading" className="mb-8 mt-0 text-18 font-bold">
          Latest data run
        </h3>
        <div aria-live="polite">
          <p className="mb-8 font-semibold">{headline(gh, stage)}</p>
          {stage !== "idle" && (gh.kind === "run" || gh.kind === "none") && <Steps stage={stage} />}
          {run && !awaitingNewRun && (
            <p className="mb-8 text-16 text-black-80">
              Started {formatDateTime(run.created_at)}. <a href={run.html_url}>See this run in GitHub</a>
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setGaveUp(false);
            void refresh();
          }}
        >
          Check again
        </button>
        {checkedAt && (
          <span className="ml-12 text-15 text-black-80">
            Last checked {checkedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
            {watching ? ". Checking every 15 seconds." : "."}
          </span>
        )}
      </section>

      <h3 className="subheading">Last result for each site</h3>
      <p className="meta mb-12">
        {status.finishedAt
          ? `From the data run that finished ${formatDateTime(status.finishedAt)}.`
          : "No data run has been published yet. The site shows the committed sample data."}
      </p>
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
            {sites.map((s) => {
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
    </>
  );
}

type Stage = "waiting" | "queued" | "running" | "publishing" | "live" | "failed" | "idle";

function stageOf(run: GitHubRun | null, status: Status, awaitingNewRun: boolean): Stage {
  if (awaitingNewRun) return "waiting";
  if (!run) return "idle";
  if (run.status !== "completed") return run.status === "in_progress" ? "running" : "queued";
  if (run.conclusion !== "success") return "failed";
  // The workflow finishes after it deploys, so by now the new status.json is usually live.
  return String(run.id) === status.runId ? "live" : "publishing";
}

const STEPS: { label: string; doneFrom: Stage[]; nowAt: Stage[] }[] = [
  { label: "Run started in GitHub", doneFrom: ["running", "publishing", "live"], nowAt: ["waiting", "queued"] },
  { label: "Fetching data and building the site", doneFrom: ["publishing", "live"], nowAt: ["running"] },
  { label: "Publishing the updated site", doneFrom: ["live"], nowAt: ["publishing"] },
  { label: "Live on this site", doneFrom: ["live"], nowAt: [] },
];

function Steps({ stage }: { stage: Stage }) {
  return (
    <ol className="mb-10 list-none p-0">
      {STEPS.map((s) => {
        const state = s.doneFrom.includes(stage) ? "Done" : s.nowAt.includes(stage) ? "In progress" : "Not yet";
        return (
          <li key={s.label} className="mb-4 flex items-center gap-10">
            <span
              aria-hidden="true"
              className={`inline-block size-12 shrink-0 rounded-full border-2 ${
                state === "Done" ? "border-palo-alto bg-palo-alto" : state === "In progress" ? "border-poppy bg-sample-tint" : "border-black-20"
              }`}
            />
            <span>
              {s.label}: <span className={state === "Not yet" ? "text-black-80" : "font-semibold"}>{state.toLowerCase()}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function headline(gh: RunState, stage: Stage): string {
  if (gh.kind === "loading") return "Checking GitHub for the latest run…";
  if (gh.kind === "missing") return "The data run workflow isn’t set up in the repo yet.";
  if (gh.kind === "unavailable") return "GitHub didn’t answer, so the run status can’t be shown right now. Try “Check again” in a minute.";
  if (gh.kind === "none" && stage !== "waiting") return "No data run has started yet.";
  switch (stage) {
    case "waiting":
      return "Waiting for the run to start. In GitHub, select “Run workflow.”";
    case "queued":
      return "Queued. GitHub will start the run shortly.";
    case "running":
      return "Running. This usually takes a few minutes.";
    case "publishing":
      return "Finished in GitHub. The updated site is still publishing.";
    case "live":
      return "Complete. The site shows the data from this run.";
    case "failed":
      return "The run didn’t finish. The site still shows the last good data. See the run in GitHub for the reason.";
    default:
      return "No data run has started yet.";
  }
}

function resultText(r: SiteRunStatus | undefined, live: boolean): string {
  if (!r) return "Not in the last run";
  if (r.result === "complete") return "Complete";
  if (r.result === "failed") return `Failed${r.reason ? `: ${r.reason}` : ""}. The site shows the last good data.`;
  return live
    ? "Not fetched live yet. The site shows sample data until the first live run."
    : "Sample data. This site isn’t fetched live.";
}

async function fetchLatestRun(): Promise<RunState> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${REFRESH_WORKFLOW}/runs?per_page=1`,
      { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" },
    );
    if (res.status === 404) return { kind: "missing" };
    if (!res.ok) return { kind: "unavailable" };
    const body = (await res.json()) as { workflow_runs: GitHubRun[] };
    return body.workflow_runs[0] ? { kind: "run", run: body.workflow_runs[0] } : { kind: "none" };
  } catch {
    return { kind: "unavailable" };
  }
}

/** The published status file. Null keeps what the page already shows. */
async function fetchStatus(): Promise<Status | null> {
  try {
    const res = await fetch(`${BASE_PATH}/status.json`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Status) : null;
  } catch {
    return null;
  }
}
