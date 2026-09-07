import { Question, SubQuestion } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export type TransformationTemplateId =
  | 'direct_rewrite'
  | 'tense_change'
  | 'voice_change'
  | 'reported_speech'
  | 'question_transformation'
  | 'affirmative_negative'
  | 'comparative_superlative'
  | 'sentence_combination'
  | 'conditional'
  | 'keyword_transformation';

export interface TransformationTemplateContract {
  templateId: TransformationTemplateId;
  name: string;
  description: string;
  purpose: string;
  requiredFields: string[];
  optionalFields: string[];
  forbiddenFields: string[];
  instructionRequirements: {
    defaultInstructionEn: string;
    defaultInstructionFr: string;
    defaultInstructionRw: string;
  };
  itemStructure: {
    requiresSourceSentence: boolean;
    requiresConstraint?: boolean;
    requiresKeyword?: boolean;
    minSourceSentences?: number;
  };
  answerStructure: {
    requiresExpectedAnswer: boolean;
  };
  responseAreaType: 'small' | 'medium';
}

export const TRANSFORMATION_TEMPLATE_REGISTRY: Record<
  TransformationTemplateId,
  TransformationTemplateContract
> = {
  direct_rewrite: {
    templateId: 'direct_rewrite',
    name: 'Direct Rewriting',
    description: 'Rewrite the sentence using a specified starting phrase or structure directive.',
    purpose: 'Test general sentence restructuration and syntactical flexibility.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence as directed without changing its original meaning.',
      defaultInstructionFr: 'Réécrivez chaque phrase comme indiqué sans modifier son sens original.',
      defaultInstructionRw: 'Andika bundi bushya buri fraze nk’uko amabwiriza abigena utagize icyo uhindura ku busobanuro bwayo.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      requiresConstraint: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  tense_change: {
    templateId: 'tense_change',
    name: 'Tense Transformation',
    description: 'Transform a sentence from one grammatical tense to another.',
    purpose: 'Assess mastery of verb tenses, aspects, and temporal alignment.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence in the specified tense.',
      defaultInstructionFr: 'Réécrivez chaque phrase au temps indiqué.',
      defaultInstructionRw: 'Andika buri nteruro mu gihe cyagutanzwe.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      requiresConstraint: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  voice_change: {
    templateId: 'voice_change',
    name: 'Voice Transformation',
    description: 'Convert a sentence between Active Voice and Passive Voice.',
    purpose: 'Evaluate understanding of transitive verb structures, agent placement, and passive voice rules.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence changing active voice to passive voice or vice versa.',
      defaultInstructionFr: 'Réécrivez chaque phrase en passant de la voix active à la voix passive ou inversement.',
      defaultInstructionRw: 'Andika buri nteruro uhindura imvugo ngirakora mumpuzandanga cyangwa mumpuzandanga mumpuzangirakora.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  reported_speech: {
    templateId: 'reported_speech',
    name: 'Reported Speech Transformation',
    description: 'Transform direct speech into indirect/reported speech or vice versa.',
    purpose: 'Test reported speech rules, tense backshifting, pronoun changes, and time/place adverbial adjustments.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence in reported (indirect) speech or direct speech.',
      defaultInstructionFr: 'Réécrivez chaque phrase au style indirect ou au style direct.',
      defaultInstructionRw: 'Andika buri nteruro mu mvugo itaziguye cyangwa iziguye.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  question_transformation: {
    templateId: 'question_transformation',
    name: 'Question / Interrogative Transformation',
    description: 'Convert a declarative sentence into a question, tag question, or inverted question.',
    purpose: 'Assess auxiliary verb placement, question tag formation, and subject-verb inversion.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Form an appropriate question or add a question tag to each sentence.',
      defaultInstructionFr: 'Formez une question appropriée ou ajoutez une question-tag à chaque phrase.',
      defaultInstructionRw: 'Baza ikibazo gikwiye cyangwa utange ikibazo-tag kuri buri nteruro.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  affirmative_negative: {
    templateId: 'affirmative_negative',
    name: 'Affirmative / Negative Transformation',
    description: 'Convert an affirmative sentence to negative or negative to affirmative without changing meaning.',
    purpose: 'Evaluate use of antonyms, double negation, and negative structures.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence in the negative or affirmative form without changing its meaning.',
      defaultInstructionFr: 'Réécrivez chaque phrase à la forme négative ou affirmative sans modifier son sens.',
      defaultInstructionRw: 'Andika buri nteruro mu buryo buhakana cyangwa bwemeza utagize icyo uhindura ku busobanuro.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  comparative_superlative: {
    templateId: 'comparative_superlative',
    name: 'Comparative / Superlative Transformation',
    description: 'Rephrase a sentence using comparative or superlative adjective/adverb forms.',
    purpose: 'Test comparative syntax, superlative structures, and degree modifiers.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence using the comparative or superlative form as directed.',
      defaultInstructionFr: 'Réécrivez chaque phrase en utilisant le comparatif ou le superlatif comme indiqué.',
      defaultInstructionRw: 'Andika buri nteruro ukoresheje igipimo cyo kugereranya cyangwa icy' + "'" + 'ikirenga.',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  sentence_combination: {
    templateId: 'sentence_combination',
    name: 'Sentence Combination Transformation',
    description: 'Combine two or more simple sentences into a single complex or compound sentence.',
    purpose: 'Test conjunctions, relative pronouns, participial phrases, and subordination clauses.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Combine each pair of sentences into a single sentence using the word or constraint provided.',
      defaultInstructionFr: 'Combinez chaque paire de phrases en une seule phrase à l\'aide du mot ou de la contrainte fournie.',
      defaultInstructionRw: 'Rundanya buri nteruro ebyiri uziyungemo interuro imwe ukoresheje ijambo wageretsweho.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      minSourceSentences: 2,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  conditional: {
    templateId: 'conditional',
    name: 'Conditional Transformation',
    description: 'Transform a sentence using conditional structures (If, Unless, Provided that, In case, etc.).',
    purpose: 'Test conditional clauses (Types 1, 2, 3), inversion in conditionals, and hypotheticals.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Rewrite each sentence using a conditional structure (e.g. If, Unless, Provided that).',
      defaultInstructionFr: 'Réécrivez chaque phrase en utilisant une structure conditionnelle (ex. Si, À moins que).',
      defaultInstructionRw: 'Andika buri nteruro ukoresheje uburyo bw’amajyana (urugero: Niba, keretse niba).',
    },
    itemStructure: {
      requiresSourceSentence: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
  keyword_transformation: {
    templateId: 'keyword_transformation',
    name: 'Keyword Transformation',
    description: 'Rewrite a sentence using a given keyword in brackets, keeping the original meaning intact.',
    purpose: 'Evaluate precise vocabulary usage, idiom restructures, and grammatical accuracy under fixed keyword constraint.',
    requiredFields: ['text', 'marks'],
    optionalFields: ['instruction', 'answerSpace', 'subQuestions'],
    forbiddenFields: ['options', 'tableData'],
    instructionRequirements: {
      defaultInstructionEn: 'Complete the second sentence so that it has a similar meaning to the first sentence, using the word given in brackets. Do not change the word given.',
      defaultInstructionFr: 'Complétez la deuxième phrase pour qu\'elle ait un sens similaire à la première, en utilisant le mot donné entre parenthèses. Ne modifiez pas le mot donné.',
      defaultInstructionRw: 'Uzuza interuro ya kabiri kugira ngo ibe ifite ubusobanuro bumwe n’iya mbere, ukoresheje ijambo ryatanzwe mu dukoroboyi. Ntuhindure iryo jambo.',
    },
    itemStructure: {
      requiresSourceSentence: true,
      requiresKeyword: true,
    },
    answerStructure: {
      requiresExpectedAnswer: true,
    },
    responseAreaType: 'medium',
  },
};

export interface TransformationValidationIssue {
  field: string;
  code:
    | 'REQUIRED_MISSING'
    | 'INVALID_STRUCTURE'
    | 'FORBIDDEN_PROPERTY'
    | 'LABEL_LEAK'
    | 'WHOLE_QUESTION_BOLD'
    | 'INSTRUCTION_MERGED'
    | 'REDUNDANT_INSTRUCTION'
    | 'MISSING_KEYWORD'
    | 'MISSING_CONSTRAINT'
    | 'INSUFFICIENT_SOURCE_SENTENCES'
    | 'IMPOSSIBLE_TRANSFORMATION';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface TransformationValidationResult {
  isValid: boolean;
  issues: TransformationValidationIssue[];
  templateId: TransformationTemplateId;
}

export interface TransformationSanitizationResult {
  sanitized: Question;
  repairLogs: {
    questionId: string;
    violatedRule: string;
    actionTaken: string;
    originalValue?: any;
    newValue?: any;
  }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Regex to detect AI label prefixes on transformation stems (e.g., "(a)", "1.", "Question 1:").
 */
export const TRANSFORMATION_LABEL_PREFIX_REGEX =
  /^(?:(?:\(?\d+\)?|\(?[a-zA-Z]\)?)\s*[\.\)]\s*|question\s+\d+[:\.]?\s*)/i;

/**
 * Regex patterns for instructions merged into transformation stems.
 */
const MERGED_TRANSFORMATION_INSTRUCTIONS = [
  /^(?:rewrite\s+(?:the\s+following\s+)?sentence[s]?\s*(?:using|starting|beginning|as|in|changing)?\s*[^:\.\(\)]*[:\.]?\s*)/i,
  /^(?:réécrivez\s+(?:les\s+phrases\s+suivantes|chaque\s+phrase)\s*[^:\.\(\)]*[:\.]?\s*)/i,
  /^(?:andika\s+bundi\s+bushya\s+buri\s+nteruro\s*[^:\.\(\)]*[:\.]?\s*)/i,
  /^(?:combine\s+(?:the\s+following\s+)?pairs?\s+of\s+sentences\s*[^:\.\(\)]*[:\.]?\s*)/i,
];

/**
 * Detects which of the 10 transformation templates applies to the question.
 */
export function detectTransformationTemplate(q: Question): TransformationTemplateId {
  const text = (q.text || '').trim();
  const inst = (q.instruction || '').trim();
  const combined = (inst + ' ' + text).toLowerCase();

  // 1. Keyword transformation
  if (
    /\[keyword:\s*[^\]]+\]/i.test(combined) ||
    /\(keyword:\s*[^\]\)]+\)/i.test(combined) ||
    /using the word given in (brackets|capital)/i.test(combined) ||
    Boolean((q as any).keyword)
  ) {
    return 'keyword_transformation';
  }

  // 2. Tense change
  if (
    /\b(tense|present tense|past tense|future tense|present perfect|past perfect|simple past)\b/i.test(
      combined
    ) ||
    /\[change to\s+[^\]]*tense\]/i.test(combined) ||
    /rewrite in the (past|present|future|perfect) tense/i.test(combined)
  ) {
    return 'tense_change';
  }

  // 3. Voice change
  if (
    /\b(passive voice|active voice|passive|active)\b/i.test(combined) ||
    /begin with the object/i.test(combined) ||
    /change (into|to) passive/i.test(combined) ||
    /change (into|to) active/i.test(combined)
  ) {
    return 'voice_change';
  }

  // 4. Reported speech
  if (
    /\b(reported speech|indirect speech|direct speech)\b/i.test(combined) ||
    /rewrite in (reported|indirect|direct) speech/i.test(combined) ||
    /(".*".*said|said that)/i.test(combined)
  ) {
    return 'reported_speech';
  }

  // 5. Question transformation
  if (
    /\b(question tag|question-tag|interrogative|tag question|form a question)\b/i.test(combined) ||
    /turn into a question/i.test(combined) ||
    /add a question tag/i.test(combined)
  ) {
    return 'question_transformation';
  }

  // 6. Affirmative / Negative
  if (
    /\b(negative form|affirmative form|make negative|make affirmative)\b/i.test(combined) ||
    /without changing meaning to negative/i.test(combined)
  ) {
    return 'affirmative_negative';
  }

  // 7. Comparative / Superlative
  if (
    /\b(comparative|superlative|as \w+ as|more \w+ than|the most)\b/i.test(combined) ||
    /rewrite using (comparative|superlative)/i.test(combined)
  ) {
    return 'comparative_superlative';
  }

  // 8. Sentence combination
  if (
    /\b(combine|join|merge|combine into one sentence|using a relative clause|using a conjunction)\b/i.test(
      combined
    ) ||
    /combine the (following )?sentences/i.test(combined)
  ) {
    return 'sentence_combination';
  }

  // 9. Conditional
  if (
    /\b(conditional|if clause|unless|provided that|in case|should you|if only)\b/i.test(combined) ||
    /\[begin\s+with:\s*(if|unless|provided|in case|should)/i.test(combined)
  ) {
    return 'conditional';
  }

  // 10. Direct Rewrite (Default)
  return 'direct_rewrite';
}

