import { Question, SubQuestion, SubSubQuestion, SectionConfig, Section, ExamConfig, GeneratedExam } from '../../types';
import {
  StructuralResource,
  StructuralValidationIssue,
  ExaminerGrid,
  ExaminerGridItem,
  CanonicalExamSection,
  CanonicalExamStructure,
} from '../../types/numberingLayoutEngine';

/**
 * Strips AI-generated numbering prefixes from question stems or sub-question texts.
 * Examples: "Question 4.", "Q12:", "1. Explain...", "12(a)", "(a)", "a)", "Part A - "
 */
export function sanitizeAIGeneratedNumberingFromStem(text?: string): string {
  if (!text) return '';
  return text
    .replace(/^(?:question|q)?\s*\d+[\.\:\)\-]\s*/i, '') // "Question 1.", "Q12:", "1. "
    .replace(/^(?:\(\s*[a-z0-9]+\s*\)|[a-z0-9]+[\.\)]|\([a-z0-9]+\))\s*/i, '') // "(a)", "a)", "12(a)"
    .replace(/^(?:part|section)\s+[a-z0-9]+[\.\:\-]\s*/i, '') // "Part A:", "Section B -"
    .trim();
}

/**
 * Applies deterministic continuous top-level question numbering (1, 2, 3...) across sections.
 * Strips AI-generated prefixes from question stems.
 */
export function applyCanonicalTopLevelNumbering(
  exam: ExamConfig | GeneratedExam
): { totalQuestions: number; renumberedCount: number } {
  let currentQuestionNumber = 1;
  let renumberedCount = 0;

  const sections = (exam as any).sections || [];
  sections.forEach((section: any) => {
    const questions: Question[] = section.questions || [];
    questions.forEach((q) => {
      const originalNum = q.number;
      q.number = currentQuestionNumber;
      q.visibleNumber = `Q${currentQuestionNumber}`;

      // Clean AI numbering from stem
      const cleanText = sanitizeAIGeneratedNumberingFromStem(q.text);
      if (cleanText !== q.text) {
        q.text = cleanText;
        renumberedCount++;
      } else if (originalNum !== currentQuestionNumber) {
        renumberedCount++;
      }

      // Apply subquestion canonical numbering
      applyCanonicalSubQuestionNumbering(q);

      currentQuestionNumber++;
    });
  });

  return {
    totalQuestions: currentQuestionNumber - 1,
    renumberedCount,
  };
}

/**
 * Applies deterministic sub-question numbering and sets explicit parentId/childIndex.
 */
export function applyCanonicalSubQuestionNumbering(question: Question): void {
  const parentId = question.id || `q_${question.number}`;
  question.id = parentId;

  if (Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
    question.subQuestions.forEach((sq, sqIdx) => {
      sq.parentId = parentId;
      sq.childIndex = sqIdx;

      // Assign deterministic label: e.g. (a), (b), (c)
      const letter = String.fromCharCode(97 + sqIdx); // 'a', 'b', 'c'
      sq.visibleLabel = `(${letter})`;

      // Clean AI prefix from subquestion stem
      sq.text = sanitizeAIGeneratedNumberingFromStem(sq.text);

      const subId = sq.id || `${parentId}_sub_${sqIdx + 1}`;
      sq.id = subId;

      // Sub-sub questions if present
      if (Array.isArray(sq.subQuestions) && sq.subQuestions.length > 0) {
        sq.subQuestions.forEach((ssq, ssqIdx) => {
          ssq.parentId = subId;
          ssq.childIndex = ssqIdx;
          const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
          const roman = romanNumerals[ssqIdx] || `${ssqIdx + 1}`;
          ssq.visibleLabel = `(${roman})`;
          ssq.text = sanitizeAIGeneratedNumberingFromStem(ssq.text);
          ssq.id = ssq.id || `${subId}_ssub_${ssqIdx + 1}`;
        });
      }
    });
  }
}

/**
 * Generates an examiner grid dynamically from actual top-level questions existing in the exam.
 */
export function generateExaminerGrid(exam: ExamConfig | GeneratedExam): ExaminerGrid {
  const items: ExaminerGridItem[] = [];
  let totalMarks = 0;

  const sections = (exam as any).sections || [];
  sections.forEach((section: any) => {
    const questions: Question[] = section.questions || [];
    questions.forEach((q) => {
      const qNum = q.number;
      const qMarks = typeof q.marks === 'number' && !isNaN(q.marks) ? q.marks : 0;

      items.push({
        questionNumber: qNum,
        label: `Q${qNum}`,
        maxMarks: qMarks,
      });

      totalMarks += qMarks;
    });
  });

  return {
    items,
    totalQuestions: items.length,
    totalMarks,
  };
}

/**
 * Validates structural integrity across the entire examination model.
 */
