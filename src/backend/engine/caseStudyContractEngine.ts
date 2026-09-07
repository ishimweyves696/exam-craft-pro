import { Question, SubQuestion, SubSubQuestion } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import {
  sanitizeQuestionByContract,
  validateQuestionTypeContract,
  QuestionContractValidationIssue,
} from '../../types/questionContracts.js';

export interface CaseStudyValidationIssue {
  field: string;
  code:
    | 'SCENARIO_MISSING'
    | 'SCENARIO_TOO_SHORT'
    | 'CHILD_QUESTIONS_MISSING'
    | 'CHILD_MISSING_TYPE'
    | 'INVALID_CHILD_TYPE'
    | 'DUPLICATE_CHILD_ID'
    | 'PARENT_CHILD_RELATIONSHIP_MISMATCH'
    | 'PARENT_MARKS_MISMATCH'
    | 'INSTRUCTION_REDUNDANT'
    | 'INSTRUCTION_CONTRADICTORY'
    | 'AUTO_TITLE_LEAK'
    | 'CHILD_CONTRACT_VIOLATION';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
  childIndex?: number;
}

export interface CaseStudyValidationResult {
  isValid: boolean;
  issues: CaseStudyValidationIssue[];
}

export interface CaseStudySanitizationResult {
  sanitized: Question;
  repairLogs: { questionId: string; violatedRule: string; actionTaken: string; originalValue?: any; newValue?: any }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Known boilerplate titles that should not be automatically injected or leaked.
 */
const BOILERPLATE_TITLE_REGEX = /^(?:case\s*study|business\s*scenario|scenario\s*analysis|reading\s*passage|context\s*(&|and)\s*data|read\s*the\s*following\s*case|scenario)$/i;

/**
 * Permitted / registered child question types for Case Study sub-questions.
 */
export const VALID_CASE_STUDY_CHILD_TYPES = new Set([
  'mcq',
  'multiple_choice',
  'true_false',
  'true-false',
  'matching',
  'table',
  'table_completion',
  'short',
  'short_answer',
  'calculation',
  'fill_blank',
  'transformation',
  'error_correction',
  'summary',
  'essay',
  'composition',
  'diagram',
  'diagram_labeling',
  'diagram_analysis',
  'explanation',
]);

/**
 * Helper to count words in a string.
 */
function countWords(str?: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Checks if a question is a Case Study / Scenario question.
 */
export function isCaseStudyType(q: Question | SubQuestion | SubSubQuestion | any): boolean {
  if (!q) return false;
  const type = (q.type || '').toLowerCase();
  if (
    type === 'case_study' ||
    type === 'case-study' ||
    type === 'scenario' ||
    type === 'scenario_analysis' ||
    type === 'case_study_scenario'
  ) {
    return true;
  }
  if (Array.isArray(q.subQuestions) && q.subQuestions.length > 0 && q.text) {
    const text = q.text.trim();
    if (
      /^Read the (case study|scenario|situation|business case)/i.test(text) ||
      /^(\*\*|\#+\s*)?(Case Study|Scenario|Business Case)/i.test(text)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Detects scenario template category for analytical tracking.
 */
export function detectScenarioTemplate(q: Question): string {
  const text = `${q.instruction || ''} ${q.text || ''}`.toLowerCase();
  if (/profit|loss|revenue|market|customer|business|company|enterprise|cost|price/i.test(text)) {
    return 'business_enterprise';
  }
  if (/patient|doctor|health|hospital|disease|treatment|symptom/i.test(text)) {
    return 'clinical_healthcare';
  }
  if (/experiment|reaction|speed|velocity|circuit|current|temperature|field/i.test(text)) {
    return 'scientific_experimental';
  }
  if (/law|court|contract|rights|constitution|legal|dispute/i.test(text)) {
    return 'legal_governance';
  }
  if (/farm|soil|crop|harvest|agriculture|livestock|irrigation/i.test(text)) {
    return 'agricultural_environmental';
  }
  return 'general_analytical_scenario';
}

/**
 * Validates a Case Study question against the NESA Case Study Contract.
 */
export function validateCaseStudyQuestionContract(
  q: Question,
  context?: { subjectName?: string }
): CaseStudyValidationResult {
  const issues: CaseStudyValidationIssue[] = [];
  const qId = q.id || `q_${q.number || 'unknown'}`;

  // 1. Scenario / Context Presence & Length
  const scenarioText = (q as any).passageText || (q as any).scenario || (q as any).context || q.text || '';
  const wordCount = countWords(scenarioText);

  if (!scenarioText || wordCount === 0) {
    issues.push({
      field: 'text',
      code: 'SCENARIO_MISSING',
      message: `Case Study question ${qId} is missing scenario context text.`,
      severity: 'Critical',
      autoFixable: false,
    });
  } else if (wordCount < 15) {
    issues.push({
      field: 'text',
      code: 'SCENARIO_TOO_SHORT',
      message: `Case Study scenario in question ${qId} is too brief (${wordCount} words). A minimum scenario length is required to provide sufficient context.`,
      severity: 'High',
      autoFixable: false,
    });
  }

  // 2. Child Questions Presence
  const subQs = q.subQuestions || [];
  if (!Array.isArray(subQs) || subQs.length === 0) {
    issues.push({
      field: 'subQuestions',
      code: 'CHILD_QUESTIONS_MISSING',
      message: `Case Study question ${qId} must contain child questions based on the scenario.`,
      severity: 'Critical',
      autoFixable: true,
    });
  } else {
    // Validate child ID uniqueness
    const seenChildIds = new Set<string>();
    let computedChildMarksSum = 0;
    let allChildrenMarksValid = true;

    subQs.forEach((subQ, idx) => {
      const childId = subQ.id || `${qId}_sub_${idx + 1}`;

      if (seenChildIds.has(childId)) {
        issues.push({
          field: `subQuestions[${idx}].id`,
          code: 'DUPLICATE_CHILD_ID',
          message: `Case Study child question has duplicate ID '${childId}'.`,
          severity: 'Critical',
          autoFixable: true,
          childIndex: idx,
        });
      }
      seenChildIds.add(childId);

      // Verify parentId relationship
      if (subQ.parentId && subQ.parentId !== q.id && subQ.parentId !== qId) {
        issues.push({
          field: `subQuestions[${idx}].parentId`,
          code: 'PARENT_CHILD_RELATIONSHIP_MISMATCH',
          message: `Child question ${childId} parentId '${subQ.parentId}' does not match parent ID '${q.id || qId}'.`,
          severity: 'Medium',
          autoFixable: true,
          childIndex: idx,
        });
      }

      // Check child question stem
      if (!subQ.text || subQ.text.trim() === '') {
        issues.push({
          field: `subQuestions[${idx}].text`,
          code: 'CHILD_QUESTIONS_MISSING',
          message: `Case Study child question ${idx + 1} is missing a question stem.`,
          severity: 'Critical',
          autoFixable: false,
          childIndex: idx,
        });
      }

      // Check child question type
      const childType = (subQ.type || '').toLowerCase();
      if (!childType) {
        issues.push({
          field: `subQuestions[${idx}].type`,
          code: 'CHILD_MISSING_TYPE',
          message: `Case Study child question ${idx + 1} is missing a registered question type.`,
          severity: 'Critical',
          autoFixable: true,
          childIndex: idx,
        });
      } else if (!VALID_CASE_STUDY_CHILD_TYPES.has(childType)) {
        issues.push({
          field: `subQuestions[${idx}].type`,
          code: 'INVALID_CHILD_TYPE',
          message: `Case Study child question ${idx + 1} has unrecognized type '${subQ.type}'. Must be a registered question type.`,
          severity: 'High',
          autoFixable: true,
          childIndex: idx,
        });
      }

      // Validate child question marks
      if (typeof subQ.marks !== 'number' || isNaN(subQ.marks) || subQ.marks < 0) {
        allChildrenMarksValid = false;
      } else {
        computedChildMarksSum += subQ.marks;
      }

      // Validate instruction redundancy
      if (subQ.instruction && q.instruction) {
        const normParent = cleanInstructionFormatting(q.instruction).toLowerCase();
        const normChild = cleanInstructionFormatting(subQ.instruction).toLowerCase();
        if (
          normChild.includes('read the scenario') ||
          normChild.includes('read the case study') ||
          normChild.includes('answer the questions') ||
          normParent === normChild
        ) {
          issues.push({
            field: `subQuestions[${idx}].instruction`,
            code: 'INSTRUCTION_REDUNDANT',
            message: `Child question ${idx + 1} duplicates parent scenario instruction: "${subQ.instruction}".`,
            severity: 'Low',
            autoFixable: true,
            childIndex: idx,
          });
        }
      }

      // Validate child against its own question type contract
      const childContractVal = validateQuestionTypeContract(subQ as Question, q.type, q.id);
      if (!childContractVal.isValid) {
        childContractVal.issues.forEach((issue) => {
          issues.push({
            field: `subQuestions[${idx}].${issue.field}`,
            code: 'CHILD_CONTRACT_VIOLATION',
            message: `Child question ${idx + 1} (${subQ.type}) contract issue: ${issue.message}`,
            severity: issue.severity as any,
            autoFixable: issue.autoFixable,
            childIndex: idx,
          });
        });
      }
    });

    // Check parent mark consistency
    if (allChildrenMarksValid && typeof q.marks === 'number' && q.marks > 0 && q.marks !== computedChildMarksSum) {
      issues.push({
        field: 'marks',
        code: 'PARENT_MARKS_MISMATCH',
        message: `Parent marks (${q.marks}) do not equal sum of child marks (${computedChildMarksSum}).`,
        severity: 'High',
        autoFixable: true,
      });
    }
  }

  // 3. Auto-Generated Boilerplate Scenario Title Leak Check
  const presTitle = q.presentation?.title;
  if (presTitle && BOILERPLATE_TITLE_REGEX.test(presTitle.trim())) {
    issues.push({
      field: 'presentation.title',
      code: 'AUTO_TITLE_LEAK',
      message: `Scenario question was assigned an artificial boilerplate title "${presTitle}". Scenario titles must not be automatically added.`,
      severity: 'Medium',
      autoFixable: true,
    });
  }

  return {
    isValid: issues.filter((i) => i.severity === 'Critical' || i.severity === 'High').length === 0,
    issues,
  };
}

import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

/**
 * Sanitizes a Case Study / Scenario question to guarantee compliance with the NESA Case Study Contract.
 */
export function sanitizeCaseStudyQuestion(
  q: Question,
  context?: { subjectName?: string }
): CaseStudySanitizationResult {
  const sanitized: Question = JSON.parse(JSON.stringify(q));
  const repairLogs: { questionId: string; violatedRule: string; actionTaken: string; originalValue?: any; newValue?: any }[] = [];
  const fixes: string[] = [];
  const qId = sanitized.id || `q_${sanitized.number || 'case_study'}`;

  // 0. Global Deep Clean
  if (sanitized.text) {
    const cleaned = deepCleanText(sanitized.text);
    if (cleaned !== sanitized.text) {
      sanitized.text = cleaned;
      fixes.push(`Deep cleaned case study text (removed slop/tags)`);
    }
  }

  // 1. Split embedded sub-questions if not already a parent
  if ((!sanitized.subQuestions || sanitized.subQuestions.length === 0) && sanitized.text) {
    const split = splitEmbeddedSubQuestions(sanitized.text, 'short', qId, sanitized.marks || 0);
    if (split.subQuestions) {
      sanitized.text = split.stimulus;
      sanitized.subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from case study block`);
      // Recursively sanitize now that it's a parent
      return sanitizeCaseStudyQuestion(sanitized, context);
    }
  }

  // 2. Ensure type is canonically 'case_study'
  sanitized.type = 'case_study';

  // 2. Remove boilerplate / artificial scenario title
  if (sanitized.presentation?.title && BOILERPLATE_TITLE_REGEX.test(sanitized.presentation.title.trim())) {
    const oldTitle = sanitized.presentation.title;
    sanitized.presentation.title = '';
    repairLogs.push({
      questionId: qId,
      violatedRule: 'AUTO_TITLE_LEAK',
      actionTaken: `Removed artificial boilerplate scenario title "${oldTitle}".`,
      originalValue: oldTitle,
      newValue: '',
    });
    fixes.push(`Removed artificial boilerplate title "${oldTitle}".`);
  }

  // 3. Extract parent instruction if embedded in scenario text stem
  if (sanitized.text) {
    let rawText = sanitized.text.trim();

    // Strategy: Detect embedded sub-questions like (a), (b), (c) if no subQuestions array exists
    if (!sanitized.subQuestions || sanitized.subQuestions.length === 0) {
      const subPartMarkers = rawText.match(/\s*\(\s*[a-z0-9]\s*\)\s*/gi);
      if (subPartMarkers && subPartMarkers.length >= 2) {
        const parts = rawText.split(/\s*\(\s*[a-z0-9]\s*\)\s*/i);
        const stimulus = parts[0].trim();
        const childTexts = parts.slice(1).map(p => p.trim()).filter(Boolean);

        if (stimulus && childTexts.length >= 2) {
          rawText = stimulus;
          sanitized.subQuestions = childTexts.map((ct, idx) => ({
            id: `${qId}_sub_${idx + 1}`,
            number: idx + 1,
            text: ct,
            type: 'short',
            marks: Math.max(1, Math.floor((sanitized.marks || 0) / childTexts.length)),
            answerSpace: 'medium',
            numberingStyle: 'alpha-lower',
            visibleLabel: `(${String.fromCharCode(97 + idx)})`
          }));
          fixes.push(`Split embedded sub-questions (${childTexts.length} parts) from case study text`);
        }
      }
    }

    // Check if the top of rawText has a title header line like "**Case Study**" or "CASE STUDY"
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1 && BOILERPLATE_TITLE_REGEX.test(lines[0].replace(/[\*\#\:]/g, '').trim())) {
      lines.shift();
      rawText = lines.join('\n\n');
      fixes.push('Stripped boilerplate title line from scenario body.');
    }

    // Extract leading instruction line (e.g., "Read the scenario below and answer questions (a)–(c).")
    if (!sanitized.instruction && lines.length > 1) {
      if (
        /^Read the (scenario|case study|situation|text|following|business case)/i.test(lines[0]) ||
        /^Study the (scenario|case study|data|information|provided)/i.test(lines[0])
      ) {
        sanitized.instruction = lines[0];
        lines.shift();
        rawText = lines.join('\n\n');
        fixes.push('Separated leading instruction from scenario context text.');
      }
    }

    sanitized.text = rawText;
  }

  // If no parent instruction was set, assign clean standard instruction above scenario
  if (!sanitized.instruction || sanitized.instruction.trim().length === 0) {
    sanitized.instruction = 'Read the scenario below carefully and answer the questions that follow.';
    fixes.push('Set standard scenario instruction above the scenario text.');
  }

  // 4. Process and sanitize child questions
  if (Array.isArray(sanitized.subQuestions) && sanitized.subQuestions.length > 0) {
    const parentInstNorm = cleanInstructionFormatting(sanitized.instruction || '').toLowerCase();
    let totalChildMarks = 0;
    const seenChildIds = new Set<string>();

    sanitized.subQuestions = sanitized.subQuestions.map((subQ, idx) => {
      let childCopy: SubQuestion = { ...subQ };
      const childId = childCopy.id || `${qId}_sub_${idx + 1}`;

      // Enforce unique child ID
      if (seenChildIds.has(childId)) {
        childCopy.id = `${qId}_sub_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`;
        repairLogs.push({
          questionId: childId,
          violatedRule: 'DUPLICATE_CHILD_ID',
          actionTaken: `Generated unique child ID '${childCopy.id}'`,
        });
        fixes.push(`Ensured unique ID for child question ${idx + 1}`);
      } else {
        childCopy.id = childId;
      }
      seenChildIds.add(childCopy.id);

      // Enforce explicit parent relationship
      childCopy.parentId = qId;
      childCopy.childIndex = idx;

      // Default child type if missing
      if (!childCopy.type || childCopy.type === 'case_study') {
        (childCopy as any).type = 'short';
        fixes.push(`Set default child question type 'short' for child ${idx + 1}`);
      }

      // Deduplicate child instruction if it repeats the parent scenario instruction
      if (childCopy.instruction) {
        const childInstNorm = cleanInstructionFormatting(childCopy.instruction).toLowerCase().replace(/[.:]+$/, '');
        if (
          childInstNorm === parentInstNorm ||
          /^(read the (scenario|case study|text|passage|case)|answer the (following )?questions?( that follow)?|read the (scenario|case study|text|passage|case) and answer the (following )?questions?(\s+that\s+follow)?)$/i.test(
            childInstNorm
          )
        ) {
          childCopy.instruction = undefined;
          fixes.push(`Removed redundant scenario instruction from child question ${idx + 1}`);
        }
      }

      // Enforce alpha-lower numbering style for standard NESA subquestions: (a), (b), (c)
      if (!childCopy.numberingStyle) {
        childCopy.numberingStyle = 'alpha-lower';
      }
      childCopy.number = idx + 1;
      childCopy.visibleLabel = `(${String.fromCharCode(97 + idx)})`;

      // Run specific question-type contract sanitizer on the child
      const childSanResult = sanitizeQuestionByContract(childCopy as unknown as Question, {
        subjectName: context?.subjectName,
        parentQuestion: sanitized,
      });

      if (!childSanResult.isRejected) {
        childCopy = childSanResult.sanitized as unknown as SubQuestion;
        if (childSanResult.repairLogs && childSanResult.repairLogs.length > 0) {
          repairLogs.push(...childSanResult.repairLogs);
        }
        if (childSanResult.fixes && childSanResult.fixes.length > 0) {
          fixes.push(...childSanResult.fixes);
        }
      }

      // Ensure appropriate answer space per child type
      if (!childCopy.answerSpace || childCopy.answerSpace === 'none') {
        const cType = (childCopy.type || '').toLowerCase();
        if (cType === 'mcq') {
          childCopy.answerSpace = 'none';
        } else if (cType === 'true_false') {
          childCopy.answerSpace = 'none';
        } else if (cType === 'matching') {
          childCopy.answerSpace = 'none';
        } else if (cType === 'essay' || cType === 'composition') {
          childCopy.answerSpace = 'large';
        } else {
          const marks = childCopy.marks || 1;
          childCopy.answerSpace = marks <= 2 ? 'medium' : marks <= 5 ? 'large' : 'xlarge';
        }
      }

      // Marks validation & accounting
      if (typeof childCopy.marks !== 'number' || isNaN(childCopy.marks) || childCopy.marks <= 0) {
        childCopy.marks = 2; // sensible default
        fixes.push(`Assigned default mark (2) to child question ${idx + 1}`);
      }
      totalChildMarks += childCopy.marks;

      return childCopy;
    });

    // Enforce parent mark accounting: parent marks = sum of child marks
    if (sanitized.marks !== totalChildMarks) {
      const oldMarks = sanitized.marks;
      sanitized.marks = totalChildMarks;
      repairLogs.push({
        questionId: qId,
        violatedRule: 'PARENT_MARKS_MISMATCH',
        actionTaken: `Recalculated parent marks to match sum of children (${totalChildMarks})`,
        originalValue: oldMarks,
        newValue: totalChildMarks,
      });
      fixes.push(`Updated Case Study parent marks to ${totalChildMarks} (sum of sub-questions).`);
    }
  }

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
