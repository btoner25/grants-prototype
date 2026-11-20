"use client";

import { useRef, useState } from "react";
import ErrorSummary, { FieldError } from "@/components/ErrorSummary";
import FileUpload from "@/components/FileUpload";
import { money } from "@/lib/data";
import { saveAttachments } from "@/lib/fileStore";
import { newId, nowIso } from "@/lib/formTypes";
import type { GranteeGrant, PaymentRequest } from "@/lib/granteeData";
import { addPaymentRequest } from "@/lib/localStore";

const inputClass = "w-full rounded border border-zinc-500 bg-white px-3 py-2";

export default function PaymentForm({
  grant,
  remaining,
  onCancel,
  onDone,
}: {
  grant: GranteeGrant;
  remaining: number;
  onCancel: () => void;
  onDone: (message: string) => void;
}) {
  const [kind, setKind] = useState<PaymentRequest["kind"]>("Reimbursement");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [lines, setLines] = useState<Record<string, string>>({});
  const [justification, setJustification] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [certify, setCertify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const total = grant.budget.reduce((s, b) => s + (Number(lines[b.line]) || 0), 0);
  const describedBy = (id: string, hint = false) =>
    [hint ? `${id}-hint` : "", errors[id] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

  function validate() {
    const e: Record<string, string> = {};
    if (!start) e["pay-start"] = "Enter the first day of the period this request covers.";
    if (!end) e["pay-end"] = "Enter the last day of the period this request covers.";
    else if (start && end < start) e["pay-end"] = "The end date can't be before the start date.";
    if (total <= 0) e["pay-line-0"] = "Enter an amount for at least one budget line.";
    else if (total > remaining)
      e["pay-line-0"] = `Your total of ${money(total)} is more than your remaining balance of ${money(remaining)}.`;
    if (kind === "Advance" && !justification.trim())
      e["pay-justification"] = "Explain why you need an advance and how you will use it.";
    if (kind === "Reimbursement" && files.length === 0)
      e["pay-files"] = "Attach receipts or invoices for the costs you want reimbursed.";
    if (!certify) e["pay-certify"] = "Confirm the certification to submit.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setSaving(true);
    try {
      const attachments = await saveAttachments(files);
      const amounts: Record<string, number> = {};
      for (const b of grant.budget) if (Number(lines[b.line]) > 0) amounts[b.line] = Number(lines[b.line]);
      addPaymentRequest({
        id: newId("req").toUpperCase(),
        grantId: grant.id,
        submittedAt: nowIso(),
        kind,
        periodStart: start,
        periodEnd: end,
        lines: amounts,
        total,
        justification: justification.trim(),
        attachments,
        status: "Pending review",
      });
      onDone(`Your ${kind.toLowerCase()} request for ${money(total)} was submitted. Your grant manager will review it.`);
    } catch {
      setSaving(false);
      setErrors({ "pay-files": "Your attachments couldn't be saved. Try again." });
      setTimeout(() => summaryRef.current?.focus(), 0);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-6">
      <p className="text-zinc-700">
        Remaining balance available to request: <strong>{money(remaining)}</strong>. Fields marked{" "}
        <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      <ErrorSummary ref={summaryRef} items={Object.entries(errors).map(([target, message]) => ({ target, message }))} />

      <div className="flex flex-col gap-5 rounded-lg border border-zinc-200 bg-white p-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="font-medium text-zinc-900">Type of request</legend>
          {(
            [
              ["Reimbursement", "Reimbursement: pay me back for costs I have already paid"],
              ["Advance", "Advance: pay me now for costs I will have soon"],
            ] as const
          ).map(([value, text], i) => (
            <div key={value} className="flex items-start gap-3">
              <input id={`pay-kind-${i}`} type="radio" name="pay-kind" className="mt-1 h-5 w-5"
                checked={kind === value} onChange={() => setKind(value)} />
              <label htmlFor={`pay-kind-${i}`} className="text-zinc-900">{text}</label>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend className="font-medium text-zinc-900">Period this request covers</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["pay-start", "Start date", start, setStart],
                ["pay-end", "End date", end, setEnd],
              ] as const
            ).map(([id, text, value, setter]) => (
              <div key={id} className="flex flex-col gap-1">
                <label htmlFor={id} className="text-zinc-900">
                  {text} <span aria-hidden="true">*</span>
                </label>
                <FieldError id={id} message={errors[id]} />
                <input id={id} type="date" className={inputClass} value={value} aria-required
                  aria-invalid={!!errors[id]} aria-describedby={describedBy(id)}
                  onChange={(e) => setter(e.target.value)} />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset aria-describedby={["pay-lines-hint", errors["pay-line-0"] ? "pay-line-0-error" : ""].filter(Boolean).join(" ")}>
          <legend className="font-medium text-zinc-900">
            Amount by budget line <span aria-hidden="true">*</span>
          </legend>
          <p id="pay-lines-hint" className="text-sm text-zinc-700">
            Enter whole dollars. Leave a line blank if this request doesn&apos;t include it.
          </p>
          <FieldError id="pay-line-0" message={errors["pay-line-0"]} />
          <div className="mt-3 flex flex-col gap-3">
            {grant.budget.map((b, i) => (
              <div key={b.line} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[16rem_12rem_1fr]">
                <label htmlFor={`pay-line-${i}`} className="text-zinc-900">{b.line}</label>
                <div className="flex items-center gap-1">
                  <span aria-hidden="true">$</span>
                  <input id={`pay-line-${i}`} inputMode="numeric" className={`${inputClass} text-right`}
                    aria-describedby={`pay-line-${i}-budget`} value={lines[b.line] ?? ""}
                    onChange={(e) => setLines((l) => ({ ...l, [b.line]: e.target.value.replace(/[^0-9]/g, "") }))} />
                </div>
                <span id={`pay-line-${i}-budget`} className="text-sm text-zinc-600">
                  Budget {money(b.amount)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-zinc-200 pt-3 text-lg font-semibold text-zinc-900" aria-live="polite">
            Total request: {money(total)}
          </p>
        </fieldset>

        {kind === "Advance" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="pay-justification" className="font-medium text-zinc-900">
              Why do you need an advance? <span aria-hidden="true">*</span>
            </label>
            <FieldError id="pay-justification" message={errors["pay-justification"]} />
            <textarea id="pay-justification" rows={3} className={inputClass} value={justification} aria-required
              aria-invalid={!!errors["pay-justification"]} aria-describedby={describedBy("pay-justification")}
              onChange={(e) => setJustification(e.target.value)} />
          </div>
        )}

        <FileUpload id="pay-files"
          label={kind === "Reimbursement" ? "Receipts or invoices" : "Supporting documents (optional)"}
          hint={kind === "Reimbursement" ? "Attach proof of the costs in this request." : "For example, a quote or purchase order."}
          required={kind === "Reimbursement"} files={files} onChange={setFiles} error={errors["pay-files"]} />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-6">
        <FieldError id="pay-certify" message={errors["pay-certify"]} />
        <div className="flex items-start gap-3">
          <input id="pay-certify" type="checkbox" className="mt-1 h-5 w-5" checked={certify}
            aria-invalid={!!errors["pay-certify"]} aria-describedby={describedBy("pay-certify")}
            onChange={(e) => setCertify(e.target.checked)} />
          <label htmlFor="pay-certify" className="text-zinc-900">
            I certify that these costs are allowable under the grant agreement and are not being paid
            from any other source. <span aria-hidden="true">*</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving}
          className="rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900 disabled:bg-zinc-500">
          {saving ? "Submitting…" : "Submit payment request"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded border border-blue-800 bg-white px-5 py-3 font-medium text-blue-800 hover:bg-blue-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