export function validateStructuralIntegrity(exam: ExamConfig | GeneratedExam): StructuralValidationIssue[] {
  const issues: StructuralValidationIssue[] = [];
  const questionIds = new Set<string>();
  const visibleNumbers = new Set<string>();
  const resourceIds = new Set<string>();

  // Collect resources across sections
  const sections = (exam as any).sections || [];
  if (sections.length === 0) {
    issues.push({
      code: 'QUESTION_OUTSIDE_SECTION',
      message: 'Examination contains no sections',
    });
  }

  // Legacy top-level passages check for backwards compatibility
  const topPassages = (exam as any).passages || [];
  topPassages.forEach((p: any, idx: number) => {
    const rId = p.id || `passage_${idx + 1}`;
    if (resourceIds.has(rId)) {
      issues.push({
        code: 'DUPLICATE_RESOURCE_ID',
        message: `Duplicate resource ID found: ${rId}`,
        resourceId: rId,
      });
    } else {
      resourceIds.add(rId);
    }
  });

  sections.forEach((sec: any, sIdx: number) => {
    const sId = sec.id || `sec_${sIdx + 1}`;
    const secPassages = sec.passages || [];
    secPassages.forEach((p: any, pIdx: number) => {
      const rId = p.id || `${sId}_passage_${pIdx + 1}`;
      if (resourceIds.has(rId)) {
        issues.push({
          code: 'DUPLICATE_RESOURCE_ID',
          message: `Duplicate resource ID found: ${rId}`,
          resourceId: rId,
          sectionId: sId,
        });
      } else {
        resourceIds.add(rId);
      }
    });

    const questions: Question[] = sec.questions || [];

    questions.forEach((q) => {
      const qId = q.id || `q_${q.number}`;

      // Check Duplicate Question ID
      if (questionIds.has(qId)) {
        issues.push({
          code: 'DUPLICATE_QUESTION_ID',
          message: `Duplicate question ID detected: ${qId}`,
          questionId: qId,
          sectionId: sId,
        });
      } else {
        questionIds.add(qId);
      }

      // Check Duplicate Visible Number
      if (q.visibleNumber) {
        if (visibleNumbers.has(q.visibleNumber)) {
          issues.push({
            code: 'DUPLICATE_VISIBLE_NUMBER',
            message: `Duplicate visible question number detected: ${q.visibleNumber}`,
            questionId: qId,
            sectionId: sId,
          });
        } else {
          visibleNumbers.add(q.visibleNumber);
        }
      }

      // Check Passage/Resource Reference
      if (q.passageRef) {
        if (!resourceIds.has(q.passageRef) && !secPassages.some((p: any) => p.id === q.passageRef) && !topPassages.some((p: any) => p.id === q.passageRef)) {
          issues.push({
            code: 'INVALID_RESOURCE_REF',
            message: `Question ${qId} references missing passage/resource: ${q.passageRef}`,
            questionId: qId,
            resourceId: q.passageRef,
            sectionId: sId,
          });
        }
      }

      // Check Subquestions (Orphans / Parent ID)
      if (Array.isArray(q.subQuestions)) {
        q.subQuestions.forEach((sq) => {
          const sqId = sq.id || `${qId}_sub_${sq.number}`;

          if (questionIds.has(sqId)) {
            issues.push({
              code: 'DUPLICATE_QUESTION_ID',
              message: `Duplicate child question ID detected: ${sqId}`,
              questionId: sqId,
              sectionId: sId,
            });
          } else {
            questionIds.add(sqId);
          }

          if (!sq.parentId || sq.parentId !== qId) {
            issues.push({
              code: 'ORPHAN_CHILD',
              message: `Child question ${sqId} is an orphan or has invalid parentId (expected ${qId}, got ${sq.parentId})`,
              questionId: sqId,
              sectionId: sId,
            });
          }
        });
      }
    });
  });

  return issues;
}

/**
 * Builds the complete canonical examination structure.
 */
export function buildCanonicalExamStructure(exam: ExamConfig | GeneratedExam): CanonicalExamStructure {
  // Apply continuous numbering and subquestion parent-child relationships
  applyCanonicalTopLevelNumbering(exam);

  // Validate structural integrity
  const issues = validateStructuralIntegrity(exam);

  // Generate Examiner Grid
  const examinerGrid = generateExaminerGrid(exam);

  // Extract Resources
  const resources: StructuralResource[] = [];
  ((exam as any).sections || []).forEach((sec: any) => {
    const secPassages = sec.passages || [];
    secPassages.forEach((p: any) => {
      resources.push({
        id: p.id,
        type: 'passage',
        content: p.text,
        associatedQuestionIds: [],
      });
    });
  });

  const canonicalSections: CanonicalExamSection[] = ((exam as any).sections || []).map((sec: any) => ({
    id: sec.id || sec.name || sec.title,
    name: sec.name || sec.title,
    instructions: sec.instructions,
    attemptRule: sec.attemptRule,
    questions: sec.questions || [],
  }));

  return {
    examHeader: (exam as any).header || (exam as any),
    sections: canonicalSections,
    resources,
    examinerGrid,
    issues,
    isValid: issues.length === 0,
  };
}
