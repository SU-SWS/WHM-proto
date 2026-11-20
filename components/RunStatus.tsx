"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_PATH, REFRESH_WORKFLOW, REPO } from "@/lib/config";
import type { Status } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";

interface GitHubRun {
  id: number;
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

type RunState =
  | { kind: "loading" }
  | { kind: "none" } // workflow exists, never run
  | { kind: "missing" } // workflow file not in the repo yet
  | { kind: "unavailable" } // GitHub API error or rate limit
  | { kind: "run"; run: GitHubRun };

// GitHub allows 60 unauthenticated API calls an hour per visitor, so check
// GitHub once a minute while a run is active. The status file is ours and
// can be checked more often.
const GITHUB_EVERY_MS = 60_000;
const STATUS_EVERY_MS = 20_000;
const STOP_AFTER_MS = 30 * 60_000;

/**
 * Shows the latest data run (AD-3): what GitHub Actions says about it, and
 * whether the published site has caught up (status.json carries the run ID).
 */
export function RunStatus({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus);
  const [gh, setGh] = useState<RunState>({ kind: "loading" });
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const started = useRef(0);

  const checkGitHub = useCallback(
    () =>
      fetchLatestRun().then((r) => {
        setGh(r);
        setCheckedAt(new Date());
      }),
    [],
  );
  const checkStatus = useCallback(
    () =>
      fetchStatus().then((s) => {
        if (s) setStatus(s);
      }),
    [],
  );

  const run = gh.kind === "run" ? gh.run : null;
  const active = run !== null && run.status !== "completed";
  // A finished run that the published status doesn't know about yet is still deploying.
  const publishing = run !== null && run.status === "completed" && run.conclusion === "success" && String(run.id) !== status.runId;
  const watching = active || publishing;

  useEffect(() => {
    started.current = Date.now();
    let live = true;
    fetchLatestRun().then((r) => {
      if (!live) return;
      setGh(r);
      setCheckedAt(new Date());
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!watching || Date.now() - started.current > STOP_AFTER_MS) return;
    const a = setInterval(checkGitHub, GITHUB_EVERY_MS);
    const b = setInterval(checkStatus, STATUS_EVERY_MS);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [watching, checkGitHub, checkStatus]);

  return (
    <div className="my-16 rounded border border-black-20 px-16 py-14">
      <h3 className="mb-6 mt-0 text-18 font-bold">Latest data run</h3>
      <div aria-live="polite">
        <p className="mb-6">{describe(gh, publishing)}</p>
        {run && (
          <p className="mb-6 text-16 text-black-80">
            Started {formatDateTime(run.created_at)}.{" "}
            <a href={run.html_url}>See this run in GitHub</a>
          </p>
        )}
        <p className="mb-10 text-16 text-black-80">
          Published data: {status.runId ? `from run ${status.runId}, finished ${status.finishedAt ? formatDateTime(status.finishedAt) : "at an unknown time"}.` : "no data run has been published yet. The site shows the committed sample data."}
        </p>
      </div>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          started.current = Date.now();
          void checkGitHub();
          void checkStatus();
        }}
      >
        Check again
      </button>
      {checkedAt && (
        <span className="ml-12 text-15 text-black-80">
          Last checked {checkedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          {watching ? ". Checking every minute while the run is going." : "."}
        </span>
      )}
    </div>
  );
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

function describe(gh: RunState, publishing: boolean): string {
  switch (gh.kind) {
    case "loading":
      return "Checking GitHub for the latest run…";
    case "missing":
      return "The data run workflow isn’t set up in the repo yet.";
    case "none":
      return "No data run has started yet.";
    case "unavailable":
      return "GitHub didn’t answer, so the run status can’t be shown right now. Try “Check again” in a minute.";
    case "run": {
      const { status, conclusion } = gh.run;
      if (status === "queued" || status === "waiting" || status === "pending") return "Queued. GitHub will start the run shortly.";
      if (status !== "completed") return "Running. This usually takes a few minutes.";
      if (conclusion === "success") {
        return publishing
          ? "Finished in GitHub. The updated site is still publishing, and this page will update when it’s live."
          : "Complete. The site shows the data from this run.";
      }
      if (conclusion === "cancelled") return "Cancelled. The site still shows the last good data.";
      return "Failed. The site still shows the last good data. See the run in GitHub for the reason.";
    }
  }
}
