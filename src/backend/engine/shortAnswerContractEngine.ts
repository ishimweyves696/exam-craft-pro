import { Question } from '../../types.js';
import { QuestionContractValidationIssue } from '../../types/questionContracts.js';

export function detectShortAnswerTemplate(q: Question): string {
  const text = (q.text || '').toLowerCase();
  const inst = ((q as any).instruction || '').toLowerCase();
  const combined = `${inst} ${text}`;

  // 1. Grouped short answers
  if (q.subQuestions && q.subQuestions.length > 0) {
    return 'grouped_short_answer';
  }

  // 2. Resource-based
  if (
    /passage/i.test(combined) ||
    /read the text/i.test(combined) ||
    /diagram/i.test(combined) ||
    /table/i.test(combined) ||
    /graph/i.test(combined) ||
    /figure/i.test(combined) ||
    q.tableData ||
    q.mermaidData ||
    q.smilesData ||
    q.svgData
  ) {
    return 'resource_based';
  }

  // 3. Explanation
  if (/\b(explain|justify|give reasons|describe|discuss|why)\b/i.test(combined)) {
    return 'explanation';
  }

  // 4. List / State multiple
  if (/\b(list|state|mention|name|give)\b\s+(two|three|four|five|\d+)\b/i.test(combined)) {
    return 'list';
  }

  // 5. Calculation
  if (/\b(calculate|find|solve|compute|determine the value)\b/i.test(combined)) {
    return 'calculation';
  }

  // 6. Definition
  if (/\b(define|what is meant by|meaning of)\b/i.test(combined)) {
    return 'definition';
  }

  // 7. Identification
  if (/\b(identify|who|what|when|where)\b/i.test(combined)) {
    return 'identification';
  }

  // 8. Direct short response (fallback)
  return 'direct_short_response';
}

