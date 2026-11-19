// Prototype storage: keeps staff-built opportunities and applications in this
// browser's localStorage. Phase 2 replaces this with a real database.
import { useSyncExternalStore } from "react";
import type { CustomOpportunity, Submission } from "./formTypes";

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
