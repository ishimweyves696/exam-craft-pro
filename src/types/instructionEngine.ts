export type InstructionScope = 'EXAM' | 'SECTION' | 'PARENT' | 'CHILD';

export type InstructionAction =
  | 'REMOVED_REDUNDANT'
  | 'REMOVED_STEM_DUPLICATE'
  | 'REMOVED_SPEC_REFERENCE'
  | 'MOVED_TO_SCOPE'
  | 'CONTRADICTION_FLAGGED'
  | 'FORMATTING_CLEANED'
  | 'RETAINED';

export interface InstructionAuditLog {
  questionId?: string;
  sectionId?: string;
  instructionAction: InstructionAction;
  reason: string;
  originalInstruction?: string;
  finalInstruction?: string;
  scope: InstructionScope;
}

export interface StructuredInstruction {
  rawText: string;
  cleanText: string;
  scope: InstructionScope;
  operation?: string;
  target?: string;
  constraint?: string;
  responseRequirement?: string;
  priority: number; // 4 = EXAM, 3 = SECTION, 2 = PARENT, 1 = CHILD
  source: 'EXAM_HEADER' | 'SECTION_CONFIG' | 'PARENT_LEAD' | 'CHILD_INSTRUCTION' | 'SPEC_REFERENCE';
}

export interface InstructionContradiction {
  higherLevelInstruction: string;
  lowerLevelInstruction: string;
  higherScope: InstructionScope;
  lowerScope: InstructionScope;
  affectedQuestionId?: string;
  affectedSectionId?: string;
  typeOfConflict: 'ATTEMPT_COUNT_MISMATCH' | 'MUTUALLY_EXCLUSIVE_REQUIREMENTS' | 'SOURCE_CONSTRAINT_MISMATCH';
}

export interface InstructionEngineValidationResult {
  isValid: boolean;
  auditLogs: InstructionAuditLog[];
  contradictions: InstructionContradiction[];
  fixes: string[];
}
