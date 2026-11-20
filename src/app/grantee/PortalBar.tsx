"use client";

import { useRouter } from "next/navigation";
import { granteeAccounts, type GranteeAccount } from "@/lib/granteeData";
import { signOutGrantee, useGranteeSession } from "@/lib/localStore";

/** The grantee account that is "signed in" (simulated), if any. */
export function useGranteeAccount(): GranteeAccount | undefined {
  const session = useGranteeSession();
  return granteeAccounts.find((a) => a.id === session[0]?.accountId);
}

export default function PortalBar({ account }: { account: GranteeAccount }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <p className="text-zinc-800">
        Signed in as <strong>{account.contactName}</strong>, {account.organization} (fictional)
      </p>
      <button
        type="button"
        className="rounded border border-blue-800 bg-white px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-50"
        onClick={() => {
          signOutGrantee();
          router.push("/grantee");
          setTimeout(() => document.getElementById("signin-title")?.focus(), 100);
        }}
      >
        Sign out
      </button>
    </div>
  );
}
