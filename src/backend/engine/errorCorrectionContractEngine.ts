import { Question, SubQuestion } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';

export type ErrorCorrectionTemplateId =
  | 'one_error_per_sentence'
  | 'identify_and_correct'
  | 'rewrite_correctly'
  | 'passage_correction'
  | 'targeted_grammar'
  | 'multiple_error_sentence';

export interface ErrorCorrectionTemplateContract {
  templateId: ErrorCorrectionTemplateId;
  name: string;
  description: string;
  purpose: string;
  requiredFields: string[];
  optionalFields: string[];
  forbiddenFields: string[];
  instructionRequirements: {
    defaultInstructionEn: string;
    defaultInstructionFr: string;
    defaultInstructionRw: string;
  };
  itemStructure: {
    requiresSourceSentence?: boolean;
    requiresPassage?: boolean;
    expectedErrorCount?: number | 'multiple';
  };
  answerStructure: {
    requiresErrorTarget?: boolean;
    requiresCorrection?: boolean;
  };
  responseAreaType: 'small' | 'medium' | 'large';
}

export const ERROR_CORRECTION_TEMPLATE_REGISTRY: Record<
  ErrorCorrectionTemplateId,
  ErrorCorrectionTemplateContract
> = {
  one_error_per_sentence: {
    templateId: 'one_error_per_sentence',
    name: 'One Error Per Sentence',
    description: 'Each sentence contains exactly one target grammatical, spelling, or punctuation error.',
    purpose: 'Test precise error identification and correction at the sentence level.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Identify and correct the single error in each sentence.',
      defaultInstructionFr: 'Identifiez et corrigez l\'unique erreur dans chaque phrase.',
      defaultInstructionRw: 'Tahura kandi ugorore ikosa rimwe riri muri buri nteruro.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      expectedErrorCount: 1,
    },
    answerStructure: {
      requiresCorrection: true,
    },
    responseAreaType: 'small',
  },
  identify_and_correct: {
    templateId: 'identify_and_correct',
    name: 'Identify and Correct Error',
    description: 'Identify the incorrect word/phrase and state the correct replacement.',
    purpose: 'Assess two-part diagnostic skills: locating the error and supplying the fix.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Underline or write down the error in each sentence, then write the correct word.',
      defaultInstructionFr: 'Soulignez ou écrivez l\'erreur dans chaque phrase, puis écrivez le mot correct.',
      defaultInstructionRw: 'Cira umurongo cyangwa wandike ikosa muri buri nteruro, ubundi wandike ijambo ry' + "'" + 'ukuri.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      expectedErrorCount: 1,
    },
    answerStructure: {
      requiresErrorTarget: true,
      requiresCorrection: true,
    },
    responseAreaType: 'small',
  },
  rewrite_correctly: {
    templateId: 'rewrite_correctly',
    name: 'Rewrite Correctly',
    description: 'Rewrite the entire sentence correctly, removing all grammatical errors.',
    purpose: 'Evaluate holistic sentence accuracy, word order, and mechanical correctness.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each incorrect sentence correctly.',
      defaultInstructionFr: 'Réécrivez correctement chaque phrase incorrecte.',
      defaultInstructionRw: 'Andika neza buri nteruro irimo ikosa.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresCorrection: true,
    },
    responseAreaType: 'medium',
  },
  passage_correction: {
    templateId: 'passage_correction',
    name: 'Passage Error Correction',
    description: 'A continuous passage containing numbered or underlined errors to correct.',
    purpose: 'Assess contextual proofreading, cohesion, and text-level error correction.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Read the text below carefully. Correct the errors indicated by numbers or underlines.',
      defaultInstructionFr: 'Lisez attentivement le texte ci-dessous. Corrigez les erreurs indiquées par des numéros ou des soulignements.',
      defaultInstructionRw: 'Soma inyandiko iri hansi n’ubwitonzi. Gorora amakosa aragazwa n’imibare cyangwa imirongo yaciwe.',
    },
    itemStructure: {
      requiresPassage: true,
      expectedErrorCount: 'multiple',
    },
    answerStructure: {
      requiresCorrection: true,
    },
    responseAreaType: 'large',
  },
  targeted_grammar: {
    templateId: 'targeted_grammar',
    name: 'Targeted Grammar Correction',
    description: 'Correction focused on a specific grammatical category (e.g. subject-verb agreement, tenses, prepositions, articles).',
    purpose: 'Evaluate mastery of a specific rule or grammatical category.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Correct the grammatical errors in the following sentences as specified.',
      defaultInstructionFr: 'Corrigez les erreurs grammaticales dans les phrases suivantes comme indiqué.',
      defaultInstructionRw: 'Kosoza amakosa y' + "'" + 'ikibonezamvugo mu nteruro zikurikira nk' + "'" + 'uko amabwiriza abivuga.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresCorrection: true,
    },
    responseAreaType: 'small',
  },
  multiple_error_sentence: {
    templateId: 'multiple_error_sentence',
    name: 'Multiple-Error Sentence Correction',
    description: 'Sentence containing multiple specified errors (e.g. 2 or 3 errors) to identify and correct.',
    purpose: 'Evaluate higher-order proofreading within complex multi-clause sentences.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Each sentence contains multiple errors. Identify and correct all errors in each sentence.',
      defaultInstructionFr: 'Chaque phrase contient plusieurs erreurs. Identifiez et corrigez toutes les erreurs dans chaque phrase.',
      defaultInstructionRw: 'Buri nteruro irimo amakosa menshi. Tahura ugorore amakosa yose muri buri nteruro.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      expectedErrorCount: 'multiple',
    },
    answerStructure: {
      requiresErrorTarget: true,
      requiresCorrection: true,
    },
    responseAreaType: 'medium',
  },
};

