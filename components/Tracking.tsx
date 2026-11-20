"use client";

// Per-page review of editorial issues (TR-2, revised Nov 20) and owner notes
// (TR-3). Only editorial issues, which Siteimprove doesn't manage, are tracked
// here: issues Siteimprove detects are fixed and rechecked in Siteimprove, the
// single system of record. Saved in this browser only for the prototype
// (lib/client/store.ts), keyed by site, issue type and normalized page path.

import { useId, useState } from "react";
import { useStored } from "@/lib/client/store";
import { formatDate } from "@/lib/data/provenance";
import type { IsoDate } from "@/lib/data/types";
import { useViewer } from "./Viewer";

type Mark = { state: "addressed" | "keep" | "later"; date: IsoDate; until?: IsoDate };
type Marks = Record<string, Mark>;
type Status = "todo" | "addressed" | "keep" | "later";

export interface TrackedPage {
  path: string;
  label: string; // "/ (home)"
  href: string | null; // the page on the site (live data only)
  views: number;
  third: string; // "3" or "14 months ago"
  siteimproveUrl: string | null;
}

interface Props {
  siteKey: string;
  issueType: string;
  checkedAt: IsoDate; // the Siteimprove check this page shows
  pages: TrackedPage[];
  thirdHeader: string;
  viewsHeader: string;
}

const today = (): IsoDate => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * A page's status. A page marked updated that a later check still lists keeps
 * its status but says so; it isn't silently reopened.
 */
function statusOf(mark: Mark | undefined, checkedAt: IsoDate): { status: Status; stillFound: boolean } {
  if (!mark) return { status: "todo", stillFound: false };
  return { status: mark.state, stillFound: mark.state === "addressed" && mark.date < checkedAt };
}

export function useTracking(siteKey: string, issueType: string) {
  return useStored<Marks>(`track:${siteKey}:${issueType}`, {});
}

const LABEL: Record<Status, string> = {
  todo: "To do",
  addressed: "Updated",
  keep: "Still correct",
  later: "Set aside",
};

