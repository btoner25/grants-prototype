// FAKE DATA ONLY. Grantee accounts and active grants for the grantee portal.
// Grant IDs match the staff dashboard's active grants.
import { localDay } from "./formTypes";

export type Attachment = { id: string; name: string; size: number; type: string };

export type ReportPeriod = {
  id: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  due: string;
  submittedOn?: string; // set for reports submitted before the portal existed
};

export type PastPayment = { id: string; date: string; amount: number; kind: "Reimbursement" | "Advance" };

export type GranteeAccount = { id: string; organization: string; contactName: string };

export type GranteeGrant = {
  id: string;
  accountId: string;
  program: string;
  agency: string;
  amount: number;
  startDate: string;
  endDate: string;
  officer: string;
  officerEmail: string;
  budget: { line: string; amount: number }[];
  payments: PastPayment[];
  reports: ReportPeriod[];
};

export type GranteeReport = {
  id: string;
  grantId: string;
  reportId: string;
  submittedAt: string;
  activities: string;
  peopleServed: number;
  expenditures: number;
  challenges: string;
  attachments: Attachment[];
};

export type PaymentRequest = {
  id: string;
  grantId: string;
  submittedAt: string;
  kind: "Reimbursement" | "Advance";
  periodStart: string;
  periodEnd: string;
  lines: Record<string, number>;
  total: number;
  justification: string;
  attachments: Attachment[];
  status: "Pending review";
};

export const granteeAccounts: GranteeAccount[] = [
  { id: "acct-bigwoods", organization: "Big Woods Theater Collective", contactName: "Avery Lindqvist" },
  { id: "acct-lakewood", organization: "Lakewood Food Shelf", contactName: "Sam Okafor" },
  { id: "acct-pinecounty", organization: "Pine County Housing Trust", contactName: "Riley Benson" },
  { id: "acct-mesabi", organization: "Mesabi Workforce Partners", contactName: "Jamie Kowalski" },
];

