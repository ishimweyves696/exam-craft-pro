import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { decodeConfig } from '../examBuilder';
import { generateExamContent } from './generator.server';

/**
 * The book itself never leaves the teacher's device: the client sends only the
 * excerpts for the units it ticked, alongside the exam id.
 */
const excerpt = z.object({ title: z.string(), text: z.string() });

const materialSchema = z.object({
  bookTitle: z.string(),
  strictness: z.enum(['book_only', 'book_first']),
  global: z.array(excerpt),
  bySection: z.record(z.string(), z.array(excerpt)),
});

export const generateExamItems = createServerFn({ method: 'POST' })
  .inputValidator((data) =>
    z
      .object({ id: z.string().min(1), material: materialSchema.optional() })
      .parse(data),
  )
  .handler(async ({ data }) => generateExamContent(decodeConfig(data.id), data.material));
