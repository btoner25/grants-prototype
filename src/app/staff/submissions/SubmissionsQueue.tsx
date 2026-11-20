"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { longDate } from "@/lib/data";
import { localDay } from "@/lib/formTypes";
import { useGranteePayments, useGranteeReports, useHydrated } from "@/lib/localStore";
import { buildQueue } from "@/lib/staffQueue";

const filters = ["Needs review", "All submissions"] as const;
type Filter = (typeof filters)[number];

export default function SubmissionsQueue() {
  const hydrated = useHydrated();
  const reports = useGranteeReports();
  const payments = useGranteePayments();
  const [filter, setFilter] = useState<Filter>("Needs review");

  const all = buildQueue(reports, payments);
  const waiting = all.filter((i) => i.needsReview);
  const shown = (filter === "Needs review" ? waiting : all).sort((a, b) =>
    filter === "Needs review"
      ? a.submittedAt.localeCompare(b.submittedAt) // oldest first: work the queue in order
      : b.submittedAt.localeCompare(a.submittedAt),
  );

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/staff" className="text-blue-800 underline">Staff dashboard</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">Grantee submissions</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">Grantee submissions</h1>
      <p className="mt-2 max-w-3xl text-zinc-700">
        Progress reports and payment requests that grantees send through the grantee portal. Accept a
        report or request changes, and approve or return each payment request. Grantees see your
        decision and comments in their portal.
      </p>

      {!hydrated ? (
        <p className="mt-6 text-zinc-700">Loading…</p>
      ) : (
        <>
          <div role="group" aria-label="Show" className="mt-6 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  filter === f ? "border-blue-800 bg-blue-800 text-white" : "border-zinc-400 bg-white text-zinc-900 hover:bg-zinc-100"
                }`}>
                {f} ({f === "Needs review" ? waiting.length : all.length})
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-zinc-400 bg-white p-6 text-zinc-700">
              {all.length === 0
                ? "Nothing has been submitted yet. When a grantee submits a progress report or payment request in the grantee portal, it appears here."
                : "You're all caught up. Nothing is waiting for review."}
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  {filter === "Needs review" ? "Submissions waiting for review, oldest first" : "All grantee submissions, newest first"}
                </caption>
                <thead className="bg-zinc-100 text-zinc-900">
                  <tr>
                    <th scope="col" className="px-4 py-3">Submission</th>
                    <th scope="col" className="px-4 py-3">Grantee</th>
                    <th scope="col" className="px-4 py-3">Grant</th>
                    <th scope="col" className="px-4 py-3">Received</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {shown.map((i) => (
                    <tr key={i.id}>
                      <th scope="row" className="px-4 py-3 font-medium text-zinc-900">
                        {i.title}
                        <span className="block text-xs font-normal text-zinc-600">{i.id}</span>
                      </th>
                      <td className="px-4 py-3 text-zinc-800">{i.organization}</td>
                      <td className="px-4 py-3 text-zinc-800">
                        {i.grant.id}
                        <span className="block text-xs text-zinc-600">{i.grant.program}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-800">{longDate(localDay(i.submittedAt))}</td>
                      <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                      <td className="px-4 py-3">
                        <Link href={i.href} className="text-blue-800 underline">
                          {i.needsReview ? "Review" : "View"}
                          <span className="sr-only">: {i.title} from {i.organization}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
