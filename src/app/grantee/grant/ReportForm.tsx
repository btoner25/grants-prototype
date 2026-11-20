"use client";

import { useRef, useState } from "react";
import ErrorSummary, { FieldError } from "@/components/ErrorSummary";
import FileUpload from "@/components/FileUpload";
import { longDate } from "@/lib/data";
import { saveAttachments } from "@/lib/fileStore";
import { newId, nowIso } from "@/lib/formTypes";
import type { GranteeGrant, ReportRow } from "@/lib/granteeData";
import { addGranteeReport } from "@/lib/localStore";

const inputClass = "w-full rounded border border-zinc-500 bg-white px-3 py-2";

export default function ReportForm({
  grant,
  period,
  releasesHold,
  onCancel,
  onDone,
}: {
  grant: GranteeGrant;
  period: ReportRow;
  releasesHold: boolean;
  onCancel: () => void;
  onDone: (message: string) => void;
}) {
  // A resubmission starts from the earlier answers (attachments are added again).
  const prev = period.submitted;
  const [activities, setActivities] = useState(prev?.activities ?? "");
  const [people, setPeople] = useState(prev ? String(prev.peopleServed) : "");
  const [spent, setSpent] = useState(prev ? String(prev.expenditures) : "");
  const [challenges, setChallenges] = useState(prev?.challenges ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [certify, setCertify] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const describedBy = (id: string, hint = false) =>
    [hint ? `${id}-hint` : "", errors[id] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

  function validate() {
    const e: Record<string, string> = {};
    if (!activities.trim()) e["rep-activities"] = "Describe the activities you completed this period.";
    if (people === "" || !/^\d+$/.test(people)) e["rep-people"] = "Enter the number of people served, as a whole number.";
    if (spent === "" || Number.isNaN(Number(spent))) e["rep-spent"] = "Enter the amount you spent this period.";
    if (!certify) e["rep-certify"] = "Confirm the certification to submit.";
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
      addGranteeReport({
        id: newId("rpt").toUpperCase(),
        grantId: grant.id,
        reportId: period.id,
        submittedAt: nowIso(),
        activities: activities.trim(),
        peopleServed: Number(people),
        expenditures: Number(spent),
        challenges: challenges.trim(),
        attachments,
      });
      onDone(
        `Your ${period.label} progress report was ${prev ? "resubmitted" : "submitted"}${
          attachments.length ? ` with ${attachments.length} attachment${attachments.length === 1 ? "" : "s"}` : ""
        }.${releasesHold ? " Payments are no longer on hold for this report." : ""}`,
      );
    } catch {
      setSaving(false);
      setErrors({ "rep-files": "Your attachments couldn't be saved. Try again, or remove them and resubmit." });
      setTimeout(() => summaryRef.current?.focus(), 0);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-6">
      <p className="text-zinc-700">
        Reporting period {longDate(period.periodStart)} to {longDate(period.periodEnd)}. Due{" "}
        {longDate(period.due)}. Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {prev?.review && (
        <div className="rounded-lg border-l-4 border-orange-600 bg-orange-50 p-4 text-zinc-900">
          <h3 className="font-semibold">Changes requested by {prev.review.reviewer}</h3>
          <p className="mt-1 whitespace-pre-line">{prev.review.comment}</p>
          <p className="mt-2 text-sm text-zinc-700">
            Your earlier answers are filled in below. Attach any supporting documents again.
          </p>
        </div>
      )}

      <ErrorSummary ref={summaryRef} items={Object.entries(errors).map(([target, message]) => ({ target, message }))} />

      <div className="flex flex-col gap-5 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="rep-activities" className="font-medium text-zinc-900">
            Activities completed <span aria-hidden="true">*</span>
          </label>
          <p id="rep-activities-hint" className="text-sm text-zinc-700">
            What did you do this period, and how does it compare with your work plan?
          </p>
          <FieldError id="rep-activities" message={errors["rep-activities"]} />
          <textarea id="rep-activities" rows={6} className={inputClass} value={activities} aria-required
            aria-invalid={!!errors["rep-activities"]} aria-describedby={describedBy("rep-activities", true)}
            onChange={(e) => setActivities(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="rep-people" className="font-medium text-zinc-900">
              People served this period <span aria-hidden="true">*</span>
            </label>
            <FieldError id="rep-people" message={errors["rep-people"]} />
            <input id="rep-people" inputMode="numeric" className={`${inputClass} max-w-[12rem]`} value={people}
              aria-required aria-invalid={!!errors["rep-people"]} aria-describedby={describedBy("rep-people")}
              onChange={(e) => setPeople(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="rep-spent" className="font-medium text-zinc-900">
              Grant funds spent this period <span aria-hidden="true">*</span>
            </label>
            <FieldError id="rep-spent" message={errors["rep-spent"]} />
            <div className="flex max-w-[14rem] items-center gap-1">
              <span aria-hidden="true">$</span>
              <input id="rep-spent" inputMode="decimal" className={`${inputClass} text-right`} value={spent}
                aria-required aria-invalid={!!errors["rep-spent"]} aria-describedby={describedBy("rep-spent")}
                onChange={(e) => setSpent(e.target.value.replace(/[^0-9.]/g, ""))} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="rep-challenges" className="font-medium text-zinc-900">
            Challenges or changes (optional)
          </label>
          <p id="rep-challenges-hint" className="text-sm text-zinc-700">
            Tell us about delays, budget changes or anything your grant manager should know.
          </p>
          <textarea id="rep-challenges" rows={3} className={inputClass} value={challenges}
            aria-describedby="rep-challenges-hint" onChange={(e) => setChallenges(e.target.value)} />
        </div>

        <FileUpload id="rep-files" label="Supporting documents (optional)"
          hint="For example: participant data, photos, sign-in sheets or a financial summary."
          files={files} onChange={setFiles} error={errors["rep-files"]} />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-6">
        <FieldError id="rep-certify" message={errors["rep-certify"]} />
        <div className="flex items-start gap-3">
          <input id="rep-certify" type="checkbox" className="mt-1 h-5 w-5" checked={certify}
            aria-invalid={!!errors["rep-certify"]} aria-describedby={describedBy("rep-certify")}
            onChange={(e) => setCertify(e.target.checked)} />
          <label htmlFor="rep-certify" className="text-zinc-900">
            I certify that this report is accurate and complete to the best of my knowledge.{" "}
            <span aria-hidden="true">*</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving}
          className="rounded bg-blue-800 px-5 py-3 font-medium text-white hover:bg-blue-900 disabled:bg-zinc-500">
          {saving ? "Submitting…" : prev ? "Resubmit progress report" : "Submit progress report"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded border border-blue-800 bg-white px-5 py-3 font-medium text-blue-800 hover:bg-blue-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
