/**
 * SOURCE BOOK STORAGE (browser, IndexedDB)
 *
 * Books live on the teacher's own device. IndexedDB is used rather than
 * localStorage because whole textbooks are far larger than the ~5MB
 * localStorage ceiling — that limit is what made big uploads fail.
 * Only the small selection reference (book id + chosen node ids) travels
 * inside the exam URL, and only the chosen excerpts are ever sent to the AI.
 */
import type { OutlineNode, SourceBook, SourceBookSummary } from './types';

const DB_NAME = 'nesa-source';
const DB_VERSION = 1;
const STORE = 'books';
const LEGACY_INDEX = 'nesa.sourceBooks';

/** Books kept per device — older ones are pruned automatically. */
const MAX_BOOKS = 12;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser cannot store books offline.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open device storage.'));
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('Device storage failed.'));
        t.oncomplete = () => db.close();
      }),
  );
}

const summarise = (book: SourceBook): SourceBookSummary => ({
  id: book.id,
  title: book.title,
  fileName: book.fileName,
  createdAt: book.createdAt,
  charCount: book.charCount,
  unitCount: book.units.length,
});

/** Books saved before the nested outline / IndexedDB change still load. */
function migrate(raw: any): SourceBook | undefined {
  if (!raw || !Array.isArray(raw.units)) return undefined;
  const fix = (n: any, level: 1 | 2 | 3): OutlineNode => {
    const children = (n.children ?? n.subunits ?? []).map((c: any) =>
      fix(c, (Math.min(3, level + 1) as 2 | 3)),
    );
    const text = String(n.text ?? '');
    return {
      id: String(n.id),
      title: String(n.title ?? 'Untitled'),
      text,
      level,
      size:
        typeof n.size === 'number'
          ? n.size
          : text.length + children.reduce((a: number, c: OutlineNode) => a + c.size, 0),
      children,
    };
  };
  return { ...raw, units: raw.units.map((u: any) => fix(u, 1)) } as SourceBook;
}

function legacyBooks(): SourceBook[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const index = JSON.parse(localStorage.getItem(LEGACY_INDEX) ?? '[]') as SourceBookSummary[];
    return index
      .map((s) => {
        const raw = localStorage.getItem(`nesa.sourceBook:${s.id}`);
        return raw ? migrate(JSON.parse(raw)) : undefined;
      })
      .filter((b): b is SourceBook => Boolean(b));
  } catch {
    return [];
  }
}

function clearLegacy() {
  if (typeof localStorage === 'undefined') return;
  try {
    const index = JSON.parse(localStorage.getItem(LEGACY_INDEX) ?? '[]') as SourceBookSummary[];
    index.forEach((s) => localStorage.removeItem(`nesa.sourceBook:${s.id}`));
    localStorage.removeItem(LEGACY_INDEX);
  } catch {
    /* nothing to clear */
  }
}

let migrated = false;
async function ensureMigrated() {
  if (migrated) return;
  migrated = true;
  const old = legacyBooks();
  if (!old.length) return;
  for (const book of old) {
    try {
      await tx('readwrite', (s) => s.put(book) as IDBRequest<IDBValidKey>);
    } catch {
      /* skip a book that will not fit */
    }
  }
  clearLegacy();
}

export async function listBooks(): Promise<SourceBookSummary[]> {
  try {
    await ensureMigrated();
    const all = (await tx<any[]>('readonly', (s) => s.getAll() as IDBRequest<any[]>)) ?? [];
    return all
      .map((b) => migrate(b))
      .filter((b): b is SourceBook => Boolean(b))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(summarise);
  } catch {
    return [];
  }
}

export async function loadBook(id: string): Promise<SourceBook | undefined> {
  try {
    await ensureMigrated();
    const raw = await tx<any>('readonly', (s) => s.get(id) as IDBRequest<any>);
    return migrate(raw);
  } catch {
    return undefined;
  }
}

export async function saveBook(book: SourceBook): Promise<SourceBookSummary[]> {
  await ensureMigrated();
  try {
    await tx('readwrite', (s) => s.put(book) as IDBRequest<IDBValidKey>);
  } catch (e) {
    throw new Error(
      'There was not enough space on this device to save the book. Remove a book from the list and try again.',
    );
  }
  const list = await listBooks();
  const extra = list.slice(MAX_BOOKS);
  for (const old of extra) await deleteBook(old.id);
  return list.slice(0, MAX_BOOKS);
}

export async function deleteBook(id: string): Promise<SourceBookSummary[]> {
  try {
    await tx('readwrite', (s) => s.delete(id) as unknown as IDBRequest<undefined>);
  } catch {
    /* already gone */
  }
  return listBooks();
}

export function newBookId(): string {
  return `bk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
