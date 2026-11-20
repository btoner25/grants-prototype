"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import AttachmentDownload from "@/components/AttachmentDownload";
import ErrorSummary, { FieldError } from "@/components/ErrorSummary";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money } from "@/lib/data";
import { localDay, nowIso, todayIso } from "@/lib/formTypes";
import {
  accountFor,
  balances,
  granteeGrants,
  holdFor,
  reportRows,
  staffUser,
  type Attachment,
  type GranteeGrant,
} from "@/lib/granteeData";
import {
  reviewGranteeReport,
  reviewPaymentRequest,
  useGranteePayments,
  useGranteeReports,
  useHydrated,
} from "@/lib/localStore";

const box = "rounded-lg border border-zinc-200 bg-white p-6";

export default function SubmissionReview() {
  const params = useSearchParams();
  const kind = params.get("kind");
  const id = params.get("id") ?? "";
  const hydrated = useHydrated();
  const reports = useGranteeReports();
  const payments = useGranteePayments();
  const [notice, setNotice] = useState("");
  const decisionHeading = useRef<HTMLHeadingElement>(null);

  if (!hydrated) return <p className="text-zinc-700">Loading…</p>;

  const report = kind === "report" ? reports.find((r) => r.id === id) : undefined;
  const payment = kind === "payment" ? payments.find((p) => p.id === id) : undefined;
  const grant = granteeGrants.find((g) => g.id === (report?.grantId ?? payment?.grantId));

  if (!grant || (!report && !payment)) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Submission not found</h1>
        <p className="mt-3 text-zinc-700">
          This submission doesn&apos;t exist in this browser. Submissions are saved only in the browser
          where the grantee entered them.
        </p>
        <Link href="/staff/submissions" className="mt-4 inline-block text-blue-800 underline">
          Back to grantee submissions
        </Link>
      </>
    );
  }

  const today = todayIso();
  const rows = reportRows(grant, reports, today);
  const hold = holdFor(rows, today);
  const b = balances(grant, payments);
  const org = accountFor(grant)?.organization ?? "";
  const period = report ? grant.reports.find((p) => p.id === report.reportId) : undefined;
  const title = report
    ? `Progress report: ${period?.label ?? report.reportId}`
    : `${payment!.kind} request ${payment!.id}`;

  const decided = (message: string) => {
    setNotice(message);
    setTimeout(() => decisionHeading.current?.focus(), 0);
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/staff" className="text-blue-800 underline">Staff dashboard</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/staff/submissions" className="text-blue-800 underline">Grantee submissions</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-zinc-700">{report ? "Progress report" : "Payment request"}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{title}</h1>
      <p className="mt-1 text-zinc-700">
        {org} · Grant {grant.id}, {grant.program} · Received {longDate(localDay((report ?? payment)!.submittedAt))}
      </p>

      <p role="status" className="mt-4 font-medium text-green-900">{notice}</p>

      <div className="mt-2 flex flex-col gap-6">
        <GrantContext grant={grant} paid={b.paid} pending={b.pending} remaining={b.remaining}
          holdText={hold ? `${hold.label} report ${hold.status === "Overdue" ? "is overdue" : "was sent back for changes and is past due"} (due ${longDate(hold.due)})` : ""} />

        {report && (
          <section aria-labelledby="sub-title" className={box}>
            <h2 id="sub-title" className="text-xl font-semibold text-zinc-900">What the grantee reported</h2>
            {period && (
              <p className="mt-1 text-sm text-zinc-700">
                Period {longDate(period.periodStart)} to {longDate(period.periodEnd)}, due {longDate(period.due)}.
                {localDay(report.submittedAt) > period.due ? " Received late." : " Received on time."}
              </p>
            )}
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Item label="People served this period">{report.peopleServed.toLocaleString("en-US")}</Item>
              <Item label="Grant funds spent this period">{money(report.expenditures)}</Item>
              <Item label="Activities completed" wide>{report.activities}</Item>
              <Item label="Challenges or changes" wide>{report.challenges || "None reported"}</Item>
              <Item label="Attachments" wide><Files list={report.attachments} /></Item>
            </dl>
          </section>
        )}

        {payment && (
          <section aria-labelledby="sub-title" className={box}>
            <h2 id="sub-title" className="text-xl font-semibold text-zinc-900">What the grantee requested</h2>
            <p className="mt-1 text-sm text-zinc-700">
              {payment.kind} for {longDate(payment.periodStart)} to {longDate(payment.periodEnd)}.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Amount requested by budget line</caption>
                <thead className="text-zinc-900">
                  <tr className="border-b border-zinc-200">
                    <th scope="col" className="py-2 pr-4">Budget line</th>
                    <th scope="col" className="py-2 pr-4 text-right">Approved budget</th>
                    <th scope="col" className="py-2 text-right">This request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {grant.budget.map((l) => (
                    <tr key={l.line}>
                      <th scope="row" className="py-2 pr-4 font-normal text-zinc-800">{l.line}</th>
                      <td className="py-2 pr-4 text-right text-zinc-800">{money(l.amount)}</td>
                      <td className="py-2 text-right text-zinc-800">{money(payment.lines[l.line] ?? 0)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <th scope="row" className="py-2 pr-4 text-zinc-900">Total</th>
                    <td className="py-2 pr-4 text-right text-zinc-900">{money(grant.amount)}</td>
                    <td className="py-2 text-right text-zinc-900">{money(payment.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-4">
              {payment.justification && <Item label="Why an advance is needed" wide>{payment.justification}</Item>}
              <Item label={payment.kind === "Reimbursement" ? "Receipts and invoices" : "Attachments"} wide>
                <Files list={payment.attachments} />
              </Item>
            </dl>
          </section>
        )}

        <section aria-labelledby="decision-title" className={box}>
          <h2 id="decision-title" ref={decisionHeading} tabIndex={-1} className="text-xl font-semibold text-zinc-900">
            {(report?.review ?? payment?.review) ? "Decision" : "Your decision"}
          </h2>
          {report?.review ? (
            <Decision status={report.review.decision} reviewer={report.review.reviewer}
              at={report.review.reviewedAt} comment={report.review.comment} />
          ) : payment?.review ? (
            <Decision status={payment.status} reviewer={payment.review.reviewer}
              at={payment.review.reviewedAt} comment={payment.review.comment} />
          ) : report ? (
            <DecisionForm
              options={[
                { value: "Accepted", label: "Accept the report", hint: "The report is complete. It counts as received." },
                { value: "Changes requested", label: "Request changes", hint: "Send it back. The grantee can revise and resubmit it." },
              ]}
              commentRequiredFor="Changes requested"
              commentHint="Required when you request changes. Tell the grantee exactly what to fix."
              onDecide={(value, comment) => {
                const decision = value as "Accepted" | "Changes requested";
                reviewGranteeReport(report.id, { decision, comment, reviewer: staffUser, reviewedAt: nowIso() });
                decided(decision === "Accepted"
                  ? "Report accepted. The grantee can see your decision in their portal."
                  : `Changes requested. The grantee can now revise and resubmit this report${
                      period && period.due < today ? ", and payments are on hold until they do" : ""}.`);
              }}
            />
          ) : (
            <DecisionForm
              options={[
                { value: "Approved", label: "Approve for payment", hint: `Releases ${money(payment!.total)} to ${org}.` },
                { value: "Returned", label: "Return to grantee", hint: "Decline this request. The amount goes back into the remaining balance." },
              ]}
              commentRequiredFor="Returned"
              commentHint="Required when you return a request. Explain why, and what to send instead."
              blockApprove={hold ? `Payments are on hold because the ${hold.label} progress report is past due. Return the request, or wait until the report is received.` : ""}
              onDecide={(value, comment) => {
                const status = value as "Approved" | "Returned";
                reviewPaymentRequest(payment!.id, status, { comment, reviewer: staffUser, reviewedAt: nowIso() });
                decided(status === "Approved"
                  ? `Payment of ${money(payment!.total)} approved. It now counts as paid.`
                  : "Payment request returned. The grantee can see your note in their portal.");
              }}
            />
          )}
        </section>

        <p>
          <Link href="/staff/submissions" className="text-blue-800 underline">Back to grantee submissions</Link>
        </p>
      </div>
    </>
  );
}

function GrantContext({ grant, paid, pending, remaining, holdText }: {
  grant: GranteeGrant; paid: number; pending: number; remaining: number; holdText: string;
}) {
  return (
    <section aria-labelledby="ctx-title" className={box}>
      <h2 id="ctx-title" className="text-xl font-semibold text-zinc-900">Grant at a glance</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
        <Item label="Award">{money(grant.amount)}</Item>
        <Item label="Paid to date">{money(paid)}</Item>
        <Item label="Pending requests">{money(pending)}</Item>
        <Item label="Remaining balance">{money(remaining)}</Item>
        <Item label="Grant period" wide>{longDate(grant.startDate)} to {longDate(grant.endDate)}</Item>
        <Item label="Payments" wide>
          {holdText ? (
            <span className="font-medium text-red-900">On hold: {holdText}.</span>
          ) : (
            "Allowed. No reports are past due."
          )}
        </Item>
      </dl>
    </section>
  );
}

function Item({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "col-span-full" : ""}>
      <dt className="text-sm text-zinc-600">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-zinc-900">{children}</dd>
    </div>
  );
}

function Files({ list }: { list: Attachment[] }) {
  if (list.length === 0) return <>None</>;
  return (
    <ul className="flex flex-col gap-1">
      {list.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-2">{a.name} <AttachmentDownload a={a} /></li>
      ))}
    </ul>
  );
}

function Decision({ status, reviewer, at, comment }: { status: string; reviewer: string; at: string; comment: string }) {
  return (
    <div className="mt-3 flex flex-col gap-2 text-zinc-900">
      <p className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} /> by {reviewer} on {longDate(localDay(at))}
      </p>
      <p className="whitespace-pre-line">
        <span className="font-medium">Comment to grantee:</span> {comment || "None"}
      </p>
    </div>
  );
}

function DecisionForm({
  options,
  commentRequiredFor,
  commentHint,
  blockApprove = "",
  onDecide,
}: {
  options: { value: string; label: string; hint: string }[];
  commentRequiredFor: string;
  commentHint: string;
  blockApprove?: string;
  onDecide: (value: string, comment: string) => void;
}) {
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const summaryRef = useRef<HTMLDivElement>(null);
  const firstId = "dec-0";

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!value) e[firstId] = "Choose a decision.";
    else if (value === options[0].value && blockApprove) e[firstId] = blockApprove;
    if (value === commentRequiredFor && !comment.trim()) e["dec-comment"] = "Enter a comment for the grantee.";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    onDecide(value, comment.trim());
  }

  return (
    <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-5">
      <ErrorSummary ref={summaryRef} items={Object.entries(errors).map(([target, message]) => ({ target, message }))} />
      {blockApprove && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">{blockApprove}</p>
      )}
      <fieldset aria-describedby={errors[firstId] ? `${firstId}-error` : undefined}>
        <legend className="font-medium text-zinc-900">Decision <span aria-hidden="true">*</span></legend>
        <FieldError id={firstId} message={errors[firstId]} />
        <div className="mt-2 flex flex-col gap-3">
          {options.map((o, i) => (
            <div key={o.value} className="flex items-start gap-3">
              <input id={`dec-${i}`} type="radio" name="decision" value={o.value} className="mt-1 h-5 w-5"
                checked={value === o.value} aria-describedby={`dec-${i}-hint`}
                onChange={() => setValue(o.value)} />
              <div>
                <label htmlFor={`dec-${i}`} className="font-medium text-zinc-900">{o.label}</label>
                <p id={`dec-${i}-hint`} className="text-sm text-zinc-700">{o.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="dec-comment" className="font-medium text-zinc-900">Comment to the grantee</label>
        <p id="dec-comment-hint" className="text-sm text-zinc-700">{commentHint} The grantee sees this comment.</p>
        <FieldError id="dec-comment" message={errors["dec-comment"]} />
        <textarea id="dec-comment" rows={4} className="w-full rounded border border-zinc-500 bg-white px-3 py-2"
          value={comment} onChange={(e) => setComment(e.target.value)} aria-invalid={!!errors["dec-comment"]}
          aria-describedby={["dec-comment-hint", errors["dec-comment"] ? "dec-comment-error" : ""].filter(Boolean).join(" ")} />
      </div>

      <div>
        <button type="submit" className="rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
          Record decision
        </button>
      </div>
    </form>
  );
}
