import type { Metadata } from "next";
import { Suspense } from "react";
import GrantWorkspace from "./GrantWorkspace";

export const metadata: Metadata = { title: "Your grant" };

export default function GranteeGrantPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-zinc-700">Loading…</p>}>
        <GrantWorkspace />
      </Suspense>
    </main>
  );
}
