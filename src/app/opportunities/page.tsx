import type { Metadata } from "next";
import { opportunities } from "@/lib/data";
import OpportunityList from "./OpportunityList";

export const metadata: Metadata = { title: "Find grants" };

export default function OpportunitiesPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Funding opportunities
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-700">
        State and federal pass-through grants offered by Minnesota agencies.
      </p>
      <OpportunityList items={opportunities} />
    </main>
  );
}
