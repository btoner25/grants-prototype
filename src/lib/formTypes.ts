// Types and helpers for staff-built funding opportunities and their custom forms.
import type { Opportunity } from "./data";

export type FieldType =
  | "section"
  | "short_text"
  | "long_text"
  | "number"
  | "currency"
  | "date"
  | "email"
  | "select"
  | "radio"
  | "checkboxes"
  | "file";

export const fieldTypes: { type: FieldType; label: string; hint: string }[] = [
  { type: "short_text", label: "Short answer", hint: "One line of text, like a name or title." },
  { type: "long_text", label: "Paragraph", hint: "Several sentences, like a project narrative." },
  { type: "number", label: "Number", hint: "A whole or decimal number." },
  { type: "currency", label: "Dollar amount", hint: "A dollar figure." },
  { type: "date", label: "Date", hint: "A calendar date." },
  { type: "email", label: "Email address", hint: "Checked for a valid format." },
  { type: "select", label: "Dropdown", hint: "Choose one option from a list." },
  { type: "radio", label: "Multiple choice", hint: "Choose one option, all shown at once." },
  { type: "checkboxes", label: "Checkboxes", hint: "Choose any number of options." },
  { type: "file", label: "File upload", hint: "Attach a document." },
  { type: "section", label: "Section heading", hint: "A heading that groups the questions after it." },
];

export const fieldTypeLabel = (t: FieldType) =>
  fieldTypes.find((f) => f.type === t)?.label ?? t;

export const usesOptions = (t: FieldType) =>
  t === "select" || t === "radio" || t === "checkboxes";
export const usesMaxLength = (t: FieldType) => t === "short_text" || t === "long_text";

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  help: string;
  required: boolean;
  options: string[]; // raw lines; blank lines are ignored
  maxLength: string; // "" means no limit
};

export type CustomOpportunity = {
  id: string;
  title: string;
  agency: string;
  summary: string;
  description: string;
  eligible: string[];
  fundingSource: "State" | "Federal pass-through";
  totalFunds: string;
  maxAward: string;
  opens: string;
  closes: string;
  contact: string;
  fields: FormField[];
  published: boolean;
  updatedAt: string;
};

export type Submission = {
  id: string;
  opportunityId: string;
  submittedAt: string;
  organization: string;
  amount: number;
  values: Record<string, string | string[]>;
};

export const agencies = [
  "Department of Administration",
  "Department of Commerce",
  "Department of Education",
  "Department of Employment and Economic Development",
  "Department of Health",
  "Department of Human Services",
  "Department of Natural Resources",
  "Pollution Control Agency",
  "State Arts Board",
];

export const eligibleTypes = [
  "Nonprofits",
  "Local governments",
  "Tribal nations",
  "Schools",
  "Soil and water districts",
  "Businesses",
];

let counter = 0;
export function newId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function statusOf(o: CustomOpportunity): Opportunity["status"] {
  const t = todayIso();
  if (o.opens && t < o.opens) return "Forecast";
  if (o.closes && t > o.closes) return "Closed";
  return "Open";
}

export const cleanOptions = (f: FormField) =>
  f.options.map((s) => s.trim()).filter(Boolean);

export function blankOpportunity(): CustomOpportunity {
  return {
    id: newId("opp"),
    title: "",
    agency: "",
    summary: "",
    description: "",
    eligible: [],
    fundingSource: "State",
    totalFunds: "",
    maxAward: "",
    opens: "",
    closes: "",
    contact: "",
    fields: [],
    published: false,
    updatedAt: nowIso(),
  };
}

const q = (
  type: FieldType,
  label: string,
  extra: Partial<FormField> = {},
): FormField => ({
  id: newId("q"),
  type,
  label,
  help: "",
  required: false,
  options: [],
  maxLength: "",
  ...extra,
});

