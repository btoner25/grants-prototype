import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { ActiveGrantsTable, GrantTiles } from "./ActiveGrants";
import {
  applications,
  getOpportunity,
  money,
  opportunities,
  type ApplicationStatus,
} from "@/lib/data";

export const metadata: Metadata = { title: "Staff dashboard" };

const pipeline: ApplicationStatus[] = ["Draft", "Submitted", "In review", "Awarded", "Declined"];

export default function StaffDashboard() {
  const openCount = opportunities.filter((o) => o.status === "Open").length;
  const inPipeline = applications.filter((a) => a.status === "Submitted" || a.status === "In review").length;

  const tiles = [
    { label: "Open opportunities", value: String(openCount) },
    { label: "Applications awaiting decision", value: String(inPipeline) },
  ];

  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Staff dashboard</h1>
      <p className="mt-2 text-zinc-700">
        Signed in as <strong>Jordan Program Manager</strong> (fictional).
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/staff/builder"
          className="inline-block rounded bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900">
          Create a funding opportunity
        </Link>
        <Link href="/staff/submissions"
          className="inline-block rounded border border-blue-800 bg-white px-4 py-2 font-medium text-blue-800 hover:bg-blue-50">
          Review grantee submissions
        </Link>
      </div>

      <h2 className="sr-only">Summary</h2>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <li key={t.label} className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-700">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{t.value}</p>
          </li>
        ))}
        <GrantTiles />
      </ul>

      <section aria-labelledby="pipeline-title" className="mt-10">
        <h2 id="pipeline-title" className="text-xl font-semibold text-zinc-900">Applications by status</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-900">
              <tr>
                <th scope="col" className="px-4 py-3">Application</th>
                <th scope="col" className="px-4 py-3">Organization</th>
                <th scope="col" className="px-4 py-3">Opportunity</th>
                <th scope="col" className="px-4 py-3 text-right">Requested</th>
                <th scope="col" className="px-4 py-3 text-right">Avg. score</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {[...applications]
                .sort((a, b) => pipeline.indexOf(a.status) - pipeline.indexOf(b.status))
                .map((a) => (
                  <tr key={a.id}>
                    <th scope="row" className="px-4 py-3 font-medium text-zinc-900">{a.id}</th>
                    <td className="px-4 py-3 text-zinc-800">{a.organization}</td>
                    <td className="px-4 py-3 text-zinc-800">{getOpportunity(a.opportunityId)?.title}</td>
                    <td className="px-4 py-3 text-right text-zinc-800">{money(a.requested)}</td>
                    <td className="px-4 py-3 text-right text-zinc-800">{a.averageScore ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="grants-title" className="mt-10">
        <h2 id="grants-title" className="text-xl font-semibold text-zinc-900">Active grants</h2>
        <p className="mt-1 text-sm text-zinc-700">
          Payments are held automatically while a progress report is past due and not received.
          Status updates as grantees submit reports and you review them.
        </p>
        <ActiveGrantsTable />
      </section>
    </main>
  );
}
