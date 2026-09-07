import { ExamConfig, SectionConfig, Question, SubQuestion, SubSubQuestion, GeneratedExam } from '../../types.js';
import {
  InstructionScope,
  InstructionAction,
  InstructionAuditLog,
  InstructionContradiction,
  InstructionEngineValidationResult,
  StructuredInstruction,
} from '../../types/instructionEngine.js';
import { getQuestionSpec } from '../../utils/questionSpecs.js';
import { normalizeLanguage } from '../../utils/languageUtils.js';

/**
 * Imperative verbs and operational command patterns in English, French, and Kinyarwanda.
 */
const IMPERATIVE_VERBS = new Set([
  // English
  'state', 'define', 'explain', 'describe', 'calculate', 'compare', 'identify', 'outline',
  'give', 'determine', 'complete', 'match', 'summarize', 'discuss', 'classify', 'list',
  'write', 'evaluate', 'show', 'analyse', 'analyze', 'illustrate', 'differentiate',
  'distinguish', 'reorder', 'rewrite', 'choose', 'select', 'circle', 'underline', 'solve',
  'find', 'prove', 'label', 'indicate', 'construct', 'draw', 'arrange', 'name', 'mention',
  // French
  'définissez', 'définir', 'expliquez', 'expliquer', 'calculez', 'calculer', 'donnez', 'donner',
  'décrivez', 'décrire', 'comparez', 'comparer', 'démontrez', 'prouver', 'identifiez', 'identifier',
  'nommez', 'nommer', 'résolvez', 'trouver', 'évaluez', 'écrivez', 'répondez', 'complétez',
  'choisissez', 'reliez', 'indiquez', 'réécrivez', 'réorganisez', 'résumez', 'lisez', 'sélectionnez',
  'entourez', 'associez', 'analysez', 'classifiez', 'dressez', 'illustrez',
  // Kinyarwanda
  'sobanura', 'sobanurira', 'ereka', 'erekana', 'bara', 'shaka', 'vuga', 'garagaza', 'tanga',
  'subiza', 'tekereza', 'tonora', 'gereranya', 'tahura', 'andika', 'uzuza', 'hitamo', 'hanisha',
  'hingura', 'panga', 'zinga', 'soma', 'kora', 'egukana', 'emeza', 'shushanya', 'kora', 'pima',
]);

const QUESTION_STEM_PATTERNS = [
  /^(what|which|why|how|when|where|who|whose|whom)\b/i,
  /^(quel|quelle|quels|quelles|pourquoi|comment|où|quand|qui)\b/i,
  /^(ni|iki|kuki|neza|ryari|hehe|nde)\b/i,
  /^(is|are|was|were|can|could|would|should|do|does|did)\b/i,
];

const GENERIC_SUBQ_INSTRUCTIONS = [
  'answer the question below',
  'answer the following question',
  'answer the question',
  'answer all questions below',
  'answer all questions',
  'provide a concise answer to the question',
  'answer the following question briefly',
  'write a comprehensive response answering all parts of the question',
  'read the passage below and answer the questions that follow',
  'read the text and answer the questions that follow',
  'read the following passage carefully and answer the questions that follow',
  'choose and circle the letter that corresponds to the correct answer',
  'choose and circle the letter of the correct answer',
  'choose the correct answer',
  'select the correct answer',
  'select the correct option',
  'choose the correct alternative',
  'state whether each of the following statements is true or false',
  'state whether true or false',
  'indicate whether true or false',
  'répondez à la question ci-dessous',
  'répondez à la question suivante',
  'répondez brièvement à la question suivante',
  'lisez le texte ci-dessous et répondez aux questions',
  'lisez attentivement le texte suivant',
  'choisissez la bonne réponse',
  'subiza iki kibazo mu magambo make',
  'tanga igisubizo kigufi kandi cyumvikana',
  'subiza ibibazo bikurikira',
  'soma iyi nyandiko ukurikize ibyo usabwa',
  'hitamo igisubizo cy\'ukuri',
];

