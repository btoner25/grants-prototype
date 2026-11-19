import type { Metadata } from "next";
import { Suspense } from "react";
import GrantDetail from "./GrantDetail";

export const metadata: Metadata = { title: "Funding opportunity" };

export default function GrantPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-zinc-700">Loading…</p>}>
        <GrantDetail />
      </Suspense>
    </main>
  );
}
