/**
 * STRICT OUTPUT SCHEMA for generated question content.
 *
 * The schema is deliberately CONTENT-ONLY: there is no field for marks,
 * numbering, spacing, section or layout, so the model has no way to influence
 * the look of the paper even if it tried.
 *
 * /v1/responses strict mode requires: every property listed in `required`,
 * additionalProperties:false everywhere, optional fields typed as nullable.
 */
import type { BankType } from '../examBank';

const str = { type: 'string' } as const;
const nullableStr = { type: ['string', 'null'] } as const;

const optionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { text: str, isCorrect: { type: 'boolean' } },
  required: ['text', 'isCorrect'],
};

const pairSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { left: str, right: str },
  required: ['left', 'right'],
};

const subPartSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { text: str, answer: str },
  required: ['text', 'answer'],
};

const partSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: str,
    answer: nullableStr,
    parts: { type: ['array', 'null'], items: subPartSchema },
  },
  required: ['text', 'answer', 'parts'],
};

/** Only the fields a given type actually needs — keeps the model focused. */
function itemSchema(type: BankType) {
  const properties: Record<string, unknown> = { text: str, topic: str };
  const required = ['text', 'topic'];

  const add = (name: string, schema: unknown) => {
    properties[name] = schema;
    required.push(name);
  };

  switch (type) {
    case 'mcq':
      add('options', { type: 'array', items: optionSchema });
      break;
    case 'true_false':
      add('answer', { type: 'string', enum: ['True', 'False'] });
      break;
    case 'fill_blank':
    case 'short_answer':
      add('answer', str);
      break;
    case 'matching':
      add('pairs', { type: 'array', items: pairSchema });
      break;
    case 'structured':
      add('parts', { type: 'array', items: partSchema });
      break;
    case 'essay':
      add('rubric', { type: 'array', items: str });
      break;
  }

  return { type: 'object', additionalProperties: false, properties, required };
}

export function batchSchema(type: BankType) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: { questions: { type: 'array', items: itemSchema(type) } },
    required: ['questions'],
  } as Record<string, unknown>;
}
