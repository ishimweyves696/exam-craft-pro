import { Question, SubQuestion, SubSubQuestion, SectionConfig, Section, ExamConfig, GeneratedExam } from '../../types';
import {
  SectionAttemptRule,
  QuestionMarkAccounting,
  SectionMarkAccounting,
  ExamMarkAuditCorrection,
  ExamMarkAudit,
} from '../../types/markAccountingEngine';

/**
 * Normalizes section attempt rules to unified structure.
 */
export function normalizeAttemptRule(rule?: any, questionCount: number = 0): SectionAttemptRule {
  if (!rule || !rule.mode) {
    return { mode: 'ATTEMPT_ALL', choose: questionCount, available: questionCount };
  }

  const rawMode = String(rule.mode).toUpperCase();
  if (rawMode === 'CHOOSE' || rawMode === 'CHOOSE_N_OF_M' || rawMode === 'CHOOSE_N') {
    const chooseNum = rule.choose || rule.chooseCount || questionCount;
    return {
      mode: 'CHOOSE_N_OF_M',
      choose: chooseNum,
      available: rule.available || questionCount,
      chooseCount: chooseNum,
    };
  }

  return {
    mode: 'ATTEMPT_ALL',
    choose: questionCount,
    available: questionCount,
    chooseCount: questionCount,
  };
}

/**
 * Validates and calculates marks for a single question (including sub-questions recursively).
 */
export function validateAndCalculateQuestionMarks(
  question: Question,
  pathPrefix: string = ''
): {
  audit: QuestionMarkAccounting;
  corrections: ExamMarkAuditCorrection[];
  childAudits: QuestionMarkAccounting[];
} {
  const qId = question.id || `q_${question.number}`;
  const discrepancies: string[] = [];
  const corrections: ExamMarkAuditCorrection[] = [];
  const childAudits: QuestionMarkAccounting[] = [];

  // Check mark exists and is valid
  if (typeof question.marks !== 'number' || isNaN(question.marks)) {
    discrepancies.push(`MISSING_MARKS: Question ${qId} has missing or non-numeric marks`);
  } else if (question.marks < 0) {
    discrepancies.push(`INVALID_MARKS: Question ${qId} has negative marks (${question.marks})`);
  }

  const hasChildren = Array.isArray(question.subQuestions) && question.subQuestions.length > 0;
  let subQuestionMarksSum: number | undefined = undefined;

  if (hasChildren) {
    let sum = 0;
    let allChildrenValid = true;

    question.subQuestions!.forEach((sq) => {
      const sqId = sq.id || `${qId}_sub_${sq.number}`;

      // Recalculate subquestion marks from sub-subquestions first if present
      if (Array.isArray(sq.subQuestions) && sq.subQuestions.length > 0) {
        let subSum = 0;
        sq.subQuestions.forEach((ssq) => {
          if (typeof ssq.marks === 'number' && !isNaN(ssq.marks) && ssq.marks >= 0) {
            subSum += ssq.marks;
          }
        });
        if (sq.marks !== subSum && subSum > 0) {
          corrections.push({
            questionId: sqId,
            action: 'PARENT_MARKS_RECALCULATED',
            reason: `Recalculated subquestion ${sqId} marks from sum of sub-subquestions (${subSum})`,
            oldValue: sq.marks,
            newValue: subSum,
          });
          sq.marks = subSum;
        }
      }

      if (typeof sq.marks !== 'number' || isNaN(sq.marks) || sq.marks < 0) {
        allChildrenValid = false;
        discrepancies.push(`INVALID_MARKS: Child question ${sqId} has invalid marks`);
      } else {
        sum += sq.marks;
      }
    });

    subQuestionMarksSum = sum;

    if (allChildrenValid && sum > 0 && question.marks !== sum) {
      corrections.push({
        questionId: qId,
        action: 'PARENT_MARKS_RECALCULATED',
        reason: `Recalculated parent question ${qId} marks from sum of subquestions (${sum})`,
        oldValue: question.marks ?? 0,
        newValue: sum,
      });
      question.marks = sum;
    } else if (question.marks !== sum) {
      discrepancies.push(
        `PARENT_CHILD_MARK_MISMATCH: Question ${qId} parent marks (${question.marks}) does not equal sum of child marks (${sum})`
      );
    }
  }

  const audit: QuestionMarkAccounting = {
    questionId: qId,
    marks: question.marks ?? 0,
    parentMarks: hasChildren ? question.marks : undefined,
    subQuestionMarksSum,
    isParent: hasChildren,
    isValid: discrepancies.length === 0,
    discrepancies,
  };

  return { audit, corrections, childAudits };
}

/**
 * Validates mark accounting for a single section.
 */
