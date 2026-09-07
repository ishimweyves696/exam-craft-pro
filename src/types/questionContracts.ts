import { Question, SubQuestion, SubSubQuestion, QuestionOption, TableData } from '../types.js';
import { getQuestionSpec } from '../utils/questionSpecs.js';
import { validateSummaryQuestionContract, sanitizeSummaryQuestion } from '../backend/engine/summaryContractEngine.js';
import { validateComprehensionQuestionContract, sanitizeComprehensionQuestion } from '../backend/engine/comprehensionContractEngine.js';
import { validateCaseStudyQuestionContract, sanitizeCaseStudyQuestion } from '../backend/engine/caseStudyContractEngine.js';
import { validateCompositionQuestionContract, sanitizeCompositionQuestion } from '../backend/engine/compositionContractEngine.js';
import { validateFillBlankQuestionContract, sanitizeFillBlankQuestion } from '../backend/engine/fillBlankContractEngine.js';
import { validateMcqQuestionContract, sanitizeMcqQuestion } from '../backend/engine/mcqContractEngine.js';
import { validateMatchingQuestionContract, sanitizeMatchingQuestion } from '../backend/engine/matchingContractEngine.js';
import { validateTransformationQuestionContract, sanitizeTransformationQuestion } from '../backend/engine/transformationContractEngine.js';
import { validateErrorCorrectionQuestionContract, sanitizeErrorCorrectionQuestion } from '../backend/engine/errorCorrectionContractEngine.js';
import { validateTrueFalseQuestionContract, sanitizeTrueFalseQuestion } from '../backend/engine/trueFalseContractEngine.js';
import { validateShortAnswerQuestionContract, sanitizeShortAnswerQuestion } from '../backend/engine/shortAnswerContractEngine.js';
import { validateTableQuestionContract, sanitizeTableQuestion } from '../backend/engine/tableContractEngine.js';
import { validateCalculationQuestionContract, sanitizeCalculationQuestion, isCalculationQuestion } from '../backend/engine/calculationContractEngine.js';
import { validateSwotMatrixQuestionContract, sanitizeSwotMatrixQuestion, isSwotMatrixQuestion } from '../backend/engine/swotMatrixContractEngine.js';

export interface QuestionRepairLog {
  questionId: string;
  violatedRule: string;
  actionTaken: string;
  originalValue?: any;
  newValue?: any;
}

export interface QuestionContractValidationIssue {
  field: string;
  code:
    | 'REQUIRED_MISSING'
    | 'FORBIDDEN_PRESENT'
    | 'LABEL_LEAK'
    | 'INVALID_STRUCTURE'
    | 'UNMATCHED_RESOURCE'
    | 'UNMATCHED_MAPPING'
    | 'MISSING_ANSWER'
    | 'DUPLICATE_ID'
    | 'HEADER_BLANKED_OUT'
    | 'INCOMPATIBLE_ANSWER_SPACE'
    | 'INVALID_FORMATTING'
    | (string & {});
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface QuestionContractValidationResult {
  questionId: string;
  questionNumber?: number;
  questionType: string;
  isValid: boolean;
  issues: QuestionContractValidationIssue[];
}

export interface QuestionSanitizationResult {
  sanitized: Question;
  repairLogs: QuestionRepairLog[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Regex to detect AI-generated leading numbering or label prefixes
 * e.g., "Q1.", "1.", "Question 1:", "A)", "A.", "(A)", "a."
 */
export const NUMBERING_PREFIX_REGEX = /^(?:q(?:uestion)?\s*\d+[:.]?\s*|\d+[\.\)]\s*)/i;
export const OPTION_PREFIX_REGEX = /^(?:[A-F][\.\)]\s*|\([A-F]\)\s*|\[[A-F]\]\s*)/i;
export const MATCHING_PREFIX_REGEX = /^(?:\d+[\.\)]\s*|[A-Z][\.\)]\s*|\([A-Z0-9]\)\s*)/i;

/**
 * Helper to identify candidate-answer cells in a table structure.
 */
