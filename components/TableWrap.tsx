// Lets a wide table scroll sideways on a phone. It's focusable and labeled so
// keyboard users can scroll it too (WCAG 2.1.1).
export function TableWrap({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`table-wrap ${className}`} tabIndex={0} role="region" aria-label={label}>
      {children}
    </div>
  );
}