export function validateSectionMarkAccounting(
  section: SectionConfig | Section,
  sectionIndex: number = 0
): {
  audit: SectionMarkAccounting;
  corrections: ExamMarkAuditCorrection[];
  questionAudits: QuestionMarkAccounting[];
} {
  const secName = section.name || (section as any).title || `Section ${sectionIndex + 1}`;
  const secId = (section as any).id || `sec_${sectionIndex + 1}`;
  const questions = section.questions || [];
  const declaredMarks = section.marks ?? 0;

  const discrepancies: string[] = [];
  const corrections: ExamMarkAuditCorrection[] = [];
  const questionAudits: QuestionMarkAccounting[] = [];

  const normRule = normalizeAttemptRule(section.attemptRule, questions.length);

  let availableMarksTotal = 0;
  const questionMarksList: number[] = [];

  questions.forEach((q) => {
    const { audit, corrections: qCorrections } = validateAndCalculateQuestionMarks(q);
    corrections.push(...qCorrections);
    questionAudits.push(audit);
    discrepancies.push(...audit.discrepancies);

    const validMark = typeof q.marks === 'number' && !isNaN(q.marks) && q.marks >= 0 ? q.marks : 0;
    availableMarksTotal += validMark;
    questionMarksList.push(validMark);
  });

  // Calculate Candidate Maximum Marks
  let allowedAttemptsCount = questions.length;
  let candidateMaximumMarks = availableMarksTotal;

  if (normRule.mode === 'CHOOSE_N_OF_M') {
    allowedAttemptsCount = Math.min(normRule.choose || questions.length, questions.length);
    // Top N marks obtainable
    const sortedMarks = [...questionMarksList].sort((a, b) => b - a);
    candidateMaximumMarks = sortedMarks.slice(0, allowedAttemptsCount).reduce((acc, m) => acc + m, 0);
  }

  // Validate declared section marks against candidate max marks
  if (declaredMarks > 0 && declaredMarks !== candidateMaximumMarks) {
    discrepancies.push(
      `SECTION_MARK_MISMATCH: Section '${secName}' declared marks (${declaredMarks}) does not match calculated candidate maximum marks (${candidateMaximumMarks})`
    );
  }

  // Check for contradiction between section instructions and attemptRule
  const instructions = (section as any).instructions;
  if (typeof instructions === 'string' && instructions.trim().length > 0) {
    const lowerInst = instructions.toLowerCase();
    if (normRule.mode === 'CHOOSE_N_OF_M' && (lowerInst.includes('attempt all') || lowerInst.includes('answer all'))) {
      discrepancies.push(
        `ATTEMPT_RULE_CONTRADICTION: Section '${secName}' instructions state 'attempt all' but attempt rule is CHOOSE_N_OF_M`
      );
    } else if (
      normRule.mode === 'ATTEMPT_ALL' &&
      (lowerInst.includes('attempt any') || lowerInst.includes('answer any') || lowerInst.includes('choose'))
    ) {
      discrepancies.push(
        `ATTEMPT_RULE_CONTRADICTION: Section '${secName}' instructions state 'choose/any' but attempt rule is ATTEMPT_ALL`
      );
    }
  }



  const audit: SectionMarkAccounting = {
    sectionId: secId,
    sectionName: secName,
    declaredSectionMarks: declaredMarks,
    availableQuestionsCount: questions.length,
    availableTotalMarks: availableMarksTotal,
    allowedAttemptsCount,
    candidateMaximumMarks,
    attemptRule: normRule,
    isValid: discrepancies.length === 0,
    discrepancies,
  };

  return { audit, corrections, questionAudits };
}

/**
 * Validates examination-wide mark accounting.
 */
export function validateExamMarkAccounting(exam: ExamConfig | GeneratedExam): ExamMarkAudit {
  const declaredTotal = (exam as any).totalMarks || (exam as any).header?.marks || 0;
  const sectionAudits: SectionMarkAccounting[] = [];
  const questionAudits: QuestionMarkAccounting[] = [];
  const corrections: ExamMarkAuditCorrection[] = [];
  const discrepancies: string[] = [];
  const errors: string[] = [];

  let candidateMaxExamMarksTotal = 0;
  let availableExamMarksTotal = 0;

  const sections = (exam as any).sections || [];
  sections.forEach((sec: any, idx: number) => {
    const { audit: secAudit, corrections: secCorrections, questionAudits: qAudits } = validateSectionMarkAccounting(
      sec,
      idx
    );

    sectionAudits.push(secAudit);
    questionAudits.push(...qAudits);
    corrections.push(...secCorrections);

    candidateMaxExamMarksTotal += secAudit.candidateMaximumMarks;
    availableExamMarksTotal += secAudit.availableTotalMarks;

    if (!secAudit.isValid) {
      discrepancies.push(...secAudit.discrepancies);
    }
  });

  // Verify Exam Total Marks
  if (declaredTotal > 0 && declaredTotal !== candidateMaxExamMarksTotal) {
    const totalMismatchMsg = `TOTAL_MARK_MISMATCH: Declared exam total marks (${declaredTotal}) does not match sum of candidate maximum marks across sections (${candidateMaxExamMarksTotal})`;
    discrepancies.push(totalMismatchMsg);
    errors.push(totalMismatchMsg);
  }

  sectionAudits.forEach((sa) => {
    sa.discrepancies.forEach((d) => {
      if (d.startsWith('SECTION_MARK_MISMATCH')) {
        errors.push(d);
      }
    });
  });

  return {
    declaredExamTotalMarks: declaredTotal,
    candidateMaximumExamMarks: candidateMaxExamMarksTotal,
    availableExamMarksTotal,
    sectionAudits,
    questionAudits,
    discrepancies,
    corrections,
    isValid: errors.length === 0,
    errors,
  };
}
