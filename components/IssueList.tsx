"use client";

import Link from "next/link";
import { useState } from "react";

export interface IssueRow {
  type: string;
  title: string;
  category: string;
  fixer: "owner" | "sws";
  summary: string; // scope and reason
  busiest?: boolean; // the summary mentions the busiest pages: gets an asterisk, explained below the list
  sample: boolean; // show a "Sample data" tag (only when the rest of the site is live)
}

interface Props {
  siteKey: string;
  owner: IssueRow[]; // ranked
  sws: IssueRow[];
  groups: { category: string; items: IssueRow[] }[];
}

/** How many ranked items "Prioritized for me" shows before "Show more". */
const TOP = 5;

// The issue feed: "Prioritized for me" by default, "Show everything plainly"
// as the same issues, unranked and grouped by category (SP-3, SP-4).
export function IssueList({ siteKey, owner, sws, groups }: Props) {
  const [mode, setMode] = useState<"prioritized" | "plain">("prioritized");
  // WHM summarizes: lead with the top few and let owners expand (Siteimprove holds the full detail).
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? owner : owner.slice(0, TOP);
  const hidden = owner.length - shown.length;

  return (
    <>
      <div className="segmented" role="group" aria-label="How to show the list">
        <button type="button" aria-pressed={mode === "prioritized"} onClick={() => setMode("prioritized")}>
          Prioritized for me
        </button>
        <button type="button" aria-pressed={mode === "plain"} onClick={() => setMode("plain")}>
          Show everything plainly
        </button>
      </div>

      {mode === "prioritized" ? (
        <>
          <p className="meta">Ordered by how many visitors each issue affects and whether you can fix it yourself.</p>
          <ol className="m-0 list-none p-0">
            {shown.map((row, i) => (
              <Row key={row.type} siteKey={siteKey} row={row} rank={i + 1} />
            ))}
          </ol>
          {owner.length > TOP && (
            <p className="mb-0 mt-12">
              <button type="button" className="btn-secondary" aria-expanded={showAll} onClick={() => setShowAll((s) => !s)}>
                {showAll ? `Show the top ${TOP} only` : `Show ${hidden} more ${hidden === 1 ? "item" : "items"}`}
              </button>
            </p>
          )}
          {sws.length > 0 && (
            <>
              <h3 className="subheading">Being handled by SWS</h3>
              <ul className="m-0 list-none p-0">
                {sws.map((row) => (
                  <Row key={row.type} siteKey={siteKey} row={row} />
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <p className="meta">All findings, grouped by category, with no ranking.</p>
          {groups.map((g) => (
            <div key={g.category}>
              <h3 className="mb-6 mt-20 text-17 font-bold text-black-80">{g.category}</h3>
              <ul className="m-0 list-none p-0">
                {g.items.map((row) => (
                  <Row key={row.type} siteKey={siteKey} row={row} />
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function Row({ siteKey, row, rank }: { siteKey: string; row: IssueRow; rank?: number }) {
  return (
    <li className="mb-0 border-t border-black-20 last:border-b">
      <Link
        href={`/sites/${siteKey}/issues/${row.type}/`}
        className={`grid gap-x-14 gap-y-4 px-4 py-14 text-black no-underline hocus:bg-fog-light hocus:text-black focus-visible:-outline-offset-[3px] ${
          rank ? "grid-cols-[36px_1fr] md:grid-cols-[36px_1fr_auto]" : "md:grid-cols-[1fr_auto]"
        }`}
      >
        {rank && (
          <span aria-hidden="true" className="font-serif text-22 font-semibold text-cardinal-red">
            {rank}
          </span>
        )}
        <span>
          <span className="block font-semibold underline decoration-black-20 underline-offset-2">
            {rank && <span className="sr-only">Priority {rank}: </span>}
            {row.title}
          </span>
          <span className="block text-16 text-black-80">
            {row.summary}
            {row.busiest && <span aria-hidden="true">*</span>}
          </span>
        </span>
        <span className={`flex flex-wrap items-start gap-6 md:justify-end ${rank ? "col-start-2 md:col-start-auto" : ""}`}>
          <span className="tag tag-cat">{row.category}</span>
          {row.fixer === "sws" ? (
            <span className="tag tag-sws">SWS is handling this</span>
          ) : (
            <span className="tag tag-you">You can fix this</span>
          )}
          {row.sample && <span className="tag tag-sample">Sample data</span>}
        </span>
      </Link>
    </li>
  );
}
