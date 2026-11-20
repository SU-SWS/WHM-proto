"use client";

// Browser-only storage for the prototype's owner state: "Viewing as", per-page
// tracking (TR-1, TR-2) and notes (TR-3). Every read and write is wrapped in
// try/catch, because storage can be unavailable (private windows, blocked
// site data), and the pages must still work without it. Not part of the data
// contract; nothing here leaves the browser.

import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "whm:v1:";
const listeners = new Set<() => void>();
const cache = new Map<string, string | null>();

function read(key: string): string | null {
  if (cache.has(key)) return cache.get(key)!;
  let v: string | null = null;
  try {
    v = window.localStorage.getItem(PREFIX + key);
  } catch {
    v = null;
  }
  cache.set(key, v);
  return v;
}

function write(key: string, value: string | null) {
  cache.set(key, value);
  try {
    if (value === null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Storage unavailable: keep the value for this page view only.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) {
      cache.delete(e.key.slice(PREFIX.length));
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** A JSON value in browser storage. Returns `fallback` on the server and until loaded. */
export function useStored<T>(key: string, fallback: T): [T, (value: T) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  let value = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  const set = useCallback((v: T) => write(key, JSON.stringify(v)), [key]);
  return [value, set];
}
