/**
 * AI READING PASS — labels questions the deterministic reader was unsure of.
 *
 * CONTENT ONLY. The model is never asked how anything should look; it only
 * says what a block of text IS — a question of which known type, worth how
 * many marks. Everything it returns is clamped to the app's own type list, so
 * an odd answer can never reach the printed paper as a strange layout.
 */
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { callGatewayJson } from './gateway.server';

const KNOWN = [
  'mcq',
  'true_false',
  'matching',
  'fill_blank',
  'short_answer',
  'structured',
  'essay',
  'generic',
] as const;

const input = z.object({
  subject: z.string().default(''),
  level: z.string().default(''),
  questions: z
    .array(z.object({ id: z.string(), text: z.string().min(1).max(4000) }))
    .min(1)
    .max(25),
});

export interface PaperLabel {
  id: string;
  type: (typeof KNOWN)[number];
  marks: number;
  confidence: number;
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['labels'],
  properties: {
    labels: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'type', 'marks', 'confidence'],
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: [...KNOWN] },
          marks: { type: 'integer', minimum: 1, maximum: 60 },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
    },
  },
} as const;

export const readPaperQuestions = createServerFn({ method: 'POST' })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }): Promise<{ labels: PaperLabel[] }> => {
    const prompt = [
      `Subject: ${data.subject || 'unspecified'}. Level: ${data.level || 'unspecified'}.`,
      'These blocks of text come from a scanned or copied Rwandan exam paper.',
      'For each one, say what kind of exam question it is and how many marks it is worth.',
      'Use "generic" when it is a question but matches none of the other kinds.',
      'Give a low confidence when the text is broken or is not a question at all.',
      'Never rewrite, reformat or renumber the text — only label it.',
      '',
      ...data.questions.map((q) => `[${q.id}] ${q.text}`),
    ].join('\n');

    const out = await callGatewayJson<{ labels: PaperLabel[] }>({
      instructions:
        'You classify exam questions. You never produce formatting, numbering or layout.',
      input: prompt,
      schemaName: 'paper_labels',
      schema,
      effort: 'low',
    });

    const allowed = new Set<string>(KNOWN);
    return {
      labels: (out.labels ?? []).filter((l) => l && allowed.has(l.type)),
    };
  });
