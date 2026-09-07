import { Question } from '../../types.js';
import { QuestionContractValidationIssue } from '../../types/questionContracts.js';
import { extractTrueFalseExpectedAnswer } from '../../types/questionContracts.js';

export function detectTrueFalseTemplate(q: Question): string {
  const text = (q.text || '').toLowerCase();
  const inst = ((q as any).instruction || '').toLowerCase();
  const combined = `${inst} ${text}`;

  // 1. Passage-based True/False
  if (
    /passage/i.test(combined) ||
    /read the text/i.test(combined) ||
    (q.subQuestions && q.subQuestions.length > 0 && text.length > 150)
  ) {
    return 'passage_based_true_false';
  }

  // 2. Stimulus-based True/False (diagram, table, data)
  if (
    /diagram/i.test(combined) ||
    /table/i.test(combined) ||
    /graph/i.test(combined) ||
    /figure/i.test(combined) ||
    q.tableData ||
    q.mermaidData ||
    q.smilesData ||
    q.svgData
  ) {
    return 'stimulus_based_true_false';
  }

  // 3. True/False with correction
  if (
    /correct the false/i.test(combined) ||
    /if false, correct/i.test(combined) ||
    /if false, rewrite/i.test(combined) ||
    /justify/i.test(combined)
  ) {
    return 'true_false_with_correction';
  }

  // 4. Grouped statements
  if (q.subQuestions && q.subQuestions.length > 0) {
    return 'grouped_statements';
  }

  // 5. Default simple statement
  return 'simple_statements';
}

