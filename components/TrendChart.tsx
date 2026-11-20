"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TableWrap } from "./TableWrap";
import { formatNumber, monthName } from "@/lib/format";

export interface TrendMetric {
  key: string;
  label: string; // "Site Target Score"
  values: number[];
  /** Scores are capped at 100 on the axis. */
  maxIs100?: boolean;
  /** Draws a goal line (Site Target Score: 100). */
  goal?: number;
  /** Source and data age, from describeSection(). */
  sourceText: string;
}

const H = 220;
const M = { left: 52, right: 56, top: 18, bottom: 30 };

// "Is it getting better or worse?" (SP-6). One line per chart, a table for
// every chart (Q-1), and a hover/keyboard readout that only repeats what the
// table already shows.
export function TrendChart({ months, metrics }: { months: string[]; metrics: TrendMetric[] }) {
  const [metricKey, setMetricKey] = useState(metrics[0].key);
  const [showTable, setShowTable] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  // Draw at the chart's real width, so axis text stays readable on a phone
  // instead of shrinking with the picture.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0];
  const values = metric.values;
  const last = values.length - 1;

  const { lo, hi, ticks } = scale(values, metric);
  const x = (i: number) => M.left + (i * (W - M.left - M.right)) / last;
  const y = (v: number) => M.top + ((hi - v) * (H - M.top - M.bottom)) / (hi - lo);
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  const first = `${monthName(months[0])}${sameYear(months) ? "" : ` ${months[0].slice(0, 4)}`}`;
  const lastMonth = `${monthName(months[last])}${sameYear(months) ? "" : ` ${months[last].slice(0, 4)}`}`;
  const summary = `${metric.label} went from ${formatNumber(values[0])} in ${first} to ${formatNumber(values[last])} in ${lastMonth}.`;
  const readout = (i: number) => `${monthName(months[i], "short")} ${months[i].slice(0, 4)}: ${formatNumber(values[i])}`;

  function pick(clientX: number, rect: DOMRect) {
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - M.left) / (W - M.left - M.right)) * last);
    setActive(Math.max(0, Math.min(last, i)));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const step = e.key === "ArrowRight" ? 1 : -1;
      setActive((a) => Math.max(0, Math.min(last, (a ?? last) + step)));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : last);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  return (
    <>
      <div className="segmented" role="group" aria-label="Which trend to show">
        {metrics.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={m.key === metric.key}
            onClick={() => {
              setMetricKey(m.key);
              setActive(null);
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        ref={box}
        className="relative max-w-[768px] touch-pan-y"
        tabIndex={0}
        role="group"
        aria-label={`${metric.label} chart. Use the left and right arrow keys to read each month.`}
        aria-describedby={`${id}-summary`}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((a) => a ?? last)}
        onBlur={() => setActive(null)}
        onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerDown={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setActive(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="stroke-black-20" strokeWidth={1} />
              <text x={M.left - 8} y={y(t) + 4} textAnchor="end" className="fill-black-80 text-[13px]">
                {formatNumber(t)}
              </text>
            </g>
          ))}
          {months.map((m, i) => (
            <text key={m} x={x(i)} y={H - 8} textAnchor="middle" className="fill-black-80 text-[13px]">
              {monthName(m, "short")}
            </text>
          ))}
          {metric.goal !== undefined && (
            <g>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y(metric.goal)}
                y2={y(metric.goal)}
                className="stroke-palo-alto"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
              <text x={M.left + 6} y={y(metric.goal) - 6} className="fill-black text-[13px] font-semibold">
                Goal: {metric.goal}
              </text>
            </g>
          )}
          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={M.top} y2={H - M.bottom} className="stroke-black-70" strokeWidth={1} />
          )}
          <polyline
            points={points}
            fill="none"
            className="stroke-cardinal-red"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {[last, ...(active !== null && active !== last ? [active] : [])].map((i) => (
            <circle key={i} cx={x(i)} cy={y(values[i])} r={4} className="fill-cardinal-red stroke-white" strokeWidth={2} />
          ))}
          <text x={x(last) + 8} y={y(values[last]) + 4} className="fill-black text-[13px] font-semibold">
            {formatNumber(values[last])}
          </text>
        </svg>
        {active !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 whitespace-nowrap rounded border border-black-20 bg-white px-8 py-4 text-15 shadow"
            style={{
              left: `${(x(active) / W) * 100}%`,
              transform: `translateX(${active > last / 2 ? "calc(-100% - 8px)" : "8px"})`,
            }}
          >
            <strong>{formatNumber(values[active])}</strong>{" "}
            <span className="text-black-80">
              {monthName(months[active], "short")} {months[active].slice(0, 4)}
            </span>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {active !== null ? readout(active) : ""}
        </p>
      </div>

      <p id={`${id}-summary`} className="meta mb-6 mt-6">
        {summary} {metric.sourceText}{" "}
        <button type="button" className="link-button" aria-expanded={showTable} onClick={() => setShowTable((s) => !s)}>
          {showTable ? "Hide the numbers" : "Show the numbers as a table"}
        </button>
      </p>
      {showTable && (
        <TableWrap label={`${metric.label} by month`} className="max-w-[480px]">
          <table className="data-table">
            <caption className="sr-only">{metric.label} by month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="num">
                  {metric.label}
                </th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => (
                <tr key={months[i]}>
                  <td>
                    {monthName(months[i])} {months[i].slice(0, 4)}
                  </td>
                  <td className="num">{formatNumber(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}

function sameYear(months: string[]): boolean {
  return months[0].slice(0, 4) === months[months.length - 1].slice(0, 4);
}

/** A y-axis with clean tick values that always includes the goal line. */
function scale(values: number[], metric: TrendMetric) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (metric.goal !== undefined) {
    min = Math.min(min, metric.goal);
    max = Math.max(max, metric.goal);
  }
  const span = max - min || Math.max(1, Math.abs(max) * 0.1);
  const step = niceStep(span / 3);
  let lo = Math.floor((min - step * 0.25) / step) * step;
  let hi = Math.ceil((max + step * 0.25) / step) * step;
  if (metric.maxIs100) hi = Math.min(hi, 100);
  lo = Math.max(0, lo);
  if (hi <= lo) hi = lo + step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(Math.round(t * 1000) / 1000);
  return { lo, hi, ticks };
}

function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}
