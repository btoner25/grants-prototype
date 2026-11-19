"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DynamicForm from "@/components/DynamicForm";
import StatusBadge from "@/components/StatusBadge";
import { longDate, money } from "@/lib/data";
import {
  agencies,
  blankOpportunity,
  eligibleTypes,
  fieldTypeLabel,
  fieldTypes,
  newId,
  nowIso,
  sampleOpportunity,
  statusOf,
  usesMaxLength,
  usesOptions,
  validateForPublish,
  type CustomOpportunity,
  type FieldType,
  type FormField,
  type PublishIssue,
} from "@/lib/formTypes";
import {
  deleteOpportunity,
  saveOpportunity,
  useCustomOpportunities,
  useHydrated,
  useSubmissions,
} from "@/lib/localStore";

const inputClass = "w-full rounded border border-zinc-500 bg-white px-3 py-2";
const btnPrimary = "rounded bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900";
const btnSecondary =
  "rounded border border-blue-800 bg-white px-4 py-2 font-medium text-blue-800 hover:bg-blue-50 disabled:border-zinc-300 disabled:text-zinc-500";

export default function Builder() {
  const list = useCustomOpportunities();
  const subs = useSubmissions();
  const hydrated = useHydrated();
  const [editing, setEditing] = useState<CustomOpportunity | null>(null);
  const [notice, setNotice] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (editing) {
    return (
      <Editor
        key={editing.id}
        initial={editing}
        onClose={(msg) => {
          setEditing(null);
          setNotice(msg ?? "");
          setTimeout(() => headingRef.current?.focus(), 0);
        }}
      />
    );
  }

  const countFor = (id: string) => subs.filter((s) => s.opportunityId === id).length;

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold tracking-tight text-zinc-900">
        Opportunity builder
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-700">
        Create a funding opportunity, design its application form, and publish it to the Find
        Grants page. Every form automatically includes organization details, the amount requested,
        and the data privacy notice and certification.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-zinc-700">
        Prototype: opportunities and applications are saved only in this web browser.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={btnPrimary} onClick={() => setEditing(blankOpportunity())}>
          Create a new opportunity
        </button>
        <button type="button" className={btnSecondary} onClick={() => setEditing(sampleOpportunity())}>
          Start from a sample
        </button>
      </div>

      <p role="status" className="mt-4 font-medium text-green-900">{notice}</p>

      <h2 className="mt-6 text-xl font-semibold text-zinc-900">Your opportunities</h2>
      {!hydrated ? (
        <p className="mt-3 text-zinc-700">Loading…</p>
      ) : list.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-zinc-400 bg-white p-6 text-zinc-700">
          You haven&apos;t created any opportunities yet.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-900">
              <tr>
                <th scope="col" className="px-4 py-3">Opportunity</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Deadline</th>
                <th scope="col" className="px-4 py-3 text-right">Questions</th>
                <th scope="col" className="px-4 py-3 text-right">Applications</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {list.map((o) => {
                const title = o.title.trim() || "Untitled opportunity";
                const n = countFor(o.id);
                return (
                  <tr key={o.id}>
                    <th scope="row" className="px-4 py-3 font-medium text-zinc-900">
                      {title}
                      <span className="block text-xs font-normal text-zinc-600">{o.agency || "No agency yet"}</span>
                    </th>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.published ? statusOf(o) : "Draft"} />
                      {o.published && <span className="sr-only"> (published)</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-800">{o.closes ? longDate(o.closes) : "—"}</td>
                    <td className="px-4 py-3 text-right text-zinc-800">
                      {o.fields.filter((f) => f.type !== "section").length}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-800">{n}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <button type="button" className="text-blue-800 underline"
                          onClick={() => setEditing(JSON.parse(JSON.stringify(o)) as CustomOpportunity)}>
                          Edit<span className="sr-only"> {title}</span>
                        </button>
                        {o.published && (
                          <Link href={`/grant?id=${encodeURIComponent(o.id)}`} className="text-blue-800 underline">
                            View posting<span className="sr-only"> for {title}</span>
                          </Link>
                        )}
                        <button type="button" className="text-red-800 underline"
                          onClick={() => {
                            const extra = n ? ` and its ${n} application${n === 1 ? "" : "s"}` : "";
                            if (window.confirm(`Delete "${title}"${extra}? This can't be undone.`)) {
                              deleteOpportunity(o.id);
                              setNotice(`Deleted "${title}".`);
                              setTimeout(() => headingRef.current?.focus(), 0);
                            }
                          }}>
                          Delete<span className="sr-only"> {title}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const steps = ["Details", "Application questions", "Preview and publish"] as const;

function Editor({
  initial,
  onClose,
}: {
  initial: CustomOpportunity;
  onClose: (message?: string) => void;
}) {
  const [o, setO] = useState(initial);
  const [step, setStep] = useState(0);
  const [issues, setIssues] = useState<PublishIssue[]>([]);
  const [status, setStatus] = useState("");
  const [newType, setNewType] = useState<FieldType>("short_text");
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const stepRef = useRef<HTMLHeadingElement>(null);
  const issuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    h1Ref.current?.focus();
  }, []);

  const set = <K extends keyof CustomOpportunity>(k: K, v: CustomOpportunity[K]) =>
    setO((prev) => ({ ...prev, [k]: v }));
  const setField = (id: string, patch: Partial<FormField>) =>
    setO((prev) => ({ ...prev, fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  const goStep = (n: number, focusId?: string) => {
    setStep(n);
    setTimeout(() => {
      const el = focusId ? document.getElementById(focusId) : null;
      if (el) el.focus();
      else stepRef.current?.focus();
    }, 0);
  };

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= o.fields.length) return;
    const fields = [...o.fields];
    [fields[i], fields[j]] = [fields[j], fields[i]];
    set("fields", fields);
    setStatus(`Moved item ${i + 1} to position ${j + 1}.`);
  }

  function remove(i: number) {
    set("fields", o.fields.filter((_, k) => k !== i));
    setStatus(`Removed item ${i + 1}.`);
    setTimeout(() => document.getElementById("new-type")?.focus(), 0);
  }

  function add() {
    const f: FormField = {
      id: newId("q"),
      type: newType,
      label: "",
      help: "",
      required: false,
      options: usesOptions(newType) ? ["Option 1", "Option 2"] : [],
      maxLength: "",
    };
    set("fields", [...o.fields, f]);
    setStatus(`Added item ${o.fields.length + 1}: ${fieldTypeLabel(newType)}.`);
    setTimeout(() => document.getElementById(`label-${f.id}`)?.focus(), 0);
  }

  function saveDraft() {
    const next = { ...o, updatedAt: nowIso() };
    saveOpportunity(next);
    setO(next);
    setStatus(o.published ? "Changes saved. The posting is updated." : "Draft saved.");
  }

  function publish() {
    const found = validateForPublish(o);
    setIssues(found);
    if (found.length > 0) {
      setTimeout(() => issuesRef.current?.focus(), 0);
      return;
    }
    saveOpportunity({ ...o, published: true, updatedAt: nowIso() });
    onClose(`"${o.title.trim()}" is published on Find Grants.`);
  }

  function unpublish() {
    const next = { ...o, published: false, updatedAt: nowIso() };
    saveOpportunity(next);
    setO(next);
    setStatus("Unpublished. Applicants can no longer see this opportunity.");
  }

  const title = o.title.trim() || "Untitled opportunity";

  return (
    <>
      <button type="button" onClick={() => onClose()} className="text-sm text-blue-800 underline">
        Back to all opportunities
      </button>
      <h1 ref={h1Ref} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        {o.title.trim() ? `Edit: ${o.title.trim()}` : "New funding opportunity"}
      </h1>
      <p className="mt-1 text-zinc-700">
        {o.published ? "Published on Find Grants. Saved changes go live right away." : "Draft. Applicants can't see it yet."}
      </p>

      <nav aria-label="Builder steps" className="mt-6">
        <ol className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <li key={s}>
              <button type="button" onClick={() => goStep(i)} aria-current={step === i ? "step" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  step === i ? "border-blue-800 bg-blue-800 text-white" : "border-zinc-400 bg-white text-zinc-900 hover:bg-zinc-100"
                }`}>
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {issues.length > 0 && (
        <div ref={issuesRef} tabIndex={-1} role="alert" aria-labelledby="issues-title"
          className="mt-6 rounded-lg border-2 border-red-700 bg-red-50 p-4">
          <h2 id="issues-title" className="text-lg font-semibold text-red-900">
            Fix {issues.length === 1 ? "1 problem" : `${issues.length} problems`} before publishing
          </h2>
          <ul className="mt-2 list-disc pl-6">
            {issues.map((iss, k) => (
              <li key={k}>
                <button type="button" className="text-left text-red-900 underline"
                  onClick={() => goStep(iss.step - 1, iss.targetId)}>
                  {steps[iss.step - 1]}: {iss.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section aria-labelledby="step-title" className="mt-6">
        <h2 id="step-title" ref={stepRef} tabIndex={-1} className="text-2xl font-semibold text-zinc-900">
          Step {step + 1}: {steps[step]}
        </h2>

        {step === 0 && <DetailsStep o={o} set={set} />}

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <p className="rounded border border-sky-300 bg-sky-50 p-4 text-sm text-sky-950">
              Always included, so you don&apos;t need to add them: organization name, UEI and contact;
              amount requested (checked against the maximum award); and the data privacy notice and
              certification.
            </p>

            {o.fields.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-400 bg-white p-6 text-zinc-700">
                No custom questions yet. Choose a question type below and select Add.
              </p>
            ) : (
              <ol className="flex flex-col gap-4">
                {o.fields.map((f, i) => (
                  <QuestionCard key={f.id} f={f} index={i} total={o.fields.length}
                    onChange={(patch) => setField(f.id, patch)}
                    onMove={(d) => move(i, d)} onRemove={() => remove(i)} />
                ))}
              </ol>
            )}

            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="new-type" className="font-medium text-zinc-900">Add a question</label>
                <select id="new-type" value={newType} aria-describedby="new-type-hint"
                  onChange={(e) => setNewType(e.target.value as FieldType)}
                  className="rounded border border-zinc-500 bg-white px-3 py-2">
                  {fieldTypes.map((t) => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button type="button" className={btnPrimary} onClick={add}>Add</button>
              <p id="new-type-hint" className="w-full text-sm text-zinc-700">
                {fieldTypes.find((t) => t.type === newType)?.hint}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-6">
            <dl className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
              {[
                ["Title", title],
                ["Agency", o.agency || "—"],
                ["Who can apply", o.eligible.join(", ") || "—"],
                ["Total available", o.totalFunds ? money(Number(o.totalFunds)) : "—"],
                ["Maximum award", o.maxAward ? money(Number(o.maxAward)) : "—"],
                ["Opens", o.opens ? longDate(o.opens) : "—"],
                ["Deadline", o.closes ? longDate(o.closes) : "—"],
                ["Custom questions", String(o.fields.filter((f) => f.type !== "section").length)],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-1 gap-1 px-4 py-2 sm:grid-cols-3">
                  <dt className="font-medium text-zinc-900">{k}</dt>
                  <dd className="text-zinc-800 sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/40 p-4">
              <p className="font-medium text-zinc-900">
                Preview: this is the form applicants will fill in. Try it out. Nothing is saved.
              </p>
              <DynamicForm opp={o} mode="preview" />
            </div>
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-200 py-4">
        {step > 0 && (
          <button type="button" className={btnSecondary} onClick={() => goStep(step - 1)}>
            Back: {steps[step - 1]}
          </button>
        )}
        {step < steps.length - 1 && (
          <button type="button" className={btnSecondary} onClick={() => goStep(step + 1)}>
            Next: {steps[step + 1]}
          </button>
        )}
        <span className="flex-1" />
        <button type="button" className={btnSecondary} onClick={saveDraft}>
          {o.published ? "Save changes" : "Save draft"}
        </button>
        {o.published ? (
          <button type="button" className={btnSecondary} onClick={unpublish}>Unpublish</button>
        ) : (
          <button type="button" className={btnPrimary} onClick={publish}>Publish to Find Grants</button>
        )}
        <p role="status" className="w-full text-sm font-medium text-green-900">{status}</p>
      </div>
    </>
  );
}

function DetailsStep({
  o,
  set,
}: {
  o: CustomOpportunity;
  set: <K extends keyof CustomOpportunity>(k: K, v: CustomOpportunity[K]) => void;
}) {
  const text = (id: string, label: string, key: "title" | "summary" | "contact", extra: { type?: string; hint?: string } = {}) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-zinc-900">{label}</label>
      {extra.hint && <p id={`${id}-hint`} className="text-sm text-zinc-700">{extra.hint}</p>}
      <input id={id} type={extra.type ?? "text"} className={inputClass} value={o[key]}
        aria-describedby={extra.hint ? `${id}-hint` : undefined}
        onChange={(e) => set(key, e.target.value)} />
    </div>
  );

  return (
    <div className="mt-4 flex flex-col gap-5 rounded-lg border border-zinc-200 bg-white p-6">
      {text("d-title", "Title", "title")}
      <div className="flex flex-col gap-1">
        <label htmlFor="d-agency" className="font-medium text-zinc-900">Agency</label>
        <select id="d-agency" className={inputClass} value={o.agency} onChange={(e) => set("agency", e.target.value)}>
          <option value="">Choose an agency</option>
          {agencies.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      {text("d-summary", "Summary", "summary", { hint: "One sentence shown on the Find Grants list." })}
      <div className="flex flex-col gap-1">
        <label htmlFor="d-description" className="font-medium text-zinc-900">Full description</label>
        <textarea id="d-description" rows={4} className={inputClass} value={o.description}
          onChange={(e) => set("description", e.target.value)} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium text-zinc-900">Who can apply</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {eligibleTypes.map((t, i) => (
            <div key={t} className="flex items-center gap-2">
              <input id={`d-elig-${i}`} type="checkbox" className="h-5 w-5" checked={o.eligible.includes(t)}
                onChange={(e) =>
                  set("eligible", e.target.checked ? [...o.eligible, t] : o.eligible.filter((x) => x !== t))
                } />
              <label htmlFor={`d-elig-${i}`} className="text-zinc-900">{t}</label>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium text-zinc-900">Funding source</legend>
        {(["State", "Federal pass-through"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <input id={`d-source-${i}`} type="radio" name="d-source" className="h-5 w-5"
              checked={o.fundingSource === s} onChange={() => set("fundingSource", s)} />
            <label htmlFor={`d-source-${i}`} className="text-zinc-900">{s}</label>
          </div>
        ))}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["d-total", "Total funds available", "totalFunds"],
            ["d-max", "Maximum award", "maxAward"],
          ] as const
        ).map(([id, label, key]) => (
          <div key={id} className="flex flex-col gap-1">
            <label htmlFor={id} className="font-medium text-zinc-900">{label}</label>
            <div className="flex items-center gap-1">
              <span aria-hidden="true">$</span>
              <input id={id} inputMode="numeric" className={`${inputClass} text-right`} value={o[key]}
                onChange={(e) => set(key, e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
          </div>
        ))}
        {(
          [
            ["d-opens", "Applications open", "opens"],
            ["d-closes", "Application deadline", "closes"],
          ] as const
        ).map(([id, label, key]) => (
          <div key={id} className="flex flex-col gap-1">
            <label htmlFor={id} className="font-medium text-zinc-900">{label}</label>
            <input id={id} type="date" className={inputClass} value={o[key]}
              onChange={(e) => set(key, e.target.value)} />
          </div>
        ))}
      </div>
      {text("d-contact", "Contact email for questions", "contact", { type: "email" })}
    </div>
  );
}

function QuestionCard({
  f,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  f: FormField;
  index: number;
  total: number;
  onChange: (patch: Partial<FormField>) => void;
  onMove: (d: number) => void;
  onRemove: () => void;
}) {
  const n = index + 1;
  const isSection = f.type === "section";
  return (
    <li className={`rounded-lg border bg-white p-4 ${isSection ? "border-blue-300 border-l-4 border-l-blue-700" : "border-zinc-200"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-900">
          Item {n}: {fieldTypeLabel(f.type)}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${btnSecondary} px-3 py-1 text-sm`} disabled={index === 0}
            onClick={() => onMove(-1)} aria-label={`Move item ${n} up`}>
            Move up
          </button>
          <button type="button" className={`${btnSecondary} px-3 py-1 text-sm`} disabled={index === total - 1}
            onClick={() => onMove(1)} aria-label={`Move item ${n} down`}>
            Move down
          </button>
          <button type="button" className="rounded border border-red-700 bg-white px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-50"
            onClick={onRemove} aria-label={`Remove item ${n}`}>
            Remove
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`label-${f.id}`} className="font-medium text-zinc-900">
            <span className="sr-only">Item {n}: </span>
            {isSection ? "Section heading" : "Question text"}
          </label>
          <input id={`label-${f.id}`} className={inputClass} value={f.label}
            onChange={(e) => onChange({ label: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`help-${f.id}`} className="font-medium text-zinc-900">
            <span className="sr-only">Item {n}: </span>
            {isSection ? "Description (optional)" : "Help text (optional)"}
          </label>
          <input id={`help-${f.id}`} className={inputClass} value={f.help}
            onChange={(e) => onChange({ help: e.target.value })} />
        </div>
        {usesOptions(f.type) && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`opts-${f.id}`} className="font-medium text-zinc-900"><span className="sr-only">Item {n}: </span>Answer options</label>
            <p id={`opts-hint-${f.id}`} className="text-sm text-zinc-700">One option per line. At least two.</p>
            <textarea id={`opts-${f.id}`} rows={Math.max(3, f.options.length + 1)} className={inputClass}
              aria-describedby={`opts-hint-${f.id}`} value={f.options.join("\n")}
              onChange={(e) => onChange({ options: e.target.value.split("\n") })} />
          </div>
        )}
        {usesMaxLength(f.type) && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`max-${f.id}`} className="font-medium text-zinc-900"><span className="sr-only">Item {n}: </span>Character limit (optional)</label>
            <input id={`max-${f.id}`} inputMode="numeric" className={`${inputClass} max-w-[10rem]`} value={f.maxLength}
              onChange={(e) => onChange({ maxLength: e.target.value.replace(/[^0-9]/g, "") })} />
          </div>
        )}
        {!isSection && (
          <div className="flex items-center gap-2">
            <input id={`req-${f.id}`} type="checkbox" className="h-5 w-5" checked={f.required}
              onChange={(e) => onChange({ required: e.target.checked })} />
            <label htmlFor={`req-${f.id}`} className="text-zinc-900"><span className="sr-only">Item {n}: </span>Applicants must answer this</label>
          </div>
        )}
      </div>
    </li>
  );
}
