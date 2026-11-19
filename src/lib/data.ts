// FAKE DATA ONLY. Every organization, person and grant below is fictional.

export type Opportunity = {
  id: string;
  title: string;
  agency: string;
  summary: string;
  description: string;
  eligible: string[];
  fundingSource: "State" | "Federal pass-through";
  totalFunds: number;
  maxAward: number;
  opens: string; // ISO date
  closes: string; // ISO date
  status: "Open" | "Closed" | "Forecast";
  contact: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "rural-broadband-2027",
    title: "Rural Broadband Readiness Grants",
    agency: "Department of Employment and Economic Development",
    summary:
      "Planning and small-infrastructure grants to bring broadband to unserved rural areas.",
    description:
      "Supports local governments and tribal nations in planning and building last-mile broadband service. Projects must serve households without 100/20 Mbps service.",
    eligible: ["Local governments", "Tribal nations", "Nonprofits"],
    fundingSource: "Federal pass-through",
    totalFunds: 4_000_000,
    maxAward: 250_000,
    opens: "2026-11-01",
    closes: "2027-01-15",
    status: "Open",
    contact: "broadband.grants@example.gov",
  },
  {
    id: "youth-mentoring-2027",
    title: "Youth Mentoring Program Grants",
    agency: "Department of Human Services",
    summary:
      "Two-year grants for community mentoring programs serving young people ages 10 to 18.",
    description:
      "Funds evidence-based mentoring programs that pair young people with trained adult mentors. Priority goes to programs serving greater Minnesota.",
    eligible: ["Nonprofits", "Schools", "Tribal nations"],
    fundingSource: "State",
    totalFunds: 1_500_000,
    maxAward: 100_000,
    opens: "2026-10-15",
    closes: "2026-12-19",
    status: "Open",
    contact: "mentoring.grants@example.gov",
  },
  {
    id: "clean-water-2027",
    title: "Clean Water Partnership Grants",
    agency: "Pollution Control Agency",
    summary:
      "Matching grants for projects that reduce runoff and protect lakes and rivers.",
    description:
      "Supports watershed restoration, stormwater improvements and agricultural best practices. A 25% local match is required.",
    eligible: ["Local governments", "Soil and water districts", "Nonprofits"],
    fundingSource: "State",
    totalFunds: 2_200_000,
    maxAward: 300_000,
    opens: "2027-02-01",
    closes: "2027-04-01",
    status: "Forecast",
    contact: "cleanwater.grants@example.gov",
  },
  {
    id: "arts-access-2026",
    title: "Community Arts Access Grants",
    agency: "State Arts Board",
    summary:
      "Grants that bring arts programming to communities with limited access.",
    description:
      "Funds free or low-cost arts events, classes and performances in underserved communities.",
    eligible: ["Nonprofits", "Local governments"],
    fundingSource: "State",
    totalFunds: 800_000,
    maxAward: 40_000,
    opens: "2026-06-01",
    closes: "2026-08-15",
    status: "Closed",
    contact: "arts.access@example.gov",
  },
];

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "In review"
  | "Awarded"
  | "Declined";

export type Application = {
  id: string;
  opportunityId: string;
  organization: string;
  projectTitle: string;
  requested: number;
  submitted: string | null;
  status: ApplicationStatus;
  averageScore: number | null;
};

export const applications: Application[] = [
  { id: "APP-1042", opportunityId: "youth-mentoring-2027", organization: "North Star Youth Alliance", projectTitle: "Mentors on the Range", requested: 95_000, submitted: "2026-11-10", status: "In review", averageScore: 82 },
  { id: "APP-1043", opportunityId: "youth-mentoring-2027", organization: "Prairie Lakes Community Center", projectTitle: "Bridges After School", requested: 60_000, submitted: "2026-11-12", status: "In review", averageScore: 74 },
  { id: "APP-1047", opportunityId: "youth-mentoring-2027", organization: "Red Pine Boys and Girls Club", projectTitle: "Next Step Mentoring", requested: 100_000, submitted: "2026-11-14", status: "Submitted", averageScore: null },
  { id: "APP-1051", opportunityId: "rural-broadband-2027", organization: "Kettle River Township", projectTitle: "Kettle River Fiber Plan", requested: 180_000, submitted: "2026-11-15", status: "Submitted", averageScore: null },
  { id: "APP-1052", opportunityId: "rural-broadband-2027", organization: "Northwind Tribal Council", projectTitle: "Shoreline Connect", requested: 250_000, submitted: null, status: "Draft", averageScore: null },
  { id: "APP-0988", opportunityId: "arts-access-2026", organization: "Big Woods Theater Collective", projectTitle: "Theater on Wheels", requested: 38_000, submitted: "2026-08-01", status: "Awarded", averageScore: 91 },
  { id: "APP-0991", opportunityId: "arts-access-2026", organization: "Two Rivers Arts Guild", projectTitle: "Mural Mondays", requested: 25_000, submitted: "2026-08-10", status: "Declined", averageScore: 58 },
];

export const rubric = [
  { id: "need", label: "Need and population served", max: 25, help: "How clearly does the applicant show the need and who will benefit?" },
  { id: "design", label: "Program design", max: 30, help: "Is the approach evidence-based and realistic?" },
  { id: "capacity", label: "Organizational capacity", max: 20, help: "Does the organization have the staff and systems to deliver?" },
  { id: "budget", label: "Budget and cost reasonableness", max: 15, help: "Are costs allowable, reasonable and tied to activities?" },
  { id: "outcomes", label: "Outcomes and evaluation", max: 10, help: "Are outcomes measurable, with a plan to track them?" },
] as const;

export type ActiveGrant = {
  id: string;
  grantee: string;
  program: string;
  amount: number;
  spent: number;
  nextReportDue: string;
  reportStatus: "On time" | "Due soon" | "Overdue";
};

export const activeGrants: ActiveGrant[] = [
  { id: "GR-2210", grantee: "Big Woods Theater Collective", program: "Community Arts Access", amount: 38_000, spent: 21_400, nextReportDue: "2026-12-31", reportStatus: "On time" },
  { id: "GR-2187", grantee: "Lakewood Food Shelf", program: "Hunger Relief", amount: 120_000, spent: 97_500, nextReportDue: "2026-11-30", reportStatus: "Due soon" },
  { id: "GR-2154", grantee: "Pine County Housing Trust", program: "Housing Stability", amount: 210_000, spent: 64_000, nextReportDue: "2026-10-31", reportStatus: "Overdue" },
  { id: "GR-2133", grantee: "Mesabi Workforce Partners", program: "Workforce Training", amount: 175_000, spent: 150_250, nextReportDue: "2026-12-15", reportStatus: "On time" },
];

export function getOpportunity(id: string) {
  return opportunities.find((o) => o.id === id);
}

export function getApplication(id: string) {
  return applications.find((a) => a.id === id);
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
