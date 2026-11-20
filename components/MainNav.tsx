"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Site pages, issue pages and reports all sit under "My sites".
const ITEMS = [
  { href: "/", label: "My sites", match: (p: string) => p === "/" || p.startsWith("/sites/") },
  { href: "/sws/", label: "All client sites", match: (p: string) => p.startsWith("/sws") },
  { href: "/admin/", label: "Admin", match: (p: string) => p.startsWith("/admin") },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
        {ITEMS.map((item) => {
          const current = item.match(pathname);
          return (
            <li key={item.href} className="mb-0">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`block border-b-[3px] px-10 py-6 text-black no-underline hocus:text-black hocus:underline ${
                  current ? "border-cardinal-red font-semibold" : "border-transparent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
