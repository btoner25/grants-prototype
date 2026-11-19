"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/data";

type Fields = {
  orgName: string;
  uei: string;
  contactName: string;
  contactEmail: string;
  projectTitle: string;
  summary: string;
  startDate: string;
  endDate: string;
  certify: boolean;
};

const budgetLines = ["Personnel", "Supplies", "Travel", "Contracted services", "Other"];
const SUMMARY_MAX = 1000;

const inputClass = "w-full rounded border border-zinc-500 px-3 py-2";

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-medium text-zinc-900">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-zinc-700">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-800">
          Error: {error}
        </p>
      )}
      {children}
    </div>
  );
}

export default function ApplicationForm({
  opportunityTitle,
  maxAward,
}: {
  opportunityTitle: string;
  maxAward: number;
}) {
  const [f, setF] = useState<Fields>({
    orgName: "",
    uei: "",
    contactName: "",
    contactEmail: "",
    projectTitle: "",
    summary: "",
    startDate: "",
    endDate: "",
    certify: false,
  });
  const [budget, setBudget] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftNote, setDraftNote] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const total = budgetLines.reduce((sum, l) => sum + (Number(budget[l]) || 0), 0);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const describedBy = (id: string, hint?: boolean) =>
    [hint ? `${id}-hint` : "", errors[id] ? `${id}-error` : ""].filter(Boolean).join(" ") ||
    undefined;

  function validate() {
    const e: Record<string, string> = {};
    if (!f.orgName.trim()) e.orgName = "Enter your organization's legal name.";
    if (!/^[A-Za-z0-9]{12}$/.test(f.uei.trim()))
      e.uei = "Enter a 12-character Unique Entity ID (letters and numbers).";
    if (!f.contactName.trim()) e.contactName = "Enter a contact name.";
    if (!/^\S+@\S+\.\S+$/.test(f.contactEmail.trim()))
      e.contactEmail = "Enter an email address like name@example.org.";
    if (!f.projectTitle.trim()) e.projectTitle = "Enter a project title.";
    if (!f.summary.trim()) e.summary = "Enter a project summary.";
    if (!f.startDate) e.startDate = "Enter a project start date.";
    if (!f.endDate) e.endDate = "Enter a project end date.";
    else if (f.startDate && f.endDate <= f.startDate)
      e.endDate = "The end date must be after the start date.";
    if (total <= 0) e.budget = "Enter at least one budget amount.";
    else if (total > maxAward)
      e.budget = `Your total of ${money(total)} is more than the ${money(maxAward)} maximum award.`;
    if (!f.certify) e.certify = "Confirm the certification to submit.";
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setReceipt("APP-2071"); // Fixed sample number; the real system would assign one.
  }

  useEffect(() => {
    if (receipt) doneRef.current?.focus();
  }, [receipt]);

  if (receipt) {
    return (
      <section className="mt-8 rounded-lg border border-green-300 bg-green-50 p-6">
        <h2 ref={doneRef} tabIndex={-1} className="text-2xl font-semibold text-green-950">
          Application submitted
        </h2>
        <p className="mt-3 text-green-950">
          Your confirmation number is <strong>{receipt}</strong>. In the real system you
          would get an email receipt, and the application would be locked from editing.
        </p>
        <p className="mt-2 text-green-950">
          This is a prototype, so nothing was saved.
        </p>
        <Link href="/opportunities" className="mt-4 inline-block text-blue-800 underline">
          Back to funding opportunities
        </Link>
      </section>
    );
  }

  const errorList = Object.entries(errors);

  return (
    <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-8">
      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="rounded-lg border-2 border-red-700 bg-red-50 p-4"
        >
          <h2 id="error-summary-title" className="text-lg font-semibold text-red-900">
            There {errorList.length === 1 ? "is 1 problem" : `are ${errorList.length} problems`} with
            your application
          </h2>
          <ul className="mt-2 list-disc pl-6">
            {errorList.map(([id, msg]) => (
              <li key={id}>
                <a href={`#${id === "budget" ? "budget-Personnel" : id}`} className="text-red-900 underline">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 text-xl font-semibold text-zinc-900">1. Your organization</legend>
        <Field id="orgName" label="Legal name of organization" required error={errors.orgName}>
          <input id="orgName" className={inputClass} value={f.orgName} autoComplete="organization"
            aria-invalid={!!errors.orgName} aria-describedby={describedBy("orgName")}
            onChange={(e) => set("orgName", e.target.value)} />
        </Field>
        <Field id="uei" label="Unique Entity ID (UEI)" required error={errors.uei}
          hint="Your 12-character ID from SAM.gov. For this prototype, any 12 letters or numbers work.">
          <input id="uei" className={`${inputClass} max-w-xs font-mono uppercase`} value={f.uei} maxLength={12}
            aria-invalid={!!errors.uei} aria-describedby={describedBy("uei", true)}
            onChange={(e) => set("uei", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="contactName" label="Contact name" required error={errors.contactName}>
            <input id="contactName" className={inputClass} value={f.contactName} autoComplete="name"
              aria-invalid={!!errors.contactName} aria-describedby={describedBy("contactName")}
              onChange={(e) => set("contactName", e.target.value)} />
          </Field>
          <Field id="contactEmail" label="Contact email" required error={errors.contactEmail}>
            <input id="contactEmail" type="email" className={inputClass} value={f.contactEmail} autoComplete="email"
              aria-invalid={!!errors.contactEmail} aria-describedby={describedBy("contactEmail")}
              onChange={(e) => set("contactEmail", e.target.value)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 text-xl font-semibold text-zinc-900">2. Your project</legend>
        <Field id="projectTitle" label="Project title" required error={errors.projectTitle}>
          <input id="projectTitle" className={inputClass} value={f.projectTitle}
            aria-invalid={!!errors.projectTitle} aria-describedby={describedBy("projectTitle")}
            onChange={(e) => set("projectTitle", e.target.value)} />
        </Field>
        <Field id="summary" label="Project summary" required error={errors.summary}
          hint={`Describe the need, what you will do and who will benefit. Up to ${SUMMARY_MAX} characters.`}>
          <textarea id="summary" rows={6} className={inputClass} value={f.summary} maxLength={SUMMARY_MAX}
            aria-invalid={!!errors.summary} aria-describedby={[describedBy("summary", true), "summary-count"].join(" ")}
            onChange={(e) => set("summary", e.target.value)} />
          <p id="summary-count" className="text-sm text-zinc-700">
            {SUMMARY_MAX - f.summary.length} characters remaining
          </p>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="startDate" label="Start date" required error={errors.startDate}>
            <input id="startDate" type="date" className={inputClass} value={f.startDate}
              aria-invalid={!!errors.startDate} aria-describedby={describedBy("startDate")}
              onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field id="endDate" label="End date" required error={errors.endDate}>
            <input id="endDate" type="date" className={inputClass} value={f.endDate}
              aria-invalid={!!errors.endDate} aria-describedby={describedBy("endDate")}
              onChange={(e) => set("endDate", e.target.value)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6"
        aria-describedby={errors.budget ? "budget-error" : undefined}>
        <legend className="px-1 text-xl font-semibold text-zinc-900">3. Budget</legend>
        <p className="text-sm text-zinc-700">Enter whole dollars. Leave a line blank if it doesn&apos;t apply.</p>
        {errors.budget && (
          <p id="budget-error" className="text-sm font-medium text-red-800">Error: {errors.budget}</p>
        )}
        <div className="flex flex-col gap-3">
          {budgetLines.map((line) => (
            <div key={line} className="grid grid-cols-[1fr_auto] items-center gap-4 sm:grid-cols-[16rem_12rem]">
              <label htmlFor={`budget-${line}`} className="text-zinc-900">{line}</label>
              <div className="flex items-center gap-1">
                <span aria-hidden="true">$</span>
                <input id={`budget-${line}`} inputMode="numeric" className={`${inputClass} text-right`}
                  value={budget[line] ?? ""}
                  onChange={(e) => setBudget((b) => ({ ...b, [line]: e.target.value.replace(/[^0-9]/g, "") }))} />
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-zinc-200 pt-3 text-lg font-semibold text-zinc-900" aria-live="polite">
          Total request: {money(total)}{" "}
          <span className="text-sm font-normal text-zinc-700">of {money(maxAward)} maximum</span>
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 text-xl font-semibold text-zinc-900">4. Data privacy and certification</legend>
        <div className="rounded border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-800">
          <h3 className="font-semibold text-zinc-900">How we use your information</h3>
          <p className="mt-1">
            We collect this information to evaluate your application for {opportunityTitle}. You
            are not required to provide it, but we cannot consider an incomplete application.
            Your organization&apos;s name, address and requested amount become public when
            applications are opened. Other information becomes public once the evaluation is
            complete, except trade secret data. (Minn. Stat. §13.599)
          </p>
        </div>
        <Field id="certify" label="" error={errors.certify}>
          <div className="flex items-start gap-3">
            <input id="certify" type="checkbox" className="mt-1 h-5 w-5" checked={f.certify}
              aria-invalid={!!errors.certify} aria-describedby={describedBy("certify")}
              onChange={(e) => set("certify", e.target.checked)} />
            <label htmlFor="certify" className="text-zinc-900">
              I certify that the information in this application is true and complete, and that I
              am authorized to submit it for my organization. <span aria-hidden="true">*</span>
            </label>
          </div>
        </Field>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
          Submit application
        </button>
        <button type="button" onClick={() => setDraftNote("Draft saved. (Prototype: nothing is actually stored.)")}
          className="rounded border border-blue-800 bg-white px-5 py-3 font-medium text-blue-800 hover:bg-blue-50">
          Save draft
        </button>
        <p role="status" className="text-sm text-zinc-700">{draftNote}</p>
      </div>
    </form>
  );
}
