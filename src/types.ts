export interface SectionAdvancedConfig {
  sourcePriority: 'Documents Only' | 'Documents First' | 'AI Knowledge First' | 'Hybrid';
  passageRules?: {
    length: 'Short' | 'Medium' | 'Long';
    difficulty: 'Grade Level' | 'Slightly Above' | 'Slightly Below';
    source: 'Original' | 'AI-written';
    preserveExact: boolean;
  };
  distractorQuality: 'Highly plausible' | 'Medium' | 'Easy';
}

export interface ExamAdvancedConfig {
  varietyLevel?: 'conservative' | 'balanced' | 'innovative';
  standard: 'National Exam' | 'School Exam' | 'Cambridge' | 'IB' | 'Teacher Custom';
  learningOutcomes: string;
  coverage: string; // Topics, chapters etc.
  distributionRules: string;
  constraints: {
    noRepeatedConcepts: boolean;
    noDuplicateQuestions: boolean;
    useOnlyUploaded: boolean;
    allowExternal: boolean;
    includeRealWorld: boolean;
    avoidAmbiguous: boolean;
  };
  formatting: {
    newSectionNewPage: boolean;
    randomizeMCQ: boolean;
    continuousNumbering: boolean;
  };
}

export interface SectionDiagramConfig {
  diagramMode?: 'auto' | 'mandatory' | 'optional' | 'none';
  diagramCount?: number;
  diagramTypes?: ('svg' | 'mermaid' | 'smiles')[];
  allowStudentDrawingSpace?: boolean;
}

export interface SectionPartConfig {
  id: string;
  name: string;
  instructions?: string;
  marks?: number;
  numberOfQuestions?: number;
  questionTypes?: string[];
  diagramCount?: number;
}

export interface SectionConfig {
  id: string;
  name: string;
  instructions: string;
  numberOfQuestions: number;
  marks: number;
  questionTypes: string[];
  bloomsTaxonomy: string[];
  advanced?: SectionAdvancedConfig;
  structuralRules?: string;
  subQuestionRange?: { min?: number; max?: number };
  diagramConfig?: SectionDiagramConfig;
  hasParts?: boolean;
  parts?: SectionPartConfig[];
  questions?: Question[];
  attemptRule?: {
    mode: 'ATTEMPT_ALL' | 'CHOOSE_N_OF_M' | 'all' | 'choose';
    chooseCount?: number;
    choose?: number;
    available?: number;
  };
}

export type CoverTemplateId = 'nesa-standard';

export interface ExamCoverPageConfig {
  showCoverPage: boolean;
  coverTemplateId?: CoverTemplateId;
  authorityName?: string;
  institutionName?: string;
  schoolLogoUrl?: string;
  recentLogos?: string[];
  paperNumber?: string;
  termSemester?: string;
  variantCode?: string;
  confidentialityNotice?: string;
  
  // Removable / Toggleable Cover Elements
  showCandidateTable?: boolean;
  showExaminerMarksTable?: boolean;
  showBarcodeStub?: boolean;
  showSchoolLogo?: boolean;
  showSpecialInstructions?: boolean;
  showCombinationsList?: boolean;
}

export interface ExamCandidateConfig {
  includeNameField: boolean;
  includeIndexNumberField: boolean;
  includeSchoolCenterField: boolean;
  includeClassField?: boolean;
  customCandidateLabels?: {
    nameLabel?: string;
    indexLabel?: string;
    centerLabel?: string;
    classLabel?: string;
  };
}

export interface ExamFooterConfig {
  showRunningFooter: boolean;
  footerText?: string;
  showPageNumbers: boolean;
  showAcademicYearInFooter?: boolean;
  showBarcodeOrSecurityId?: boolean;
  securityBarcodeId?: string;
}

export interface ExamMetadataConfig {
  coverPage?: ExamCoverPageConfig;
  candidate?: ExamCandidateConfig;
  footer?: ExamFooterConfig;
  chiefExaminerCode?: string;
}

export interface ExamConfig {
  subjectName: string;
  subjectCode: string;
  combinations: string;
  duration: string;
  totalMarks: number;
  academicYear: string;
  level: string;
  examDate: string;
  examTime: string;
  sourceText: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  templateId: string;
  instructions: string[];
  sections: SectionConfig[];
  language?: string;
  varietyLevel?: 'conservative' | 'balanced' | 'innovative';
  advanced?: ExamAdvancedConfig;
  metadata?: ExamMetadataConfig;
}

