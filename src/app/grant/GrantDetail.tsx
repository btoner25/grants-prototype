"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money } from "@/lib/data";
import { statusOf } from "@/lib/formTypes";
import { useGrant } from "./useGrant";

export default function GrantDetail() {
  const { opp: o, loading } = useGrant();

  if (loading) return <p className="text-zinc-700">Loading…</p>;
  if (!o) return <NotFound />;

  const status = statusOf(o);
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/opportunities" className="text-blue-800 underline">Funding opportunities</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">{o.title}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{o.title}</h1>
        <StatusBadge status={status} />
      </div>
      <p className="mt-1 text-zinc-700">{o.agency}</p>
      {o.description.trim() && <p className="mt-6 text-lg leading-8 text-zinc-800">{o.description}</p>}

      <h2 className="mt-8 text-xl font-semibold text-zinc-900">Key facts</h2>
      <dl className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {[
          ["Funding source", o.fundingSource],
          ["Total available", money(Number(o.totalFunds))],
          ["Maximum award", money(Number(o.maxAward))],
          ["Application opens", longDate(o.opens)],
          ["Application deadline", `${longDate(o.closes)}, 4:00 p.m. Central`],
          ["Who can apply", o.eligible.join(", ")],
          ["Questions", o.contact],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="font-medium text-zinc-900">{k}</dt>
            <dd className="text-zinc-800 sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        {status === "Open" ? (
          <Link href={`/grant/apply?id=${encodeURIComponent(o.id)}`}
            className="inline-block rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
            Start an application
          </Link>
        ) : (
          <p className="rounded border border-zinc-300 bg-white p-4 text-zinc-800">
            {status === "Forecast"
              ? `Applications open ${longDate(o.opens)}.`
              : "This opportunity is closed to new applications."}
          </p>
        )}
      </div>
    </>
  );
}

export function NotFound() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Opportunity not found</h1>
      <p className="mt-3 text-zinc-700">
        It may have been unpublished, or it was created in a different web browser. (In this
        prototype, opportunities are saved only in the browser where they were built.)
      </p>
      <Link href="/opportunities" className="mt-4 inline-block text-blue-800 underline">
        Back to funding opportunities
      </Link>
    </>
  );
}
