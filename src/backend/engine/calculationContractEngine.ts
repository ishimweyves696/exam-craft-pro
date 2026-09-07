import { Question, SubQuestion, SubSubQuestion } from '../../types.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';
import { QuestionContractValidationIssue, QuestionContractValidationResult, QuestionSanitizationResult } from '../../types/questionContracts.js';

/**
 * Detects if a question is a calculation based on text patterns and subject.
 */
export function isCalculationQuestion(q: Question | SubQuestion | SubSubQuestion, subjectName?: string): boolean {
  if ((q.type as any) === 'calculation' || q.layoutVariant === 'calculation' || q.presentation?.layout === 'calculation') return true;
  
  const text = (q.text || '').toLowerCase();
  const inst = (q.instruction || '').toLowerCase();
  const context = (q.context || '').toLowerCase();
  const combined = `${inst} ${text} ${context}`;

  // Subject check - some subjects are naturally calculation-heavy
  const calcHeavySubjects = ['mathematics', 'physics', 'chemistry', 'accounting', 'economics', 'entrepreneurship'];
  const isCalcSubject = calcHeavySubjects.some(s => subjectName?.toLowerCase().includes(s));

  if (isCalcSubject) {
    if (/\b(calculate|find|solve|compute|determine|evaluate|show that|prove|derive|work out)\b/i.test(combined)) {
      return true;
    }
    if (/[\d\.]+\s*[a-z]*\s*[\+\-\*\/]\s*[\d\.]+/i.test(combined)) {
      return true; // Simple arithmetic pattern
    }
  }

  return /\b(calculate|compute|solve for|determine the value)\b/i.test(combined);
}

/**
 * Validates a calculation question contract.
 */
