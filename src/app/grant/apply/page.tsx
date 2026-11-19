import type { Metadata } from "next";
import { Suspense } from "react";
import GrantApply from "./GrantApply";

export const metadata: Metadata = { title: "Apply" };

export default function GrantApplyPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-zinc-700">Loading…</p>}>
        <GrantApply />
      </Suspense>
    </main>
  );
}
