/**
 * AI ASSIST — edit one question at a time.
 *
 * The teacher describes the change in plain language ("split this into three
 * questions", "turn the matching table into multiple choice", "more writing
 * space"). The model rewrites ONLY the content of that one question and may
 * return several questions in its place. Layout stays with the code.
 */
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { callGatewayJson } from './gateway.server';
import { questionEditSchema, type AiEditResult } from './editSchema';
import { SYSTEM_INSTRUCTIONS } from './prompts';
import { BAND_LABEL, BAND_CONVENTIONS, levelBand } from '../levelFormats';

const input = z.object({
  instruction: z.string().min(2).max(600),
  question: z.string().min(2).max(20000),
  subject: z.string().default(''),
  level: z.string().default(''),
  term: z.string().default(''),
  section: z.string().default(''),
});

export const aiEditQuestion = createServerFn({ method: 'POST' })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }): Promise<AiEditResult> => {
    const band = levelBand(data.level);
    const prompt = [
      `Subject: ${data.subject || 'unspecified'}`,
      `Level: ${data.level || 'unspecified'} — ${BAND_LABEL[band]}`,
      `Paper conventions at this level: ${BAND_CONVENTIONS[band].join(' ')}`,
      `Assessment: ${data.term || 'end-of-term'} examination, NESA house style`,
      `Section: ${data.section || 'unspecified'}`,
      '',
      'The teacher is editing ONE question of an existing paper. Here it is as JSON:',
      data.question,
      '',
      'The teacher asks:',
      data.instruction,
      '',
      'Return the question (or questions, if the request implies splitting it) that should REPLACE it.',
      'Rules:',
      '- Keep the same subject, level and topic unless the teacher asked otherwise.',
      '- Keep the total marks the same unless the teacher asked to change them; when splitting, divide the marks sensibly so they still add up.',
      '- "options" only for multiple choice (exactly 4, one correct). "tableRows" only for matching, first row is the column headings.',
      '- "subQuestions" only for structured questions; a sub-part may itself have at most 3 sub-parts.',
      '- "answerSpace" reflects how much a candidate must write: none for MCQ/True-False/matching, small/medium for short answers, large/xlarge for extended responses.',
      '- "answer" is the expected answer for the marking guide, or null when the part has sub-parts.',
      '- Never write question numbers, letters, marks in brackets, answer lines or any formatting inside the text.',
      '- "note" is one short sentence telling the teacher what you changed.',
    ].join('\n');

    return callGatewayJson<AiEditResult>({
      instructions: SYSTEM_INSTRUCTIONS,
      input: prompt,
      schemaName: 'question_edit',
      schema: questionEditSchema,
      effort: 'low',
    });
  });