export function validateCalculationQuestionContract(
  q: Question | SubQuestion | SubSubQuestion,
  options?: { subjectName?: string }
): QuestionContractValidationResult {
  const issues: QuestionContractValidationIssue[] = [];
  const qId = (q as any).id || `q_${q.number || 'unknown'}`;
  const subjectName = options?.subjectName || '';

  // 1. Check for solvability (Basic heuristic: must have numbers or variables)
  const combinedText = `${q.text || ''} ${q.context || ''} ${q.givenData || ''}`.trim();
  if (!/\d|[a-z]/i.test(combinedText)) {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: 'Calculation question appears to have no numerical data or variables to solve.',
      severity: 'High',
      autoFixable: false,
    });
  }

  // 2. Check for question stem
  if (!q.text) {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: 'Calculation question requires a clear task or question stem.',
      severity: 'Critical',
      autoFixable: false,
    });
  }

  // 3. Subject compatibility
  const forbiddenCalcSubjects = ['english', 'french', 'literature', 'history', 'religious'];
  if (forbiddenCalcSubjects.some(s => subjectName.toLowerCase().includes(s))) {
    issues.push({
      field: 'type',
      code: 'INVALID_STRUCTURE',
      message: `Calculation question type is generally not appropriate for subject: ${subjectName}`,
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // 4. Data vs Question separation check (Warning if they seem merged)
  if (q.text && q.text.length > 300 && !q.context && !q.givenData) {
    issues.push({
      field: 'text',
      code: 'INVALID_FORMATTING',
      message: 'Calculation question has a very long stem; consider separating context and data from the question.',
      severity: 'Low',
      autoFixable: true,
    });
  }

  return {
    questionId: qId,
    questionNumber: q.number,
    questionType: 'calculation',
    isValid: !issues.some(i => i.severity === 'Critical' || i.severity === 'High'),
    issues,
  };
}

/**
 * Sanitizes a calculation question.
 */
export function sanitizeCalculationQuestion(
  q: Question | SubQuestion | SubSubQuestion,
  options?: { subjectName?: string; parentQuestion?: Question }
): QuestionSanitizationResult {
  const clone = JSON.parse(JSON.stringify(q)) as Question;
  const fixes: string[] = [];
  const subjectName = options?.subjectName || '';
  const qId = clone.id || `q_${clone.number || 'calc'}`;

  // 0. Global Deep Clean
  if (clone.text) {
    const cleaned = deepCleanText(clone.text);
    if (cleaned !== clone.text) {
      clone.text = cleaned;
      fixes.push(`Deep cleaned calculation text (removed slop/tags)`);
    }
  }

  // 1. Split embedded sub-questions if not already a parent
  if ((!clone.subQuestions || clone.subQuestions.length === 0) && clone.text) {
    const split = splitEmbeddedSubQuestions(clone.text, 'calculation', clone.id || 'calc', clone.marks || 0);
    if (split.subQuestions) {
      clone.text = split.stimulus;
      clone.subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from calculation block`);
      // Recursively sanitize
      return sanitizeCalculationQuestion(clone, options);
    }
  }

  // 1. Enforce explicit question type
  (clone as any).type = 'short';

  // 2. Extract hierarchy elements if they are merged in 'text'
  // Rule: If 'text' contains "Given ... Calculate ...", split them.
  if (clone.text && !clone.givenData && !clone.context) {
    let text = clone.text;
    
    // Strategy: Detect embedded sub-questions like (a), (b), (c)
    const split = splitEmbeddedSubQuestions(text, 'calculation', qId, clone.marks || 0);
    if (split.subQuestions) {
      clone.text = split.stimulus;
      clone.subQuestions = split.subQuestions;
      
      // Adjust parent marks if sum of children doesn't match
      const totalChildMarks = clone.subQuestions.reduce((sum, sq) => sum + (sq.marks || 0), 0);
      if (totalChildMarks > 0) clone.marks = totalChildMarks;

      fixes.push(`Split embedded sub-questions (${clone.subQuestions.length} parts) from calculation text`);
      return { sanitized: clone, repairLogs: [], fixes, isRejected: false };
    }

    const givenMatch = text.match(/^(?:Given\s+that\s+|Given\s+)([\s\S]+?)(?=\s+Calculate|\s+Determine|\s+Find|\s+What|\s+How|\?)/i);
    if (givenMatch) {
      clone.givenData = givenMatch[1].trim();
      clone.text = text.replace(givenMatch[0], '').trim();
      fixes.push('Separated "Given Data" from question text');
    }

    const contextMatch = text.match(/^([\s\S]+?)(?=\s+Calculate|\s+Determine|\s+Find|\s+What|\s+How|\?)/i);
    if (contextMatch && !clone.givenData && contextMatch[1].split(' ').length > 10) {
      clone.context = contextMatch[1].trim();
      clone.text = text.replace(contextMatch[1], '').trim();
      fixes.push('Separated "Context" from question text');
    }
  }

  // 3. Instruction Separation & Deduplication
  // If the instruction and the question stem both start with "Calculate...", deduplicate.
  if (clone.instruction && clone.text) {
    const instClean = clone.instruction.toLowerCase().replace(/[^a-z]/g, '');
    const textClean = clone.text.toLowerCase().replace(/[^a-z]/g, '');
    
    if (textClean.startsWith(instClean)) {
      clone.instruction = undefined;
      fixes.push('Removed redundant instruction duplicated in question text');
    } else if (instClean.includes('calculate') && textClean.includes('calculate')) {
      // If both say "Calculate ...", simplify instruction
      clone.instruction = 'Answer the following question.';
      fixes.push('Simplified redundant calculation instruction');
    }
  }

  // 4. Working Space Calculation
  if (!clone.answerSpace || clone.answerSpace === 'none') {
    let space: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
    const marks = clone.marks || 0;
    
    if (marks <= 2) space = 'small';
    else if (marks <= 5) space = 'medium';
    else if (marks <= 10) space = 'large';
    else space = 'xlarge';

    // Subject bias
    if (subjectName.toLowerCase().includes('math')) {
      if (marks > 3) space = 'large';
    }

    clone.answerSpace = space;
    fixes.push(`Set answerSpace to '${space}' based on ${marks} marks`);
  }

  // 5. Unit Awareness (Basic)
  if (subjectName.toLowerCase().includes('physics') || subjectName.toLowerCase().includes('chemistry')) {
    if (clone.text && !clone.text.toLowerCase().includes('unit') && !clone.text.toLowerCase().includes('state the') && (clone.marks || 0) > 1) {
       // Optional: Add hint about units if missing in Physics/Chemistry?
       // The prompt says "Do not randomly add or remove units", so I'll be careful.
    }
  }

  // 6. Formatting - ensure no raw LaTeX leakage (placeholder logic)
  if (clone.text && clone.text.includes('\\frac')) {
     // We assume the renderer handles LaTeX, but we should ensure it's not "raw" in a way that breaks.
     // In this app, we use KaTeX/Markdown, so it should be fine.
  }

  return {
    sanitized: clone as Question,
    repairLogs: [],
    fixes,
    isRejected: false,
  };
}