export function validateShortAnswerQuestionContract(
  q: Question,
  context?: { subjectName?: string }
): { issues: QuestionContractValidationIssue[] } {
  const issues: QuestionContractValidationIssue[] = [];
  const template = detectShortAnswerTemplate(q);
  const isParentContainer = Boolean(q.subQuestions && q.subQuestions.length > 0);

  // Parent container checks
  if (isParentContainer) {
    if (!q.instruction && !q.text) {
      issues.push({
        field: 'instruction',
        code: 'REQUIRED_MISSING',
        message: 'Grouped Short Answer questions require a parent instruction or stimulus text.',
        severity: 'High',
        autoFixable: false,
      });
    }

    for (const subQ of q.subQuestions || []) {
      if (subQ.subQuestions && subQ.subQuestions.length > 0) {
        issues.push({
          field: 'subQuestions',
          code: 'FORBIDDEN_PRESENT',
          message: 'Short Answer grouped statements cannot have deeply nested sub-questions.',
          severity: 'High',
          autoFixable: true,
        });
      }
      
      if (!subQ.text) {
        issues.push({
          field: 'text',
          code: 'REQUIRED_MISSING',
          message: 'Short Answer sub-question requires statement text.',
          severity: 'Critical',
          autoFixable: false,
        });
      }
    }
  } else {
    // Individual checks
    if (!q.text) {
      issues.push({
        field: 'text',
        code: 'REQUIRED_MISSING',
        message: 'Short Answer question requires a statement text.',
        severity: 'Critical',
        autoFixable: false,
      });
    }
  }

  // Forbidden: options
  if (q.options && q.options.length > 0) {
    issues.push({
      field: 'options',
      code: 'FORBIDDEN_PRESENT',
      message: `Short Answer question type must not contain 'options'.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  return { issues };
}

import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export function sanitizeShortAnswerQuestion(
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

  const template = detectShortAnswerTemplate(clone);
  const isParentContainer = Boolean(clone.subQuestions && clone.subQuestions.length > 0);

  // 0. Global Deep Clean
  if (clone.text) {
    const cleaned = deepCleanText(clone.text);
    if (cleaned !== clone.text) {
      clone.text = cleaned;
      fixes.push(`Deep cleaned short answer text (removed slop/tags)`);
    }
  }

  // 1. Strip forbidden options
  if (clone.options) {
    repairLogs.push({
      questionId: clone.id,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden options array from Short Answer question',
      originalValue: clone.options,
      newValue: undefined,
    });
    fixes.push(`Stripped forbidden 'options' from Short Answer Q${clone.number || ''}`);
    delete (clone as any).options;
  }

  // Strategy: Detect embedded sub-questions like (a), (b), (c) if not already a parent
  if (!isParentContainer && clone.text) {
    const split = splitEmbeddedSubQuestions(clone.text, 'short', clone.id || 'short', clone.marks || 0);
    if (split.subQuestions) {
      clone.text = split.stimulus;
      clone.subQuestions = split.subQuestions;
      
      const totalChildMarks = clone.subQuestions.reduce((sum, sq) => sum + (sq.marks || 0), 0);
      if (totalChildMarks > 0) clone.marks = totalChildMarks;

      fixes.push(`Split embedded sub-questions (${clone.subQuestions.length} parts) from short answer text`);
      // Re-calculate state
      return sanitizeShortAnswerQuestion(clone, context);
    }
  }

  // 2. Strip tableData unless stimulus-based
  if (clone.tableData && template !== 'resource_based') {
    delete (clone as any).tableData;
    fixes.push(`Stripped unused tableData from Short Answer Q${clone.number || ''}`);
  }

  // Helper: process individual question text/instructions
  const processQuestionText = (item: any, isChild: boolean) => {
    if (!item.text) return;
    
    let newText = item.text;
    
    // AI Prefix stripping from text
    newText = newText.replace(/^\s*Question\s*\d+:\s*/i, '');
    newText = newText.replace(/^\s*\(\s*[a-z]\s*\)\s*/i, '');
    newText = newText.replace(/^\s*\d+\.\s*/, '');
    
    // Unwrap full bolding
    if (newText.startsWith('**') && newText.endsWith('**') && newText.length > 4) {
      const inner = newText.slice(2, -2);
      if (!inner.includes('**')) {
        newText = inner;
      }
    }

    // Redundant instruction stripping: if the instruction exactly matches or is a prefix of the text
    if (item.instruction) {
      const instClean = item.instruction.trim().toLowerCase();
      const textClean = newText.trim().toLowerCase();
      if (textClean.startsWith(instClean)) {
        item.instruction = undefined;
        fixes.push(`Removed redundant instruction that is duplicated in the stem`);
      }
    }

    if (newText !== item.text) {
      repairLogs.push({
        questionId: item.id,
        violatedRule: 'INVALID_FORMATTING',
        actionTaken: 'Sanitized Short Answer statement text (stripped prefixes/bolding)',
        originalValue: item.text,
        newValue: newText,
      });
      item.text = newText;
      fixes.push(`Sanitized Short Answer text formatting`);
    }
    
    // Calculate expected answer space
    if (item.answerSpace === 'none' || !item.answerSpace) {
      let recommendedSpace: 'small' | 'medium' | 'large' = 'medium';
      
      const itemTemplate = detectShortAnswerTemplate(item);
      if (itemTemplate === 'identification') recommendedSpace = 'small';
      if (itemTemplate === 'definition') recommendedSpace = 'small';
      if (itemTemplate === 'explanation') recommendedSpace = 'medium';
      if (itemTemplate === 'list') recommendedSpace = 'medium';
      if (itemTemplate === 'calculation') recommendedSpace = 'medium';
      
      // If it's a child or normal question requiring space, set it
      if (isChild || !isParentContainer) {
         item.answerSpace = recommendedSpace;
      }
    }
  };

  if (isParentContainer) {
    if (clone.answerSpace && clone.answerSpace !== 'none') {
      clone.answerSpace = 'none'; // Parent doesn't need space, children do
    }
    
    // Deduplicate child instructions that match parent
    const parentInstClean = (clone.instruction || '').trim().toLowerCase();
    
    for (const subQ of clone.subQuestions || []) {
      if (subQ.subQuestions && subQ.subQuestions.length > 0) {
        repairLogs.push({
          questionId: subQ.id,
          violatedRule: 'FORBIDDEN_PROPERTY',
          actionTaken: 'Stripped deeply nested subQuestions from grouped short answer.',
          originalValue: subQ.subQuestions,
          newValue: undefined,
        });
        fixes.push(`Stripped nested sub-questions from grouped short answer child.`);
        subQ.subQuestions = undefined;
      }
      
      if (subQ.instruction && parentInstClean) {
        const subInstClean = subQ.instruction.trim().toLowerCase();
        if (subInstClean === parentInstClean || parentInstClean.includes(subInstClean)) {
          subQ.instruction = undefined; // Strip it
        }
      }
      processQuestionText(subQ, true);
    }
  } else {
    processQuestionText(clone, false);
  }

  return {
    sanitized: clone,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
