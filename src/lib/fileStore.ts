// Prototype file storage: keeps uploaded attachments in this browser's
// IndexedDB so they can be downloaded again. Phase 2 moves files to secure
// cloud storage with malware scanning (spec S-13).
import { newId } from "./formTypes";
import type { Attachment } from "./granteeData";

const DB_NAME = "gms-files";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = op(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Stores each file and returns its attachment record. */
export async function saveAttachments(files: File[]): Promise<Attachment[]> {
  const saved: Attachment[] = [];
  for (const f of files) {
    const id = newId("file");
    await run("readwrite", (s) => s.put(f, id));
    saved.push({ id, name: f.name, size: f.size, type: f.type });
  }
  return saved;
}

/** Downloads a stored attachment to the user's computer. */
export async function downloadAttachment(a: Attachment) {
  const blob = await run<Blob | undefined>("readonly", (s) => s.get(a.id));
  if (!blob) throw new Error("File not found");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = a.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
