import type { Metadata } from "next";
import SubmissionsQueue from "./SubmissionsQueue";

export const metadata: Metadata = { title: "Grantee submissions" };

export default function SubmissionsPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <SubmissionsQueue />
    </main>
  );
}
