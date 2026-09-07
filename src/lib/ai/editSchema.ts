/**
 * STRICT SCHEMA for AI-assisted edits of a single question.
 *
 * Content-only, plus the two *sizing* knobs a teacher can legitimately ask for
 * ("make this worth 5 marks", "give more writing space"). Everything else —
 * numbering, indentation, fonts, spacing, page breaks — stays with the code.
 */

const str = { type: 'string' } as const;
const nullableStr = { type: ['string', 'null'] } as const;
const num = { type: 'number' } as const;

const ANSWER_SPACE = {
  type: 'string',
  enum: ['none', 'small', 'medium', 'large', 'xlarge'],
} as const;

const QUESTION_TYPE = {
  type: 'string',
  enum: ['mcq', 'true_false', 'fill_blank', 'matching', 'short_answer', 'structured', 'essay'],
} as const;

const optionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { text: str, isCorrect: { type: 'boolean' } },
  required: ['text', 'isCorrect'],
};

const leafSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { text: str, marks: num, answer: nullableStr },
  required: ['text', 'marks', 'answer'],
};

const subSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: str,
    marks: num,
    answerSpace: ANSWER_SPACE,
    answer: nullableStr,
    subQuestions: { type: ['array', 'null'], items: leafSchema },
  },
  required: ['text', 'marks', 'answerSpace', 'answer', 'subQuestions'],
};

const questionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: str,
    type: QUESTION_TYPE,
    marks: num,
    answerSpace: ANSWER_SPACE,
    answer: nullableStr,
    options: { type: ['array', 'null'], items: optionSchema },
    tableRows: { type: ['array', 'null'], items: { type: 'array', items: str } },
    subQuestions: { type: ['array', 'null'], items: subSchema },
  },
  required: [
    'text',
    'type',
    'marks',
    'answerSpace',
    'answer',
    'options',
    'tableRows',
    'subQuestions',
  ],
};

export const questionEditSchema: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: { type: 'array', items: questionSchema },
    note: nullableStr,
  },
  required: ['questions', 'note'],
};

export interface AiEditedQuestion {
  text: string;
  type: string;
  marks: number;
  answerSpace: string;
  answer: string | null;
  options: { text: string; isCorrect: boolean }[] | null;
  tableRows: string[][] | null;
  subQuestions:
    | {
        text: string;
        marks: number;
        answerSpace: string;
        answer: string | null;
        subQuestions: { text: string; marks: number; answer: string | null }[] | null;
      }[]
    | null;
}

export interface AiEditResult {
  questions: AiEditedQuestion[];
  note: string | null;
}