export function isProceduralSectionInstruction(inst?: string): boolean {
  if (!inst) return true;
  const raw = inst.replace(/\*/g, '').trim();
  if (!raw) return true;
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const clean = normalized.replace(/[^a-z0-9]/g, '');
  if (!clean) return true;

  const proceduralPhrases = [
    'attemptall',
    'attemptany',
    'answerall',
    'answerany',
    'answereach',
    'repondezatoutes',
    'repondeza',
    'repondreautout',
    'repondreatoutes',
    'subizaibibazobyose',
    'subizaibibazo',
    'subizabyose',
    'answereachquestion',
    'attemptthree',
    'attempttwo',
    'attemptfour',
    'attemptfive',
    'answertwo',
    'answerthree',
    'answerfour',
    'answerfive',
    'choisissez',
    'hitamobiri',
    'hitamobitatu',
  ];

  if (proceduralPhrases.some((phrase) => clean.includes(phrase))) {
    const stripped = normalized
      .replace(
        /\b(attempt|answer|questions?|in|this|section|all|any|only|marks?|points?|amanota|\d+|one|two|three|four|five|six|seven|eight|nine|ten|choose|choice|elective|compulsory|de|cette|les|des|du|la|le|au|aux|choix|repondez|repondre|toutes|tous|subiza|ibibazo|byose|bya|muri|iki|kuri|gice|gusa|hitamo|unyuzemo|part|parts)\b/g,
        ''
      )
      .replace(/[^a-z]/g, '')
      .trim();
    if (stripped.length < 5) {
      return true;
    }
  }

  return false;
}

/**
 * Strips HTML, Markdown formatting, leading labels ("INSTRUCTION:"), leading numbering ("1.", "a)"), trailing punctuation/colons.
 */
export function cleanInstructionFormatting(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/[\*_]/g, '') // Strip Markdown bold/italics
    .replace(/^(?:instruction[s]?|note|nb|amabwiriza)[:\s]*/i, '') // Strip label headers
    .replace(/^(?:\d+[\.\)]\s*|[a-z][\.\)]\s*|\([a-z0-9]+\)\s*)/i, '') // Strip leading numbers/bullets
    .replace(/\s+/g, ' ')
    .replace(/[:\s]+$/, '')
    .trim();
}

/**
 * Checks if a question stem already contains an imperative verb or operational command.
 */
export function detectStemImperative(stemText?: string): { hasImperative: boolean; verb?: string; isSelfContained: boolean } {
  if (!stemText) return { hasImperative: false, isSelfContained: false };
  const clean = cleanInstructionFormatting(stemText).toLowerCase();
  const words = clean.split(/\s+/);
  if (words.length === 0) return { hasImperative: false, isSelfContained: false };

  const firstWord = words[0].replace(/[^a-z]/g, '');
  const secondWord = words.length > 1 ? words[1].replace(/[^a-z]/g, '') : '';

  let hasVerb = IMPERATIVE_VERBS.has(firstWord) || (words.length > 1 && IMPERATIVE_VERBS.has(secondWord));
  let matchedVerb = IMPERATIVE_VERBS.has(firstWord) ? firstWord : IMPERATIVE_VERBS.has(secondWord) ? secondWord : undefined;

  let isQuestionWord = QUESTION_STEM_PATTERNS.some((pattern) => pattern.test(clean));

  const isSelfContained = hasVerb || isQuestionWord;

  return {
    hasImperative: hasVerb,
    verb: matchedVerb,
    isSelfContained,
  };
}

/**
 * Detects whether an instruction contains a specialized candidate constraint that MUST be preserved.
 * Examples: "show all working", "in one sentence", "in not more than 100 words", "using the formula", "with the aid of a diagram".
 */