export interface ExamProfile {
  id: string;
  name: string;
  description?: string;
  category?: string;
  level?: string;
  subjectName?: string;
  isDefault?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  config: ExamConfig;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface TableCell {
  text: string;
  role?: 'HEADER' | 'LABEL' | 'SUPPLIED_CONTENT' | 'CANDIDATE_RESPONSE' | 'STRUCTURAL';
  expectedAnswer?: string;
  marks?: number;
}

export interface QuestionTable {
  rows: string[][];
  blankCells?: { rowIndex: number; colIndex: number }[];
  semanticCells?: TableCell[][];
}

export type TableData = QuestionTable;

export interface QuestionPresentation {
  keepTogether?: boolean;
  pageBreakBefore?: boolean;
  indentation?: string;
  layout?: 'standard' | 'side-by-side' | 'grid' | 'traditional' | 'one-to-many' | 'ordering' | 'table' | 'swot-matrix' | 'calculation';
  answerStyle?: 'dotted' | 'dashed' | 'solid' | 'box' | 'grid';
  tableStyle?: 'standard' | 'minimal' | 'boxed';
  customLines?: number;
  title?: string;
  wordBank?: string[];
}

export interface QuestionLayoutIntent {
  optionArrangement?: 'horizontal' | 'two_column' | 'vertical';
  workspaceType?: 'ruled_lines' | 'calculation_box' | 'graph_grid' | 'blank_space' | 'none';
  breakConstraint?: 'keep_together' | 'allow_split' | 'force_page_break_after';
  blankTokenStyle?: 'inline_leader' | 'compact_blank';
  estimatedHeightPt?: number;
}

export interface RubricStep {
  step: string;
  markType?: 'M' | 'A' | 'B' | 'Method' | 'Accuracy' | 'Explanation' | string;
  marks: number;
}

export interface QuestionMarkingScheme {
  expectedAnswer: string;
  rubric?: string[];
  rubricSteps?: RubricStep[];
  methodMarks?: number;
  accuracyMarks?: number;
  examinerNotes?: string[];
  acceptableAlternatives?: string[];
  doNotAwardMarksFor?: string[];
}

export interface BaseItemFields {
  id: string;
  number: number;
  visibleLabel?: string;
  parentId?: string;
  childIndex?: number;
  text: string;
  marks: number;
  instruction?: string;
  leadInstruction?: string;
  strategy?: string;
  context?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  evidenceCitation?: string;
  layoutVariant?: string;
  numberingStyle?: 'numeric' | 'alpha-lower' | 'roman-upper' | 'roman-lower';
  presentation?: QuestionPresentation;
  layoutIntent?: QuestionLayoutIntent;
  markingScheme?: QuestionMarkingScheme;
  cognitiveDomain?: {
    bloomsLevel?: string;
    assessmentObjective?: string;
    commandVerb?: string;
  };
  curriculumRef?: {
    competence?: string;
    unitTopic?: string;
    localContext?: string;
  };
  editorNote?: string;
  passageRef?: string;
  svgData?: string;
  smilesData?: string;
  mermaidData?: string;
  givenData?: string;
  formula?: string;
  wordBank?: string[];
  swotData?: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  finalAnswerSlot?: boolean;
  unit?: string;
}

// ------------------------------------------------------------
// 1. MCQ VARIANT
// Contract: options REQUIRED, answerSpace 'none', atomic (no subquestions)
// ------------------------------------------------------------
export interface McqVariant extends BaseItemFields {
  type: 'mcq';
  options: QuestionOption[];
  answerSpace?: 'none';
  tableData?: never;
  wordBank?: never;
  subQuestions?: never;
  summaryTask?: never;
  wordLimit?: never;
}

// ------------------------------------------------------------
// 2. TRUE / FALSE VARIANT
// Contract: options forbidden, tableData forbidden
// ------------------------------------------------------------
export interface TrueFalseVariant<TChild = never> extends BaseItemFields {
  type: 'true_false';
  answerSpace?: 'none' | 'small';
  options?: never;
  tableData?: never;
  wordBank?: never;
  summaryTask?: never;
  wordLimit?: never;
  subQuestions?: TChild[];
}

// ------------------------------------------------------------
// 3. TABULAR / MATCHING VARIANT
// Contract: tableData REQUIRED, options forbidden
// ------------------------------------------------------------
export interface TableVariant<TChild = never> extends BaseItemFields {
  type: 'matching' | 'table';
  tableData: TableData;
  options?: never;
  wordBank?: never;
  summaryTask?: never;
  wordLimit?: never;
  answerSpace?: 'none' | 'small' | 'medium' | 'large';
  subQuestions?: TChild[];
}

// ------------------------------------------------------------
// 4. FILL IN THE BLANKS VARIANT
// Contract: answerSpace 'none', optional wordBank, options forbidden
// ------------------------------------------------------------
export interface FillBlankVariant extends BaseItemFields {
  type: 'fill_blank';
  answerSpace?: 'none';
  wordBank?: string[];
  options?: never;
  tableData?: never;
  summaryTask?: never;
  wordLimit?: never;
  subQuestions?: never;
}

// ------------------------------------------------------------
// 5. WRITTEN OPEN RESPONSE VARIANT
// Contract: answerSpace REQUIRED, options FORBIDDEN (no topic options)
// ------------------------------------------------------------
export interface WrittenResponseVariant<TChild = never> extends BaseItemFields {
  type: 'short' | 'short_answer' | 'transformation' | 'reorder' | 'summary';
  answerSpace?: 'small' | 'medium' | 'large' | 'xlarge' | 'none';
  summaryTask?: string;
  wordLimit?: number;
  options?: never;
  tableData?: never;
  wordBank?: never;
  subQuestions?: TChild[];
}

export interface EssayVariant extends BaseItemFields {
  type: 'essay';
  answerSpace?: 'large' | 'xlarge';
  summaryTask?: never;
  wordLimit?: never;
  options?: any; // To support composition topics
  tableData?: never;
  wordBank?: never;
  subQuestions?: never; // ATOMIC: Must not have sub-questions
}

export interface CalculationVariant<TChild = never> extends BaseItemFields {
  type: 'calculation';
  answerSpace?: 'small' | 'medium' | 'large' | 'xlarge' | 'none';
  formula?: string;
  givenData?: string;
  unit?: string;
  finalAnswerSlot?: boolean;
  options?: never;
  tableData?: never;
  wordBank?: never;
  subQuestions?: TChild[];
}

// ------------------------------------------------------------
// 6. CASE STUDY SCENARIO CONTAINER VARIANT
// Contract: subQuestions REQUIRED, options & tableData forbidden on container
// ------------------------------------------------------------
export interface CaseStudyVariant<TChild> extends BaseItemFields {
  type: 'case_study';
  subQuestions: TChild[];
  answerSpace?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  options?: never;
  tableData?: never;
  wordBank?: never;
  summaryTask?: never;
  wordLimit?: never;
}

// ============================================================
// LEVEL 3: SubSubQuestion (Leaf Node — no further recursion)
// ============================================================
export type SubSubQuestion =
  | McqVariant
  | TrueFalseVariant<never>
  | TableVariant<never>
  | FillBlankVariant
  | WrittenResponseVariant<never>
  | EssayVariant
  | CalculationVariant<never>;

// ============================================================
// LEVEL 2: SubQuestion (Can contain SubSubQuestions)
// ============================================================
export type SubQuestion =
  | McqVariant
  | TrueFalseVariant<SubSubQuestion>
  | TableVariant<SubSubQuestion>
  | FillBlankVariant
  | WrittenResponseVariant<SubSubQuestion>
  | EssayVariant
  | CalculationVariant<SubSubQuestion>
  | CaseStudyVariant<SubSubQuestion>;

// ============================================================
// LEVEL 1: Top-Level Question (Can contain SubQuestions)
// ============================================================
export interface QuestionExtraFields {
  bloomLevel?: string;
  visibleNumber?: string;
  resourceIds?: string[];
}

export type Question = (
  | McqVariant
  | TrueFalseVariant<SubQuestion>
  | TableVariant<SubQuestion>
  | FillBlankVariant
  | WrittenResponseVariant<SubQuestion>
  | EssayVariant
  | CalculationVariant<SubQuestion>
  | CaseStudyVariant<SubQuestion>
) & QuestionExtraFields;

export interface Passage {
  id: string;
  text: string;
  title?: string;
  source?: string;
  language?: 'en' | 'fr';
}

export interface SectionPart {
  id: string;
  name: string;
  instructions?: string;
  marks?: number;
  questions: Question[];
}

export interface Section {
  id?: string;
  name?: string;
  attemptRule?: {
    mode: 'ATTEMPT_ALL' | 'CHOOSE_N_OF_M' | 'all' | 'choose';
    chooseCount?: number;
    choose?: number;
    available?: number;
  };
  subQuestionRange?: { min?: number; max?: number };
  title: string;
  instructions: string;
  marks: number;
  questions: Question[];
  editorNote?: string;
  svgData?: string;
  smilesData?: string;
  mermaidData?: string;
  presentation?: {
    pageBreakBefore: boolean;
    columns: number;
  };
  hasParts?: boolean;
  parts?: SectionPart[];
  diagramConfig?: SectionDiagramConfig;
  passages?: Passage[];
}

export interface Answer {
  questionId: string;
  number: number;
  expected: string;
  marks: number;
  rubric?: string[] | string;
  rubricSteps?: RubricStep[];
  methodMarks?: number;
  accuracyMarks?: number;
  examinerNotes?: string[];
  acceptableAlternatives?: string[];
  doNotAwardMarksFor?: string[];
}

export interface MarkingSection {
  title: string;
  answers: Answer[];
}

export interface ExamAnalysis {
  difficultyDistribution: { name: string; value: number }[];
  bloomsDistribution: { name: string; value: number }[];
  topicCoverage: { name: string; value: number }[];
}

export interface ExamHeader {
  subjectName: string;
  subjectCode: string;
  combinations: string;
  duration: string;
  marks: number;
  academicYear: string;
  level: string;
  examDate: string;
  examTime: string;
  instructions: string[];
  language?: string;
  metadata?: ExamMetadataConfig;
}

export interface GeneratedExam {
  header: ExamHeader;
  sections: Section[];
  markingGuide?: GeneratedMarkingGuide;
  presentation?: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    margins: { top: string, bottom: string, left: string, right: string };
    pageTarget?: number;
  };
}

