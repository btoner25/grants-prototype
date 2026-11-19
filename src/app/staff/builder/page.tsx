import type { Metadata } from "next";
import Builder from "./Builder";

export const metadata: Metadata = { title: "Opportunity builder" };

export default function BuilderPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Builder />
    </main>
  );
}