/**
 * Validates a transformation question against its template contract.
 */
export function validateTransformationQuestionContract(
  q: Question,
  options?: { subjectName?: string }
): TransformationValidationResult {
  const issues: TransformationValidationIssue[] = [];
  const templateId = detectTransformationTemplate(q);
  const contract = TRANSFORMATION_TEMPLATE_REGISTRY[templateId];

  // Forbidden fields
  if (q.options && Array.isArray(q.options) && q.options.length > 0) {
    issues.push({
      field: 'options',
      code: 'FORBIDDEN_PROPERTY',
      message: `Transformation question must not contain 'options' array.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  if (q.tableData) {
    issues.push({
      field: 'tableData',
      code: 'FORBIDDEN_PROPERTY',
      message: `Transformation question must not contain 'tableData'.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  // Check stem content
  const text = (q.text || '').trim();
  const hasSubQ = Array.isArray(q.subQuestions) && q.subQuestions.length > 0;

  if (!text && !hasSubQ) {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: `Transformation question requires text stem or subquestions.`,
      severity: 'Critical',
      autoFixable: false,
    });
  }

  // Template-specific validation rules
  if (contract.itemStructure.requiresKeyword) {
    const hasKeyword =
      /\[keyword:\s*[^\]]+\]/i.test(text) ||
      /\(keyword:\s*[^\]\)]+\)/i.test(text) ||
      Boolean((q as any).keyword);

    if (!hasKeyword && !hasSubQ) {
      issues.push({
        field: 'text',
        code: 'MISSING_KEYWORD',
        message: `Keyword transformation template requires a bracketed keyword e.g. [Keyword: IN SPITE OF].`,
        severity: 'High',
        autoFixable: true,
      });
    }
  }

  if (contract.itemStructure.minSourceSentences && contract.itemStructure.minSourceSentences > 1) {
    // Check if stem or text contains multiple sentence signals e.g. '.' or ';'
    const sentenceCount = (text.match(/[\.\!\?]+/g) || []).length;
    if (sentenceCount < 2 && !hasSubQ) {
      issues.push({
        field: 'text',
        code: 'INSUFFICIENT_SOURCE_SENTENCES',
        message: `Sentence combination template requires at least 2 source sentences in the item stem.`,
        severity: 'Medium',
        autoFixable: false,
      });
    }
  }

  // Check label leak / hardcoded AI prefix
  if (text && TRANSFORMATION_LABEL_PREFIX_REGEX.test(text)) {
    issues.push({
      field: 'text',
      code: 'LABEL_LEAK',
      message: `Transformation item stem contains hardcoded label prefix e.g. "${text.slice(0, 10)}..."`,
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // Check whole-question bolding
  if (text.startsWith('**') && text.endsWith('**') && text.length > 4) {
    issues.push({
      field: 'text',
      code: 'WHOLE_QUESTION_BOLD',
      message: `Transformation question stem is wrapped in whole-sentence bolding.`,
      severity: 'Low',
      autoFixable: true,
    });
  }

  const isValid = !issues.some((i) => i.severity === 'Critical');

  return {
    isValid,
    issues,
    templateId,
  };
}

/**
 * Strips AI prefix from transformation text.
 */
export function stripTransformationPrefix(text?: string): string {
  if (!text) return '';
  return text.trim().replace(TRANSFORMATION_LABEL_PREFIX_REGEX, '').trim();
}

/**
 * Unwraps whole-sentence bolding from transformation text.
 */
export function unwrapWholeTransformationBolding(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
    const inner = trimmed.slice(2, -2).trim();
    if (!inner.includes('**')) {
      return inner;
    }
  }
  return trimmed;
}

/**
 * Sanitizes and repairs a transformation question.
 */
export function sanitizeTransformationQuestion(
  q: Question,
  options?: {
    subjectName?: string;
    parentInstruction?: string;
  }
): TransformationSanitizationResult {
  const repairLogs: {
    questionId: string;
    violatedRule: string;
    actionTaken: string;
    originalValue?: any;
    newValue?: any;
  }[] = [];
  const fixes: string[] = [];
  const qId = q.id || 'transformation_q';

  // Deep clone
  const sanitized: Question = JSON.parse(JSON.stringify(q));

  // 0. Global Deep Clean
  if (sanitized.text) {
    const cleaned = deepCleanText(sanitized.text);
    if (cleaned !== sanitized.text) {
      sanitized.text = cleaned;
      fixes.push(`Deep cleaned transformation text (removed slop/tags)`);
    }
  }

  // 1. Split embedded sub-questions if not already a parent
  if ((!sanitized.subQuestions || sanitized.subQuestions.length === 0) && sanitized.text) {
    const split = splitEmbeddedSubQuestions(sanitized.text, 'transformation', qId, sanitized.marks || 0);
    if (split.subQuestions) {
      sanitized.text = split.stimulus || sanitized.text; // Retain original if stimulus is empty
      sanitized.subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from transformation block`);
      // Recursively sanitize now that it's a parent
      return sanitizeTransformationQuestion(sanitized, options);
    }
  }

  // 2. Critical structural safety check
  if (typeof sanitized.marks === 'number' && sanitized.marks <= 0) {
    return {
      sanitized,
      repairLogs,
      fixes,
      isRejected: true,
      rejectionReason: `Unsafe structural error in transformation Q${sanitized.number || ''}: Invalid or non-positive marks value: ${sanitized.marks}`,
    };
  }

  // 2. Strip forbidden properties
  if (sanitized.options) {
    repairLogs.push({
      questionId: qId,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden options array from transformation question',
      originalValue: sanitized.options,
      newValue: undefined,
    });
    fixes.push(`Stripped forbidden 'options' from transformation Q${sanitized.number || ''}`);
    delete (sanitized as any).options;
  }

  if (sanitized.tableData) {
    delete (sanitized as any).tableData;
  }

  // Detect template
  const templateId = detectTransformationTemplate(sanitized);

  // 3. Unwrap whole-sentence bolding in stem
  if (sanitized.text) {
    const origText = sanitized.text;
    sanitized.text = unwrapWholeTransformationBolding(sanitized.text);
    if (origText !== sanitized.text) {
      repairLogs.push({
        questionId: qId,
        violatedRule: 'WHOLE_QUESTION_BOLD',
        actionTaken: 'Unwrapped whole-sentence bolding from transformation stem',
        originalValue: origText,
        newValue: sanitized.text,
      });
      fixes.push(`Unwrapped whole-sentence bolding in transformation Q${sanitized.number || ''}`);
    }
  }

  // 4. Extract merged instructions
  if (sanitized.text) {
    for (const pattern of MERGED_TRANSFORMATION_INSTRUCTIONS) {
      const match = sanitized.text.match(pattern);
      if (match) {
        const extractedInst = match[0].trim().replace(/[:.]\s*$/, '');
        sanitized.text = sanitized.text.substring(match[0].length).trim();
        if (!sanitized.instruction) {
          sanitized.instruction = extractedInst;
        }
        repairLogs.push({
          questionId: qId,
          violatedRule: 'INSTRUCTION_MERGED',
          actionTaken: 'Separated merged transformation instruction from stem',
          originalValue: match[0],
          newValue: sanitized.text,
        });
        fixes.push(`Separated merged instruction in transformation Q${sanitized.number || ''}`);
        break;
      }
    }
  }

  // 5. Strip AI label prefix from stem
  if (sanitized.text) {
    const orig = sanitized.text;
    sanitized.text = stripTransformationPrefix(sanitized.text);
    if (orig !== sanitized.text) {
      repairLogs.push({
        questionId: qId,
        violatedRule: 'LABEL_LEAK',
        actionTaken: 'Stripped hardcoded AI prefix from transformation stem',
        originalValue: orig,
        newValue: sanitized.text,
      });
      fixes.push(`Stripped prefix from transformation Q${sanitized.number || ''}`);
    }
  }

  // 6. Clean instruction & handle redundancy against parent
  if (sanitized.instruction) {
    sanitized.instruction = cleanInstructionFormatting(sanitized.instruction);
    if (options?.parentInstruction) {
      const parentNorm = options.parentInstruction.trim().toLowerCase();
      const instNorm = sanitized.instruction.trim().toLowerCase();
      if (parentNorm.includes(instNorm) || instNorm.includes(parentNorm)) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'REDUNDANT_INSTRUCTION',
          actionTaken: 'Removed redundant transformation instruction matching parent/section instruction',
          originalValue: sanitized.instruction,
          newValue: undefined,
        });
        fixes.push(`Removed redundant instruction in transformation Q${sanitized.number || ''}`);
        sanitized.instruction = undefined;
      }
    }
  }

  // 7. Process sub-questions recursively
  if (sanitized.subQuestions && Array.isArray(sanitized.subQuestions)) {
    sanitized.subQuestions = sanitized.subQuestions.map((sq, idx) => {
      let cleanSqText = stripTransformationPrefix(sq.text || '');
      cleanSqText = unwrapWholeTransformationBolding(cleanSqText);

      let cleanSqInst = sq.instruction ? cleanInstructionFormatting(sq.instruction) : undefined;
      if (cleanSqInst && (sanitized.instruction || options?.parentInstruction)) {
        const parentRef = (sanitized.instruction || options?.parentInstruction || '').toLowerCase();
        if (parentRef.includes(cleanSqInst.toLowerCase())) {
          cleanSqInst = undefined; // Strip redundant child instruction
        }
      }

      return {
        ...sq,
        text: cleanSqText,
        instruction: cleanSqInst,
        answerSpace: sq.answerSpace || 'medium',
      } as SubQuestion;
    });
  }

  // 8. Deterministic answerSpace assignment
  const hasSubQ = Array.isArray(sanitized.subQuestions) && sanitized.subQuestions.length > 0;
  if (!hasSubQ) {
    if (!sanitized.answerSpace || sanitized.answerSpace === 'none') {
      sanitized.answerSpace = 'medium';
    }
  } else {
    sanitized.answerSpace = 'none';
  }

  // 9. Structured Answer Relationship (Internal model)
  (sanitized as any).transformationModel = {
    templateId,
    sourceItem: sanitized.text,
    transformationRule: sanitized.instruction || (sanitized as any).constraint || 'direct_rewrite',
    expectedAnswer: (sanitized as any).expectedAnswer || (sanitized as any).solution || '',
  };

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
