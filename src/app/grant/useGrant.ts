"use client";

import { useSearchParams } from "next/navigation";
import { useCustomOpportunities, useHydrated } from "@/lib/localStore";

/** Finds the published, staff-built opportunity named by ?id= in the URL. */
export function useGrant() {
  const id = useSearchParams().get("id") ?? "";
  const list = useCustomOpportunities();
  const hydrated = useHydrated();
  const opp = list.find((o) => o.id === id && o.published);
  return { opp, loading: !hydrated };
}