export interface ErrorCorrectionValidationIssue {
  field: string;
  code:
    | 'REQUIRED_MISSING'
    | 'INVALID_STRUCTURE'
    | 'FORBIDDEN_PROPERTY'
    | 'LABEL_LEAK'
    | 'WHOLE_QUESTION_BOLD'
    | 'INSTRUCTION_MERGED'
    | 'REDUNDANT_INSTRUCTION'
    | 'MISSING_PASSAGE'
    | 'MISSING_ERROR_TARGET';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface ErrorCorrectionValidationResult {
  isValid: boolean;
  issues: ErrorCorrectionValidationIssue[];
  templateId: ErrorCorrectionTemplateId;
}

export interface ErrorCorrectionSanitizationResult {
  sanitized: Question;
  repairLogs: {
    questionId: string;
    violatedRule: string;
    actionTaken: string;
    originalValue?: any;
    newValue?: any;
  }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Regex to detect AI label prefixes on error correction stems (e.g., "(a)", "1.", "Question 1:").
 */
export const ERROR_CORRECTION_LABEL_PREFIX_REGEX =
  /^(?:(?:\(?\d+\)?|\(?[a-zA-Z]\)?)\s*[\.\)]\s*|question\s+\d+[:\.]?\s*)/i;

/**
 * Regex patterns for instructions merged into error correction question stems.
 */
const MERGED_ERROR_CORRECTION_INSTRUCTIONS = [
  /^(?:correct\s+(?:the\s+)?(?:error[s]?|mistake[s]?)\s*(?:in\s+the\s+following\s+sentence[s]?)?[:\.]?\s*)/i,
  /^(?:identify\s+and\s+correct\s+(?:the\s+)?(?:error[s]?|mistake[s]?)\s*(?:in\s+the\s+following\s+sentence[s]?)?[:\.]?\s*)/i,
  /^(?:rewrite\s+(?:the\s+following\s+)?sentence[s]?\s+correctly[:\.]?\s*)/i,
  /^(?:corrigez\s+les\s+erreurs\s+dans\s+les\s+phrases\s+suivantes[:\.]?\s*)/i,
  /^(?:gorora\s+amakosa\s+mu\s+nteruro\s+zikurikira[:\.]?\s*)/i,
];

/**
 * Detects which of the 6 error correction templates applies to the question.
 */
export function detectErrorCorrectionTemplate(q: Question): ErrorCorrectionTemplateId {
  const text = (q.text || '').trim();
  const inst = (q.instruction || '').trim();
  const combined = (inst + ' ' + text).toLowerCase();

  // 1. Passage correction
  if (
    text.includes('\n\n') ||
    text.length > 250 ||
    /read the (passage|text|paragraph)/i.test(combined) ||
    /passage error/i.test(combined) ||
    /\(\d+\)\s+[A-Z]/i.test(text) // Numbered inline errors e.g. "(1) She go..."
  ) {
    return 'passage_correction';
  }

  // 2. Identify and correct
  if (
    /\b(underline|state|identify\s+and\s+correct|locate\s+the\s+error|find\s+the\s+mistake)\b/i.test(
      combined
    ) ||
    /write down the error/i.test(combined)
  ) {
    return 'identify_and_correct';
  }

  // 3. Multiple errors
  if (
    /\b(multiple errors|2 errors|3 errors|two errors|three errors|several mistakes)\b/i.test(
      combined
    ) ||
    /each sentence contains (two|three|\d+) errors/i.test(combined)
  ) {
    return 'multiple_error_sentence';
  }

  // 4. Targeted grammar
  if (
    /\b(subject-verb agreement|tenses|prepositions|articles|pronouns|adjectives|adverbs|conjunctions)\b/i.test(
      combined
    ) ||
    /correct the (preposition|tense|article|agreement) error/i.test(combined)
  ) {
    return 'targeted_grammar';
  }

  // 5. Rewrite correctly
  if (
    /\b(rewrite correctly|rewrite each sentence|rewrite the full sentence)\b/i.test(combined) ||
    /rewrite the incorrect sentence/i.test(combined)
  ) {
    return 'rewrite_correctly';
  }

  // 6. One error per sentence (Default)
  return 'one_error_per_sentence';
}

/**
 * Validates an error correction question against its template contract.
 */
export function validateErrorCorrectionQuestionContract(
  q: Question,
  options?: { subjectName?: string }
): ErrorCorrectionValidationResult {
  const issues: ErrorCorrectionValidationIssue[] = [];
  const templateId = detectErrorCorrectionTemplate(q);

  // Forbidden fields
  if (q.options && Array.isArray(q.options) && q.options.length > 0) {
    issues.push({
      field: 'options',
      code: 'FORBIDDEN_PROPERTY',
      message: `Error correction question must not contain 'options' array.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  if (q.tableData) {
    issues.push({
      field: 'tableData',
      code: 'FORBIDDEN_PROPERTY',
      message: `Error correction question must not contain 'tableData'.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  // Check stem content
  const text = (q.text || '').trim();
  const hasSubQ = Array.isArray(q.subQuestions) && q.subQuestions.length > 0;

  if (!text && !hasSubQ) {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: `Error correction question requires text stem or subquestions.`,
      severity: 'Critical',
      autoFixable: false,
    });
  }

  // Template-specific check
  if (templateId === 'passage_correction' && text.length < 50 && !hasSubQ) {
    issues.push({
      field: 'text',
      code: 'MISSING_PASSAGE',
      message: `Passage error correction template requires a multi-sentence passage text.`,
      severity: 'Medium',
      autoFixable: false,
    });
  }

  // Check label leak / hardcoded AI prefix
  if (text && ERROR_CORRECTION_LABEL_PREFIX_REGEX.test(text)) {
    issues.push({
      field: 'text',
      code: 'LABEL_LEAK',
      message: `Error correction item stem contains hardcoded label prefix e.g. "${text.slice(0, 10)}..."`,
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // Check whole-question bolding
  if (text.startsWith('**') && text.endsWith('**') && text.length > 4) {
    issues.push({
      field: 'text',
      code: 'WHOLE_QUESTION_BOLD',
      message: `Error correction question stem is wrapped in whole-sentence bolding.`,
      severity: 'Low',
      autoFixable: true,
    });
  }

  const isValid = !issues.some((i) => i.severity === 'Critical');

  return {
    isValid,
    issues,
    templateId,
  };
}

/**
 * Strips AI prefix from error correction text.
 */
export function stripErrorCorrectionPrefix(text?: string): string {
  if (!text) return '';
  return text.trim().replace(ERROR_CORRECTION_LABEL_PREFIX_REGEX, '').trim();
}

/**
 * Unwraps whole-sentence bolding from error correction text.
 */
export function unwrapWholeErrorCorrectionBolding(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
    const inner = trimmed.slice(2, -2).trim();
    if (!inner.includes('**')) {
      return inner;
    }
  }
  return trimmed;
}

/**
 * Sanitizes and repairs an error correction question.
 */
export function sanitizeErrorCorrectionQuestion(
  q: Question,
  options?: {
    subjectName?: string;
    parentInstruction?: string;
  }
): ErrorCorrectionSanitizationResult {
  const repairLogs: {
    questionId: string;
    violatedRule: string;
    actionTaken: string;
    originalValue?: any;
    newValue?: any;
  }[] = [];
  const fixes: string[] = [];
  const qId = q.id || 'error_correction_q';

  // Deep clone
  const sanitized: Question = JSON.parse(JSON.stringify(q));

  // 1. Critical structural safety check
  if (typeof sanitized.marks === 'number' && sanitized.marks <= 0) {
    return {
      sanitized,
      repairLogs,
      fixes,
      isRejected: true,
      rejectionReason: `Unsafe structural error in error_correction Q${sanitized.number || ''}: Invalid or non-positive marks value: ${sanitized.marks}`,
    };
  }

  // 2. Strip forbidden properties
  if (sanitized.options) {
    repairLogs.push({
      questionId: qId,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden options array from error correction question',
      originalValue: sanitized.options,
      newValue: undefined,
    });
    fixes.push(`Stripped forbidden 'options' from error correction Q${sanitized.number || ''}`);
    delete (sanitized as any).options;
  }

  if (sanitized.tableData) {
    delete (sanitized as any).tableData;
  }

  // Detect template
  const templateId = detectErrorCorrectionTemplate(sanitized);

  // 3. Unwrap whole-sentence bolding in stem
  if (sanitized.text) {
    const origText = sanitized.text;
    sanitized.text = unwrapWholeErrorCorrectionBolding(sanitized.text);
    if (origText !== sanitized.text) {
      repairLogs.push({
        questionId: qId,
        violatedRule: 'WHOLE_QUESTION_BOLD',
        actionTaken: 'Unwrapped whole-sentence bolding from error correction stem',
        originalValue: origText,
        newValue: sanitized.text,
      });
      fixes.push(`Unwrapped whole-sentence bolding in error correction Q${sanitized.number || ''}`);
    }
  }

  // 4. Extract merged instructions
  if (sanitized.text) {
    for (const pattern of MERGED_ERROR_CORRECTION_INSTRUCTIONS) {
      const match = sanitized.text.match(pattern);
      if (match) {
        const extractedInst = match[0].trim().replace(/[:.]\s*$/, '');
        sanitized.text = sanitized.text.substring(match[0].length).trim();
        if (!sanitized.instruction) {
          sanitized.instruction = extractedInst;
        }
        repairLogs.push({
          questionId: qId,
          violatedRule: 'INSTRUCTION_MERGED',
          actionTaken: 'Separated merged error correction instruction from stem',
          originalValue: match[0],
          newValue: sanitized.text,
        });
        fixes.push(`Separated merged instruction in error correction Q${sanitized.number || ''}`);
        break;
      }
    }
  }

  // 5. Strip AI label prefix from stem
  if (sanitized.text) {
    const orig = sanitized.text;
    sanitized.text = stripErrorCorrectionPrefix(sanitized.text);
    if (orig !== sanitized.text) {
      repairLogs.push({
        questionId: qId,
        violatedRule: 'LABEL_LEAK',
        actionTaken: 'Stripped hardcoded AI prefix from error correction stem',
        originalValue: orig,
        newValue: sanitized.text,
      });
      fixes.push(`Stripped prefix from error correction Q${sanitized.number || ''}`);
    }
  }

  // 6. Clean instruction & handle redundancy against parent
  if (sanitized.instruction) {
    sanitized.instruction = cleanInstructionFormatting(sanitized.instruction);
    if (options?.parentInstruction) {
      const parentNorm = options.parentInstruction.trim().toLowerCase();
      const instNorm = sanitized.instruction.trim().toLowerCase();
      if (parentNorm.includes(instNorm) || instNorm.includes(parentNorm)) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'REDUNDANT_INSTRUCTION',
          actionTaken: 'Removed redundant error correction instruction matching parent/section instruction',
          originalValue: sanitized.instruction,
          newValue: undefined,
        });
        fixes.push(`Removed redundant instruction in error correction Q${sanitized.number || ''}`);
        sanitized.instruction = undefined;
      }
    }
  }

  // 7. Process sub-questions recursively
  if (sanitized.subQuestions && Array.isArray(sanitized.subQuestions)) {
    sanitized.subQuestions = sanitized.subQuestions.map((sq, idx) => {
      let cleanSqText = stripErrorCorrectionPrefix(sq.text || '');
      cleanSqText = unwrapWholeErrorCorrectionBolding(cleanSqText);

      let cleanSqInst = sq.instruction ? cleanInstructionFormatting(sq.instruction) : undefined;
      if (cleanSqInst && (sanitized.instruction || options?.parentInstruction)) {
        const parentRef = (sanitized.instruction || options?.parentInstruction || '').toLowerCase();
        if (parentRef.includes(cleanSqInst.toLowerCase())) {
          cleanSqInst = undefined;
        }
      }

      return {
        ...sq,
        text: cleanSqText,
        instruction: cleanSqInst,
        answerSpace: sq.answerSpace || 'small',
      } as SubQuestion;
    });
  }

  // 8. Deterministic answerSpace assignment
  const hasSubQ = Array.isArray(sanitized.subQuestions) && sanitized.subQuestions.length > 0;
  if (!hasSubQ) {
    if (!sanitized.answerSpace || sanitized.answerSpace === 'none') {
      sanitized.answerSpace = templateId === 'passage_correction' ? 'large' : 'small';
    }
  } else {
    sanitized.answerSpace = 'none';
  }

  // 9. Structured Answer Relationship (Internal model)
  (sanitized as any).errorCorrectionModel = {
    templateId,
    sourceItem: sanitized.text,
    errorTarget: (sanitized as any).errorTarget || (sanitized as any).errorWord || '',
    correction: (sanitized as any).expectedAnswer || (sanitized as any).correction || '',
    errorCount: templateId === 'multiple_error_sentence' ? 2 : 1,
  };

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