export interface GeneratedMarkingGuide {
  sections: MarkingSection[];
}

export interface GenerationResponse {
  success: boolean;
  exam: GeneratedExam;
  markingGuide: GeneratedMarkingGuide;
  analysis: ExamAnalysis;
  recommendations?: string[];
}

export interface EvidenceObject {
  id: string;
  knowledgeObjectId: string;
  sourceDocumentId: string;
  sourceFileName: string;
  sourcePage?: number;
  paragraphNumber?: number;
  figureTableReference?: string;
  
  subjectId?: string;
  educationLevel?: string;
  classId?: string;
  programmeId?: string;
  streamId?: string;
  curriculumVersion?: string;
  topicId?: string;
  subtopicId?: string;
  competencyId?: string;
  learningOutcomeId?: string;
  assessmentObjectiveId?: string;
  
  questionTypeRelevance?: string[];
  bloomLevel?: string;
  difficultyEstimate?: string;
  
  confidenceScore: number;
  validationStatus: 'Pending' | 'Valid' | 'Requires Review' | 'Quarantined';
  retrievalScore: number;
  
  timestamp: number;
  version: number;
  content: string;
}

export interface RetrievalQuery {
  subjectId?: string;
  topicId?: string;
  competencyId?: string;
  learningOutcomeId?: string;
  bloomLevel?: string;
  difficulty?: string;
  questionType?: string;
  curriculumVersion?: string;
  teacherId?: string;
  maxTokens?: number;
  text?: string;
}