export function isMeaningfulConstraint(text?: string): boolean {
  if (!text) return false;
  const norm = text.toLowerCase();

  const constraintPatterns = [
    /show all (your )?working/i,
    /montrez tous vos calculs/i,
    /erekana intambwe zose/i,
    /in (one|two|three|\d+) sentence(s)?/i,
    /en une phrase/i,
    /in not more than \d+ words/i,
    /en \d+ mots ou moins/i,
    /in \d+ words or less/i,
    /using (the|a) (formula|diagram|table|passage|map|graph)/i,
    /en utilisant/i,
    /with the aid of/i,
    /from your own knowledge/i,
    /without using a calculator/i,
    /sans utiliser/i,
    /in (descending|ascending) order/i,
    /step by step/i,
  ];

  return constraintPatterns.some((pattern) => pattern.test(norm));
}

/**
 * Normalizes instruction text for semantic comparison.
 */
function normalizeForSemanticCompare(text?: string): string {
  if (!text) return '';
  return cleanInstructionFormatting(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\b(the|a|an|following|below|questions?|in|this|section|of|all|each|please)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two instructions are semantically equivalent or redundant.
 */
export function areInstructionsSemanticallyEquivalent(instA?: string, instB?: string): boolean {
  if (!instA || !instB) return false;
  const normA = normalizeForSemanticCompare(instA);
  const normB = normalizeForSemanticCompare(instB);

  if (normA === '' || normB === '') return false;
  if (normA === normB) return true;

  // Check substring inclusion if both are non-trivial
  if (normA.length >= 8 && normB.length >= 8) {
    if (normA.includes(normB) || normB.includes(normA)) return true;
  }

  return false;
}

/**
 * Checks if an instruction is a generic subquestion filler (e.g. "Answer the question below").
 */
export function isGenericSubQuestionInstruction(inst?: string): boolean {
  if (!inst) return false;
  const clean = cleanInstructionFormatting(inst).toLowerCase();
  return GENERIC_SUBQ_INSTRUCTIONS.some((g) => clean.includes(g) || g.includes(clean));
}

/**
 * Analyzes the entire exam for contradictory instructions across scopes.
 */
export function detectContradictionsInExamInstructions(exam: ExamConfig | GeneratedExam | any): InstructionContradiction[] {
  const contradictions: InstructionContradiction[] = [];

  // 1. Check Section vs Exam Contradictions
  exam.sections?.forEach((section, sIdx) => {
    const sId = section.id || `section_${sIdx + 1}`;
    const secInst = cleanInstructionFormatting(section.instructions);

    // Section attempt rule vs Section instruction conflict
    if ((section as any).attemptRule) {
      const mode = (section as any).attemptRule.mode;
      const chooseCount = (section as any).attemptRule.chooseCount;

      if (mode === 'choose' && chooseCount) {
        if (/attempt all|answer all|répondez à toutes|subiza ibyo/i.test(secInst)) {
          contradictions.push({
            higherLevelInstruction: `Section attemptRule: Choose ${chooseCount}`,
            lowerLevelInstruction: secInst,
            higherScope: 'SECTION',
            lowerScope: 'SECTION',
            affectedSectionId: sId,
            typeOfConflict: 'ATTEMPT_COUNT_MISMATCH',
          });
        }
      } else if (mode === 'all') {
        if (/answer (?:only\s+)?(?:one|two|three|four|\d+)|choose (?:only\s+)?(?:one|two|three|four|\d+)|répondez à (?:une|deux|trois)/i.test(secInst)) {
          contradictions.push({
            higherLevelInstruction: `Section attemptRule: Attempt ALL`,
            lowerLevelInstruction: secInst,
            higherScope: 'SECTION',
            lowerScope: 'SECTION',
            affectedSectionId: sId,
            typeOfConflict: 'ATTEMPT_COUNT_MISMATCH',
          });
        }
      }
    }

    // 2. Check Question vs Section Contradictions
    section.questions?.forEach((q, qIdx) => {
      const qId = q.id || `q_${q.number || qIdx + 1}`;
      const qInst = cleanInstructionFormatting(q.instruction || q.leadInstruction);

      if (secInst && qInst) {
        // Example: Section requires "Answer THREE questions", Question says "Answer ALL questions"
        const secRequiresChoice = /answer (any|three|two|four|\d+)|choisissez/i.test(secInst);
        const qRequiresAll = /answer all|attempt all|répondez à toutes/i.test(qInst);

        if (secRequiresChoice && qRequiresAll) {
          contradictions.push({
            higherLevelInstruction: secInst,
            lowerLevelInstruction: qInst,
            higherScope: 'SECTION',
            lowerScope: 'PARENT',
            affectedQuestionId: qId,
            affectedSectionId: sId,
            typeOfConflict: 'ATTEMPT_COUNT_MISMATCH',
          });
        }

        // Example: Passage source constraint mismatch ("using the passage" vs "from your own knowledge")
        const secPassage = /using (the )?passage/i.test(secInst);
        const qOwnKnowledge = /from your own knowledge/i.test(qInst);
        if (secPassage && qOwnKnowledge) {
          contradictions.push({
            higherLevelInstruction: secInst,
            lowerLevelInstruction: qInst,
            higherScope: 'SECTION',
            lowerScope: 'PARENT',
            affectedQuestionId: qId,
            affectedSectionId: sId,
            typeOfConflict: 'SOURCE_CONSTRAINT_MISMATCH',
          });
        }
      }

      // 3. Check Parent vs Child Contradictions
      if (q.subQuestions && q.subQuestions.length > 0) {
        const parentInst = qInst;
        q.subQuestions.forEach((sq, sqIdx) => {
          const sqId = sq.id || `${qId}_sub_${sq.number || sqIdx + 1}`;
          const childInst = cleanInstructionFormatting(sq.instruction || sq.leadInstruction);

          if (parentInst && childInst) {
            const parentAll = /answer all|attempt all/i.test(parentInst);
            const childChoice = /answer (any|two|one|\d+)/i.test(childInst);

            if (parentAll && childChoice) {
              contradictions.push({
                higherLevelInstruction: parentInst,
                lowerLevelInstruction: childInst,
                higherScope: 'PARENT',
                lowerScope: 'CHILD',
                affectedQuestionId: sqId,
                affectedSectionId: sId,
                typeOfConflict: 'ATTEMPT_COUNT_MISMATCH',
              });
            }
          }
        });
      }
    });
  });

  return contradictions;
}

/**
 * Main Feature 2 Processing and Deduplication Engine.
 * Processes instructions hierarchically across EXAM -> SECTION -> PARENT -> CHILD.
 */
export function processAndDeduplicateExamInstructions(exam: ExamConfig | GeneratedExam | any): InstructionEngineValidationResult {
  const auditLogs: InstructionAuditLog[] = [];
  const fixes: string[] = [];

  // Step 1: Detect Contradictions
  const contradictions = detectContradictionsInExamInstructions(exam);
  if (contradictions.length > 0) {
    contradictions.forEach((c) => {
      auditLogs.push({
        questionId: c.affectedQuestionId,
        sectionId: c.affectedSectionId,
        instructionAction: 'CONTRADICTION_FLAGGED',
        reason: `Contradiction between ${c.higherScope} ("${c.higherLevelInstruction}") and ${c.lowerScope} ("${c.lowerLevelInstruction}") [${c.typeOfConflict}]`,
        originalInstruction: c.lowerLevelInstruction,
        scope: c.lowerScope,
      });
      fixes.push(`Flagged instruction contradiction: ${c.typeOfConflict} on ${c.affectedQuestionId || c.affectedSectionId}`);
    });
  }

  // Step 2: Clean, Deduplicate, and Remove Subject Metadata / Contradictions from Exam-Level Instructions
  const targetLang = normalizeLanguage(exam.language || exam.header?.language || 'en');
  const subjectUpper = (exam.header?.subjectName || '').toUpperCase();

  if (exam.instructions && Array.isArray(exam.instructions)) {
    const cleanedExamInsts: string[] = [];
    exam.instructions.forEach((inst, idx) => {
      if (!inst) return;
      const cleaned = cleanInstructionFormatting(inst);
      if (!cleaned) return;

      // A. Remove Subject Name / Metadata Duplication from instructions list
      const upperInst = cleaned.toUpperCase();
      if (
        (subjectUpper && upperInst.includes(`SUBJECT: ${subjectUpper}`)) ||
        (subjectUpper && upperInst === subjectUpper) ||
        upperInst.startsWith('DURATION:') ||
        upperInst.startsWith('MARKS:') ||
        upperInst.startsWith('CODE:') ||
        upperInst.startsWith('ACADEMIC YEAR:')
      ) {
        auditLogs.push({
          instructionAction: 'REMOVED_REDUNDANT',
          reason: 'Removed redundant subject/metadata header string from instructions list',
          originalInstruction: inst,
          scope: 'EXAM',
        });
        fixes.push(`Removed redundant subject metadata string "${cleaned}" from exam instructions`);
        return;
      }

      // B. Remove Contradictory Language Instructions (e.g. French/Kinyarwanda on an English exam)
      if (targetLang === 'en' && (/\b(répondez|choisissez|lisez|attentivement|subiza|hitamo|ibibazo)\b/i.test(cleaned))) {
        auditLogs.push({
          instructionAction: 'REMOVED_REDUNDANT',
          reason: 'Removed non-English instruction on English paper',
          originalInstruction: inst,
          scope: 'EXAM',
        });
        fixes.push(`Removed language-contradictory instruction "${cleaned}" from English exam`);
        return;
      } else if (targetLang === 'fr' && (/\b(answer|choose|read the passage|carefully|attempt all)\b/i.test(cleaned))) {
        auditLogs.push({
          instructionAction: 'REMOVED_REDUNDANT',
          reason: 'Removed non-French instruction on French paper',
          originalInstruction: inst,
          scope: 'EXAM',
        });
        fixes.push(`Removed language-contradictory instruction "${cleaned}" from French exam`);
        return;
      }

      if (!cleanedExamInsts.some((existing) => areInstructionsSemanticallyEquivalent(existing, cleaned))) {
        cleanedExamInsts.push(cleaned);
      } else {
        auditLogs.push({
          instructionAction: 'REMOVED_REDUNDANT',
          reason: 'Removed duplicate exam-level instruction',
          originalInstruction: inst,
          scope: 'EXAM',
        });
      }
    });
    exam.instructions = cleanedExamInsts;
  }

  // Step 3: Process Sections
  exam.sections?.forEach((section, sIdx) => {
    const sId = section.id || `section_${sIdx + 1}`;

    // Clean Section Instruction
    if (section.instructions) {
      const origSecInst = section.instructions;
      const cleanedSecInst = cleanInstructionFormatting(section.instructions);

      // Check if Section instruction duplicates an Exam instruction
      const isExamDup = exam.instructions?.some((eInst) => areInstructionsSemanticallyEquivalent(eInst, cleanedSecInst));

      if (isExamDup) {
        auditLogs.push({
          sectionId: sId,
          instructionAction: 'REMOVED_REDUNDANT',
          reason: 'Section instruction duplicates Exam-level instruction',
          originalInstruction: origSecInst,
          scope: 'SECTION',
        });
        section.instructions = '';
        fixes.push(`Removed redundant section instruction in ${section.name}`);
      } else if (cleanedSecInst !== origSecInst) {
        auditLogs.push({
          sectionId: sId,
          instructionAction: 'FORMATTING_CLEANED',
          reason: 'Cleaned section instruction visual formatting',
          originalInstruction: origSecInst,
          finalInstruction: cleanedSecInst,
          scope: 'SECTION',
        });
        section.instructions = cleanedSecInst;
      }
    }

    const activeSecInst = section.instructions;

    // Process Questions within Section
    section.questions?.forEach((q, qIdx) => {
      const qId = q.id || `q_${q.number || qIdx + 1}`;
      const lang = exam.language || 'en';

      // Clean Question Instruction & Lead Instruction
      if (q.instruction) {
        let cleaned = cleanInstructionFormatting(q.instruction);
        // Language contradiction check
        if (targetLang === 'en' && /\b(répondez|choisissez|lisez|attentivement|subiza|hitamo|ibibazo)\b/i.test(cleaned)) {
          fixes.push(`Removed French/Kinyarwanda instruction "${cleaned}" from English Q${q.number}`);
          q.instruction = undefined;
          cleaned = '';
        } else if (targetLang === 'fr' && /\b(answer all|choose|read the passage|carefully)\b/i.test(cleaned)) {
          fixes.push(`Removed English instruction "${cleaned}" from French Q${q.number}`);
          q.instruction = undefined;
          cleaned = '';
        }
        if (cleaned && cleaned !== q.instruction) {
          auditLogs.push({
            questionId: qId,
            instructionAction: 'FORMATTING_CLEANED',
            reason: 'Cleaned question instruction visual formatting',
            originalInstruction: q.instruction,
            finalInstruction: cleaned,
            scope: 'PARENT',
          });
          q.instruction = cleaned;
        }
      }

      if (q.leadInstruction) {
        let cleaned = cleanInstructionFormatting(q.leadInstruction);
        // Language contradiction check
        if (targetLang === 'en' && /\b(répondez|choisissez|lisez|attentivement|subiza|hitamo|ibibazo)\b/i.test(cleaned)) {
          fixes.push(`Removed French/Kinyarwanda leadInstruction from English Q${q.number}`);
          q.leadInstruction = undefined;
          cleaned = '';
        } else if (targetLang === 'fr' && /\b(answer all|choose|read the passage|carefully)\b/i.test(cleaned)) {
          fixes.push(`Removed English leadInstruction from French Q${q.number}`);
          q.leadInstruction = undefined;
          cleaned = '';
        }
        if (cleaned && cleaned !== q.leadInstruction) {
          auditLogs.push({
            questionId: qId,
            instructionAction: 'FORMATTING_CLEANED',
            reason: 'Cleaned question leadInstruction visual formatting',
            originalInstruction: q.leadInstruction,
            finalInstruction: cleaned,
            scope: 'PARENT',
          });
          q.leadInstruction = cleaned;
        }
      }

      // Check Stem Imperative Verb
      const stemAnalysis = detectStemImperative(q.text);
      const spec = getQuestionSpec(q.type);

      // Check if question instruction is redundant with section instruction
      if (q.instruction && activeSecInst && areInstructionsSemanticallyEquivalent(q.instruction, activeSecInst)) {
        auditLogs.push({
          questionId: qId,
          instructionAction: 'REMOVED_REDUNDANT',
          reason: 'Question instruction duplicates section instruction',
          originalInstruction: q.instruction,
          scope: 'PARENT',
        });
        fixes.push(`Removed section-duplicate instruction from Q${q.number}`);
        q.instruction = undefined;
      }

      // Check if question instruction is redundant with question stem command
      if (q.instruction && stemAnalysis.isSelfContained) {
        const hasConstraint = isMeaningfulConstraint(q.instruction);
        if (!hasConstraint) {
          // If the instruction merely repeats the stem or provides no new constraint -> REMOVE
          auditLogs.push({
            questionId: qId,
            instructionAction: 'REMOVED_STEM_DUPLICATE',
            reason: `Question stem '${q.text.slice(0, 30)}...' already contains operational command. Instruction adds no new constraints.`,
            originalInstruction: q.instruction,
            scope: 'PARENT',
          });
          fixes.push(`Removed stem-duplicate instruction from Q${q.number}`);
          q.instruction = undefined;
        }
      }

      // Check if question instruction is a Spec Reference microInstruction that is unnecessary
      if (q.instruction && spec.microInstructions) {
        // quarantined pending verified Kinyarwanda source paper per AGENTS.md: 'rw' removed from cast
        const refMicro = spec.microInstructions[normalizeLanguage(lang) as 'en' | 'fr'] || spec.microInstructions.en;
        if (areInstructionsSemanticallyEquivalent(q.instruction, refMicro) && stemAnalysis.isSelfContained) {
          auditLogs.push({
            questionId: qId,
            instructionAction: 'REMOVED_SPEC_REFERENCE',
            reason: 'Spec reference instruction suppressed because question stem is self-contained',
            originalInstruction: q.instruction,
            scope: 'PARENT',
          });
          fixes.push(`Suppressed spec reference instruction from Q${q.number}`);
          q.instruction = undefined;
        }
      }

      // Process Passage / Case Study Parent Containers
      if (spec.hierarchy.isParentContainer || spec.hierarchy.requiresPassageRef) {
        if (!q.leadInstruction && q.instruction && isGenericSubQuestionInstruction(q.instruction)) {
          // Move generic instruction to leadInstruction for passage group
          q.leadInstruction = q.instruction;
          q.instruction = undefined;
          auditLogs.push({
            questionId: qId,
            instructionAction: 'MOVED_TO_SCOPE',
            reason: 'Promoted passage container instruction to leadInstruction',
            scope: 'PARENT',
          });
        }
      }

      // Process Sub-Questions (CHILD scope)
      if (q.subQuestions && Array.isArray(q.subQuestions)) {
        const parentSharedInst = q.leadInstruction || q.instruction || activeSecInst;

        q.subQuestions.forEach((sq, sqIdx) => {
          const sqId = sq.id || `${qId}_sub_${sq.number || sqIdx + 1}`;

          // Clean child instruction formatting
          if (sq.instruction) {
            const cleaned = cleanInstructionFormatting(sq.instruction);
            if (cleaned !== sq.instruction) {
              sq.instruction = cleaned;
            }
          }

          const childAnalysis = detectStemImperative(sq.text);

          if (sq.instruction) {
            const hasConstraint = isMeaningfulConstraint(sq.instruction);

            // Check if child instruction duplicates parent instruction
            const isParentDup = parentSharedInst && areInstructionsSemanticallyEquivalent(sq.instruction, parentSharedInst);
            const isGenericFiller = isGenericSubQuestionInstruction(sq.instruction);

            if (isParentDup || (isGenericFiller && parentSharedInst)) {
              if (!hasConstraint) {
                auditLogs.push({
                  questionId: sqId,
                  instructionAction: 'REMOVED_REDUNDANT',
                  reason: 'Child instruction duplicates shared parent instruction',
                  originalInstruction: sq.instruction,
                  scope: 'CHILD',
                });
                fixes.push(`Removed redundant child instruction from Q${q.number}.${sq.number}`);
                sq.instruction = undefined;
              } else {
                auditLogs.push({
                  questionId: sqId,
                  instructionAction: 'RETAINED',
                  reason: 'Retained child instruction because it contains a specialized response constraint',
                  originalInstruction: sq.instruction,
                  scope: 'CHILD',
                });
              }
            } else if (childAnalysis.isSelfContained && !hasConstraint) {
              // Child stem already has operational verb, instruction has no new constraint -> REMOVE
              auditLogs.push({
                questionId: sqId,
                instructionAction: 'REMOVED_STEM_DUPLICATE',
                reason: 'Child stem contains operational command and instruction adds no new constraints',
                originalInstruction: sq.instruction,
                scope: 'CHILD',
              });
              fixes.push(`Removed stem-duplicate instruction from child Q${q.number}.${sq.number}`);
              sq.instruction = undefined;
            } else {
              auditLogs.push({
                questionId: sqId,
                instructionAction: 'RETAINED',
                reason: 'Retained specialized child instruction',
                finalInstruction: sq.instruction,
                scope: 'CHILD',
              });
            }
          }
        });
      }
    });
  });

  return {
    isValid: contradictions.length === 0,
    auditLogs,
    contradictions,
    fixes,
  };
}
