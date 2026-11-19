"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/data";
import {
  cleanOptions,
  newId,
  nowIso,
  type CustomOpportunity,
  type FormField,
} from "@/lib/formTypes";
import { addSubmission } from "@/lib/localStore";

type Value = string | string[];
const inputClass = "w-full rounded border border-zinc-500 bg-white px-3 py-2";
const groupTypes = new Set(["radio", "checkboxes"]);

/**
 * Renders an applicant form from a staff-built opportunity.
 * mode="preview" is used inside the builder: it validates but saves nothing.
 */
export default function DynamicForm({
  opp,
  mode,
}: {
  opp: CustomOpportunity;
  mode: "live" | "preview";
}) {
  const p = mode === "preview" ? "pv-" : ""; // keeps preview ids distinct from builder ids
  const [values, setValues] = useState<Record<string, Value>>({});
  const [certify, setCertify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const maxAward = Number(opp.maxAward) || 0;

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const str = (id: string) => (typeof values[id] === "string" ? (values[id] as string) : "");
  const arr = (id: string) => (Array.isArray(values[id]) ? (values[id] as string[]) : []);
  const setVal = (id: string, v: Value) => setValues((prev) => ({ ...prev, [id]: v }));

  const fieldById = (id: string) => opp.fields.find((f) => f.id === id);
  const targetId = (key: string) =>
    groupTypes.has(fieldById(key)?.type ?? "") ? `${p}${key}-0` : `${p}${key}`;

  const describedBy = (id: string, hint: boolean) =>
    [hint ? `${p}${id}-hint` : "", errors[id] ? `${p}${id}-error` : ""].filter(Boolean).join(" ") ||
    undefined;

  function validate() {
    const e: Record<string, string> = {};
    if (!str("std-org").trim()) e["std-org"] = "Enter your organization's legal name.";
    if (!/^[A-Za-z0-9]{12}$/.test(str("std-uei").trim()))
      e["std-uei"] = "Enter a 12-character Unique Entity ID (letters and numbers).";
    if (!str("std-contact").trim()) e["std-contact"] = "Enter a contact name.";
    if (!/^\S+@\S+\.\S+$/.test(str("std-email").trim()))
      e["std-email"] = "Enter an email address like name@example.org.";
    const amt = Number(str("std-amount"));
    if (!str("std-amount") || !amt) e["std-amount"] = "Enter the amount you are requesting.";
    else if (maxAward && amt > maxAward)
      e["std-amount"] = `Your request of ${money(amt)} is more than the ${money(maxAward)} maximum award.`;

    for (const f of opp.fields) {
      if (f.type === "section") continue;
      const name = f.label.trim() || "this question";
      if (f.type === "checkboxes") {
        if (f.required && arr(f.id).length === 0) e[f.id] = `Choose at least one option for "${name}".`;
        continue;
      }
      const v = str(f.id).trim();
      if (!v) {
        if (f.required)
          e[f.id] =
            f.type === "file"
              ? `Attach a file for "${name}".`
              : f.type === "select" || f.type === "radio"
                ? `Choose an option for "${name}".`
                : `Answer "${name}".`;
        continue;
      }
      if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(v))
        e[f.id] = `Enter a valid email address for "${name}".`;
      if ((f.type === "number" || f.type === "currency") && Number.isNaN(Number(v)))
        e[f.id] = `Enter a number for "${name}".`;
    }
    if (!certify) e["std-certify"] = "Confirm the certification to submit.";
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
    if (mode === "preview") {
      setDone("PREVIEW");
      return;
    }
    const id = newId("sub").toUpperCase();
    addSubmission({
      id,
      opportunityId: opp.id,
      submittedAt: nowIso(),
      organization: str("std-org").trim(),
      amount: Number(str("std-amount")),
      values,
    });
    setDone(id);
  }

  function reset() {
    setValues({});
    setCertify(false);
    setErrors({});
    setDone(null);
  }

  if (done) {
    return (
      <section className="mt-6 rounded-lg border border-green-300 bg-green-50 p-6">
        <h2 ref={doneRef} tabIndex={-1} className="text-2xl font-semibold text-green-950">
          {mode === "preview" ? "Preview: the form passed every check" : "Application submitted"}
        </h2>
        {mode === "preview" ? (
          <>
            <p className="mt-3 text-green-950">
              An applicant would see their confirmation number here. Nothing was saved.
            </p>
            <button type="button" onClick={reset}
              className="mt-4 rounded border border-blue-800 bg-white px-4 py-2 font-medium text-blue-800 hover:bg-blue-50">
              Try the preview again
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-green-950">
              Your confirmation number is <strong>{done}</strong>. Program staff can now see your
              application.
            </p>
            <p className="mt-2 text-green-950">
              Prototype: it is stored only in this web browser, on this computer.
            </p>
            <Link href="/opportunities" className="mt-4 inline-block text-blue-800 underline">
              Back to funding opportunities
            </Link>
          </>
        )}
      </section>
    );
  }

  const errorList = Object.entries(errors);

  const label = (id: string, text: string, required: boolean) => (
    <label htmlFor={`${p}${id}`} className="font-medium text-zinc-900">
      {text}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
  const hint = (id: string, text: string) =>
    text ? (
      <p id={`${p}${id}-hint`} className="text-sm text-zinc-700">
        {text}
      </p>
    ) : null;
  const error = (id: string) =>
    errors[id] ? (
      <p id={`${p}${id}-error`} className="text-sm font-medium text-red-800">
        Error: {errors[id]}
      </p>
    ) : null;

  function renderField(f: FormField) {
    const name = f.label.trim() || "Untitled question";
    const hasHint = !!f.help.trim() || (f.type === "long_text" && !!f.maxLength);
    const common = {
      id: `${p}${f.id}`,
      "aria-invalid": !!errors[f.id],
      "aria-describedby": describedBy(f.id, hasHint),
    };

    if (f.type === "section") {
      return (
        <div key={f.id} className="border-t border-zinc-200 pt-4">
          <h3 className="text-lg font-semibold text-zinc-900">{f.label.trim() || "Untitled section"}</h3>
          {f.help.trim() && <p className="mt-1 text-zinc-700">{f.help}</p>}
        </div>
      );
    }

    if (f.type === "radio" || f.type === "checkboxes") {
      const opts = cleanOptions(f);
      return (
        <fieldset key={f.id} className="flex flex-col gap-2"
          aria-describedby={describedBy(f.id, !!f.help.trim())}>
          <legend className="font-medium text-zinc-900">
            {name}
            {f.required && <span aria-hidden="true"> *</span>}
            {f.required && <span className="sr-only"> (required)</span>}
          </legend>
          {hint(f.id, f.help)}
          {error(f.id)}
          {opts.map((o, i) => {
            const id = `${p}${f.id}-${i}`;
            const checked = f.type === "radio" ? str(f.id) === o : arr(f.id).includes(o);
            return (
              <div key={i} className="flex items-start gap-3">
                <input id={id} type={f.type === "radio" ? "radio" : "checkbox"} name={`${p}${f.id}`}
                  value={o} className="mt-1 h-5 w-5" checked={checked}
                  onChange={(e) =>
                    f.type === "radio"
                      ? setVal(f.id, o)
                      : setVal(f.id, e.target.checked ? [...arr(f.id), o] : arr(f.id).filter((x) => x !== o))
                  } />
                <label htmlFor={id} className="text-zinc-900">{o}</label>
              </div>
            );
          })}
        </fieldset>
      );
    }

    const maxLen = Number(f.maxLength) || undefined;
    let control: React.ReactNode;
    switch (f.type) {
      case "long_text":
        control = (
          <>
            <textarea {...common} rows={5} className={inputClass} maxLength={maxLen}
              aria-required={f.required} value={str(f.id)} onChange={(e) => setVal(f.id, e.target.value)} />
            {maxLen && (
              <p className="text-sm text-zinc-700" aria-live="polite">
                {maxLen - str(f.id).length} characters remaining
              </p>
            )}
          </>
        );
        break;
      case "select":
        control = (
          <select {...common} className={inputClass} aria-required={f.required} value={str(f.id)}
            onChange={(e) => setVal(f.id, e.target.value)}>
            <option value="">Choose one</option>
            {cleanOptions(f).map((o, i) => (
              <option key={i} value={o}>{o}</option>
            ))}
          </select>
        );
        break;
      case "currency":
        control = (
          <div className="flex max-w-xs items-center gap-1">
            <span aria-hidden="true">$</span>
            <input {...common} inputMode="decimal" className={`${inputClass} text-right`}
              aria-required={f.required} value={str(f.id)}
              onChange={(e) => setVal(f.id, e.target.value.replace(/[^0-9.]/g, ""))} />
          </div>
        );
        break;
      case "file":
        control = (
          <>
            <input {...common} type="file" className="block w-full text-zinc-900" aria-required={f.required}
              onChange={(e) => setVal(f.id, e.target.files?.[0]?.name ?? "")} />
            <p className="text-sm text-zinc-700">Prototype: only the file name is kept, not the file.</p>
          </>
        );
        break;
      default:
        control = (
          <input {...common}
            type={f.type === "email" ? "email" : f.type === "date" ? "date" : "text"}
            inputMode={f.type === "number" ? "decimal" : undefined}
            className={f.type === "number" || f.type === "date" ? `${inputClass} max-w-xs` : inputClass}
            maxLength={maxLen} aria-required={f.required} value={str(f.id)}
            onChange={(e) => setVal(f.id, e.target.value)} />
        );
    }

    return (
      <div key={f.id} className="flex flex-col gap-1">
        {label(f.id, name, f.required)}
        {hint(f.id, [f.help.trim(), f.type === "long_text" && maxLen ? `Up to ${maxLen} characters.` : ""].filter(Boolean).join(" "))}
        {error(f.id)}
        {control}
      </div>
    );
  }

  const stdInput = (id: string, text: string, opts: { type?: string; hintText?: string; className?: string; autoComplete?: string } = {}) => (
    <div className="flex flex-col gap-1">
      {label(id, text, true)}
      {opts.hintText && hint(id, opts.hintText)}
      {error(id)}
      <input id={`${p}${id}`} type={opts.type ?? "text"} className={opts.className ?? inputClass}
        autoComplete={opts.autoComplete} aria-required aria-invalid={!!errors[id]}
        aria-describedby={describedBy(id, !!opts.hintText)} value={str(id)}
        onChange={(e) => setVal(id, e.target.value)} />
    </div>
  );

  return (
    <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-8">
      <p className="text-zinc-700">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby={`${p}error-summary`}
          className="rounded-lg border-2 border-red-700 bg-red-50 p-4">
          <h2 id={`${p}error-summary`} className="text-lg font-semibold text-red-900">
            There {errorList.length === 1 ? "is 1 problem" : `are ${errorList.length} problems`} with this
            application
          </h2>
          <ul className="mt-2 list-disc pl-6">
            {errorList.map(([id, msg]) => (
              <li key={id}>
                <a href={`#${targetId(id)}`} className="text-red-900 underline">{msg}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section aria-labelledby={`${p}sec-org`} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 id={`${p}sec-org`} className="text-xl font-semibold text-zinc-900">Your organization</h2>
        {stdInput("std-org", "Legal name of organization", { autoComplete: "organization" })}
        {stdInput("std-uei", "Unique Entity ID (UEI)", {
          hintText: "Your 12-character ID from SAM.gov. For this prototype, any 12 letters or numbers work.",
          className: `${inputClass} max-w-xs font-mono uppercase`,
        })}
        <div className="grid gap-4 sm:grid-cols-2">
          {stdInput("std-contact", "Contact name", { autoComplete: "name" })}
          {stdInput("std-email", "Contact email", { type: "email", autoComplete: "email" })}
        </div>
      </section>

      <section aria-labelledby={`${p}sec-app`} className="flex flex-col gap-5 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 id={`${p}sec-app`} className="text-xl font-semibold text-zinc-900">Your application</h2>
        <div className="flex flex-col gap-1">
          {label("std-amount", "Amount requested", true)}
          {hint("std-amount", maxAward ? `Up to ${money(maxAward)}.` : "")}
          {error("std-amount")}
          <div className="flex max-w-xs items-center gap-1">
            <span aria-hidden="true">$</span>
            <input id={`${p}std-amount`} inputMode="numeric" className={`${inputClass} text-right`}
              aria-required aria-invalid={!!errors["std-amount"]}
              aria-describedby={describedBy("std-amount", !!maxAward)} value={str("std-amount")}
              onChange={(e) => setVal("std-amount", e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
        </div>
        {opp.fields.map(renderField)}
      </section>

      <section aria-labelledby={`${p}sec-cert`} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 id={`${p}sec-cert`} className="text-xl font-semibold text-zinc-900">Data privacy and certification</h2>
        <div className="rounded border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-800">
          <h3 className="font-semibold text-zinc-900">How we use your information</h3>
          <p className="mt-1">
            We collect this information to evaluate your application for{" "}
            {opp.title.trim() || "this grant"}. You are not required to provide it, but we cannot
            consider an incomplete application. Your organization&apos;s name, address and requested
            amount become public when applications are opened. Other information becomes public once
            the evaluation is complete, except trade secret data. (Minn. Stat. §13.599)
          </p>
        </div>
        {error("std-certify")}
        <div className="flex items-start gap-3">
          <input id={`${p}std-certify`} type="checkbox" className="mt-1 h-5 w-5" checked={certify}
            aria-invalid={!!errors["std-certify"]} aria-describedby={describedBy("std-certify", false)}
            onChange={(e) => setCertify(e.target.checked)} />
          <label htmlFor={`${p}std-certify`} className="text-zinc-900">
            I certify that the information in this application is true and complete, and that I am
            authorized to submit it for my organization. <span aria-hidden="true">*</span>
          </label>
        </div>
      </section>

      <div>
        <button type="submit" className="rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
          {mode === "preview" ? "Test submit (preview)" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
