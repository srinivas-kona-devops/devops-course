import type { DocMeta, DocRecord } from '../docs/types';

const DB_NAME = 'dochub';
const STORE = 'docs';

// Uploads live in the browser (IndexedDB). GitHub Pages is static, so there is no server to store them.
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(request.result);
        };
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export async function putDoc(doc: DocRecord): Promise<void> {
  await run('readwrite', (store) => store.put(doc));
}

export async function getDoc(id: string): Promise<DocRecord | undefined> {
  return run('readonly', (store) => store.get(id));
}

export async function deleteDoc(id: string): Promise<void> {
  await run('readwrite', (store) => store.delete(id));
}

/** Lists metadata without loading blob bodies into memory. */
export async function listDocs(): Promise<DocMeta[]> {
  const all = await run<DocRecord[]>('readonly', (store) => store.getAll());
  return all
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => a.title.localeCompare(b.title));
}
