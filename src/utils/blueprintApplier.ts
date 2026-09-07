import { ExamConfig, SectionConfig } from '../types';
import { getBlueprint } from '../data/nesaBlueprints';

export function applyBlueprintToConfig(config: ExamConfig, newSubjectName?: string, newLevel?: string): ExamConfig {
  const subject = newSubjectName ?? config.subjectName;
  const level = newLevel ?? config.level;
  
  const blueprint = getBlueprint(subject, level);
  
  if (!blueprint) {
    return {
      ...config,
      subjectName: subject,
      level: level
    };
  }

  // Map blueprint sections to ExamConfig sections
  const sections: SectionConfig[] = blueprint.sections.map((bSec) => ({
    id: bSec.id,
    name: bSec.title,
    marks: bSec.totalMarks,
    numberOfQuestions: bSec.numberOfQuestions,
    questionTypes: bSec.allowedQuestionTypes,
    bloomsTaxonomy: bSec.bloomsLevels,
    instructions: bSec.instructions,
    structuralRules: bSec.structuralRules,
    advanced: config.sections.find(s => s.id === bSec.id)?.advanced
  }));

  return {
    ...config,
    subjectName: subject,
    level: level,
    totalMarks: blueprint.totalMarks,
    sections: sections
  };
}
