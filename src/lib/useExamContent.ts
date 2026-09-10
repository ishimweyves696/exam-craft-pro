/**
 * EXAM CONTENT HOOK
 *
 * Preview, print and marking guide must show the SAME paper. The exam id
 * encodes the config (including the seed), so AI content is fetched once per
 * id and cached in sessionStorage; every view then rebuilds the identical
 * paper from that cached pool through the same deterministic builder.
 */
import { useCallback, useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { generateExamItems } from './ai/generate.functions';
import type { BankItem } from './examBank';
import { buildExam, decodeConfig } from './examBuilder';
import { clearEdits, loadEdits, saveEdits, type EditedPaper } from './examEdits';
import type { GeneratedExam, GeneratedMarkingGuide } from '../types';
import { loadBook } from './source/store';
import { buildMaterialPayload } from './source/payload';
import type { MaterialPayload } from './source/types';
import { loadPaper } from './pastpapers/store';
import { buildBlueprint } from './pastpapers/blueprint';
import { mixItems } from './pastpapers/mix';
import { pastPaperPayload } from './pastpapers/payload';
import type { PastPaper } from './pastpapers/types';


interface Cached {
  items: BankItem[];
  warning?: string;
  report?: { type: string; needed: number; produced: number }[];
}

const memory = new Map<string, Cached>();

function readCache(id: string): Cached | undefined {
  if (memory.has(id)) return memory.get(id);
  if (typeof sessionStorage === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(`exam-ai:${id}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Cached;
    memory.set(id, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}

function writeCache(id: string, value: Cached) {
  memory.set(id, value);
  try {
    sessionStorage.setItem(`exam-ai:${id}`, JSON.stringify(value));
  } catch {
    /* quota or private mode — the in-memory cache still holds for this tab */
  }
}

/**
 * Rebuild the excerpts for this exam from the book stored on this device.
 * Code decides what the model sees; the exam id only carries the ticked ids.
 * Device storage is asynchronous, so this resolves before generation starts.
 */
function pastPapersFor(config: ReturnType<typeof decodeConfig>): PastPaper[] {
  const ids = config.pastPapers?.paperIds ?? [];
  return ids.map((pid) => loadPaper(pid)).filter((p): p is PastPaper => Boolean(p));
}

/**
 * MIX MODE — real questions from the uploads, arranged by the learned shape.
 * Fully seeded, so the same exam id always rebuilds the same paper, and the
 * questions still pass through every fixed layout rule in the builder.
 */
function mixedItems(config: ReturnType<typeof decodeConfig>): BankItem[] | undefined {
  if (config.pastPapers?.mode !== 'mix') return undefined;
  const papers = pastPapersFor(config);
  const blueprint = buildBlueprint(papers);
  if (!blueprint) return [];
  return mixItems(papers, blueprint, config.seed || 1);
}

async function materialFor(
  config: ReturnType<typeof decodeConfig>,
): Promise<MaterialPayload | undefined> {
  if (config.pastPapers?.mode === 'fresh' && !config.sourceMaterial?.bookId) {
    return pastPaperPayload(pastPapersFor(config));
  }
  const ref = config.sourceMaterial;
  if (!ref?.bookId) return undefined;
  const book = await loadBook(ref.bookId);
  if (!book) return undefined;
  const bySection: Record<string, string[]> = {};
  (config.sectionPlan ?? []).forEach((s) => {
    if (s.sourceNodeIds?.length) bySection[s.id] = s.sourceNodeIds;
  });
  return buildMaterialPayload(book, ref, bySection);
}

export function useExamContent(id: string) {
  const config = decodeConfig(id);
  const mixMode = config.pastPapers?.mode === 'mix';
  const useAi = config.source === 'ai' && !mixMode;
  const generate = useServerFn(generateExamItems);

  const [items, setItems] = useState<BankItem[] | undefined>(() =>
    useAi ? readCache(id)?.items : undefined,
  );
  const [warning, setWarning] = useState<string | undefined>(() =>
    useAi ? readCache(id)?.warning : undefined,
  );
  const [report, setReport] = useState<Cached['report']>(() =>
    useAi ? readCache(id)?.report : undefined,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!useAi) return;
    const cached = readCache(id);
    if (cached) {
      setItems(cached.items);
      setWarning(cached.warning);
      setReport(cached.report);
      return;
    }
    let alive = true;
    setLoading(true);
    materialFor(config)
      .then((material) => generate({ data: { id, material } }))
      .then((res) => {
        if (!alive) return;
        const value: Cached = { items: res.items, warning: res.warning, report: res.report };
        writeCache(id, value);
        setItems(value.items);
        setWarning(value.warning);
        setReport(value.report);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setItems([]);
        setWarning(
          err instanceof Error
            ? `${err.message} Showing bank questions instead.`
            : 'AI generation failed. Showing bank questions instead.',
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, useAi, generate]);

  // Uploaded papers live in this browser, so the mix is resolved after
  // hydration; the server render shows the same paper built from the bank.
  const [mixed, setMixed] = useState<BankItem[] | undefined>(undefined);
  useEffect(() => {
    if (!mixMode) return;
    setMixed(mixedItems(config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mixMode]);

  const built = buildExam(config, mixMode ? mixed : useAi ? items : undefined);

  // Teacher edits win over generated content, and are read after hydration so
  // the server-rendered markup still matches the first client render.
  const [edits, setEdits] = useState<EditedPaper | undefined>(undefined);
  useEffect(() => {
    setEdits(loadEdits(id));
  }, [id]);

  const save = useCallback(
    (exam: GeneratedExam, markingGuide: GeneratedMarkingGuide) => {
      setEdits(saveEdits(id, exam, markingGuide));
    },
    [id],
  );

  const reset = useCallback(() => {
    clearEdits(id);
    setEdits(undefined);
  }, [id]);

  return {
    exam: edits?.exam ?? built.exam,
    markingGuide: edits?.markingGuide ?? built.markingGuide,
    /** The untouched generated paper, used by the editor's "revert" action. */
    generated: built,
    edited: Boolean(edits),
    editedAt: edits?.savedAt,
    saveEdits: save,
    resetEdits: reset,
    config,
    /** True while AI content is still being written; the view shows bank content meanwhile. */
    loading: (useAi && (loading || items === undefined) && !edits) || (mixMode && mixed === undefined && !edits),
    warning,
    /** Per-question-type outcome of the AI compliance gate. */
    report,
  };

}