export function validateTrueFalseQuestionContract(
  q: Question,
  context?: { subjectName?: string }
): { issues: QuestionContractValidationIssue[] } {
  const issues: QuestionContractValidationIssue[] = [];
  const template = detectTrueFalseTemplate(q);
  const isParentContainer = Boolean(q.subQuestions && q.subQuestions.length > 0);

  // Grouped / Parent container checks
  if (isParentContainer) {
    // Parent should have instruction, but might not have expectedAnswer
    if (!q.instruction && !q.text) {
       issues.push({
         field: 'instruction',
         code: 'REQUIRED_MISSING',
         message: 'Grouped True/False questions require a parent instruction or stimulus text.',
         severity: 'High',
         autoFixable: false,
       });
    }

    // Children must not have subQuestions themselves (limit depth for TF)
    for (const subQ of q.subQuestions || []) {
      if (subQ.subQuestions && subQ.subQuestions.length > 0) {
        issues.push({
          field: 'subQuestions',
          code: 'FORBIDDEN_PRESENT',
          message: 'True/False grouped statements cannot have deeply nested sub-questions.',
          severity: 'High',
          autoFixable: true,
        });
      }
      
      // Each child needs an expected answer
      const tfAnswer = extractTrueFalseExpectedAnswer(subQ);
      if (!tfAnswer.hasAnswer) {
        issues.push({
          field: 'expectedAnswer',
          code: 'MISSING_ANSWER',
          message: tfAnswer.isInvalidFormat
            ? `True/False sub-statement contains an invalid expected answer.`
            : `True/False sub-statement is missing explicit expected answer ('True' or 'False').`,
          severity: 'Critical',
          autoFixable: false,
        });
      }
    }
  } else {
    // Individual statement checks
    // Required: Statement exists + Explicit Expected Answer
    const tfAnswer = extractTrueFalseExpectedAnswer(q);
    if (!tfAnswer.hasAnswer) {
      issues.push({
        field: 'expectedAnswer',
        code: 'MISSING_ANSWER',
        message: tfAnswer.isInvalidFormat
          ? `True/False question contains an invalid/unrecognized expected answer string.`
          : `True/False question is missing explicit expected answer ('True' or 'False').`,
        severity: 'Critical',
        autoFixable: false,
      });
    }

    if (!q.text) {
      issues.push({
        field: 'text',
        code: 'REQUIRED_MISSING',
        message: 'True/False question requires a statement text.',
        severity: 'Critical',
        autoFixable: false,
      });
    }
  }

  // Forbidden in all True/False templates
  if (q.options && q.options.length > 0) {
    issues.push({
      field: 'options',
      code: 'FORBIDDEN_PRESENT',
      message: `True/False question type must not contain 'options'.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  // Formatting / Structure checks
  if (q.text && /^\s*([a-z]|\d+)[.)]\s*true.*false/i.test(q.text)) {
    issues.push({
      field: 'text',
      code: 'LABEL_LEAK',
      message: `True/False statement text includes hardcoded AI prefixes or response labels (e.g. 'True/False').`,
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // Answer Space specific (e.g. true_false_with_correction needs an answer space if answer is false)
  if (template === 'true_false_with_correction') {
    if (isParentContainer) {
      for (const subQ of q.subQuestions || []) {
        if (!subQ.answerSpace || subQ.answerSpace === 'none') {
           issues.push({
             field: 'answerSpace',
             code: 'INVALID_STRUCTURE',
             message: `True/False with correction requires an answer space for statements.`,
             severity: 'Medium',
             autoFixable: true,
           });
        }
      }
    } else {
      if (!q.answerSpace || q.answerSpace === 'none') {
        issues.push({
          field: 'answerSpace',
          code: 'INVALID_STRUCTURE',
          message: `True/False with correction requires an answer space.`,
          severity: 'Medium',
          autoFixable: true,
        });
      }
    }
  }

  return { issues };
}

import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export function sanitizeTrueFalseQuestion(
  q: Question,
  context?: { subjectName?: string; parentInstruction?: string }
): {
  sanitized: Question;
  repairLogs: any[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
} {
  const clone = JSON.parse(JSON.stringify(q)) as Question;
  const repairLogs: any[] = [];
  const fixes: string[] = [];

  const template = detectTrueFalseTemplate(clone);
  const isParentContainer = Boolean(clone.subQuestions && clone.subQuestions.length > 0);

  // 0. Global Deep Clean
  if (clone.text) {
    const cleaned = deepCleanText(clone.text);
    if (cleaned !== clone.text) {
      clone.text = cleaned;
      fixes.push(`Deep cleaned True/False text (removed slop/tags)`);
    }
  }

  // 1. Split embedded sub-questions if not already a parent
  if (!isParentContainer && clone.text) {
    const split = splitEmbeddedSubQuestions(clone.text, 'true_false', clone.id || 'tf', clone.marks || 0);
    if (split.subQuestions) {
      clone.text = split.stimulus;
      clone.subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from True/False block`);
      // Recursively sanitize now that it's a parent
      return sanitizeTrueFalseQuestion(clone, context);
    }
  }

  // 1. Extract and preserve expected answer before stripping options
  const existingAns = extractTrueFalseExpectedAnswer(clone);
  if (existingAns.hasAnswer && existingAns.value) {
    (clone as any).expectedAnswer = existingAns.value;
  } else if (!isParentContainer && !(clone as any).expectedAnswer) {
    // Default to 'True' if no expected answer could be determined from options/text
    (clone as any).expectedAnswer = 'True';
    fixes.push(`Defaulted expectedAnswer to 'True' for True/False statement Q${clone.number || ''}`);
  }

  // Also sanitize subQuestions expectedAnswer if parent container
  if (isParentContainer && clone.subQuestions) {
    clone.subQuestions.forEach((subQ: any) => {
      const subAns = extractTrueFalseExpectedAnswer(subQ);
      if (subAns.hasAnswer && subAns.value) {
        subQ.expectedAnswer = subAns.value;
      } else if (!subQ.expectedAnswer) {
        subQ.expectedAnswer = 'True';
        fixes.push(`Defaulted expectedAnswer to 'True' for True/False sub-statement Q${subQ.number || ''}`);
      }
      if (subQ.options) {
        delete (subQ as any).options;
      }
    });
  }

  // 1b. Strip forbidden options
  if (clone.options) {
    repairLogs.push({
      questionId: clone.id,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden options array from True/False question',
      originalValue: clone.options,
      newValue: undefined,
    });
    fixes.push(`Stripped forbidden 'options' from True/False Q${clone.number || ''}`);
    delete (clone as any).options;
  }

  // 2. Strip tableData unless stimulus-based
  if (clone.tableData && template !== 'stimulus_based_true_false') {
    delete (clone as any).tableData;
    fixes.push(`Stripped unused tableData from True/False Q${clone.number || ''}`);
  }

  // 3. AI Prefix stripping from text (e.g., "(a) Statement" or "1. Statement" or "True/False:")
  if (clone.text) {
    let newText = clone.text;
    newText = newText.replace(/^\s*Question\s*\d+:\s*/i, '');
    newText = newText.replace(/^\s*\(\s*[a-z]\s*\)\s*/i, '');
    newText = newText.replace(/^\s*\d+\.\s*/, '');
    newText = newText.replace(/^(?:Choose\s+)?(?:True|False)\s*(?:\/|or)\s*(?:True|False)\s*:\s*/i, '');
    
    // Also strip trailing true/false options if the AI dumped them in the text
    newText = newText.replace(/\s*(?:\[|\()?True\s*(?:\/|\|)\s*False(?:\]|\))?\s*$/i, '');
    newText = newText.replace(/\s*(?:\[|\()?(?:True|False)(?:\]|\))\s*$/i, '');
    
    // Unwrap full bolding
    if (newText.startsWith('**') && newText.endsWith('**') && newText.length > 4) {
      const inner = newText.slice(2, -2);
      if (!inner.includes('**')) {
        newText = inner;
      }
    }
    
    if (newText !== clone.text) {
      repairLogs.push({
        questionId: clone.id,
        violatedRule: 'INVALID_STRUCTURE',
        actionTaken: 'Stripped AI prefix/suffix from True/False statement',
        originalValue: clone.text,
        newValue: newText,
      });
      fixes.push(`Sanitized True/False statement text Q${clone.number || ''}`);
      clone.text = newText;
    }
  }

  // 4. Answer space adjustments
  if (template === 'true_false_with_correction') {
    if (isParentContainer) {
      for (const subQ of clone.subQuestions || []) {
        if (!subQ.answerSpace || subQ.answerSpace === 'none') {
          subQ.answerSpace = 'medium';
          fixes.push(`Added medium answer space for correction in sub-question Q${subQ.number || ''}`);
        }
      }
      if (clone.answerSpace && clone.answerSpace !== 'none') {
        clone.answerSpace = 'none'; // Parent doesn't need space
      }
    } else {
      if (!clone.answerSpace || clone.answerSpace === 'none') {
        clone.answerSpace = 'medium';
        fixes.push(`Added medium answer space for correction in Q${clone.number || ''}`);
      }
    }
  } else {
    // Standard true/false doesn't need an answer space for simple statements
    if (isParentContainer) {
      for (const subQ of clone.subQuestions || []) {
        if (subQ.answerSpace && subQ.answerSpace !== 'none') {
          subQ.answerSpace = 'none';
        }
      }
      if (clone.answerSpace && clone.answerSpace !== 'none') {
        clone.answerSpace = 'none';
      }
    } else {
      if (clone.answerSpace && clone.answerSpace !== 'none') {
        clone.answerSpace = 'none';
      }
    }
  }

  // 5. Answer Key Repair Fallback
  const tfAnswer = extractTrueFalseExpectedAnswer(clone);
  if (!tfAnswer.hasAnswer) {
    // If it's a child sub-question, we really need an answer.
    // Try one last desperate grep in text
    if (clone.text && /\b(true|vrai|ukuri)\b/i.test(clone.text) && !/\b(false|faux|ikinyoma)\b/i.test(clone.text)) {
      (clone as any).expectedAnswer = 'True';
      fixes.push(`Inferred 'True' from statement text for Q${clone.number || ''}`);
    } else if (clone.text && /\b(false|faux|ikinyoma)\b/i.test(clone.text) && !/\b(true|vrai|ukuri)\b/i.test(clone.text)) {
      (clone as any).expectedAnswer = 'False';
      fixes.push(`Inferred 'False' from statement text for Q${clone.number || ''}`);
    }
  }

  return {
    sanitized: clone,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
