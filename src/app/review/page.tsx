import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { applications, getOpportunity, longDate, money } from "@/lib/data";

export const metadata: Metadata = { title: "Review queue" };

export default function ReviewQueue() {
  const assigned = applications.filter(
    (a) => a.status === "Submitted" || a.status === "In review",
  );

  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Your review queue</h1>
      <p className="mt-2 max-w-2xl text-zinc-700">
        Signed in as <strong>Pat Reviewer</strong> (fictional), Youth Mentoring and Rural
        Broadband panels. You must declare any conflict of interest before an application opens.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Applications assigned to you for review</caption>
          <thead className="bg-zinc-100 text-zinc-900">
            <tr>
              <th scope="col" className="px-4 py-3">Application</th>
              <th scope="col" className="px-4 py-3">Organization</th>
              <th scope="col" className="px-4 py-3">Opportunity</th>
              <th scope="col" className="px-4 py-3 text-right">Requested</th>
              <th scope="col" className="px-4 py-3">Submitted</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {assigned.map((a) => (
              <tr key={a.id}>
                <th scope="row" className="px-4 py-3 font-medium">
                  <Link href={`/review/${a.id}`} className="text-blue-800 underline">
                    {a.id}<span className="sr-only">, review {a.projectTitle}</span>
                  </Link>
                </th>
                <td className="px-4 py-3 text-zinc-800">{a.organization}</td>
                <td className="px-4 py-3 text-zinc-800">{getOpportunity(a.opportunityId)?.title}</td>
                <td className="px-4 py-3 text-right text-zinc-800">{money(a.requested)}</td>
                <td className="px-4 py-3 text-zinc-800">{a.submitted ? longDate(a.submitted) : "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
