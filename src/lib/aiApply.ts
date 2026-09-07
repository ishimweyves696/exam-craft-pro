/**
 * Turns AI-returned question CONTENT into the exam's question shape.
 * Ids, numbering, spacing and every other layout decision are made here in
 * code — never by the model.
 */
import type { AiEditedQuestion } from './ai/editSchema';

const rid = () => Math.random().toString(36).slice(2, 7);

export function materialiseQuestion(
  ai: AiEditedQuestion,
  sectionId: string,
  index: number,
): any {
  const id = `${sectionId || 'sec'}_q${index + 1}_${rid()}`;
  const q: any = {
    id,
    number: index + 1,
    text: ai.text,
    type: ai.type,
    marks: Math.max(0, Math.round(Number(ai.marks) || 0)),
    answerSpace: ai.answerSpace || 'medium',
  };

  if (ai.options?.length) {
    q.options = ai.options.map((o, i) => ({
      id: `${id}_o${i + 1}`,
      text: o.text,
      isCorrect: Boolean(o.isCorrect),
    }));
    q.answerSpace = 'none';
  }

  if (ai.tableRows?.length) {
    q.tableData = { rows: ai.tableRows.map((r) => [...r]) };
    q.answerSpace = 'none';
  }

  if (ai.subQuestions?.length) {
    q.subQuestions = ai.subQuestions.map((sub, si) => {
      const subId = `${id}_sub${si + 1}`;
      const s: any = {
        id: subId,
        number: si + 1,
        text: sub.text,
        type: 'short_answer',
        marks: Math.max(0, Math.round(Number(sub.marks) || 0)),
        answerSpace: sub.answerSpace || 'small',
      };
      if (sub.subQuestions?.length) {
        s.subQuestions = sub.subQuestions.map((leaf, li) => ({
          id: `${subId}_p${li + 1}`,
          number: li + 1,
          text: leaf.text,
          type: 'short_answer',
          marks: Math.max(0, Math.round(Number(leaf.marks) || 0)),
          answerSpace: 'small',
        }));
        s.answerSpace = 'none';
      }
      return s;
    });
    const partTotal = q.subQuestions.reduce((sum: number, s: any) => sum + (s.marks || 0), 0);
    if (partTotal > 0) q.marks = partTotal;
    q.answerSpace = 'none';
  }

  return q;
}

/** The expected answers to fold into the marking guide for a rewritten question. */
export function expectedAnswerFor(ai: AiEditedQuestion): string {
  if (ai.answer) return ai.answer;
  if (ai.options?.length) {
    const correct = ai.options.find((o) => o.isCorrect);
    if (correct) return correct.text;
  }
  if (ai.subQuestions?.length) {
    return ai.subQuestions
      .map((s, i) => {
        const letter = 'abcdefgh'[i] ?? String(i + 1);
        if (s.subQuestions?.length) {
          return `${letter}) ${s.subQuestions
            .map((l, j) => `${['i', 'ii', 'iii', 'iv'][j] ?? j + 1}) ${l.answer ?? ''}`)
            .join('; ')}`;
        }
        return `${letter}) ${s.answer ?? ''}`;
      })
      .join('\n');
  }
  return '';
}
