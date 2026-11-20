"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money } from "@/lib/data";
import { todayIso } from "@/lib/formTypes";
import { balances, granteeAccounts, granteeGrants, reportRows } from "@/lib/granteeData";
import { signInGrantee, useGranteePayments, useGranteeReports, useHydrated } from "@/lib/localStore";
import PortalBar, { useGranteeAccount } from "./PortalBar";

export default function GranteeHome() {
  const hydrated = useHydrated();
  const account = useGranteeAccount();
  const reports = useGranteeReports();
  const payments = useGranteePayments();

  if (!hydrated) return <p className="text-zinc-700">Loading…</p>;
  if (!account) return <SignIn />;

  const today = todayIso();
  const grants = granteeGrants.filter((g) => g.accountId === account.id);

  return (
    <>
      <PortalBar account={account} />
      <h1 id="portal-title" tabIndex={-1} className="mt-8 text-3xl font-semibold tracking-tight text-zinc-900">
        Your grants
      </h1>
      <p className="mt-2 text-zinc-700">
        Submit progress reports, request payments and upload documents for each active grant.
      </p>

      <ul className="mt-6 flex flex-col gap-6">
        {grants.map((g) => {
          const rows = reportRows(g, reports, today);
          const next = rows.find((r) => r.status !== "Submitted");
          const overdue = rows.find((r) => r.status === "Overdue");
          const b = balances(g, payments);
          const href = `/grantee/grant?id=${encodeURIComponent(g.id)}`;
          return (
            <li key={g.id} className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-zinc-900">
                <Link href={href} className="text-blue-800 underline hover:text-blue-950">
                  {g.program}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-zinc-700">
                Grant {g.id} · {g.agency} · {longDate(g.startDate)} to {longDate(g.endDate)}
              </p>

              {overdue && (
                <p className="mt-4 rounded border-l-4 border-red-700 bg-red-50 px-4 py-3 text-red-900">
                  <strong>Action needed:</strong> your {overdue.label} progress report was due{" "}
                  {longDate(overdue.due)}. Payments are on hold until you submit it.
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
                <div>
                  <dt className="text-zinc-600">Award</dt>
                  <dd className="font-medium text-zinc-900">{money(g.amount)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Paid to date</dt>
                  <dd className="font-medium text-zinc-900">{money(b.paid)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Pending requests</dt>
                  <dd className="font-medium text-zinc-900">{money(b.pending)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Remaining balance</dt>
                  <dd className="font-medium text-zinc-900">{money(b.remaining)}</dd>
                </div>
                <div className="col-span-2 md:col-span-4">
                  <dt className="text-zinc-600">Next progress report</dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-2 font-medium text-zinc-900">
                    {next ? (
                      <>
                        {next.label}, due {longDate(next.due)} <StatusBadge status={next.status} />
                      </>
                    ) : (
                      "All reports submitted"
                    )}
                  </dd>
                </div>
              </dl>

              <Link href={href}
                className="mt-5 inline-block rounded bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900">
                Open grant<span className="sr-only"> {g.program}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SignIn() {
  const [choice, setChoice] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <h1 id="signin-title" tabIndex={-1} className="text-3xl font-semibold tracking-tight text-zinc-900">
        Grantee portal sign-in
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-700">
        Current grantees can sign in to submit progress reports, request payments and upload documents.
      </p>
      <p className="mt-3 max-w-2xl rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        Prototype: choose a fictional grantee account below. No password is needed. The real portal
        will use secure sign-in with multifactor authentication, and people will only ever see their
        own organization&apos;s grants.
      </p>

      <form
        noValidate
        className="mt-6 max-w-xl rounded-lg border border-zinc-200 bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!choice) {
            setError("Choose an account to sign in.");
            return;
          }
          setError("");
          signInGrantee(choice);
          setTimeout(() => document.getElementById("portal-title")?.focus(), 50);
        }}
      >
        <fieldset aria-describedby={error ? "signin-error" : undefined}>
          <legend className="text-lg font-semibold text-zinc-900">Sign in as</legend>
          {error && (
            <p id="signin-error" role="alert" className="mt-2 font-medium text-red-800">
              Error: {error}
            </p>
          )}
          <div className="mt-3 flex flex-col gap-3">
            {granteeAccounts.map((a, i) => (
              <div key={a.id} className="flex items-start gap-3">
                <input id={`acct-${i}`} type="radio" name="account" value={a.id} className="mt-1 h-5 w-5"
                  checked={choice === a.id} onChange={() => setChoice(a.id)} />
                <label htmlFor={`acct-${i}`} className="text-zinc-900">
                  {a.contactName}, {a.organization}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="mt-6 rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
          Sign in
        </button>
      </form>
    </>
  );
}