export function isCandidateAnswerCell(cellValue: string | undefined | null): boolean {
  if (cellValue === undefined || cellValue === null) return true;
  const trimmed = cellValue.trim();
  if (trimmed === '') return true;
  if (/^[\._\-–—\s]{2,}$/.test(trimmed)) return true;
  if (/^\[\s*[\._\-–—\s]*\s*\]$/.test(trimmed)) return true;
  if (/^(candidate_answer|blank|\[blank\]|\(\s*\)|\?\?\?|\.\.\.)$/i.test(trimmed)) return true;
  return false;
}

/**
 * Helper to normalize and validate True/False expected answers.
 */
export function extractTrueFalseExpectedAnswer(q: any): { hasAnswer: boolean; value?: 'True' | 'False'; isInvalidFormat?: boolean } {
  const possibleValues = [
    q.answer,
    q.expectedAnswer,
    q.expected,
    q.correctAnswer,
    q.options?.find((o: any) => o.isCorrect)?.text,
  ];

  for (const raw of possibleValues) {
    if (raw === undefined || raw === null) continue;
    if (typeof raw === 'boolean') {
      return { hasAnswer: true, value: raw ? 'True' : 'False' };
    }
    if (typeof raw === 'string') {
      const norm = raw.trim().toLowerCase();
      if (['true', 'vrai', 'ukuri', 't', 'v', 'yes', 'oui'].includes(norm)) {
        return { hasAnswer: true, value: 'True' };
      }
      if (['false', 'faux', 'ikinyoma', 'f', 'no', 'non'].includes(norm)) {
        return { hasAnswer: true, value: 'False' };
      }
    }
  }

  // Check if an invalid/unresolvable answer string was explicitly supplied
  const hasRawVal = possibleValues.some((val) => val !== undefined && val !== null && String(val).trim() !== '');
  if (hasRawVal) {
    return { hasAnswer: false, isInvalidFormat: true };
  }

  return { hasAnswer: false };
}

/**
 * Validates a single question item (or sub-question) strictly against its question-type contract.
 */
