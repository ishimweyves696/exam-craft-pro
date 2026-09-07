/**
 * AI CONTENT GENERATOR — server only.
 *
 * Pipeline, per exam:
 *   plan (code)  ->  one AI batch per question type (parallel)
 *                ->  compliance gate (repair / validate / dedupe)
 *                ->  one retry per type that fell short, with the rejection
 *                    reasons fed back to the model
 *                ->  return whatever passed.
 *
 * Anything still missing is simply not returned: buildExam() appends the
 * static bank behind the AI pool, so a short pool degrades into a normal
 * bank-backed paper instead of a broken one.
 */
import type { BankItem, BankType } from '../examBank';
import { getSubject } from '../examBank';
import type { ExamBuildConfig } from '../examBuilder';
import { planExam } from './plan';
import { batchSchema } from './schema';
import { buildPrompt, SYSTEM_INSTRUCTIONS } from './prompts';
import { callGatewayJson, GatewayError } from './gateway.server';
import { validateItems } from './validate';
import type { MaterialExcerpt, MaterialPayload } from '../source/types';

export interface GenerationResult {
  items: BankItem[];
  /** Per-type outcome, surfaced in the UI so the teacher can trust the paper. */
  report: { type: BankType; needed: number; produced: number }[];
  warning?: string;
}

/** A single model call never asks for more than this — big batches drift and cost more. */
const MAX_PER_CALL = 12;
/**
 * One call at a time: free-tier keys allow only a handful of requests per
 * minute, and a burst turns the whole paper into 429s.
 */
const CONCURRENCY = 3;

/** One unit of work: N items of one type, written for one section. */
interface Job {
  type: BankType;
  sectionId: string;
  request: number;
  excerpts?: MaterialExcerpt[];
}

async function batch(
  plan: ReturnType<typeof planExam>,
  job: Job,
  feedback?: string,
): Promise<BankItem[]> {
  const { type, request: count } = job;
  const material =
    job.excerpts?.length && plan.material
      ? {
          excerpts: job.excerpts,
          bookTitle: plan.material.bookTitle,
          strictness: plan.material.strictness,
        }
      : undefined;
  const data = await callGatewayJson<{ questions: Partial<BankItem>[] }>({
    instructions: SYSTEM_INSTRUCTIONS,
    input: buildPrompt(plan, type, count, feedback, material),
    schemaName: `${type}_batch`,
    schema: batchSchema(type),
    effort: type === 'structured' || type === 'essay' ? 'medium' : 'low',
  });
  // The section tag is a CONTENT routing decision made in code, never by the
  // model: items written from a section's book units stay in that section.
  return (data.questions ?? []).map(
    (q) => ({ ...q, type, sectionId: job.sectionId }) as BankItem,
  );
}

/** Split a quota into calls of at most MAX_PER_CALL items. */
function chunk(job: Job): Job[] {
  const calls = Math.max(1, Math.ceil(job.request / MAX_PER_CALL));
  const base = Math.ceil(job.request / calls);
  const out: Job[] = [];
  let left = job.request;
  for (let i = 0; i < calls && left > 0; i++) {
    const n = Math.min(base, left);
    out.push({ ...job, request: n });
    left -= n;
  }
  return out;
}

export async function generateExamContent(
  config: ExamBuildConfig,
  material?: MaterialPayload,
): Promise<GenerationResult> {
  const subject = getSubject(config.subjectId);
  const plan = planExam(config, subject.name, material);

  const accepted: BankItem[] = [];
  const feedbackByType = new Map<BankType, string>();
  let warning: string | undefined;
  /** Set on 401/402/403: no later call in this run can succeed, so stop calling. */
  let halted = false;

  const runPass = async (quotas: Job[]) => {
    const jobs = quotas.flatMap(chunk);
    let cursor = 0;

    const take = (items: BankItem[], type: BankType) => {
      const { accepted: ok, rejected } = validateItems(items, {
        existing: [...accepted, ...subject.items],
      });
      accepted.push(...ok);
      if (rejected.length) {
        feedbackByType.set(
          type,
          rejected
            .slice(0, 4)
            .map((x) => `- ${x.reason}`)
            .join('\n'),
        );
      }
    };

    const worker = async () => {
      for (;;) {
        const job = jobs[cursor++];
        if (!job || halted) return;
        try {
          take(await batch(plan, job, feedbackByType.get(job.type)), job.type);
        } catch (err) {
          if (err instanceof GatewayError) {
            if (!warning) warning = err.message;
            if (err.terminal) halted = true;
          }
        }
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  };

  const produced = (sectionId: string, type: BankType) =>
    accepted.filter((i) => i.type === type && i.sectionId === sectionId).length;

  const asJob = (q: (typeof plan.quotas)[number], request: number): Job => ({
    type: q.type,
    sectionId: q.sectionId,
    request,
    excerpts: q.excerpts,
  });

  await runPass(plan.quotas.map((q) => asJob(q, q.request)));

  if (!halted) {
    const missing = plan.quotas
      .map((q) => ({ q, gap: q.needed - produced(q.sectionId, q.type) }))
      .filter((x) => x.gap > 0)
      .map(({ q, gap }) => asJob(q, Math.max(gap + 2, Math.ceil(gap * 1.5))));
    if (missing.length) await runPass(missing);
  }

  const report = plan.quotas.map((q) => ({
    type: q.type,
    needed: q.needed,
    produced: produced(q.sectionId, q.type),
  }));

  const short = report.some((r) => r.produced < r.needed);
  if (warning && short) {
    warning = `${warning} The vetted question bank filled the remaining questions, so the paper is still complete.`;
  } else if (!warning && short) {
    warning = 'Some AI questions did not pass the compliance checks — the bank filled the gap.';
  }

  return { items: accepted, report, warning };
}
