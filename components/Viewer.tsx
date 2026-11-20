"use client";

// "Viewing as" (AC-2): a concept of who sees what, driven by the registry's
// owners. It isn't sign-in and doesn't protect anything: the site is public.

import { createContext, useContext } from "react";
import { useStored } from "@/lib/client/store";

export const ADMIN = "admin";

export interface ViewerOption {
  key: string; // owner key, or "admin"
  label: string; // "Owner A", "SWS administrator"
  sites: string[]; // site keys this viewer owns (all for admin)
}

interface ViewerState {
  viewer: ViewerOption;
  options: ViewerOption[];
  setViewer: (key: string) => void;
  /** Whether the current viewer may see this site's pages. */
  canSee: (siteKey: string) => boolean;
  isAdmin: boolean;
}

const Ctx = createContext<ViewerState | null>(null);

export function ViewerProvider({ options, children }: { options: ViewerOption[]; children: React.ReactNode }) {
  // Starts as the SWS administrator, so nothing looks hidden at first (decisions, Nov 20).
  const [key, setKey] = useStored<string>("viewer", ADMIN);
  const viewer = options.find((o) => o.key === key) ?? options.find((o) => o.key === ADMIN)!;
  const isAdmin = viewer.key === ADMIN;
  return (
    <Ctx.Provider
      value={{ viewer, options, setViewer: setKey, isAdmin, canSee: (site) => isAdmin || viewer.sites.includes(site) }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useViewer(): ViewerState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useViewer outside ViewerProvider");
  return v;
}

export function ViewingAs() {
  const { viewer, options, setViewer } = useViewer();
  return (
    <label className="flex items-center gap-8 text-16">
      Viewing as
      <select
        className="rounded border border-black-80 bg-white py-4 pl-8 pr-32 text-16"
        value={viewer.key}
        aria-describedby="viewas-help"
        onChange={(e) => setViewer(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.key === ADMIN ? o.label : `${o.label} (${o.sites.length} ${o.sites.length === 1 ? "site" : "sites"})`}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Shows children only to viewers who may see this site; others get a short explanation. */
export function SiteGate({ siteKey, siteName, children }: { siteKey: string; siteName: string; children: React.ReactNode }) {
  const { canSee, viewer } = useViewer();
  if (canSee(siteKey)) return <>{children}</>;
  return (
    <div className="my-24 max-w-[62ch]">
      <p className="verdict">{viewer.label} doesn’t own {siteName}.</p>
      <p>
        In the full version, owners see only their own sites. Switch “Viewing as” to an owner of this site, or to the SWS
        administrator.
      </p>
    </div>
  );
}

/** Shows children only to the SWS administrator. */
export function AdminGate({ title, children }: { title: string; children: React.ReactNode }) {
  const { isAdmin } = useViewer();
  if (isAdmin) return <>{children}</>;
  return (
    <>
      <h1 className="eyebrow">{title}</h1>
      <p className="verdict">Only SWS staff can see this page.</p>
      <p>Switch “Viewing as” to the SWS administrator to see it.</p>
    </>
  );
}
