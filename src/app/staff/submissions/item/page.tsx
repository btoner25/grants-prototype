import type { Metadata } from "next";
import { Suspense } from "react";
import SubmissionReview from "./SubmissionReview";

export const metadata: Metadata = { title: "Review a grantee submission" };

export default function SubmissionItemPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-zinc-700">Loading…</p>}>
        <SubmissionReview />
      </Suspense>
    </main>
  );
}