export function validateQuestionTypeContract(
  q: Question | SubQuestion | SubSubQuestion,
  parentType?: string,
  parentQuestionId?: string,
  knownQuestionIds?: Set<string>,
  subjectName?: string,
  parentQuestion?: Question
): QuestionContractValidationResult {
  const issues: QuestionContractValidationIssue[] = [];
  const qId = (q as any).id || `q_${q.number || 'unknown'}`;
  const spec = getQuestionSpec(q.type);
  const qType = spec.id;

  // 0. Check Question ID uniqueness & validity
  if (knownQuestionIds) {
    if (knownQuestionIds.has(qId)) {
      issues.push({
        field: 'id',
        code: 'DUPLICATE_ID',
        message: `Duplicate question ID detected: '${qId}'.`,
        severity: 'Critical',
        autoFixable: false,
      });
    } else {
      knownQuestionIds.add(qId);
    }
  }

  // 0b. Validate Marks
  if (q.marks === undefined || q.marks === null || isNaN(q.marks) || q.marks < 0) {
    issues.push({
      field: 'marks',
      code: 'INVALID_STRUCTURE',
      message: `Invalid or negative marks value: ${q.marks}`,
      severity: 'Critical',
      autoFixable: false,
    });
  }

  // 1. Check for Question Stem
  if (!q.text || q.text.trim() === '') {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: `Question stem 'text' is missing for question type '${qType}'.`,
      severity: 'Critical',
      autoFixable: true,
    });
  } else {
    // Check for Label Leakage in Stem (e.g. "Q1. What is...")
    if (NUMBERING_PREFIX_REGEX.test(q.text.trim())) {
      issues.push({
        field: 'text',
        code: 'LABEL_LEAK',
        message: `Question text contains hardcoded numbering prefix: "${q.text.slice(0, 20)}..."`,
        severity: 'Medium',
        autoFixable: true,
      });
    }
  }

  // 2. Parent-Child Relationship Integrity
  if ((q as any).parentId) {
    const parentId = (q as any).parentId;
    if (parentQuestionId && parentId !== parentQuestionId) {
      issues.push({
        field: 'parentId',
        code: 'INVALID_STRUCTURE',
        message: `Child question '${qId}' references incorrect parentId '${parentId}' (expected '${parentQuestionId}').`,
        severity: 'Critical',
        autoFixable: false,
      });
    }
  }

  // 3. Type-Specific Required and Forbidden Elements
  switch (qType) {
    case 'mcq': {
      const mcqVal = validateMcqQuestionContract(q as Question, { subjectName });
      mcqVal.issues.forEach((mcqIssue) => {
        issues.push({
          field: mcqIssue.field,
          code: mcqIssue.code as any,
          message: mcqIssue.message,
          severity: mcqIssue.severity,
          autoFixable: mcqIssue.autoFixable,
        });
      });
      break;
    }

    case 'true_false': {
      const tfVal = validateTrueFalseQuestionContract(q as Question, { subjectName });
      tfVal.issues.forEach((tfIssue) => {
        issues.push({
          field: tfIssue.field,
          code: tfIssue.code as any,
          message: tfIssue.message,
          severity: tfIssue.severity,
          autoFixable: tfIssue.autoFixable,
        });
      });
      break;
    }

    case 'matching': {
      const matchRes = validateMatchingQuestionContract(q as Question);
      matchRes.issues.forEach((iss) => {
        let mappedCode: QuestionContractValidationIssue['code'] = 'INVALID_STRUCTURE';
        if (iss.code === 'REQUIRED_MISSING') mappedCode = 'REQUIRED_MISSING';
        else if (iss.code === 'FORBIDDEN_PROPERTY') mappedCode = 'FORBIDDEN_PRESENT';
        else if (iss.code === 'LABEL_LEAK') mappedCode = 'LABEL_LEAK';
        else if (iss.code === 'UNMATCHED_MAPPING') mappedCode = 'UNMATCHED_MAPPING';

        issues.push({
          field: iss.field,
          code: mappedCode,
          message: iss.message,
          severity: iss.severity,
          autoFixable: iss.autoFixable,
        });
      });
      break;
    }

    case 'table':
    case 'table_completion': {
      if (isSwotMatrixQuestion(q, subjectName) || (q as any).type === 'swot' || (q as any).swotData || q.layoutVariant === 'swot-matrix') {
        const swotVal = validateSwotMatrixQuestionContract(q as Question, { subjectName });
        swotVal.issues.forEach((swotIssue) => {
          issues.push({
            field: swotIssue.field,
            code: swotIssue.code as any,
            message: swotIssue.message,
            severity: swotIssue.severity,
            autoFixable: swotIssue.autoFixable,
          });
        });
        break;
      }
      const tbVal = validateTableQuestionContract(q as Question, { subjectName });
      tbVal.issues.forEach((tbIssue) => {
        issues.push({
          field: tbIssue.field,
          code: tbIssue.code as any,
          message: tbIssue.message,
          severity: tbIssue.severity,
          autoFixable: tbIssue.autoFixable,
        });
      });
      break;
    }

    case 'summary': {
      if (q.options && q.options.length > 0) {
        issues.push({
          field: 'options',
          code: 'FORBIDDEN_PRESENT',
          message: `Summary question type must not contain 'options'.`,
          severity: 'High',
          autoFixable: true,
        });
      }
      const sumVal = validateSummaryQuestionContract(q, { subjectName, parentQuestion });
      sumVal.issues.forEach((sumIssue) => {
        issues.push({
          field: sumIssue.field,
          code: sumIssue.code as any,
          message: sumIssue.message,
          severity: sumIssue.severity,
          autoFixable: sumIssue.autoFixable,
        });
      });
      break;
    }

    case 'fill_blank': {
      if (q.options && q.options.length > 0) {
        issues.push({
          field: 'options',
          code: 'FORBIDDEN_PRESENT',
          message: `Fill-in-the-blank question type must not contain 'options'.`,
          severity: 'High',
          autoFixable: true,
        });
      }
      const fbVal = validateFillBlankQuestionContract(q as Question, { subjectName, parentQuestion });
      fbVal.issues.forEach((fbIssue) => {
        issues.push({
          field: fbIssue.field,
          code: fbIssue.code as any,
          message: fbIssue.message,
          severity: fbIssue.severity,
          autoFixable: fbIssue.autoFixable,
        });
      });
      break;
    }

    case 'transformation':
    case 'sentence_transformation':
    case 'sentence_rewriting':
    case 'rewrite': {
      const transVal = validateTransformationQuestionContract(q as Question, { subjectName });
      transVal.issues.forEach((transIssue) => {
        issues.push({
          field: transIssue.field,
          code: transIssue.code as any,
          message: transIssue.message,
          severity: transIssue.severity,
          autoFixable: transIssue.autoFixable,
        });
      });
      break;
    }

    case 'error_correction':
    case 'error_identification':
    case 'proofreading':
    case 'grammar_correction': {
      const errVal = validateErrorCorrectionQuestionContract(q as Question, { subjectName });
      errVal.issues.forEach((errIssue) => {
        issues.push({
          field: errIssue.field,
          code: errIssue.code as any,
          message: errIssue.message,
          severity: errIssue.severity,
          autoFixable: errIssue.autoFixable,
        });
      });
      break;
    }

    case 'short': {
      if (isSwotMatrixQuestion(q, subjectName) || (q as any).type === 'swot' || (q as any).swotData || q.layoutVariant === 'swot-matrix') {
        const swotVal = validateSwotMatrixQuestionContract(q as Question, { subjectName });
        swotVal.issues.forEach((swotIssue) => {
          issues.push({
            field: swotIssue.field,
            code: swotIssue.code as any,
            message: swotIssue.message,
            severity: swotIssue.severity,
            autoFixable: swotIssue.autoFixable,
          });
        });
        break;
      }
      if (isCalculationQuestion(q, subjectName) || (q as any).type === 'calculation' || q.layoutVariant === 'calculation') {
        const calcVal = validateCalculationQuestionContract(q as Question, { subjectName });
        calcVal.issues.forEach((calcIssue) => {
          issues.push({
            field: calcIssue.field,
            code: calcIssue.code as any,
            message: calcIssue.message,
            severity: calcIssue.severity,
            autoFixable: calcIssue.autoFixable,
          });
        });
        break;
      }
      const shortVal = validateShortAnswerQuestionContract(q as Question, { subjectName });
      shortVal.issues.forEach((shIssue) => {
        issues.push({
          field: shIssue.field,
          code: shIssue.code as any,
          message: shIssue.message,
          severity: shIssue.severity,
          autoFixable: shIssue.autoFixable,
        });
      });
      break;
    }

    case 'calculation': {
      const calcVal = validateCalculationQuestionContract(q as Question, { subjectName });
      calcVal.issues.forEach((calcIssue) => {
        issues.push({
          field: calcIssue.field,
          code: calcIssue.code as any,
          message: calcIssue.message,
          severity: calcIssue.severity,
          autoFixable: calcIssue.autoFixable,
        });
      });
      break;
    }

    case 'swot':
    case 'swot_matrix':
    case 'swot_analysis':
    case 'matrix': {
      const swotVal = validateSwotMatrixQuestionContract(q as Question, { subjectName });
      swotVal.issues.forEach((swotIssue) => {
        issues.push({
          field: swotIssue.field,
          code: swotIssue.code as any,
          message: swotIssue.message,
          severity: swotIssue.severity,
          autoFixable: swotIssue.autoFixable,
        });
      });
      break;
    }

    case 'essay':
    case 'composition': {
      const compVal = validateCompositionQuestionContract(q as Question, { subjectName, parentQuestion });
      compVal.issues.forEach((compIssue) => {
        issues.push({
          field: compIssue.field,
          code: compIssue.code as any,
          message: compIssue.message,
          severity: compIssue.severity,
          autoFixable: compIssue.autoFixable,
        });
      });
      break;
    }

    case 'case_study':
    case 'case-study':
    case 'scenario':
    case 'scenario_analysis': {
      const caseVal = validateCaseStudyQuestionContract(q as Question, { subjectName });
      caseVal.issues.forEach((cIssue) => {
        issues.push({
          field: cIssue.field,
          code: cIssue.code as any,
          message: cIssue.message,
          severity: cIssue.severity,
          autoFixable: cIssue.autoFixable,
        });
      });
      break;
    }

    case 'passage':
    case 'comprehension':
    case 'reading_comprehension': {
      const compVal = validateComprehensionQuestionContract(q as Question, { subjectName, parentQuestion });
      compVal.issues.forEach((cIssue) => {
        issues.push({
          field: cIssue.field,
          code: cIssue.code as any,
          message: cIssue.message,
          severity: cIssue.severity,
          autoFixable: cIssue.autoFixable,
        });
      });
      break;
    }

    case 'diagram':
    case 'diagram_labeling':
    case 'circuit_diagram':
    case 'chemical_structure':
    case 'diagram_analysis': {
      // Requires explicit diagram asset
      const svg = (q as any).svgData;
      const mermaid = (q as any).mermaidData;
      const smiles = (q as any).smilesData;
      const hasDiagramData = Boolean(svg || mermaid || smiles || (q as any).diagramRef);

      if (!hasDiagramData && !parentType) {
        issues.push({
          field: 'diagramData',
          code: 'REQUIRED_MISSING',
          message: `Diagram question type '${qType}' is missing diagram asset (svgData, mermaidData, or smilesData).`,
          severity: 'Critical',
          autoFixable: false,
        });
      } else if (hasDiagramData) {
        // Asset type compatibility check
        if (qType === 'chemical_structure' && !smiles && !svg) {
          issues.push({
            field: 'smilesData',
            code: 'UNMATCHED_RESOURCE',
            message: `Chemical structure question requires SMILES data or molecular SVG.`,
            severity: 'High',
            autoFixable: false,
          });
        }
        if (qType === 'circuit_diagram' && !mermaid && !svg) {
          issues.push({
            field: 'mermaidData',
            code: 'UNMATCHED_RESOURCE',
            message: `Circuit diagram question requires Mermaid or SVG circuit schematic.`,
            severity: 'High',
            autoFixable: false,
          });
        }
        if (qType === 'diagram_labeling') {
          // Verify label/response structure
          const hasLabelTargets = Boolean(
            q.answerSpace || (q as any).labels || (q.text && /label|indicate|mark/i.test(q.text))
          );
          if (!hasLabelTargets) {
            issues.push({
              field: 'labelTargets',
              code: 'REQUIRED_MISSING',
              message: `Diagram labeling question requires explicit response structure or label targets.`,
              severity: 'High',
              autoFixable: true,
            });
          }
        }
      }
      break;
    }
  }

  // Recursive check for subQuestions
  const subQuestions = (q as any).subQuestions;
  if (subQuestions && Array.isArray(subQuestions)) {
    subQuestions.forEach((sq: any) => {
      const subResult = validateQuestionTypeContract(sq, qType, qId, knownQuestionIds);
      issues.push(...subResult.issues);
    });
  }

  const isCriticalOrHigh = issues.some((i) => i.severity === 'Critical' || i.severity === 'High');

  return {
    questionId: qId,
    questionNumber: q.number,
    questionType: qType,
    isValid: !isCriticalOrHigh,
    issues,
  };
}

