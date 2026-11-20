import type { Metadata } from "next";
import GranteeHome from "./GranteeHome";

export const metadata: Metadata = { title: "Grantee portal" };

export default function GranteePortalPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <GranteeHome />
    </main>
  );
}
