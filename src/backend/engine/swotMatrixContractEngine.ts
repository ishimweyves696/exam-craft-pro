import { Question, SubQuestion, SubSubQuestion } from '../../types.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';
import {
  QuestionContractValidationIssue,
  QuestionContractValidationResult,
  QuestionSanitizationResult,
} from '../../types/questionContracts.js';
import { normalizeLanguage } from '../../utils/languageUtils.js';

export interface SwotQuadrantLocalization {
  internalHeader: string;
  externalHeader: string;
  strengthsTitle: string;
  weaknessesTitle: string;
  opportunitiesTitle: string;
  threatsTitle: string;
}

export const SWOT_LOCALIZATIONS: Record<string, SwotQuadrantLocalization> = {
  en: {
    internalHeader: 'INTERNAL FACTORS',
    externalHeader: 'EXTERNAL FACTORS',
    strengthsTitle: 'STRENGTHS (S)',
    weaknessesTitle: 'WEAKNESSES (W)',
    opportunitiesTitle: 'OPPORTUNITIES (O)',
    threatsTitle: 'THREATS (T)',
  },
  fr: {
    internalHeader: 'FACTEURS INTERNES',
    externalHeader: 'FACTEURS EXTERNES',
    strengthsTitle: 'FORCES (F)',
    weaknessesTitle: 'FAIBLESSES (F)',
    opportunitiesTitle: 'OPPORTUNITÉS (O)',
    threatsTitle: 'MENACES (M)',
  },
  rw: {
    internalHeader: 'IBY’IMBERE MU KIGO',
    externalHeader: 'IBY’INJURIRIYE HANZE',
    strengthsTitle: 'IMBARAGA (S)',
    weaknessesTitle: 'INTEGE NKE (W)',
    opportunitiesTitle: 'AMAHIRWE (O)',
    threatsTitle: 'INZITIZI / IBIHANGAYIKISHIJE (T)',
  },
};

export function getSwotLocalization(lang?: string): SwotQuadrantLocalization {
  if (lang && (lang === 'rw' || lang.toLowerCase().startsWith('rw') || lang.toLowerCase().includes('kiny'))) {
    return SWOT_LOCALIZATIONS.rw || SWOT_LOCALIZATIONS.en;
  }
  const norm = normalizeLanguage(lang);
  return SWOT_LOCALIZATIONS[norm] || SWOT_LOCALIZATIONS.en;
}

/**
 * Detects if a question is a SWOT Matrix based on type or text patterns.
 */
export function isSwotMatrixQuestion(
  q: Question | SubQuestion | SubSubQuestion,
  subjectName?: string
): boolean {
  const t = (q.type || '').toLowerCase();
  if (t === 'swot' || t === 'swot_matrix' || t === 'swot_analysis') return true;
  if (t === 'matrix' && !subjectName?.toLowerCase().includes('math')) return true;

  const combined = `${q.instruction || ''} ${q.text || ''} ${q.context || ''}`.toLowerCase();
  
  if (/\bswot\b/i.test(combined)) return true;
  if (
    /\bstrengths?\b/i.test(combined) &&
    /\bweaknesses?\b/i.test(combined) &&
    /\bopportunities?\b/i.test(combined) &&
    /\bthreats?\b/i.test(combined)
  ) {
    return true;
  }
  if (
    /\bforces?\b/i.test(combined) &&
    /\bfaiblesses?\b/i.test(combined) &&
    /\bopportunit[eé]s?\b/i.test(combined) &&
    /\bmenaces?\b/i.test(combined)
  ) {
    return true;
  }

  return false;
}

/**
 * Validates a SWOT Matrix question contract.
 */
export function validateSwotMatrixQuestionContract(
  q: Question | SubQuestion | SubSubQuestion,
  options?: { subjectName?: string }
): QuestionContractValidationResult {
  const issues: QuestionContractValidationIssue[] = [];
  const qId = (q as any).id || `q_${q.number || 'swot'}`;
  const subjectName = options?.subjectName || '';

  // 1. Check for Question Stem
  if (!q.text || q.text.trim() === '') {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: 'SWOT Matrix question requires a clear task stem or business scenario.',
      severity: 'Critical',
      autoFixable: false,
    });
  }

  // 2. Subject Compatibility
  const forbiddenSwotSubjects = ['mathematics', 'physics', 'chemistry', 'biology', 'geography_physical'];
  if (forbiddenSwotSubjects.some((s) => subjectName.toLowerCase().includes(s))) {
    issues.push({
      field: 'type',
      code: 'INVALID_STRUCTURE',
      message: `SWOT Matrix question type is not standard for subject: ${subjectName}`,
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // 3. Mark Allocation Guidance (SWOT analysis typically requires at least 4 marks, 1 per quadrant)
  if (q.marks !== undefined && q.marks > 0 && q.marks < 4) {
    issues.push({
      field: 'marks',
      code: 'INVALID_STRUCTURE',
      message: `SWOT Matrix question is assigned only ${q.marks} marks (recommended minimum 4 marks for 4 quadrants).`,
      severity: 'Low',
      autoFixable: true,
    });
  }

  return {
    questionId: qId,
    questionNumber: q.number,
    questionType: 'swot',
    isValid: !issues.some((i) => i.severity === 'Critical' || i.severity === 'High'),
    issues,
  };
}

/**
 * Sanitizes a SWOT Matrix question.
 * Auto-upgrades generic answer lines to a structured 4-quadrant SWOT matrix.
 */
export function sanitizeSwotMatrixQuestion(
  q: Question | SubQuestion | SubSubQuestion,
  options?: { subjectName?: string; language?: string; parentQuestion?: Question }
): QuestionSanitizationResult {
  const clone = JSON.parse(JSON.stringify(q)) as Question;
  const fixes: string[] = [];
  const qId = clone.id || `q_${clone.number || 'swot'}`;

  // 0. Global Deep Clean
  if (clone.text) {
    const cleaned = deepCleanText(clone.text);
    if (cleaned !== clone.text) {
      clone.text = cleaned;
      fixes.push('Deep cleaned SWOT matrix text stem');
    }
  }

  // 1. Enforce canonical question type
  (clone as any).type = 'table';

  // 2. Strip MCQ options if mistakenly attached to a SWOT matrix
  if (clone.options && clone.options.length > 0) {
    delete (clone as any).options;
    fixes.push('Removed forbidden MCQ options from SWOT matrix question');
  }

  // 3. Ensure presentation and layout variant is swot-matrix
  if (!clone.presentation) {
    clone.presentation = {};
  }
  clone.presentation.layout = 'swot-matrix';
  clone.layoutVariant = 'swot-matrix';

  // 4. Auto-upgrade: Replace generic answerSpace with none because the 4-quadrant box handles response space
  if (clone.answerSpace && clone.answerSpace !== 'none') {
    fixes.push(`Auto-upgraded generic answer lines (${clone.answerSpace}) to structured 4-quadrant SWOT matrix`);
    clone.answerSpace = 'none';
  }

  // 5. Structure swotData if provided in solution or context
  if (clone.swotData) {
    const cleanList = (arr?: string[]) =>
      Array.isArray(arr)
        ? arr.map((item) => deepCleanText(item)).filter((item) => item.length > 0)
        : [];

    clone.swotData = {
      strengths: cleanList(clone.swotData.strengths),
      weaknesses: cleanList(clone.swotData.weaknesses),
      opportunities: cleanList(clone.swotData.opportunities),
      threats: cleanList(clone.swotData.threats),
    };
  }

  return {
    sanitized: clone,
    repairLogs: [],
    fixes,
    isRejected: false,
  };
}