/**
 * Deterministically sanitizes a question according to its question-type contract.
 * Uses SAFE REPAIR vs REJECTION logic:
 * - SAFE REPAIR: Strips label leaks ("Q1.", "A."), removes forbidden properties, sets valid answerSpace defaults.
 * - UNSAFE STRUCTURAL ERROR: Rejects the question with exact reason.
 */
export function sanitizeQuestionByContract(
  q: Question,
  parentTypeOrContext?: string | { subjectName?: string; parentQuestion?: Question; parentType?: string; firstComprehensionPassage?: { text: string; title?: string } },
  subjectName?: string,
  parentQuestion?: Question
): QuestionSanitizationResult {
  const repairLogs: QuestionRepairLog[] = [];
  const fixes: string[] = [];
  const clone: Question = JSON.parse(JSON.stringify(q));

  let parentType: string | undefined;
  let resolvedSubjectName: string | undefined = subjectName;
  let resolvedParentQuestion: Question | undefined = parentQuestion;
  if (typeof parentTypeOrContext === 'object' && parentTypeOrContext !== null) {
    parentType = parentTypeOrContext.parentType;
    resolvedSubjectName = parentTypeOrContext.subjectName;
    resolvedParentQuestion = parentTypeOrContext.parentQuestion;
  } else if (typeof parentTypeOrContext === 'string') {
    parentType = parentTypeOrContext;
  }

  const qId = clone.id || `q_${clone.number || 'unknown'}`;
  const spec = getQuestionSpec(clone.type);
  (clone as any).type = spec.id;

  // 1. Check for UNSAFE STRUCTURAL ERRORS prior to sanitization
  const preValidation = validateQuestionTypeContract(clone, parentType);
  const criticalUnfixable = preValidation.issues.filter((i) => i.severity === 'Critical' && !i.autoFixable);

  if (criticalUnfixable.length > 0) {
    const primaryReason = criticalUnfixable[0].message;
    return {
      sanitized: clone,
      repairLogs,
      fixes,
      isRejected: true,
      rejectionReason: `Unsafe structural error in ${clone.type} Q${clone.number || ''}: ${primaryReason}`,
    };
  }

  // 2. Safe Deterministic Repairs

  // Safe Repair A: Strip hardcoded numbering prefixes from stem text
  if (clone.text) {
    const trimmed = clone.text.trim();
    if (NUMBERING_PREFIX_REGEX.test(trimmed)) {
      const cleaned = trimmed.replace(NUMBERING_PREFIX_REGEX, '').trim();
      if (cleaned.length > 0) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'NUMBERING_PREFIX_LEAK',
          actionTaken: 'Stripped hardcoded question numbering prefix',
          originalValue: trimmed.slice(0, 20),
          newValue: cleaned.slice(0, 20),
        });
        fixes.push(`Stripped hardcoded numbering prefix from Q${clone.number || ''}`);
        clone.text = cleaned;
      }
    }
  }

  // Safe Repair B: Type-specific sanitization & contract enforcement
  switch (spec.id) {
    case 'mcq': {
      const mcqSan = sanitizeMcqQuestion(clone as any, { subjectName: resolvedSubjectName, parentInstruction: resolvedParentQuestion?.instruction });
      if (mcqSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: mcqSan.rejectionReason,
        };
      }
      Object.assign(clone, mcqSan.sanitized);
      if (mcqSan.repairLogs && mcqSan.repairLogs.length > 0) {
        repairLogs.push(...mcqSan.repairLogs);
      }
      if (mcqSan.fixes && mcqSan.fixes.length > 0) {
        fixes.push(...mcqSan.fixes);
      }
      break;
    }

    case 'true_false': {
      const tfSan = sanitizeTrueFalseQuestion(clone as any, {
        subjectName: resolvedSubjectName,
        parentInstruction: resolvedParentQuestion?.instruction,
      });
      if (tfSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: tfSan.rejectionReason,
        };
      }
      Object.assign(clone, tfSan.sanitized);
      fixes.push(...tfSan.fixes);
      repairLogs.push(...tfSan.repairLogs);
      break;
    }

    case 'matching': {
      const matchSan = sanitizeMatchingQuestion(clone as any, { subjectName: resolvedSubjectName, parentInstruction: resolvedParentQuestion?.instruction });
      if (matchSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: matchSan.rejectionReason,
        };
      }
      Object.assign(clone, matchSan.sanitized);
      if (matchSan.repairLogs && matchSan.repairLogs.length > 0) {
        repairLogs.push(...matchSan.repairLogs);
      }
      if (matchSan.fixes && matchSan.fixes.length > 0) {
        fixes.push(...matchSan.fixes);
      }
      break;
    }

    case 'table': {
      if (isSwotMatrixQuestion(clone, resolvedSubjectName) || (clone.type as any) === 'swot' || clone.layoutVariant === 'swot-matrix') {
        const swotSan = sanitizeSwotMatrixQuestion(clone as any, {
          subjectName: resolvedSubjectName,
          parentQuestion: resolvedParentQuestion,
        });
        if (swotSan.isRejected) {
          return {
            sanitized: clone,
            repairLogs,
            fixes,
            isRejected: true,
            rejectionReason: swotSan.rejectionReason,
          };
        }
        Object.assign(clone, swotSan.sanitized);
        fixes.push(...swotSan.fixes);
        repairLogs.push(...swotSan.repairLogs);
        break;
      }
      const tbSan = sanitizeTableQuestion(clone as any, {
        subjectName: resolvedSubjectName,
        parentInstruction: resolvedParentQuestion?.instruction,
      });
      if (tbSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: tbSan.rejectionReason,
        };
      }
      Object.assign(clone, tbSan.sanitized);
      fixes.push(...tbSan.fixes);
      repairLogs.push(...tbSan.repairLogs);
      break;
    }

    case 'summary': {
      const sumSan = sanitizeSummaryQuestion(clone as any, { subjectName: resolvedSubjectName, parentQuestion: resolvedParentQuestion });
      if (sumSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: sumSan.rejectionReason,
        };
      }
      Object.assign(clone, sumSan.sanitized);
      fixes.push(...sumSan.fixes);
      break;
    }

    case 'transformation':
    case 'reorder': {
      const transSan = sanitizeTransformationQuestion(clone as any, {
        subjectName: resolvedSubjectName,
        parentInstruction: resolvedParentQuestion?.instruction,
      });
      if (transSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: transSan.rejectionReason,
        };
      }
      Object.assign(clone, transSan.sanitized);
      fixes.push(...transSan.fixes);
      repairLogs.push(...transSan.repairLogs);
      break;
    }

    case 'short':
    case 'short_answer': {
      if (isSwotMatrixQuestion(clone, resolvedSubjectName) || (clone.type as any) === 'swot' || (clone as any).swotData || clone.layoutVariant === 'swot-matrix') {
        const swotSan = sanitizeSwotMatrixQuestion(clone as any, {
          subjectName: resolvedSubjectName,
          parentQuestion: resolvedParentQuestion,
        });
        if (swotSan.isRejected) {
          return {
            sanitized: clone,
            repairLogs,
            fixes,
            isRejected: true,
            rejectionReason: swotSan.rejectionReason,
          };
        }
        Object.assign(clone, swotSan.sanitized);
        fixes.push(...swotSan.fixes);
        repairLogs.push(...swotSan.repairLogs);
        break;
      }
      if (isCalculationQuestion(clone, resolvedSubjectName) || (clone.type as any) === 'calculation' || clone.layoutVariant === 'calculation') {
        const calcSan = sanitizeCalculationQuestion(clone as any, {
          subjectName: resolvedSubjectName,
          parentQuestion: resolvedParentQuestion,
        });
        if (calcSan.isRejected) {
          return {
            sanitized: clone,
            repairLogs,
            fixes,
            isRejected: true,
            rejectionReason: calcSan.rejectionReason,
          };
        }
        Object.assign(clone, calcSan.sanitized);
        fixes.push(...calcSan.fixes);
        repairLogs.push(...calcSan.repairLogs);
        break;
      }
      const shSan = sanitizeShortAnswerQuestion(clone as any, {
        subjectName: resolvedSubjectName,
        parentInstruction: resolvedParentQuestion?.instruction,
      });
      if (shSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: shSan.rejectionReason,
        };
      }
      Object.assign(clone, shSan.sanitized);
      fixes.push(...shSan.fixes);
      repairLogs.push(...shSan.repairLogs);
      break;
    }

    case 'calculation': {
      const calcSan = sanitizeCalculationQuestion(clone as any, {
        subjectName: resolvedSubjectName,
        parentQuestion: resolvedParentQuestion,
      });
      if (calcSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: calcSan.rejectionReason,
        };
      }
      Object.assign(clone, calcSan.sanitized);
      fixes.push(...calcSan.fixes);
      repairLogs.push(...calcSan.repairLogs);
      break;
    }

    case 'swot':
    case 'swot_matrix':
    case 'swot_analysis':
    case 'matrix': {
      const swotSan = sanitizeSwotMatrixQuestion(clone as any, {
        subjectName: resolvedSubjectName,
        parentQuestion: resolvedParentQuestion,
      });
      if (swotSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: swotSan.rejectionReason,
        };
      }
      Object.assign(clone, swotSan.sanitized);
      fixes.push(...swotSan.fixes);
      repairLogs.push(...swotSan.repairLogs);
      break;
    }

    case 'essay': {
      const compSan = sanitizeCompositionQuestion(clone as any, { subjectName: resolvedSubjectName });
      if (compSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: compSan.rejectionReason,
        };
      }
      Object.assign(clone, compSan.sanitized);
      fixes.push(...compSan.fixes);
      break;
    }

    case 'fill_blank': {
      if ((clone as any).options && (clone as any).options.length > 0) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'FORBIDDEN_PRESENT',
          actionTaken: 'Removed options array from fill_blank question.',
          originalValue: (clone as any).options,
        });
        delete (clone as any).options;
        fixes.push(`Removed forbidden 'options' array from fill_blank question.`);
      }
      const fbSan = sanitizeFillBlankQuestion(clone as any, { subjectName: resolvedSubjectName });
      if (fbSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: fbSan.rejectionReason,
        };
      }
      Object.assign(clone, fbSan.sanitized);
      fixes.push(...fbSan.fixes);
      break;
    }

    case 'case_study': {
      const caseSan = sanitizeCaseStudyQuestion(clone as any, { subjectName: resolvedSubjectName });
      if (caseSan.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: caseSan.rejectionReason,
        };
      }
      Object.assign(clone, caseSan.sanitized);
      fixes.push(...caseSan.fixes);
      break;
    }
  }

  // 3. Process subquestions recursively
  if (clone.subQuestions && Array.isArray(clone.subQuestions)) {
    const sanitizedSubQuestions: SubQuestion[] = [];
    for (const sq of clone.subQuestions) {
      const subResult = sanitizeQuestionByContract(sq as any, {
        parentType: clone.type,
        subjectName: resolvedSubjectName,
        parentQuestion: clone,
        firstComprehensionPassage: (parentTypeOrContext as any)?.firstComprehensionPassage
      });
      if (subResult.isRejected) {
        return {
          sanitized: clone,
          repairLogs,
          fixes,
          isRejected: true,
          rejectionReason: `Child subquestion rejected: ${subResult.rejectionReason}`,
        };
      }
      repairLogs.push(...subResult.repairLogs);
      fixes.push(...subResult.fixes);
      sanitizedSubQuestions.push(subResult.sanitized as any);
    }
    (clone as any).subQuestions = sanitizedSubQuestions;
  }

  // 4. Re-validate after sanitization to ensure compliance
  const postValidation = validateQuestionTypeContract(clone, parentType);
  if (!postValidation.isValid) {
    const unhandledIssue = postValidation.issues.find((i) => i.severity === 'Critical' || i.severity === 'High');
    return {
      sanitized: clone,
      repairLogs,
      fixes,
      isRejected: true,
      rejectionReason: `Post-sanitization contract check failed: ${unhandledIssue?.message || 'Invalid structure'}`,
    };
  }

  return {
    sanitized: clone,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
