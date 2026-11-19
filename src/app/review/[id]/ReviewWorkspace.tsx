"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money, rubric, type Application } from "@/lib/data";

type Coi = "none" | "conflict" | null;

export default function ReviewWorkspace({ app }: { app: Application }) {
  const [coiChoice, setCoiChoice] = useState<Coi>(null);
  const [coiConfirmed, setCoiConfirmed] = useState<Coi>(null);
  const [coiError, setCoiError] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const total = rubric.reduce((s, r) => s + (Number(scores[r.id]) || 0), 0);
  const maxTotal = rubric.reduce((s, r) => s + r.max, 0);

  useEffect(() => {
    if (coiConfirmed || submitted) headingRef.current?.focus();
  }, [coiConfirmed, submitted]);

  // Step 1: conflict-of-interest declaration (Minn. Stat. §16B.98, subd. 3).
  if (!coiConfirmed) {
    return (
      <form
        className="mt-8 rounded-lg border border-zinc-200 bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!coiChoice) return setCoiError("Choose one option to continue.");
          setCoiError("");
          setCoiConfirmed(coiChoice);
        }}
      >
        <fieldset aria-describedby={coiError ? "coi-error" : "coi-hint"}>
          <legend className="text-xl font-semibold text-zinc-900">
            Conflict of interest declaration
          </legend>
          <p id="coi-hint" className="mt-2 text-zinc-700">
            Before you can see this application, confirm whether you have a conflict of
            interest with <strong>{app.organization}</strong>. A conflict includes a financial
            interest, employment, board service or a close personal relationship.
          </p>
          {coiError && (
            <p id="coi-error" role="alert" className="mt-2 font-medium text-red-800">
              Error: {coiError}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <input id="coi-none" type="radio" name="coi" value="none" className="mt-1 h-5 w-5"
                checked={coiChoice === "none"} onChange={() => setCoiChoice("none")} />
              <label htmlFor="coi-none">
                I have no actual or potential conflict of interest with this applicant.
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input id="coi-conflict" type="radio" name="coi" value="conflict" className="mt-1 h-5 w-5"
                checked={coiChoice === "conflict"} onChange={() => setCoiChoice("conflict")} />
              <label htmlFor="coi-conflict">
                I have an actual or potential conflict of interest and will not review it.
              </label>
            </div>
          </div>
        </fieldset>
        <button type="submit" className="mt-6 rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
          Continue
        </button>
      </form>
    );
  }

  if (coiConfirmed === "conflict") {
    return (
      <section className="mt-8 rounded-lg border border-zinc-300 bg-white p-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-zinc-900">
          You have been recused from this application
        </h2>
        <p className="mt-2 text-zinc-800">
          Your declaration was recorded, and the program manager will reassign this application.
          You will not see its contents.
        </p>
        <Link href="/review" className="mt-4 inline-block text-blue-800 underline">Back to review queue</Link>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="mt-8 rounded-lg border border-green-300 bg-green-50 p-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-green-950">
          Scores submitted: {total} of {maxTotal}
        </h2>
        <p className="mt-2 text-green-950">Prototype: nothing was saved.</p>
        <Link href="/review" className="mt-4 inline-block text-blue-800 underline">Back to review queue</Link>
      </section>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const r of rubric) {
      const v = scores[r.id];
      const n = Number(v);
      if (v === undefined || v === "" || Number.isNaN(n) || n < 0 || n > r.max)
        errs[r.id] = `Enter a score from 0 to ${r.max}.`;
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
    else document.getElementById(`score-${Object.keys(errs)[0]}`)?.focus();
  }

  return (
    <>
      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6" aria-labelledby="app-summary">
        <h2 id="app-summary" ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-zinc-900">
          {app.projectTitle}
        </h2>
        <p className="mt-1 text-zinc-700">{app.organization} · Requested {money(app.requested)}</p>
        <p className="mt-4 text-zinc-800">
          (Sample application text.) This program will recruit and train 40 volunteer mentors and
          match them with young people referred by local schools. Mentors meet weekly for a year.
          We will track school attendance and a validated youth well-being survey at intake and at
          12 months.
        </p>
      </section>

      <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-zinc-900">Score this application</h2>
        {rubric.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-200 bg-white p-5">
            <label htmlFor={`score-${r.id}`} className="font-semibold text-zinc-900">
              {r.label} (0 to {r.max} points)
            </label>
            <p id={`help-${r.id}`} className="mt-1 text-sm text-zinc-700">{r.help}</p>
            {errors[r.id] && (
              <p id={`err-${r.id}`} className="mt-1 text-sm font-medium text-red-800">Error: {errors[r.id]}</p>
            )}
            <input
              id={`score-${r.id}`}
              type="number"
              min={0}
              max={r.max}
              inputMode="numeric"
              className="mt-2 w-24 rounded border border-zinc-500 px-3 py-2"
              value={scores[r.id] ?? ""}
              aria-invalid={!!errors[r.id]}
              aria-describedby={[`help-${r.id}`, errors[r.id] ? `err-${r.id}` : ""].filter(Boolean).join(" ")}
              onChange={(e) => setScores((s) => ({ ...s, [r.id]: e.target.value }))}
            />
            <label htmlFor={`comment-${r.id}`} className="mt-3 block text-sm font-medium text-zinc-900">
              Comments (optional)
            </label>
            <textarea
              id={`comment-${r.id}`}
              rows={2}
              className="mt-1 w-full rounded border border-zinc-500 px-3 py-2"
              value={comments[r.id] ?? ""}
              onChange={(e) => setComments((c) => ({ ...c, [r.id]: e.target.value }))}
            />
          </div>
        ))}
        <p className="text-lg font-semibold text-zinc-900" aria-live="polite">
          Total: {total} of {maxTotal}
        </p>
        <button type="submit" className="self-start rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900">
          Submit scores
        </button>
      </form>
    </>
  );
}
