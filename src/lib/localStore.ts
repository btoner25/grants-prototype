// Prototype storage: keeps staff-built opportunities and applications in this
// browser's localStorage. Phase 2 replaces this with a real database.
import { useSyncExternalStore } from "react";
import type { CustomOpportunity, Submission } from "./formTypes";
import type { GranteeReport, PaymentRequest, ReportDecision, StaffReview } from "./granteeData";

function createStore<T>(key: string) {
  const empty: T[] = [];
  let cacheRaw: string | null | undefined;
  let cacheVal: T[] = empty;
  const listeners = new Set<() => void>();

  const read = (): T[] => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      // Storage blocked (private window, etc.): behave as empty.
    }
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      try {
        cacheVal = raw ? (JSON.parse(raw) as T[]) : empty;
      } catch {
        cacheVal = empty;
      }
    }
    return cacheVal;
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  const write = (list: T[]) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // Ignore: nothing we can do in the prototype.
    }
    listeners.forEach((l) => l());
  };

  const useList = () => useSyncExternalStore(subscribe, read, () => empty);
  return { read, write, useList };
}

const opps = createStore<CustomOpportunity>("gms.customOpportunities.v1");
const subs = createStore<Submission>("gms.customSubmissions.v1");

export const useCustomOpportunities = opps.useList;
export const useSubmissions = subs.useList;

export function saveOpportunity(o: CustomOpportunity) {
  const list = opps.read();
  const exists = list.some((x) => x.id === o.id);
  opps.write(exists ? list.map((x) => (x.id === o.id ? o : x)) : [...list, o]);
}

export function deleteOpportunity(id: string) {
  opps.write(opps.read().filter((x) => x.id !== id));
  subs.write(subs.read().filter((s) => s.opportunityId !== id));
}

export function addSubmission(s: Submission) {
  subs.write([...subs.read(), s]);
}

const noopSubscribe = () => () => {};
/** False during the server render and first hydration pass, true after. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// Grantee portal: submitted progress reports, payment requests, and the
// simulated sign-in (which fictional grantee account is "signed in").
const reports = createStore<GranteeReport>("gms.granteeReports.v1");
const paymentRequests = createStore<PaymentRequest>("gms.paymentRequests.v1");
const session = createStore<{ accountId: string }>("gms.granteeSession.v1");

export const useGranteeReports = reports.useList;
export const useGranteePayments = paymentRequests.useList;
export const useGranteeSession = session.useList;

/** Saves a report. A resubmission replaces the earlier version for that period. */
export function addGranteeReport(r: GranteeReport) {
  reports.write([
    ...reports.read().filter((x) => !(x.grantId === r.grantId && x.reportId === r.reportId)),
    r,
  ]);
}

export function reviewGranteeReport(id: string, review: StaffReview & { decision: ReportDecision }) {
  reports.write(reports.read().map((x) => (x.id === id ? { ...x, review } : x)));
}

export function reviewPaymentRequest(id: string, status: "Approved" | "Returned", review: StaffReview) {
  paymentRequests.write(paymentRequests.read().map((x) => (x.id === id ? { ...x, status, review } : x)));
}

export function addPaymentRequest(p: PaymentRequest) {
  paymentRequests.write([...paymentRequests.read(), p]);
}

export function signInGrantee(accountId: string) {
  session.write([{ accountId }]);
}

export function signOutGrantee() {
  session.write([]);
}

/** Erases everything testers entered in this browser (opportunities,
 * applications, reports, payment requests and the grantee sign-in). */
export function resetDemoData() {
  opps.write([]);
  subs.write([]);
  reports.write([]);
  paymentRequests.write([]);
  session.write([]);
}
