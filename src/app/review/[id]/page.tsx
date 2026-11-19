import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { applications, getApplication, getOpportunity } from "@/lib/data";
import ReviewWorkspace from "./ReviewWorkspace";

// The page depends on the application in the URL, so it may block briefly while loading.
export const instant = false;

export function generateStaticParams() {
  return applications
    .filter((a) => a.status === "Submitted" || a.status === "In review")
    .map((a) => ({ id: a.id }));
}

export const metadata: Metadata = { title: "Review application" };

export default async function ReviewPage(props: PageProps<"/review/[id]">) {
  const { id } = await props.params;
  const app = getApplication(id);
  if (!app) notFound();
  const opp = getOpportunity(app.opportunityId);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/review" className="text-blue-800 underline">Review queue</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">{app.id}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
        Review {app.id}
      </h1>
      <p className="mt-1 text-zinc-700">{opp?.title}</p>
      <ReviewWorkspace app={app} />
    </main>
  );
}
