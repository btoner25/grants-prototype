"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money } from "@/lib/data";
import { todayIso } from "@/lib/formTypes";
import { accountFor, balances, granteeGrants, holdFor, isReceived, reportRows } from "@/lib/granteeData";
import { useGranteePayments, useGranteeReports, useHydrated } from "@/lib/localStore";
import { buildQueue } from "@/lib/staffQueue";

/** Live grant status: combines the sample grants with what grantees submitted
 * in the portal and what staff decided. */
function useActiveGrants() {
  const hydrated = useHydrated();
  const reports = useGranteeReports();
  const payments = useGranteePayments();
  // Today's date and browser data are only read after the page loads in the
  // browser (Next.js pre-builds this page on the server, where neither exists).
  if (!hydrated) return { hydrated, grants: [], toReview: 0 };
  const today = todayIso();
  const grants = granteeGrants.map((g) => {
    const rows = reportRows(g, reports, today);
    const hold = holdFor(rows, today);
    const next = rows.find((r) => !isReceived(r));
    const b = balances(g, payments);
    const reportStatus = hold
      ? hold.status
      : !next
        ? "All received"
        : next.status === "Upcoming"
          ? "On time"
          : next.status;
    return { g, org: accountFor(g)?.organization ?? "", next, hold, b, reportStatus };
  });
  const toReview = buildQueue(reports, payments).filter((i) => i.needsReview).length;
  return { hydrated, grants, toReview };
}

export function GrantTiles() {
  const { hydrated, grants, toReview } = useActiveGrants();
  const tiles = [
    { label: "Active grant dollars", value: money(granteeGrants.reduce((s, g) => s + g.amount, 0)) },
    { label: "Grants with payments on hold", value: hydrated ? String(grants.filter((x) => x.hold).length) : "…", alert: grants.some((x) => x.hold) },
    { label: "Grantee submissions to review", value: hydrated ? String(toReview) : "…", href: "/staff/submissions" },
  ];
  return (
    <>
      {tiles.map((t) => (
        <li key={t.label}
          className={`rounded-lg border bg-white p-4 ${t.alert ? "border-red-300 border-l-4 border-l-red-700" : "border-zinc-200"}`}>
          <p className="text-sm text-zinc-700">{t.label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{t.value}</p>
          {t.href && (
            <Link href={t.href} className="mt-1 inline-block text-sm text-blue-800 underline">
              Review submissions
            </Link>
          )}
        </li>
      ))}
    </>
  );
}

export function ActiveGrantsTable() {
  const { hydrated, grants } = useActiveGrants();
  if (!hydrated) return <p className="mt-3 text-zinc-700">Loading…</p>;
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-900">
          <tr>
            <th scope="col" className="px-4 py-3">Grant</th>
            <th scope="col" className="px-4 py-3">Grantee</th>
            <th scope="col" className="px-4 py-3 text-right">Award</th>
            <th scope="col" className="px-4 py-3 text-right">Paid</th>
            <th scope="col" className="px-4 py-3">Next report due</th>
            <th scope="col" className="px-4 py-3">Report status</th>
            <th scope="col" className="px-4 py-3">Payments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {grants.map(({ g, org, next, hold, b, reportStatus }) => (
            <tr key={g.id}>
              <th scope="row" className="px-4 py-3 font-medium text-zinc-900">{g.id}</th>
              <td className="px-4 py-3 text-zinc-800">
                {org}
                <span className="block text-xs text-zinc-600">{g.program}</span>
              </td>
              <td className="px-4 py-3 text-right text-zinc-800">{money(g.amount)}</td>
              <td className="px-4 py-3 text-right text-zinc-800">
                {money(b.paid)}
                <span className="block text-xs text-zinc-600">{Math.round((b.paid / g.amount) * 100)}%</span>
              </td>
              <td className="px-4 py-3 text-zinc-800">
                {(hold ?? next) ? (
                  <>
                    {longDate((hold ?? next)!.due)}
                    <span className="block text-xs text-zinc-600">{(hold ?? next)!.label}</span>
                  </>
                ) : "—"}
              </td>
              <td className="px-4 py-3"><StatusBadge status={reportStatus} /></td>
              <td className="px-4 py-3 font-medium text-zinc-900">{hold ? "On hold" : "Allowed"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
