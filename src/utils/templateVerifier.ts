import { ExamConfig, GeneratedExam, SectionConfig, Section } from '../types';
import { getBlueprint, NesaBlueprint } from '../data/nesaBlueprints';

export interface SectionComparison {
  index: number;
  actualName: string;
  expectedName?: string;
  actualMarks: number;
  expectedMarks?: number;
  actualQuestions: number;
  expectedQuestions?: number;
  matchesMarks: boolean;
  matchesQuestions: boolean;
}

export interface TemplateVerificationResult {
  hasOfficialTemplate: boolean;
  templateId?: string;
  templateSubject?: string;
  templateLevel?: string;
  isCompliant: boolean;
  complianceScore: number; // 0 to 100
  sectionCountMatch: boolean;
  totalMarksMatch: boolean;
  expectedSectionCount: number;
  actualSectionCount: number;
  expectedTotalMarks: number;
  actualTotalMarks: number;
  sectionComparisons: SectionComparison[];
  discrepancies: string[];
  recommendations: string[];
}

/**
 * Verifies whether the provided exam configuration or generated exam matches
 * the official NESA blueprint for its subject and education level.
 */
export function verifyExamAgainstTemplate(
  examOrConfig: ExamConfig | GeneratedExam,
  customSubject?: string,
  customLevel?: string
): TemplateVerificationResult {
  // Normalize input to common fields
  let subjectName = customSubject || '';
  let level = customLevel || '';
  let totalMarks = 0;
  let sections: Array<{ name: string; marks: number; numberOfQuestions: number }> = [];

  if ('subjectName' in examOrConfig) {
    // ExamConfig
    const cfg = examOrConfig as ExamConfig;
    subjectName = customSubject || cfg.subjectName || '';
    level = customLevel || cfg.level || '';
    totalMarks = Number(cfg.totalMarks) || 0;
    sections = (cfg.sections || []).map(s => ({
      name: s.name,
      marks: Number(s.marks) || 0,
      numberOfQuestions: Number(s.numberOfQuestions) || 0
    }));
  } else if ('header' in examOrConfig) {
    // GeneratedExam
    const exam = examOrConfig as GeneratedExam;
    subjectName = customSubject || exam.header?.subjectName || '';
    level = customLevel || exam.header?.level || '';
    totalMarks = Number(exam.header?.marks) || 0;
    sections = (exam.sections || []).map(s => ({
      name: s.title,
      marks: Number(s.marks) || 0,
      numberOfQuestions: s.questions?.length || 0
    }));
  }

  const blueprint = getBlueprint(subjectName, level);

  if (!blueprint) {
    return {
      hasOfficialTemplate: false,
      isCompliant: true,
      complianceScore: 100,
      sectionCountMatch: true,
      totalMarksMatch: true,
      expectedSectionCount: sections.length,
      actualSectionCount: sections.length,
      expectedTotalMarks: totalMarks,
      actualTotalMarks: totalMarks,
      sectionComparisons: sections.map((s, idx) => ({
        index: idx,
        actualName: s.name,
        actualMarks: s.marks,
        actualQuestions: s.numberOfQuestions,
        matchesMarks: true,
        matchesQuestions: true
      })),
      discrepancies: [],
      recommendations: ['Custom subject format: standard single/multi-section structure active.']
    };
  }

  const expectedSectionCount = blueprint.sections.length;
  const actualSectionCount = sections.length;
  const expectedTotalMarks = blueprint.totalMarks;
  const actualTotalMarks = totalMarks;

  const sectionCountMatch = expectedSectionCount === actualSectionCount;
  const totalMarksMatch = expectedTotalMarks === actualTotalMarks;

  const discrepancies: string[] = [];
  const recommendations: string[] = [];
  let matchingPoints = 0;
  const totalPointsPossible = 4 + blueprint.sections.length * 2; // 2 for count, 2 for total marks, 2 per section (marks + Qs)

  if (sectionCountMatch) {
    matchingPoints += 2;
  } else {
    discrepancies.push(
      `Section count mismatch: Template expects ${expectedSectionCount} sections, but exam has ${actualSectionCount}.`
    );
    recommendations.push(`Adjust exam sections to ${expectedSectionCount} to match official NESA past-paper structure.`);
  }

  if (totalMarksMatch) {
    matchingPoints += 2;
  } else {
    discrepancies.push(
      `Total marks mismatch: Template expects ${expectedTotalMarks} marks, but exam specifies ${actualTotalMarks}.`
    );
    recommendations.push(`Set total exam marks to ${expectedTotalMarks}.`);
  }

  const sectionComparisons: SectionComparison[] = [];

  const maxLen = Math.max(blueprint.sections.length, sections.length);
  for (let i = 0; i < maxLen; i++) {
    const expectedSec = blueprint.sections[i];
    const actualSec = sections[i];

    if (expectedSec && actualSec) {
      const marksMatch = Number(actualSec.marks) === Number(expectedSec.totalMarks);
      const questionsMatch = Math.abs(Number(actualSec.numberOfQuestions) - Number(expectedSec.numberOfQuestions)) <= 2;

      if (marksMatch) matchingPoints += 1;
      else {
        discrepancies.push(
          `Section ${i + 1} ("${actualSec.name}") marks mismatch: Expected ${expectedSec.totalMarks} marks, but got ${actualSec.marks} marks.`
        );
      }

      if (questionsMatch) matchingPoints += 1;
      else {
        discrepancies.push(
          `Section ${i + 1} ("${actualSec.name}") question count deviation: Standard blueprint specifies ${expectedSec.numberOfQuestions} questions, got ${actualSec.numberOfQuestions}.`
        );
      }

      sectionComparisons.push({
        index: i,
        actualName: actualSec.name,
        expectedName: expectedSec.title,
        actualMarks: actualSec.marks,
        expectedMarks: expectedSec.totalMarks,
        actualQuestions: actualSec.numberOfQuestions,
        expectedQuestions: expectedSec.numberOfQuestions,
        matchesMarks: marksMatch,
        matchesQuestions: questionsMatch
      });
    } else if (expectedSec && !actualSec) {
      discrepancies.push(`Missing Section ${i + 1}: Expected "${expectedSec.title}" (${expectedSec.totalMarks} marks).`);
      sectionComparisons.push({
        index: i,
        actualName: `Missing (Expected "${expectedSec.title}")`,
        expectedName: expectedSec.title,
        actualMarks: 0,
        expectedMarks: expectedSec.totalMarks,
        actualQuestions: 0,
        expectedQuestions: expectedSec.numberOfQuestions,
        matchesMarks: false,
        matchesQuestions: false
      });
    } else if (!expectedSec && actualSec) {
      discrepancies.push(`Extra Section ${i + 1}: "${actualSec.name}" is not present in official blueprint.`);
      sectionComparisons.push({
        index: i,
        actualName: actualSec.name,
        actualMarks: actualSec.marks,
        actualQuestions: actualSec.numberOfQuestions,
        matchesMarks: false,
        matchesQuestions: false
      });
    }
  }

  const complianceScore = Math.round((matchingPoints / totalPointsPossible) * 100);
  const isCompliant = complianceScore >= 90 && sectionCountMatch && totalMarksMatch;

  return {
    hasOfficialTemplate: true,
    templateId: blueprint.id,
    templateSubject: blueprint.subject,
    templateLevel: blueprint.level,
    isCompliant,
    complianceScore,
    sectionCountMatch,
    totalMarksMatch,
    expectedSectionCount,
    actualSectionCount,
    expectedTotalMarks,
    actualTotalMarks,
    sectionComparisons,
    discrepancies,
    recommendations
  };
}

/**
 * Re-aligns an ExamConfig to match the exact official NESA blueprint while preserving
 * teacher-authored content like source text, academic year, exam date, etc.
 */
export function realignConfigToOfficialTemplate(config: ExamConfig): ExamConfig {
  const blueprint = getBlueprint(config.subjectName, config.level);
  if (!blueprint) return config;

  const newSections: SectionConfig[] = blueprint.sections.map((bSec) => ({
    id: bSec.id || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: bSec.title,
    marks: bSec.totalMarks,
    numberOfQuestions: bSec.numberOfQuestions,
    questionTypes: bSec.allowedQuestionTypes || [],
    bloomsTaxonomy: bSec.bloomsLevels || ['Knowledge', 'Comprehension'],
    instructions: bSec.instructions || 'Attempt all questions in this section.',
    structuralRules: bSec.structuralRules,
    advanced: config.sections?.find(s => s.name?.toLowerCase().includes(bSec.title.toLowerCase()))?.advanced
  }));

  return {
    ...config,
    totalMarks: blueprint.totalMarks,
    sections: newSections
  };
}
