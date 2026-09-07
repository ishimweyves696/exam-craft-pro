import { Question, SubQuestion, SubSubQuestion, Section, SectionConfig } from '../types';

export type NumberingStyle = 'numeric' | 'alpha-lower' | 'alpha-upper' | 'roman-lower' | 'roman-upper';

export interface StructuralResource {
  id: string;
  type: 'passage' | 'case_study' | 'table' | 'diagram' | 'svg' | 'smiles' | 'mermaid';
  content: any;
  associatedQuestionIds: string[];
}

export interface StructuralValidationIssue {
  code:
    | 'DUPLICATE_QUESTION_ID'
    | 'DUPLICATE_VISIBLE_NUMBER'
    | 'ORPHAN_CHILD'
    | 'INVALID_RESOURCE_REF'
    | 'DUPLICATE_RESOURCE_ID'
    | 'MISSING_PARENT_ID'
    | 'QUESTION_OUTSIDE_SECTION';
  message: string;
  questionId?: string;
  resourceId?: string;
  sectionId?: string;
}

export interface ExaminerGridItem {
  questionNumber: number;
  label: string;
  maxMarks: number;
}

export interface ExaminerGrid {
  items: ExaminerGridItem[];
  totalQuestions: number;
  totalMarks: number;
}

export interface CanonicalExamSection {
  id: string;
  name: string;
  instructions: string;
  attemptRule: any;
  questions: Question[];
}

export interface CanonicalExamStructure {
  examHeader: any;
  sections: CanonicalExamSection[];
  resources: StructuralResource[];
  examinerGrid: ExaminerGrid;
  issues: StructuralValidationIssue[];
  isValid: boolean;
}