// Phase 1: Class & Classroom System Types
export type EducationLevelCode = 'ORDINARY LEVEL' | 'ADVANCED LEVEL';

export interface SeniorClassInfo {
  id: string; // 'grd-s1' | 'grd-s2' | 'grd-s3' | 'grd-s4' | 'grd-s5' | 'grd-s6'
  code: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  name: string; // "Senior 1", "Senior 2", "Senior 3", "Senior 4", "Senior 5", "Senior 6"
  levelId: 'lvl-olevel' | 'lvl-alevel';
  levelCode: EducationLevelCode;
  isTerminalClass: boolean; // S3 and S6 are national examination terminal years
}

export interface ClassroomCoverageConfig {
  mode: 'single' | 'cumulative_70_30' | 'custom';
  currentClassPct: number;
  previousClassesPct: number;
  breakdown?: { classId: string; className: string; pct: number }[];
}

export interface Classroom {
  id: string;
  name: string; // e.g., "Senior 6 Biology"
  levelId: 'lvl-olevel' | 'lvl-alevel';
  levelCode: EducationLevelCode;
  levelName: string; // "Lower Secondary (O-Level)" or "Upper Secondary (A-Level)"
  classId: string; // "grd-s1" .. "grd-s6"
  classCode: string; // "S1" .. "S6"
  className: string; // "Senior 1" .. "Senior 6"
  subjectName: string; // "Biology", "Mathematics", etc.
  subjectCode: string; // "BIO201", "028", etc.
  combinations?: string; // e.g. "MCB, PCB, BCG" for A-Level
  academicYear: string; // "2024-2025"
  term: string; // "Term 1", "Term 2", "Term 3", "National Mock"
  curriculumContext?: string; // Syllabus passages, key units, or source material
  coverageConfig?: ClassroomCoverageConfig;
  createdAt: string;
  updatedAt: string;
}

