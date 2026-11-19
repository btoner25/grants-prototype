import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { getOpportunity, longDate, money, opportunities } from "@/lib/data";

// The page depends on the opportunity in the URL, so it may block briefly while loading.
export const instant = false;

export function generateStaticParams() {
  return opportunities.map((o) => ({ id: o.id }));
}

export async function generateMetadata(
  props: PageProps<"/opportunities/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  return { title: getOpportunity(id)?.title ?? "Opportunity not found" };
}

export default async function OpportunityPage(props: PageProps<"/opportunities/[id]">) {
  const { id } = await props.params;
  const o = getOpportunity(id);
  if (!o) notFound();

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/opportunities" className="text-blue-800 underline">
          Funding opportunities
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">{o.title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{o.title}</h1>
        <StatusBadge status={o.status} />
      </div>
      <p className="mt-1 text-zinc-700">{o.agency}</p>

      <p className="mt-6 text-lg leading-8 text-zinc-800">{o.description}</p>

      <h2 className="mt-8 text-xl font-semibold text-zinc-900">Key facts</h2>
      <dl className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {[
          ["Funding source", o.fundingSource],
          ["Total available", money(o.totalFunds)],
          ["Maximum award", money(o.maxAward)],
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
        {o.status === "Open" ? (
          <Link
            href={`/apply/${o.id}`}
            className="inline-block rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900"
          >
            Start an application
          </Link>
        ) : (
          <p className="rounded border border-zinc-300 bg-white p-4 text-zinc-800">
            {o.status === "Forecast"
              ? `Applications open ${longDate(o.opens)}.`
              : "This opportunity is closed to new applications."}
          </p>
        )}
      </div>
    </main>
  );
}
