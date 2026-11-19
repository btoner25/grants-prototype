"use client";

import Link from "next/link";
import DynamicForm from "@/components/DynamicForm";
import { longDate, money } from "@/lib/data";
import { statusOf } from "@/lib/formTypes";
import { NotFound } from "../GrantDetail";
import { useGrant } from "../useGrant";

export default function GrantApply() {
  const { opp: o, loading } = useGrant();

  if (loading) return <p className="text-zinc-700">Loading…</p>;
  if (!o) return <NotFound />;

  const href = `/grant?id=${encodeURIComponent(o.id)}`;
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href={href} className="text-blue-800 underline">{o.title}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">Application</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">Apply: {o.title}</h1>
      <p className="mt-2 text-zinc-700">
        Deadline {longDate(o.closes)}. Maximum award {money(Number(o.maxAward))}.
      </p>
      {statusOf(o) === "Open" ? (
        <DynamicForm opp={o} mode="live" />
      ) : (
        <p className="mt-6 rounded border border-zinc-300 bg-white p-4 text-zinc-800">
          This opportunity isn&apos;t accepting applications right now.{" "}
          <Link href={href} className="text-blue-800 underline">See the details</Link>.
        </p>
      )}
    </>
  );
}
