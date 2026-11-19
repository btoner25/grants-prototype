"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money, type Opportunity } from "@/lib/data";
import { toListing } from "@/lib/formTypes";
import { useCustomOpportunities } from "@/lib/localStore";

export default function OpportunityList({ items: builtIn }: { items: Opportunity[] }) {
  const custom = useCustomOpportunities();
  // Staff-published opportunities (from the builder) appear first.
  const items = useMemo(
    () => [...custom.filter((o) => o.published).map(toListing), ...builtIn],
    [custom, builtIn],
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (o) =>
      (status === "All" || o.status === status) &&
      (q === "" ||
        `${o.title} ${o.agency} ${o.summary}`.toLowerCase().includes(q)),
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="search" className="text-sm font-medium text-zinc-900">
            Search by keyword
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72 max-w-full rounded border border-zinc-500 px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium text-zinc-900">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-zinc-500 bg-white px-3 py-2"
          >
            <option>All</option>
            <option>Open</option>
            <option>Forecast</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-700" role="status">
        Showing {shown.length} of {items.length} opportunities
      </p>

      <ul className="mt-3 flex flex-col gap-4">
        {shown.map((o) => (
          <li key={o.id} className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-zinc-900">
                <Link href={o.href ?? `/opportunities/${o.id}`} className="text-blue-800 underline hover:text-blue-950">
                  {o.title}
                </Link>
              </h2>
              <StatusBadge status={o.status} />
            </div>
            <p className="mt-1 text-sm text-zinc-700">{o.agency}</p>
            <p className="mt-3 text-zinc-800">{o.summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-zinc-600">Maximum award</dt>
                <dd className="font-medium text-zinc-900">{money(o.maxAward)}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">Total available</dt>
                <dd className="font-medium text-zinc-900">{money(o.totalFunds)}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">Opens</dt>
                <dd className="font-medium text-zinc-900">{longDate(o.opens)}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">Deadline</dt>
                <dd className="font-medium text-zinc-900">{longDate(o.closes)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
