/** IndexedDB store for downloaded PDF files, keyed by source id. */
const DB_NAME = "rn-files";
const STORE = "pdfs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = fn(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdf(id: string, bytes: Uint8Array) {
  if (typeof indexedDB === "undefined") return;
  try {
    await tx("readwrite", (s) => s.put(bytes, id));
  } catch {
    /* storage unavailable — the extracted text still works */
  }
}

export async function loadPdf(id: string): Promise<Uint8Array | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const value = await tx<unknown>("readonly", (s) => s.get(id));
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    return null;
  } catch {
    return null;
  }
}

export async function deletePdf(id: string) {
  if (typeof indexedDB === "undefined") return;
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}
