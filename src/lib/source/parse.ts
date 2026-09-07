/**
 * FILE → TEXT (browser only)
 *
 * PDF and Word parsing happen in the teacher's browser: the book never leaves
 * the device except as the short excerpts the teacher explicitly selects.
 *
 * Built for whole textbooks: pages are appended to an array (never re-joined
 * per page, which is what made large books hang), the UI thread is released
 * between pages so the progress bar keeps moving, and the work can be
 * cancelled at any time.
 */

/** Hard cap so one enormous scan cannot exhaust device memory. */
export const MAX_BOOK_CHARS = 4_000_000;

/** Files larger than this are refused early with a clear message. */
export const MAX_FILE_BYTES = 120 * 1024 * 1024;

export interface ParseOptions {
  /** 0–1 progress plus a human label, called as pages are read. */
  onProgress?: (fraction: number, label: string) => void;
  signal?: AbortSignal;
}

const idle = () => new Promise((r) => setTimeout(r, 0));

function checkAbort(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('Upload cancelled.');
}

async function pdfToText(file: File, opts: ParseOptions): Promise<string> {
  const pdfjs: any = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const task = pdfjs.getDocument({ data: buffer, disableAutoFetch: true, disableStream: true });
  opts.signal?.addEventListener('abort', () => task.destroy?.());
  const doc = await task.promise;

  const pages: string[] = [];
  let total = 0;
  for (let i = 1; i <= doc.numPages; i++) {
    checkAbort(opts.signal);
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = '';
    let lastY: number | null = null;
    const out: string[] = [];
    for (const item of content.items as any[]) {
      if (typeof item.str !== 'string') continue;
      const y = item.transform?.[5];
      if (lastY !== null && typeof y === 'number' && Math.abs(y - lastY) > 4) {
        out.push(line.trim());
        line = '';
      }
      line += item.str + (item.hasEOL ? '\n' : ' ');
      if (typeof y === 'number') lastY = y;
    }
    out.push(line.trim());
    const text = out.join('\n');
    pages.push(text);
    total += text.length + 2;
    page.cleanup?.();

    opts.onProgress?.(i / doc.numPages, `Reading page ${i} of ${doc.numPages}`);
    if (i % 5 === 0) await idle();
    if (total > MAX_BOOK_CHARS) break;
  }
  try {
    await doc.destroy?.();
  } catch {
    /* already closed */
  }
  return pages.join('\n\n');
}

async function docxToText(file: File, opts: ParseOptions): Promise<string> {
  opts.onProgress?.(0.3, 'Reading the Word document');
  const mammoth: any = await import('mammoth/mammoth.browser.js');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  opts.onProgress?.(0.9, 'Tidying the text');
  return String(result?.value ?? '');
}

export async function extractText(file: File, opts: ParseOptions = {}): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `That file is ${Math.round(file.size / 1024 / 1024)}MB. Please split it or upload a version under ${Math.round(
        MAX_FILE_BYTES / 1024 / 1024,
      )}MB.`,
    );
  }
  const name = file.name.toLowerCase();
  let text: string;
  if (name.endsWith('.pdf')) text = await pdfToText(file, opts);
  else if (name.endsWith('.docx')) text = await docxToText(file, opts);
  else if (name.endsWith('.doc'))
    throw new Error('Old .doc files are not supported. Save the file as .docx or PDF first.');
  else {
    opts.onProgress?.(0.5, 'Reading the file');
    text = await file.text();
  }
  checkAbort(opts.signal);

  opts.onProgress?.(0.95, 'Preparing the outline');
  text = text.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ');
  if (!text.trim()) {
    throw new Error(
      'No readable text was found. If this is a scanned book, use a version with selectable text.',
    );
  }
  return text.length > MAX_BOOK_CHARS ? text.slice(0, MAX_BOOK_CHARS) : text;
}
