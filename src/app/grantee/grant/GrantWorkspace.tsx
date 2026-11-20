"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import AttachmentDownload from "@/components/AttachmentDownload";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money } from "@/lib/data";
import { localDay, todayIso } from "@/lib/formTypes";
import { balances, granteeGrants, holdFor, isReceived, reportRows, type Attachment } from "@/lib/granteeData";
import { useGranteePayments, useGranteeReports, useHydrated } from "@/lib/localStore";
import PortalBar, { useGranteeAccount } from "../PortalBar";
import PaymentForm from "./PaymentForm";
import ReportForm from "./ReportForm";

const views = ["Overview", "Progress reports", "Payment requests", "Documents"] as const;
type View = (typeof views)[number];
type Mode = { kind: "report"; reportId: string } | { kind: "payment" } | null;

const btnPrimary = "rounded bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900";

export default function GrantWorkspace() {
  const id = useSearchParams().get("id") ?? "";
  const hydrated = useHydrated();
  const account = useGranteeAccount();
  const localReports = useGranteeReports();
  const localPayments = useGranteePayments();
  const [view, setView] = useState<View>("Overview");
  const [mode, setMode] = useState<Mode>(null);
  const [notice, setNotice] = useState("");
  const viewHeading = useRef<HTMLHeadingElement>(null);

  if (!hydrated) return <p className="text-zinc-700">Loading…</p>;

  if (!account) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Please sign in</h1>
        <p className="mt-3 text-zinc-700">Sign in to the grantee portal to see your grants.</p>
        <Link href="/grantee" className="mt-4 inline-block text-blue-800 underline">Go to grantee sign-in</Link>
      </>
    );
  }

  const g = granteeGrants.find((x) => x.id === id && x.accountId === account.id);
  if (!g) {
    return (
      <>
        <PortalBar account={account} />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-900">Grant not found</h1>
        <p className="mt-3 text-zinc-700">This grant doesn&apos;t exist, or it isn&apos;t assigned to your organization.</p>
        <Link href="/grantee" className="mt-4 inline-block text-blue-800 underline">Back to your grants</Link>
      </>
    );
  }

  const today = todayIso();
  const rows = reportRows(g, localReports, today);
  const hold = holdFor(rows, today);
  const onHold = !!hold;
  const b = balances(g, localPayments);
  const myReports = localReports.filter((r) => r.grantId === g.id);
  const myPayments = localPayments.filter((p) => p.grantId === g.id);
  const reportFor = mode?.kind === "report" ? rows.find((r) => r.id === mode.reportId) : undefined;

  const focusHeading = () => setTimeout(() => viewHeading.current?.focus(), 0);
  const go = (v: View, message = "") => {
    setView(v);
    setMode(null);
    setNotice(message);
    focusHeading();
  };
  const open = (m: Mode) => {
    setMode(m);
    setNotice("");
    focusHeading();
  };

  const documents: { a: Attachment; context: string; date: string }[] = [
    ...myReports.flatMap((r) =>
      r.attachments.map((a) => ({
        a,
        context: `Progress report: ${g.reports.find((p) => p.id === r.reportId)?.label ?? r.reportId}`,
        date: localDay(r.submittedAt),
      })),
    ),
    ...myPayments.flatMap((p) =>
      p.attachments.map((a) => ({ a, context: `${p.kind} request ${p.id}`, date: localDay(p.submittedAt) })),
    ),
  ].sort((x, y) => y.date.localeCompare(x.date));

  const heading = reportFor
    ? `${reportFor.status === "Changes requested" ? "Revise" : "Submit"} progress report: ${reportFor.label}`
    : mode?.kind === "payment"
      ? "Request a payment"
      : view;

  return (
    <>
      <PortalBar account={account} />
      <nav aria-label="Breadcrumb" className="mt-6 text-sm">
        <Link href="/grantee" className="text-blue-800 underline">Your grants</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">{g.program}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{g.program}</h1>
      <p className="mt-1 text-zinc-700">Grant {g.id} · {g.agency}</p>

      {hold && (
        <div className="mt-6 rounded-lg border-l-4 border-red-700 bg-red-50 p-4 text-red-900">
          <h2 className="font-semibold">Payments are on hold</h2>
          <p className="mt-1">
            {hold.status === "Changes requested"
              ? `Your grant manager asked for changes to your ${hold.label} progress report, which was due ${longDate(hold.due)}. Resubmit it to release payments.`
              : `Your ${hold.label} progress report was due ${longDate(hold.due)}. Submit it to release payments.`}
          </p>
          {!(mode?.kind === "report") && (
            <button type="button" className="mt-3 rounded bg-red-800 px-4 py-2 font-medium text-white hover:bg-red-900"
              onClick={() => { setView("Progress reports"); open({ kind: "report", reportId: hold.id }); }}>
              {hold.status === "Changes requested" ? "Revise" : "Submit"} the {hold.label} report
            </button>
          )}
        </div>
      )}

      <nav aria-label="Grant sections" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {views.map((v) => (
            <li key={v}>
              <button type="button" onClick={() => go(v)} aria-current={view === v && !mode ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  view === v ? "border-blue-800 bg-blue-800 text-white" : "border-zinc-400 bg-white text-zinc-900 hover:bg-zinc-100"
                }`}>
                {v}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <p role="status" className="mt-4 font-medium text-green-900">{notice}</p>

      <section aria-labelledby="view-title" className="mt-2">
        <h2 id="view-title" ref={viewHeading} tabIndex={-1} className="text-2xl font-semibold text-zinc-900">
          {heading}
        </h2>

        {reportFor ? (
          <ReportForm grant={g} period={reportFor} releasesHold={hold?.id === reportFor.id} onCancel={() => go("Progress reports")}
            onDone={(m) => go("Progress reports", m)} />
        ) : mode?.kind === "payment" ? (
          <PaymentForm grant={g} remaining={b.remaining} onCancel={() => go("Payment requests")}
            onDone={(m) => go("Payment requests", m)} />
        ) : view === "Overview" ? (
          <div className="mt-4 flex flex-col gap-6">
            <dl className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
              {[
                ["Organization", account.organization],
                ["Grant period", `${longDate(g.startDate)} to ${longDate(g.endDate)}`],
                ["Award amount", money(g.amount)],
                ["Paid to date", money(b.paid)],
                ["Pending payment requests", money(b.pending)],
                ["Remaining balance", money(b.remaining)],
                ["Grant manager", `${g.officer}, ${g.officerEmail}`],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3">
                  <dt className="font-medium text-zinc-900">{k}</dt>
                  <dd className="text-zinc-800 sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="px-4 pt-3 text-left text-lg font-semibold text-zinc-900">Approved budget</caption>
                <thead className="text-zinc-900">
                  <tr className="border-b border-zinc-200">
                    <th scope="col" className="px-4 py-2">Budget line</th>
                    <th scope="col" className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {g.budget.map((l) => (
                    <tr key={l.line}>
                      <th scope="row" className="px-4 py-2 font-normal text-zinc-800">{l.line}</th>
                      <td className="px-4 py-2 text-right text-zinc-800">{money(l.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <th scope="row" className="px-4 py-2 text-zinc-900">Total</th>
                    <td className="px-4 py-2 text-right text-zinc-900">{money(g.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : view === "Progress reports" ? (
          <div className="mt-4 flex flex-col gap-6">
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Progress report schedule</caption>
                <thead className="bg-zinc-100 text-zinc-900">
                  <tr>
                    <th scope="col" className="px-4 py-3">Report</th>
                    <th scope="col" className="px-4 py-3">Period</th>
                    <th scope="col" className="px-4 py-3">Due</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <th scope="row" className="px-4 py-3 font-medium text-zinc-900">{r.label}</th>
                      <td className="px-4 py-3 text-zinc-800">{longDate(r.periodStart)} to {longDate(r.periodEnd)}</td>
                      <td className="px-4 py-3 text-zinc-800">{longDate(r.due)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                        {r.submittedOn && <span className="block text-xs text-zinc-600">on {longDate(r.submittedOn)}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.canSubmit ? (
                          <button type="button" className="text-blue-800 underline"
                            onClick={() => open({ kind: "report", reportId: r.id })}>
                            {r.status === "Changes requested" ? "Revise and resubmit" : "Submit report"}
                            <span className="sr-only">: {r.label}</span>
                          </button>
                        ) : isReceived(r) ? (
                          <span className="text-zinc-600">Done</span>
                        ) : (
                          <span className="text-zinc-600">Opens {longDate(r.periodStart)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {myReports.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Reports submitted in the portal</h3>
                <ul className="mt-3 flex flex-col gap-4">
                  {myReports.map((r) => (
                    <li key={r.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                      <h4 className="font-semibold text-zinc-900">
                        {g.reports.find((p) => p.id === r.reportId)?.label} · submitted {longDate(localDay(r.submittedAt))}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-800">
                        Grant manager review: <StatusBadge status={r.review?.decision ?? "Pending review"} />
                      </div>
                      {r.review?.comment && (
                        <p className="mt-2 rounded border-l-4 border-zinc-400 bg-zinc-50 px-3 py-2 text-sm text-zinc-900">
                          <span className="font-medium">Comment from {r.review.reviewer}, {longDate(localDay(r.review.reviewedAt))}:</span>{" "}
                          <span className="whitespace-pre-line">{r.review.comment}</span>
                        </p>
                      )}
                      <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="text-zinc-600">People served</dt><dd className="text-zinc-900">{r.peopleServed}</dd></div>
                        <div><dt className="text-zinc-600">Funds spent</dt><dd className="text-zinc-900">{money(r.expenditures)}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-zinc-600">Activities</dt><dd className="whitespace-pre-line text-zinc-900">{r.activities}</dd></div>
                        {r.challenges && (
                          <div className="sm:col-span-2"><dt className="text-zinc-600">Challenges or changes</dt><dd className="whitespace-pre-line text-zinc-900">{r.challenges}</dd></div>
                        )}
                        <div className="sm:col-span-2">
                          <dt className="text-zinc-600">Attachments</dt>
                          <dd className="text-zinc-900">
                            {r.attachments.length === 0 ? "None" : (
                              <ul className="mt-1 flex flex-col gap-1">
                                {r.attachments.map((a) => (
                                  <li key={a.id} className="flex flex-wrap items-center gap-2">{a.name} <AttachmentDownload a={a} /></li>
                                ))}
                              </ul>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : view === "Payment requests" ? (
          <div className="mt-4 flex flex-col gap-6">
            <p className="text-zinc-800">
              Remaining balance: <strong>{money(b.remaining)}</strong> of {money(g.amount)}.
            </p>
            {onHold ? (
              <p className="rounded border border-red-300 bg-red-50 p-4 text-red-900">
                You can&apos;t request a payment while a progress report is overdue.
              </p>
            ) : b.remaining <= 0 ? (
              <p className="rounded border border-zinc-300 bg-white p-4 text-zinc-800">
                Your full award has been paid or requested.
              </p>
            ) : (
              <div>
                <button type="button" className={btnPrimary} onClick={() => open({ kind: "payment" })}>
                  Request a payment
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="px-4 pt-3 text-left text-lg font-semibold text-zinc-900">Payment history</caption>
                <thead className="text-zinc-900">
                  <tr className="border-b border-zinc-200">
                    <th scope="col" className="px-4 py-2">Request</th>
                    <th scope="col" className="px-4 py-2">Date</th>
                    <th scope="col" className="px-4 py-2">Type</th>
                    <th scope="col" className="px-4 py-2 text-right">Amount</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2 text-right">Attachments</th>
                    <th scope="col" className="px-4 py-2">Grant manager note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {[
                    ...myPayments.map((p) => ({ id: p.id, date: localDay(p.submittedAt), kind: p.kind, amount: p.total, status: p.status as string, files: p.attachments.length, note: p.review?.comment ?? "" })),
                    ...g.payments.map((p) => ({ id: p.id, date: p.date, kind: p.kind, amount: p.amount, status: "Paid", files: 0, note: "" })),
                  ]
                    .sort((x, y) => y.date.localeCompare(x.date))
                    .map((p) => (
                      <tr key={p.id}>
                        <th scope="row" className="px-4 py-2 font-medium text-zinc-900">{p.id}</th>
                        <td className="px-4 py-2 text-zinc-800">{longDate(p.date)}</td>
                        <td className="px-4 py-2 text-zinc-800">{p.kind}</td>
                        <td className="px-4 py-2 text-right text-zinc-800">{money(p.amount)}</td>
                        <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-2 text-right text-zinc-800">{p.files || "—"}</td>
                        <td className="whitespace-pre-line px-4 py-2 text-zinc-800">{p.note || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {documents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-400 bg-white p-6 text-zinc-700">
                No documents yet. Files you attach to progress reports and payment requests appear here.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Documents uploaded for this grant</caption>
                  <thead className="bg-zinc-100 text-zinc-900">
                    <tr>
                      <th scope="col" className="px-4 py-3">File</th>
                      <th scope="col" className="px-4 py-3">Attached to</th>
                      <th scope="col" className="px-4 py-3">Uploaded</th>
                      <th scope="col" className="px-4 py-3">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {documents.map((d) => (
                      <tr key={d.a.id}>
                        <th scope="row" className="px-4 py-3 font-medium text-zinc-900">{d.a.name}</th>
                        <td className="px-4 py-3 text-zinc-800">{d.context}</td>
                        <td className="px-4 py-3 text-zinc-800">{longDate(d.date)}</td>
                        <td className="px-4 py-3"><AttachmentDownload a={d.a} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
