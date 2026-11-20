"use client";

import { useSyncExternalStore } from "react";
import { formatAge } from "@/lib/data/provenance";
import type { IsoDate } from "@/lib/data/types";

const noop = () => () => {};

/**
 * "Checked 9 days ago", worked out in the viewer's browser so it's right on the
 * day the page is opened, not the day it was built. Renders nothing until then.
 */
export function DataAge({ date }: { date: IsoDate }) {
  const age = useSyncExternalStore(
    noop,
    () => formatAge(date),
    () => null,
  );
  return age ? <> ({age.charAt(0).toLowerCase() + age.slice(1)})</> : null;
}