export function TrackedTable({ siteKey, issueType, checkedAt, pages, thirdHeader, viewsHeader }: Props) {
  const [marks, setMarks] = useTracking(siteKey, issueType);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Status | "all">("all");
  const [until, setUntil] = useState("");
  const [message, setMessage] = useState("");
  const id = useId();

  const rows = pages.map((p) => ({ ...p, ...statusOf(marks[p.path], checkedAt) }));
  const shown = rows.filter((r) => filter === "all" || r.status === filter);
  const count = (s: Status) => rows.filter((r) => r.status === s).length;
  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.path));

  function apply(action: Status) {
    const paths = [...selected].filter((p) => shown.some((r) => r.path === p));
    if (!paths.length) return setMessage("Select one or more pages in the table first.");
    if (action === "later" && !/^\d{4}-\d{2}-\d{2}$/.test(until)) return setMessage("Choose a revisit date first.");
    if (action === "later" && until < today()) return setMessage("Choose a revisit date that hasn’t passed.");
    const next = { ...marks };
    for (const p of paths) {
      if (action === "todo") delete next[p];
      else next[p] = { state: action, date: today(), ...(action === "later" ? { until } : {}) };
    }
    setMarks(next);
    setSelected(new Set());
    setMessage(
      `${paths.length} ${paths.length === 1 ? "page" : "pages"} moved to ${
        action === "later" ? `Set aside until ${formatDate(until)}` : LABEL[action]
      }.`,
    );
  }

  const options: [Status | "all", string][] = [
    ["all", `All pages (${rows.length})`],
    ["todo", `To do (${count("todo")})`],
    ["addressed", `Updated (${count("addressed")})`],
    ["keep", `Still correct (${count("keep")})`],
    ["later", `Set aside (${count("later")})`],
  ];

  return (
    <>
      <p className="meta mb-8">Select pages in the table, then choose what you did.</p>
      <p className="mb-8">
        <label>
          Show{" "}
          <select
            className="rounded border border-black-80 bg-white py-4 pl-8 pr-32 text-16"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as Status | "all");
              setSelected(new Set());
            }}
          >
            {options.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </p>
      <div role="group" aria-label="Mark the selected pages" className="mb-6 flex flex-wrap items-center gap-8">
        <button type="button" className="btn" onClick={() => apply("addressed")}>
          I updated these pages
        </button>
        <button type="button" className="btn-secondary" onClick={() => apply("keep")}>
          They’re still correct
        </button>
        <span className="flex flex-wrap items-center gap-6">
          <label htmlFor={`${id}-until`} className="text-16">
            Revisit by
          </label>
          <input
            id={`${id}-until`}
            type="date"
            min={today()}
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="rounded border border-black-80 px-8 py-4 text-16"
          />
          <button type="button" className="btn-secondary" onClick={() => apply("later")}>
            Set aside
          </button>
        </span>
        <button type="button" className="btn-secondary" onClick={() => apply("todo")}>
          Move back to To do
        </button>
      </div>
      <p className="meta mb-8 min-h-[1.5em]" role="status">
        {message}
      </p>

      <div className="table-wrap" tabIndex={0} role="region" aria-label="Pages with this issue">
        <table className="data-table">
          <caption className="sr-only">Pages with this issue, and your progress on each</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[40px]">
                <input
                  type="checkbox"
                  className="size-18"
                  aria-label="Select all pages shown"
                  checked={allShownSelected}
                  onChange={(e) => setSelected(e.target.checked ? new Set(shown.map((r) => r.path)) : new Set())}
                />
              </th>
              <th scope="col">Page</th>
              <th scope="col" className="num">
                {viewsHeader}
              </th>
              <th scope="col" className="num">
                {thirdHeader}
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={5}>No pages with this status.</td>
              </tr>
            )}
            {shown.map((r) => {
              const mark = marks[r.path];
              return (
                <tr key={r.path}>
                  <td>
                    <input
                      type="checkbox"
                      className="size-18"
                      aria-label={`Select ${r.label}`}
                      checked={selected.has(r.path)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(r.path);
                        else next.delete(r.path);
                        setSelected(next);
                      }}
                    />
                  </td>
                  <td>
                    {r.href ? <a href={r.href}>{r.label}</a> : r.label}
                    {r.siteimproveUrl && (
                      <a href={r.siteimproveUrl} className="mt-4 block text-16">
                        Open in Siteimprove<span className="sr-only">: report for {r.label}</span>
                      </a>
                    )}
                  </td>
                  <td className="num">{r.views.toLocaleString("en-US")}</td>
                  <td className="num">{r.third}</td>
                  <td>
                    {r.status === "later" && mark?.until ? `Set aside until ${formatDate(mark.until)}` : LABEL[r.status]}
                    {r.stillFound && <span className="block text-15 text-black-80">The latest check still lists this page</span>}
                    {mark && !r.stillFound && <span className="block text-15 text-black-80">Marked {formatDate(mark.date)}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** "Your progress" for an editorial issue: counts and what each status means. */
export function ProgressPanel({ siteKey, issueType, checkedAt, pages }: Omit<Props, "thirdHeader" | "viewsHeader">) {
  const [marks] = useTracking(siteKey, issueType);
  const rows = pages.map((p) => statusOf(marks[p.path], checkedAt).status);
  const n = (s: Status) => rows.filter((r) => r === s).length;
  const reviewed = rows.length - n("todo");
  return (
    <>
      <h2 className="mb-6 mt-0 text-18 font-bold">Your progress</h2>
      <p className="mb-6">
        <strong>
          {reviewed} of {rows.length} {rows.length === 1 ? "page" : "pages"} reviewed.
        </strong>
      </p>
      <ul className="mb-10 pl-20">
        <li className="mb-2">To do: {n("todo")}</li>
        <li className="mb-2">Updated: {n("addressed")}</li>
        <li className="mb-2">Still correct: {n("keep")}</li>
        <li className="mb-2">Set aside: {n("later")}</li>
      </ul>
      <details className="mt-12">
        <summary className="cursor-pointer text-17 font-bold">What each status means</summary>
        <dl className="m-0 mt-6 text-16">
          <dt className="font-semibold">To do</dt>
          <dd className="mb-6 ml-0">You haven’t reviewed this page yet.</dd>
          <dt className="font-semibold">Updated</dt>
          <dd className="mb-6 ml-0">You updated the page. The next check should show its new date.</dd>
          <dt className="font-semibold">Still correct</dt>
          <dd className="mb-6 ml-0">You reviewed the page, and it doesn’t need an update right now.</dd>
          <dt className="font-semibold">Set aside</dt>
          <dd className="mb-6 ml-0">You’ll decide later. The revisit date reminds you when to come back to it.</dd>
        </dl>
      </details>
    </>
  );
}

type Note = { by: string; at: IsoDate; text: string };

/** Notes for a site's owners about one issue (TR-3). */
export function Notes({ siteKey, issueType }: { siteKey: string; issueType: string }) {
  const [notes, setNotes] = useStored<Note[]>(`notes:${siteKey}:${issueType}`, []);
  const [draft, setDraft] = useState("");
  const { viewer } = useViewer();
  const id = useId();
  return (
    <>
      <h2 className="mb-4 mt-20 text-18 font-bold">Notes</h2>
      <p className="mb-8 text-15 text-black-80">
        Notes are visible to every owner of this site. They aren’t sent to SWS. In this prototype, notes are saved in this
        browser only.
      </p>
      {notes.map((n, i) => (
        <div key={i} className="mb-8 border-l-4 border-black-20 bg-white px-12 py-8">
          <div className="text-15 text-black-80">
            {n.by}, {formatDate(n.at)}
          </div>
          <div className="whitespace-pre-wrap">{n.text}</div>
        </div>
      ))}
      <label htmlFor={`${id}-note`} className="sr-only">
        Add a note
      </label>
      <textarea
        id={`${id}-note`}
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a note for this site’s owners"
        className="block w-full rounded border border-black-80 px-8 py-6 text-16"
      />
      <button
        type="button"
        className="btn-secondary mt-8"
        onClick={() => {
          const text = draft.trim();
          if (!text) return;
          setNotes([...notes, { by: viewer.label, at: today(), text }]);
          setDraft("");
        }}
      >
        Save note
      </button>
    </>
  );
}
