import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunity, longDate, money, opportunities } from "@/lib/data";
import ApplicationForm from "./ApplicationForm";

// The page depends on the opportunity in the URL, so it may block briefly while loading.
export const instant = false;

export function generateStaticParams() {
  return opportunities.filter((o) => o.status === "Open").map((o) => ({ id: o.id }));
}

export const metadata: Metadata = { title: "Apply" };

export default async function ApplyPage(props: PageProps<"/apply/[id]">) {
  const { id } = await props.params;
  const o = getOpportunity(id);
  if (!o || o.status !== "Open") notFound();

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href={`/opportunities/${o.id}`} className="text-blue-800 underline">
          {o.title}
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">Application</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
        Apply: {o.title}
      </h1>
      <p className="mt-2 text-zinc-700">
        Deadline {longDate(o.closes)}. Maximum award {money(o.maxAward)}. Fields
        marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>
      <ApplicationForm opportunityTitle={o.title} maxAward={o.maxAward} />
    </main>
  );
}
