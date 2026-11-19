"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/opportunities", label: "Find grants" },
  { href: "/review", label: "Reviewer" },
  { href: "/staff", label: "Staff dashboard" },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex flex-wrap gap-1">
        {links.map((l) => {
          const current = pathname === l.href || pathname.startsWith(`${l.href}/`);
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
