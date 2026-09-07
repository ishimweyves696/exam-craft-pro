import { Question, SubQuestion, SubSubQuestion } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import { sanitizeQuestionByContract, OPTION_PREFIX_REGEX } from '../../types/questionContracts.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export type ComprehensionSubjectProfile =
  | 'LANGUAGE_COMPREHENSION'
  | 'SUBJECT_COMPREHENSION'
  | 'GENERAL_STUDIES_COMPREHENSION';

export interface ComprehensionValidationIssue {
  field: string;
  code:
    | 'PASSAGE_MISSING'
    | 'PASSAGE_TOO_SHORT'
    | 'REQUIRED_MISSING'
    | 'INVALID_STRUCTURE'
    | 'INSTRUCTION_REDUNDANT'
    | 'INSTRUCTION_CONTRADICTORY'
    | 'INSTRUCTION_MERGED_IN_PASSAGE'
    | 'RANDOM_BOLD_ARTIFACT'
    | 'BULLET_POINT_PASSAGE'
    | 'CHILD_INVALID_TYPE'
    | 'PARENT_MARKS_MISMATCH'
    | 'AUTO_TITLE_LEAK';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface ComprehensionValidationResult {
  isValid: boolean;
  profile: ComprehensionSubjectProfile;
  issues: ComprehensionValidationIssue[];
}

export interface ComprehensionSanitizationResult {
  sanitized: Question;
  profile: ComprehensionSubjectProfile;
  repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

export const VALID_LANGUAGE_COMP_CHILD_TYPES = [
  'short',
  'short_answer',
  'mcq',
  'true_false',
  'fill_blank',
  'transformation',
  'summary',
  'essay',
  'vocabulary',
  'reorder',
];

export const VALID_GENERAL_STUDIES_CHILD_TYPES = [
  'short',
  'short_answer',
  'essay',
  'summary',
  'mcq',
  'true_false',
  'table',
  'matching',
];

export const VALID_SUBJECT_COMP_CHILD_TYPES = [
  'short',
  'short_answer',
  'calculation',
  'mcq',
  'true_false',
  'table',
  'matching',
  'essay',
  'diagram_labeling',
  'summary',
  'fill_blank',
];

const BOILERPLATE_TITLE_REGEX = /^(?:case\s*study|business\s*scenario|scenario\s*analysis|reading\s*(?:passage|comprehension|comprehension\s*passage)|comprehension\s*(?:passage|text)?|comprehension|text\s*for\s*comprehension|context\s*(?:&|and)\s*data|read\s*the\s*following\s*(?:case|passage|scenario)|scenario)$/i;

/**
 * Helper to count words in a string.
 */
export function countWords(str?: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Determines the Comprehension Subject Profile based on subject, level, and section information.
 */
export function determineComprehensionProfile(
  subjectName?: string,
  level?: string,
  sectionName?: string
): ComprehensionSubjectProfile {
  const s = (subjectName || '').toLowerCase().trim();
  const sec = (sectionName || '').toLowerCase().trim();

  // 1. General Studies / General Paper
  if (
    s.includes('general studies') ||
    s.includes('general paper') ||
    s.includes('gscs') ||
    s.includes('citizenship') ||
    sec.includes('general studies')
  ) {
    return 'GENERAL_STUDIES_COMPREHENSION';
  }

  // 2. Language Subjects (English, French, Kinyarwanda, Kiswahili, Literature, etc.)
  if (
    s.includes('english') ||
    s.includes('anglais') ||
    s.includes('french') ||
    s.includes('français') ||
    s.includes('francais') ||
    s.includes('kinyarwanda') ||
    s.includes('ikinyarwanda') ||
    s.includes('kiswahili') ||
    s.includes('swahili') ||
    s.includes('literature') ||
    s.includes('littérature') ||
    s.includes('litterature') ||
    s.includes('language')
  ) {
    return 'LANGUAGE_COMPREHENSION';
  }

  // 3. Other Subjects (Biology, Chemistry, Physics, Geography, History, Economics, Entrepreneurship, etc.)
  return 'SUBJECT_COMPREHENSION';
}

/**
 * Returns pedagogical skills and objectives for the given comprehension profile.
 */
export function getSubjectProfileSkills(profile: ComprehensionSubjectProfile): string[] {
  switch (profile) {
    case 'LANGUAGE_COMPREHENSION':
      return [
        'Main idea and key themes identification',
        'Specific factual details extraction',
        'Contextual vocabulary and phrase interpretation',
        'Inferential and deductive reasoning',
        'Pronoun and reference analysis',
        'Author tone, attitude, and communicative purpose',
        'Paraphrase and summary formulation',
      ];
    case 'GENERAL_STUDIES_COMPREHENSION':
      return [
        'Multi-disciplinary source evaluation',
        'Critical analysis of contemporary arguments',
        'Socio-economic and ethical perspective synthesis',
        'Structured essay and argument formulation',
        'Core point summarization',
      ];
    case 'SUBJECT_COMPREHENSION':
      return [
        'Data and scenario interpretation',
        'Scientific or empirical phenomenon explanation',
        'Concept application to real-world context',
        'Quantitative deduction and calculation',
        'Subject-specific curriculum knowledge integration',
      ];
  }
}

/**
 * Checks if a question is a comprehension, passage, or reading question.
 */
export function isComprehensionType(q: Question | SubQuestion | SubSubQuestion): boolean {
  const type = (q.type || '').toLowerCase();
  if (type === 'passage' || type === 'comprehension' || type === 'reading_comprehension') {
    return true;
  }
  if ((q as Question).subQuestions && (q as Question).subQuestions!.length > 0 && q.text) {
    const text = q.text.trim();
    if (
      text.includes('\n\n') ||
      /^Read the (passage|text|following|situation|article)/i.test(text) ||
      /^Lisez le (texte|passage|document)/i.test(text) ||
      /^Soma (iki|iyi) (gitekerezo|nyandiko)/i.test(text) ||
      (text.length > 200 && !/^Discuss/i.test(text) && !/^Explain/i.test(text) && !/^Evaluate/i.test(text) && !/^Analyse/i.test(text))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Cleans formatting artifacts from passage text:
 * - Strips random inline bold words (e.g. `The **agriculture** in **Rwanda**` -> `The agriculture in Rwanda`)
 * - Strips HTML tags and Markdown code fences
 * - Normalizes paragraph spacing
 * - Removes unrequested numbering at the start of paragraphs if it's not a list
 */
export function cleanPassageFormatting(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText
    // Remove markdown code fences
    .replace(/```[a-z]*\n?/gi, '')
    // Remove HTML tags
    .replace(/<\/?(?:p|div|span|strong|em|b|i|h[1-6]|br)\b[^>]*>/gi, '')
    // Remove leading/trailing quotes wrapping the entire text
    .replace(/^["']|["']$/g, '');

  // Split into paragraphs
  const paragraphs = cleaned.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);

  const cleanedParagraphs = paragraphs.map((para) => {
    // Strategy: Find and fix "AI Slop" bolding.
    // If a paragraph contains multiple bold segments that aren't the whole paragraph, strip them.
    // e.g. "The **capital** of **Rwanda** is **Kigali**." -> "The capital of Rwanda is Kigali."
    const boldSegments = para.match(/\*\*([^*]+)\*\*/g);
    if (boldSegments && boldSegments.length >= 2 && para.length > 50) {
      // Check if it's a list item (starts with bold and ends with bold but is short)
      const isListItem = para.length < 100 && para.startsWith('**') && para.endsWith('**');
      if (!isListItem) {
        para = para.replace(/\*\*([^*]+)\*\*/g, '$1');
      }
    }
    
    // Also remove bolding if it's just one or two words in a long sentence
    para = para.replace(/(?<=\s|^)\*\*([^*]{1,20})\*\*(?=\s|[.,!?;:]|$)/g, '$1');

    return para;
  });

  return cleanedParagraphs.join('\n\n');
}

/**
 * Extracts a potential title from the start of a passage.
 */
export function extractPassageTitle(text: string): { title?: string; remainingText: string } {
  const paragraphs = text.split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) return { remainingText: text };

  const firstPara = paragraphs[0];
  
  // Title detection heuristics:
  // 1. All caps and relatively short
  // 2. Wrapped in double asterisks and short
  // 3. One of the boilerplate titles (handled by regex already, but good to double check)
  
  const isAllCaps = /^[A-Z\s0-9.,'"&!-]{10,100}$/.test(firstPara.replace(/\*/g, ''));
  const isWrappedBold = firstPara.startsWith('**') && firstPara.endsWith('**') && firstPara.length < 100;
  const isShortHeading = firstPara.length < 80 && !firstPara.includes('.') && !firstPara.includes('?');

  if (isAllCaps || isWrappedBold || isShortHeading) {
    const title = firstPara.replace(/\*\*/g, '').trim();
    paragraphs.shift();
    return { title, remainingText: paragraphs.join('\n\n') };
  }

  return { remainingText: text };
}

/**
 * Validates a Comprehension / Passage question against the NESA Comprehension Contract.
 */
export function validateComprehensionQuestionContract(
  q: Question,
  context?: { subjectName?: string; level?: string; sectionName?: string; parentQuestion?: Question }
): ComprehensionValidationResult {
  const issues: ComprehensionValidationIssue[] = [];

  const profile = (q as any).subjectProfile || determineComprehensionProfile(context?.subjectName, context?.level, context?.sectionName);

  // 1. Passage / Resource Presence & Length Validation
  const passageText = (q as any).passageText || (q as any).passage || (q as any).context || '';
  const textContent = passageText ? `${passageText} ${q.text || ''}` : (q.text || '');
  const wordCount = countWords(textContent);

  if (!textContent || wordCount < 10) {
    issues.push({
      field: 'text',
      code: 'PASSAGE_MISSING',
      message: `Comprehension (${profile}) requires a substantive passage or resource text.`,
      severity: 'Critical',
      autoFixable: false,
    });
  } else {
    // Profile-specific length thresholds
    if (profile === 'LANGUAGE_COMPREHENSION') {
      // Language comprehension requires substantial continuous prose (Minimum 100 words, Target: 500-700 words)
      if (wordCount < 100) {
        issues.push({
          field: 'text',
          code: 'PASSAGE_TOO_SHORT',
          message: `Language comprehension passage is too short (${wordCount} words). A genuine language reading text requires substantial continuous prose (Minimum 100 words, Target: 500-700 words) to support rigorous analytical assessment.`,
          severity: 'High',
          autoFixable: false,
        });
      }
    } else {
      // SUBJECT_COMPREHENSION and GENERAL_STUDIES_COMPREHENSION
      if (wordCount < 30) {
        issues.push({
          field: 'text',
          code: 'PASSAGE_TOO_SHORT',
          message: `Subject comprehension stimulus/context is too brief (${wordCount} words). A minimum of 30 words is required.`,
          severity: 'High',
          autoFixable: false,
        });
      }
    }
  }

  // 2. Continuous Prose & Quality Checks (for Language Comprehension)
  if (profile === 'LANGUAGE_COMPREHENSION' && textContent) {
    // Check if passage is formatted as numbered/bulleted points instead of continuous paragraphs
    const lines = textContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const bulletLines = lines.filter((l) => /^(\d+[\.\)]|\-|\*|Point\s*\d+[:\.])\s+/i.test(l));
    if (bulletLines.length >= 3 && bulletLines.length >= lines.length * 0.5) {
      issues.push({
        field: 'text',
        code: 'BULLET_POINT_PASSAGE',
        message: 'Language comprehension passage must be continuous prose paragraphs, not a bulleted/numbered list.',
        severity: 'Medium',
        autoFixable: true,
      });
    }

    // Check for random bold artifacts in body text
    const midTextBoldMatches = textContent.match(/[a-zA-Z0-9,]\s+\*\*[^*]+\*\*\s+[a-zA-Z0-9]/g);
    if (midTextBoldMatches && midTextBoldMatches.length >= 2) {
      issues.push({
        field: 'text',
        code: 'RANDOM_BOLD_ARTIFACT',
        message: 'Passage contains random bold words scattered through body sentences.',
        severity: 'Low',
        autoFixable: true,
      });
    }
  }

  // 3. Merged Instruction Detection
  if (q.text && !q.instruction) {
    const firstLine = q.text.split(/\r?\n/)[0]?.trim() || '';
    if (
      /^Read the (passage|text|following|article)/i.test(firstLine) ||
      /^Lisez le (texte|passage|document)/i.test(firstLine) ||
      /^Soma (iki|iyi) (gitekerezo|nyandiko)/i.test(firstLine)
    ) {
      issues.push({
        field: 'instruction',
        code: 'INSTRUCTION_MERGED_IN_PASSAGE',
        message: 'Operational reading instruction is embedded in the passage body instead of being a separate instruction field.',
        severity: 'Medium',
        autoFixable: true,
      });
    }
  }

  // 4. Hierarchy & Sub-questions Validation
  const subQs = q.subQuestions || [];
  if (subQs.length === 0) {
    issues.push({
      field: 'subQuestions',
      code: 'REQUIRED_MISSING',
      message: `Comprehension question (${profile}) must contain sub-questions based on the resource.`,
      severity: 'Critical',
      autoFixable: true,
    });
  } else {
    // Check permitted child types based on profile
    const permittedTypes =
      profile === 'LANGUAGE_COMPREHENSION'
        ? VALID_LANGUAGE_COMP_CHILD_TYPES
        : profile === 'GENERAL_STUDIES_COMPREHENSION'
        ? VALID_GENERAL_STUDIES_CHILD_TYPES
        : VALID_SUBJECT_COMP_CHILD_TYPES;

    let childMarksSum = 0;

    subQs.forEach((subQ, idx) => {
      childMarksSum += subQ.marks || 0;

      if (!subQ.text || subQ.text.trim() === '') {
        issues.push({
          field: `subQuestions[${idx}].text`,
          code: 'REQUIRED_MISSING',
          message: `Comprehension sub-question ${idx + 1} is missing a question stem.`,
          severity: 'Critical',
          autoFixable: false,
        });
      }

      const childType = (subQ.type || 'short').toLowerCase();
      if (!permittedTypes.includes(childType)) {
        issues.push({
          field: `subQuestions[${idx}].type`,
          code: 'CHILD_INVALID_TYPE',
          message: `Child question type '${childType}' is not permitted for ${profile}.`,
          severity: 'Medium',
          autoFixable: true,
        });
      }

      // Answer space check for leaf sub-question
      const hasSubSub = subQ.subQuestions && subQ.subQuestions.length > 0;
      if (!hasSubSub && childType !== 'mcq' && childType !== 'true_false') {
        if (!subQ.answerSpace || subQ.answerSpace === 'none') {
          issues.push({
            field: `subQuestions[${idx}].answerSpace`,
            code: 'REQUIRED_MISSING',
            message: `Comprehension sub-question ${idx + 1} requires an explicit answer space ('small', 'medium', 'large', or 'xlarge').`,
            severity: 'Medium',
            autoFixable: true,
          });
        }
      }

      // Check instruction redundancy
      if (subQ.instruction && q.instruction) {
        const normParent = cleanInstructionFormatting(q.instruction).toLowerCase();
        const normChild = cleanInstructionFormatting(subQ.instruction).toLowerCase();
        if (
          normChild === normParent ||
          /^(read the (passage|text|following|article|context)|answer the (following )?questions?( that follow)?|read the (passage|text) and answer the questions?)$/i.test(
            normChild
          )
        ) {
          issues.push({
            field: `subQuestions[${idx}].instruction`,
            code: 'INSTRUCTION_REDUNDANT',
            message: `Sub-question ${idx + 1} duplicates parent passage instruction: "${subQ.instruction}".`,
            severity: 'Low',
            autoFixable: true,
          });
        }
      }
    });

    // Parent mark consistency check
    if (q.marks && childMarksSum > 0 && q.marks !== childMarksSum) {
      issues.push({
        field: 'marks',
        code: 'PARENT_MARKS_MISMATCH',
        message: `Parent comprehension marks (${q.marks}) does not match the sum of child question marks (${childMarksSum}).`,
        severity: 'Medium',
        autoFixable: true,
      });
    }
  }

  // 5. Auto-Generated Title Leak
  const presTitle = q.presentation?.title;
  if (presTitle && BOILERPLATE_TITLE_REGEX.test(presTitle.trim())) {
    const hasExplicitInText = Boolean(
      q.text && /^(\*\*|\#+\s*)?(Reading Passage|Comprehension Passage|Case Study)/i.test(q.text.trim())
    );
    if (!hasExplicitInText) {
      issues.push({
        field: 'presentation.title',
        code: 'AUTO_TITLE_LEAK',
        message: `Question was automatically assigned an artificial "${presTitle}" title.`,
        severity: 'Medium',
        autoFixable: true,
      });
    }
  }

  return {
    isValid: issues.filter((i) => i.severity === 'Critical' || i.severity === 'High').length === 0,
    profile,
    issues,
  };
}

/**
 * Sanitizes a Comprehension question to guarantee compliance with the NESA Comprehension Contract.
 */
export function sanitizeComprehensionQuestion(
  q: Question,
  context?: { subjectName?: string; level?: string; sectionName?: string }
): ComprehensionSanitizationResult {
  const sanitized: Question = JSON.parse(JSON.stringify(q));
  const repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[] = [];
  const fixes: string[] = [];

  const profile = (sanitized as any).subjectProfile || determineComprehensionProfile(context?.subjectName, context?.level, context?.sectionName);
  (sanitized as any).subjectProfile = profile;

  // 1. Remove auto-injected boilerplate title if not present in original text
  if (sanitized.presentation?.title && BOILERPLATE_TITLE_REGEX.test(sanitized.presentation.title.trim())) {
    const hasExplicitInText = Boolean(
      q.text && /^(\*\*|\#+\s*)?(Reading Passage|Comprehension Passage|Case Study)/i.test(q.text.trim())
    );
    if (!hasExplicitInText) {
      sanitized.presentation.title = '';
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'AUTO_TITLE_LEAK',
        actionTaken: 'Removed artificial boilerplate title from question presentation.',
      });
      fixes.push('Removed artificial boilerplate title.');
    }
  }

  // 2. Extract merged instruction from passage text stem if present
  if (sanitized.text) {
    const lines = sanitized.text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (
      lines.length > 1 &&
      (/^Read the (passage|text|following|article|context|scenario|situation)/i.test(lines[0]) ||
        /^Lisez (attentivement )?le (texte|passage|document)/i.test(lines[0]) ||
        /^Soma (iki|iyi) (gitekerezo|nyandiko)/i.test(lines[0]))
    ) {
      if (!sanitized.instruction) {
        sanitized.instruction = lines[0];
        fixes.push('Extracted operational instruction from passage text stem.');
      }
      lines.shift();
      sanitized.text = lines.join('\n\n');
    }
  }

  // Set default instruction based on profile and language if missing
  if (!sanitized.instruction) {
    if (profile === 'LANGUAGE_COMPREHENSION') {
      sanitized.instruction = 'Read the passage below carefully and answer the questions that follow.';
    } else if (profile === 'GENERAL_STUDIES_COMPREHENSION') {
      sanitized.instruction = 'Read the following source text carefully and answer the questions that follow.';
    } else {
      sanitized.instruction = 'Read the context/stimulus below carefully and answer the questions that follow.';
    }
    fixes.push(`Assigned standard ${profile} instruction.`);
  }

  // 3. Clean passage formatting (inline bold artifacts, HTML/markdown leakage, normalized paragraphs)
  if (sanitized.text) {
    // A. Apply Deep Clean first (handles tags, basic bold normalization)
    sanitized.text = deepCleanText(sanitized.text);

    // B. Strategy: Extract title first before general cleaning
    const { title, remainingText } = extractPassageTitle(sanitized.text);
    if (title && !sanitized.presentation?.title) {
      if (!sanitized.presentation) sanitized.presentation = {};
      sanitized.presentation.title = title;
      sanitized.text = remainingText;
      fixes.push(`Extracted passage title: "${title}"`);
    }

    const cleanedText = cleanPassageFormatting(sanitized.text);
    if (cleanedText !== sanitized.text) {
      sanitized.text = cleanedText;
      fixes.push('Cleaned random bold artifacts and normalized paragraph structure in passage.');
    }
  }

  // 4. Process and sanitize sub-questions
  if (sanitized.subQuestions && sanitized.subQuestions.length > 0) {
    const parentInstNorm = cleanInstructionFormatting(sanitized.instruction || '')
      .toLowerCase()
      .replace(/[.:;!]+$/, '')
      .trim();
    let childMarksSum = 0;

    sanitized.subQuestions = sanitized.subQuestions.map((subQ, idx) => {
      let childCopy = { ...subQ };
      childCopy.parentId = sanitized.id;
      childCopy.childIndex = idx;
      const originalAnswerSpace = subQ.answerSpace;

      // Deduplicate sub-question instruction if it repeats parent instruction or generic reading prompt
      if (childCopy.instruction) {
        const childInstNorm = cleanInstructionFormatting(childCopy.instruction)
          .toLowerCase()
          .replace(/[.:;!]+$/, '')
          .trim();
        if (
          childInstNorm === parentInstNorm ||
          (parentInstNorm && parentInstNorm.includes(childInstNorm)) ||
          (childInstNorm && childInstNorm.includes(parentInstNorm)) ||
          /^(read the (passage|text|following|article|context)|answer the (following )?questions?( that follow)?|read the (passage|text) (carefully )?and answer the (following )?questions?(\s+that\s+follow)?)$/i.test(
            childInstNorm
          )
        ) {
          childCopy.instruction = undefined;
          fixes.push(`Removed redundant instruction from sub-question ${idx + 1}.`);
        }
      }

      // Sanitize child question via global contract system
      const childSanResult = sanitizeQuestionByContract(childCopy as Question, {
        parentType: 'comprehension',
        subjectName: context?.subjectName,
        parentQuestion: sanitized,
      });

      if (!childSanResult.isRejected) {
        childCopy = childSanResult.sanitized as SubQuestion;
        fixes.push(...childSanResult.fixes);
      }

      // Ensure appropriate answer space for leaf sub-questions based on type and marks
      const hasSubSub = childCopy.subQuestions && childCopy.subQuestions.length > 0;
      const childType = (childCopy.type || 'short').toLowerCase();

      if (!hasSubSub) {
        if (childType === 'mcq' || childType === 'true_false') {
          childCopy.answerSpace = 'none';
        } else if (childType === 'summary' || childType === 'essay' || childType === 'composition') {
          const m = childCopy.marks || 5;
          childCopy.answerSpace = m <= 5 ? 'large' : 'xlarge';
        } else if (!originalAnswerSpace || originalAnswerSpace === 'none' || !childCopy.answerSpace || childCopy.answerSpace === 'none') {
          const m = childCopy.marks || 1;
          childCopy.answerSpace = m <= 2 ? 'small' : m <= 4 ? 'medium' : m <= 6 ? 'large' : 'xlarge';
          fixes.push(`Assigned deterministic answer space '${childCopy.answerSpace}' to sub-question ${idx + 1}.`);
        }
      }

      // Ensure proper numbering style
      if (!childCopy.numberingStyle) {
        childCopy.numberingStyle = 'alpha-lower';
      }

      childMarksSum += childCopy.marks || 0;
      return childCopy;
    });

    // Parent mark summation recalculation
    if (childMarksSum > 0 && sanitized.marks !== childMarksSum) {
      sanitized.marks = childMarksSum;
      fixes.push(`Recalculated parent comprehension marks to ${childMarksSum} (sum of sub-questions).`);
    }
  }

  return {
    sanitized,
    profile,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
