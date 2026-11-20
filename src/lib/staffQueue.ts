// Builds the staff review queue from grantee reports and payment requests.
import { money } from "./data";
import {
  accountFor,
  granteeGrants,
  type GranteeGrant,
  type GranteeReport,
  type PaymentRequest,
} from "./granteeData";

export type QueueItem = {
  kind: "report" | "payment";
  id: string;
  grant: GranteeGrant;
  organization: string;
  title: string;
  submittedAt: string;
  status: string; // shown as text in a badge
  needsReview: boolean;
  href: string;
};

export function buildQueue(reports: GranteeReport[], payments: PaymentRequest[]): QueueItem[] {
  const items: QueueItem[] = [];
  for (const r of reports) {
    const grant = granteeGrants.find((g) => g.id === r.grantId);
    if (!grant) continue;
    items.push({
      kind: "report",
      id: r.id,
      grant,
      organization: accountFor(grant)?.organization ?? "",
      title: `Progress report: ${grant.reports.find((p) => p.id === r.reportId)?.label ?? r.reportId}`,
      submittedAt: r.submittedAt,
      status: r.review?.decision ?? "Needs review",
      needsReview: !r.review,
      href: `/staff/submissions/item?kind=report&id=${encodeURIComponent(r.id)}`,
    });
  }
  for (const p of payments) {
    const grant = granteeGrants.find((g) => g.id === p.grantId);
    if (!grant) continue;
    items.push({
      kind: "payment",
      id: p.id,
      grant,
      organization: accountFor(grant)?.organization ?? "",
      title: `${p.kind} request, ${money(p.total)}`,
      submittedAt: p.submittedAt,
      status: p.status === "Pending review" ? "Needs review" : p.status,
      needsReview: p.status === "Pending review",
      href: `/staff/submissions/item?kind=payment&id=${encodeURIComponent(p.id)}`,
    });
  }
  return items;
}