export const granteeGrants: GranteeGrant[] = [
  {
    id: "GR-2210",
    accountId: "acct-bigwoods",
    program: "Community Arts Access",
    agency: "State Arts Board",
    amount: 38_000,
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    officer: "Morgan Ellis",
    officerEmail: "arts.access@example.gov",
    budget: [
      { line: "Artist fees", amount: 20_000 },
      { line: "Venue and equipment", amount: 8_000 },
      { line: "Marketing", amount: 4_000 },
      { line: "Travel", amount: 6_000 },
    ],
    payments: [
      { id: "PAY-5101", date: "2026-09-15", amount: 9_500, kind: "Advance" },
      { id: "PAY-5188", date: "2026-10-20", amount: 11_900, kind: "Reimbursement" },
    ],
    reports: [
      { id: "r1", label: "First quarter", periodStart: "2026-09-01", periodEnd: "2026-11-30", due: "2026-12-31" },
      { id: "r2", label: "Second quarter", periodStart: "2026-12-01", periodEnd: "2027-02-28", due: "2027-03-31" },
      { id: "r3", label: "Final report", periodStart: "2026-09-01", periodEnd: "2027-08-31", due: "2027-09-30" },
    ],
  },
  {
    id: "GR-2187",
    accountId: "acct-lakewood",
    program: "Hunger Relief",
    agency: "Department of Human Services",
    amount: 120_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    officer: "Dana Whitfield",
    officerEmail: "hunger.relief@example.gov",
    budget: [
      { line: "Food purchases", amount: 80_000 },
      { line: "Staff", amount: 25_000 },
      { line: "Transportation", amount: 10_000 },
      { line: "Supplies", amount: 5_000 },
    ],
    payments: [
      { id: "PAY-4410", date: "2026-02-10", amount: 30_000, kind: "Advance" },
      { id: "PAY-4702", date: "2026-05-12", amount: 30_000, kind: "Reimbursement" },
      { id: "PAY-5033", date: "2026-08-14", amount: 37_500, kind: "Reimbursement" },
    ],
    reports: [
      { id: "r1", label: "January to March", periodStart: "2026-01-01", periodEnd: "2026-03-31", due: "2026-04-30", submittedOn: "2026-04-22" },
      { id: "r2", label: "April to June", periodStart: "2026-04-01", periodEnd: "2026-06-30", due: "2026-07-31", submittedOn: "2026-07-30" },
      { id: "r3", label: "July to October", periodStart: "2026-07-01", periodEnd: "2026-10-31", due: "2026-11-30" },
      { id: "r4", label: "Final report", periodStart: "2026-01-01", periodEnd: "2026-12-31", due: "2027-01-31" },
    ],
  },
  {
    id: "GR-2154",
    accountId: "acct-pinecounty",
    program: "Housing Stability",
    agency: "Department of Human Services",
    amount: 210_000,
    startDate: "2026-04-01",
    endDate: "2027-09-30",
    officer: "Dana Whitfield",
    officerEmail: "housing.stability@example.gov",
    budget: [
      { line: "Rental assistance", amount: 150_000 },
      { line: "Case management", amount: 45_000 },
      { line: "Administration", amount: 15_000 },
    ],
    payments: [
      { id: "PAY-4650", date: "2026-04-20", amount: 32_000, kind: "Advance" },
      { id: "PAY-4990", date: "2026-08-05", amount: 32_000, kind: "Reimbursement" },
    ],
    reports: [
      { id: "r1", label: "April to June", periodStart: "2026-04-01", periodEnd: "2026-06-30", due: "2026-07-31", submittedOn: "2026-07-29" },
      { id: "r2", label: "July to September", periodStart: "2026-07-01", periodEnd: "2026-09-30", due: "2026-10-31" },
      { id: "r3", label: "October to December", periodStart: "2026-10-01", periodEnd: "2026-12-31", due: "2027-01-31" },
    ],
  },
  {
    id: "GR-2133",
    accountId: "acct-mesabi",
    program: "Workforce Training",
    agency: "Department of Employment and Economic Development",
    amount: 175_000,
    startDate: "2025-07-01",
    endDate: "2027-06-30",
    officer: "Casey Nguyen",
    officerEmail: "workforce.grants@example.gov",
    budget: [
      { line: "Training instructors", amount: 90_000 },
      { line: "Participant support", amount: 50_000 },
      { line: "Equipment", amount: 20_000 },
      { line: "Administration", amount: 15_000 },
    ],
    payments: [
      { id: "PAY-3920", date: "2025-08-01", amount: 50_000, kind: "Advance" },
      { id: "PAY-4380", date: "2026-02-09", amount: 50_000, kind: "Reimbursement" },
      { id: "PAY-4975", date: "2026-08-07", amount: 50_250, kind: "Reimbursement" },
    ],
    reports: [
      { id: "r1", label: "July to December 2025", periodStart: "2025-07-01", periodEnd: "2025-12-31", due: "2026-01-31", submittedOn: "2026-01-26" },
      { id: "r2", label: "January to June 2026", periodStart: "2026-01-01", periodEnd: "2026-06-30", due: "2026-07-31", submittedOn: "2026-07-24" },
      { id: "r3", label: "July to November 2026", periodStart: "2026-07-01", periodEnd: "2026-11-30", due: "2026-12-15" },
      { id: "r4", label: "Final report", periodStart: "2025-07-01", periodEnd: "2027-06-30", due: "2027-07-31" },
    ],
  },
];

export type ReportStatus = "Submitted" | "Overdue" | "Due soon" | "Upcoming";

export type ReportRow = ReportPeriod & {
  status: ReportStatus;
  submitted?: GranteeReport;
  canSubmit: boolean;
};

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 864e5);

/** Combines the grant's report schedule with reports submitted in the portal. */
export function reportRows(g: GranteeGrant, submitted: GranteeReport[], today: string): ReportRow[] {
  return g.reports.map((r) => {
    const sub = submitted.find((s) => s.grantId === g.id && s.reportId === r.id);
    const submittedOn = r.submittedOn ?? (sub ? localDay(sub.submittedAt) : undefined);
    const status: ReportStatus = submittedOn
      ? "Submitted"
      : r.due < today
        ? "Overdue"
        : daysBetween(today, r.due) <= 30
          ? "Due soon"
          : "Upcoming";
    return {
      ...r,
      submittedOn,
      status,
      submitted: sub,
      canSubmit: !submittedOn && r.periodStart <= today,
    };
  });
}

export function balances(g: GranteeGrant, requests: PaymentRequest[]) {
  const paid = g.payments.reduce((s, p) => s + p.amount, 0);
  const pending = requests.filter((p) => p.grantId === g.id).reduce((s, p) => s + p.total, 0);
  return { paid, pending, remaining: g.amount - paid - pending };
}
