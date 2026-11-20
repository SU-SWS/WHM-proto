import { describeSection, type Provenance } from "@/lib/data/provenance";
import { DataAge } from "./DataAge";

/**
 * Where a section's data came from and how old it is (AD-4), plus a warning if
 * the latest run failed and this is the last good data (Q-7).
 */
export function SourceNote({
  className = "meta",
  showAge = false,
  children,
  ...provenance
}: Provenance & { className?: string; showAge?: boolean; children?: React.ReactNode }) {
  const { origin, sourceLabel, warning } = describeSection(provenance);
  return (
    <>
      {warning && (
        <p role="status" className="my-12 border-l-4 border-digital-red bg-warn-tint px-16 py-10">
          {warning}
        </p>
      )}
      <p className={className}>
        {children}
        {children ? " " : null}
        {showAge ? (
          <>
            {origin.replace(/\.$/, "")}
            <DataAge date={provenance.date} />.
          </>
        ) : (
          origin
        )}{" "}
        {sourceLabel}.
      </p>
    </>
  );
}