export function sampleOpportunity(): CustomOpportunity {
  return {
    ...blankOpportunity(),
    title: "Small Business Energy Efficiency Grants",
    agency: "Department of Commerce",
    summary: "Matching grants that help small businesses cut energy use and costs.",
    description:
      "Funds lighting, heating and cooling, insulation and refrigeration upgrades for Minnesota businesses with fewer than 50 employees. A 50% match is required.",
    eligible: ["Businesses", "Nonprofits"],
    totalFunds: "1000000",
    maxAward: "50000",
    opens: "2026-11-15",
    closes: "2027-02-26",
    contact: "energy.grants@example.gov",
    fields: [
      q("section", "About your business"),
      q("select", "Business type", {
        required: true,
        options: ["Retail", "Restaurant or food service", "Manufacturing", "Agriculture", "Other"],
      }),
      q("number", "Number of employees", { required: true }),
      q("section", "Your project", {
        help: "Tell us what you plan to upgrade and what you expect to save.",
      }),
      q("checkboxes", "Which upgrades are included?", {
        required: true,
        options: ["Lighting", "Heating and cooling", "Insulation", "Refrigeration", "Other"],
      }),
      q("long_text", "Describe your project", {
        required: true,
        maxLength: "1500",
        help: "Include the equipment you will replace and your timeline.",
      }),
      q("currency", "Estimated annual energy savings", { required: true }),
      q("radio", "Have you had an energy audit in the last two years?", {
        required: true,
        options: ["Yes", "No"],
      }),
      q("file", "Energy audit report", { help: "Optional. PDF preferred." }),
    ],
  };
}

export function toListing(o: CustomOpportunity): Opportunity {
  return {
    id: o.id,
    title: o.title,
    agency: o.agency,
    summary: o.summary,
    description: o.description,
    eligible: o.eligible,
    fundingSource: o.fundingSource,
    totalFunds: Number(o.totalFunds) || 0,
    maxAward: Number(o.maxAward) || 0,
    opens: o.opens,
    closes: o.closes,
    status: statusOf(o),
    contact: o.contact,
    href: `/grant?id=${encodeURIComponent(o.id)}`,
  };
}

export type PublishIssue = { step: 1 | 2; targetId: string; message: string };

export function validateForPublish(o: CustomOpportunity): PublishIssue[] {
  const issues: PublishIssue[] = [];
  const d = (targetId: string, message: string) => issues.push({ step: 1, targetId, message });
  if (!o.title.trim()) d("d-title", "Enter a title.");
  if (!o.agency) d("d-agency", "Choose the agency offering the grant.");
  if (!o.summary.trim()) d("d-summary", "Enter a one-sentence summary.");
  if (o.eligible.length === 0) d("d-elig-0", "Choose at least one type of eligible applicant.");
  const total = Number(o.totalFunds);
  const max = Number(o.maxAward);
  if (!total || total <= 0) d("d-total", "Enter the total funds available.");
  if (!max || max <= 0) d("d-max", "Enter the maximum award.");
  else if (total > 0 && max > total) d("d-max", "The maximum award can't be more than the total funds.");
  if (!o.opens) d("d-opens", "Enter the date applications open.");
  if (!o.closes) d("d-closes", "Enter the application deadline.");
  else if (o.opens && o.closes <= o.opens) d("d-closes", "The deadline must be after the open date.");
  if (!/^\S+@\S+\.\S+$/.test(o.contact.trim())) d("d-contact", "Enter a contact email address.");

  o.fields.forEach((f, i) => {
    const n = i + 1;
    if (!f.label.trim())
      issues.push({
        step: 2,
        targetId: `label-${f.id}`,
        message: f.type === "section" ? `Item ${n} needs a section heading.` : `Item ${n} needs question text.`,
      });
    if (usesOptions(f.type) && cleanOptions(f).length < 2)
      issues.push({ step: 2, targetId: `opts-${f.id}`, message: `Item ${n} needs at least two answer options.` });
  });
  return issues;
}

/** The local calendar date (YYYY-MM-DD) of an ISO timestamp, so evening
 * submissions in Minnesota don't show up dated the next day (UTC). */
export function localDay(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
