"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/opportunities", label: "Find grants" },
  { href: "/grantee", label: "Grantee portal" },
  { href: "/review", label: "Reviewer" },
  { href: "/staff", label: "Staff dashboard" },
  { href: "/staff/builder", label: "Opportunity builder" },
];

export default function SiteNav() {
  const pathname = usePathname();
  // Highlight only the most specific matching link (e.g. builder, not dashboard).
  const active = links
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav aria-label="Main">
      <ul className="flex flex-wrap gap-1">
        {links.map((l) => {
          const current = l.href === active;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={`block rounded px-3 py-2 text-sm font-medium ${
                  current
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-blue-800"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
