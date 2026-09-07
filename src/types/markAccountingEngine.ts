import { Question, SubQuestion, SubSubQuestion, SectionConfig, Section, ExamConfig, GeneratedExam } from '../types';

export type AttemptRuleMode = 'ATTEMPT_ALL' | 'CHOOSE_N_OF_M' | 'all' | 'choose';

export interface SectionAttemptRule {
  mode: AttemptRuleMode;
  choose?: number;
  available?: number;
  chooseCount?: number;
}

export interface QuestionMarkAccounting {
  questionId: string;
  marks: number;
  parentMarks?: number;
  subQuestionMarksSum?: number;
  isParent: boolean;
  isValid: boolean;
  discrepancies: string[];
}

export interface SectionMarkAccounting {
  sectionId: string;
  sectionName: string;
  declaredSectionMarks: number;
  availableQuestionsCount: number;
  availableTotalMarks: number;
  allowedAttemptsCount: number;
  candidateMaximumMarks: number;
  attemptRule: SectionAttemptRule;
  isValid: boolean;
  discrepancies: string[];
}

export interface ExamMarkAuditCorrection {
  questionId?: string;
  sectionId?: string;
  action: 'PARENT_MARKS_RECALCULATED' | 'TOTAL_MARKS_RECALCULATED' | 'QUESTION_MARKS_DEFAULTED';
  reason: string;
  oldValue: number | string;
  newValue: number | string;
}

export interface ExamMarkAudit {
  declaredExamTotalMarks: number;
  candidateMaximumExamMarks: number;
  availableExamMarksTotal: number;
  sectionAudits: SectionMarkAccounting[];
  questionAudits: QuestionMarkAccounting[];
  discrepancies: string[];
  corrections: ExamMarkAuditCorrection[];
  isValid: boolean;
  errors: string[];
}
