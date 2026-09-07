import { Question, QuestionOption } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export type McqPattern =
  | 'direct'
  | 'incomplete_statement'
  | 'stimulus_based'
  | 'scenario_based'
  | 'calculation'
  | 'passage_based'
  | 'negative'
  | 'application_reasoning';

export interface McqPatternResult {
  primaryPattern: McqPattern;
  detectedPatterns: McqPattern[];
}

export interface McqValidationIssue {
  field: string;
  code:
    | 'REQUIRED_MISSING'
    | 'INVALID_OPTION_COUNT'
    | 'NO_CORRECT_ANSWER'
    | 'MULTIPLE_CORRECT_ANSWERS'
    | 'DUPLICATE_OPTION'
    | 'LABEL_LEAK'
    | 'UNBOLDED_NEGATIVE_KEYWORD'
    | 'WHOLE_QUESTION_BOLD'
    | 'INSTRUCTION_MERGED'
    | 'REDUNDANT_INSTRUCTION'
    | 'MISSING_STIMULUS'
    | 'FORBIDDEN_PROPERTY';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface McqValidationResult {
  isValid: boolean;
  issues: McqValidationIssue[];
  patternInfo: McqPatternResult;
}

export interface McqSanitizationResult {
  sanitized: Question;
  repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Regex to detect option prefixes like "A.", "B.", "(A)", "a)", "1." in option text.
 */
export const OPTION_LABEL_PREFIX_REGEX =
  /^(?:\(?[a-eA-E0-9]\)?[\.\)]\s*|[a-eA-E0-9]\.\s+)/i;

/**
 * Regex patterns for negative MCQ keywords.
 */
const NEGATIVE_KEYWORDS_REGEX = /\b(NOT|EXCEPT|INCORRECT|LEAST\s+LIKELY)\b/;
const UNBOLDED_NEGATIVE_KEYWORDS_REGEX =
  /(?<!\*\*)\b(NOT|EXCEPT|INCORRECT|LEAST\s+LIKELY|not|except|incorrect|least\s+likely)\b(?!\*\*)/;

/**
 * Regex for instruction patterns merged into MCQ question stems.
 */
const MERGED_MCQ_INSTRUCTIONS = [
  /^(?:choose\s+the\s+(?:correct|best|appropriate)\s+(?:answer|option|statement)[s]?\s*(?:below|from\s+the\s+following)?[:.]?\s*)/i,
  /^(?:select\s+the\s+(?:correct|best|appropriate)\s+(?:answer|option|statement)[s]?\s*(?:below|from\s+the\s+following)?[:.]?\s*)/i,
  /^(?:choisissez\s+la\s+bonne\s+réponse[:.]?\s*)/i,
  /^(?:hitamo\s+subizo\s+y'ukuri[:.]?\s*)/i,
];

/**
 * Detects MCQ question patterns based on stem, options, and metadata.
 */
export function detectMcqPattern(q: Question): McqPatternResult {
  const text = (q.text || '').trim();
  const lowerText = text.toLowerCase();
  const detected: McqPattern[] = [];

  // 1. Negative / Exception MCQ
  if (/\b(not|except|incorrect|least likely)\b/i.test(text)) {
    detected.push('negative');
  }

  // 2. Stimulus-based MCQ
  const hasStimulusData = Boolean(q.tableData || q.svgData || q.mermaidData || q.smilesData);
  const referencesStimulus = /\b(diagram|table|figure|graph|chart|data|map|circuit|structure|equation)\b/i.test(text);
  if (hasStimulusData || referencesStimulus) {
    detected.push('stimulus_based');
  }

  // 3. Passage / Data-based MCQ
  if ((q as any).passageText || /\b(passage|text|excerpt|read the following)\b/i.test(text)) {
    detected.push('passage_based');
  }

  // 4. Calculation / Problem MCQ
  const hasMath = /(\$\$|\\\[|\\\(|\$|[0-9]+\s*[\+\-\*\/\\=\^]\s*[0-9]+)/.test(text);
  const mathVerbs = /\b(calculate|find the value|evaluate|determine the value|solve|compute)\b/i.test(text);
  if (hasMath || mathVerbs) {
    detected.push('calculation');
  }

  // 5. Scenario-based MCQ
  if (/\b(scenario|farmer|patient|investigator|company|student|experiment|observe|suppose|if a)\b/i.test(text) && text.length > 80) {
    detected.push('scenario_based');
  }

  // 6. Application / Reasoning MCQ
  if (/\b(conclusion|best drawn|which principle|implies|demonstrates|explains why|most likely)\b/i.test(text)) {
    detected.push('application_reasoning');
  }

  // 7. Incomplete statement
  if (/_{2,}|\.{3,}$|\bis\s*$/i.test(text) || (!text.endsWith('?') && !text.endsWith('.'))) {
    detected.push('incomplete_statement');
  }

  // 8. Direct question (default if ends with ? or straightforward stem)
  if (text.endsWith('?') || detected.length === 0) {
    detected.push('direct');
  }

  return {
    primaryPattern: detected[0] || 'direct',
    detectedPatterns: detected,
  };
}

/**
 * Validates an MCQ question against the NESA MCQ Contract.
 */
export function validateMcqQuestionContract(
  q: Question,
  context?: { subjectName?: string; parentQuestion?: Question }
): McqValidationResult {
  const issues: McqValidationIssue[] = [];
  const text = (q.text || '').trim();
  const options = q.options || [];
  const patternInfo = detectMcqPattern(q);

  // 1. Question stem presence
  if (!text) {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: 'MCQ question stem text is missing.',
      severity: 'Critical',
      autoFixable: true,
    });
  }

  // 2. Option Count Validation (Must be between 2 and 5)
  if (!options || options.length < 2) {
    issues.push({
      field: 'options',
      code: 'INVALID_OPTION_COUNT',
      message: `MCQ requires at least 2 options, found ${options.length}.`,
      severity: 'Critical',
      autoFixable: false,
    });
  } else if (options.length > 5) {
    issues.push({
      field: 'options',
      code: 'INVALID_OPTION_COUNT',
      message: `MCQ exceeds maximum allowed options (5), found ${options.length}.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  // 3. Option Text Quality & Leakage
  const optionTextSet = new Set<string>();
  let correctCount = 0;

  options.forEach((opt, idx) => {
    const optText = (opt.text || '').trim();

    if (!optText) {
      issues.push({
        field: `options[${idx}].text`,
        code: 'REQUIRED_MISSING',
        message: `MCQ Option ${idx + 1} text is empty.`,
        severity: 'Critical',
        autoFixable: true,
      });
    } else {
      // Check for hardcoded option prefix leakage (e.g. "A. Option")
      if (OPTION_LABEL_PREFIX_REGEX.test(optText)) {
        issues.push({
          field: `options[${idx}].text`,
          code: 'LABEL_LEAK',
          message: `MCQ Option ${idx + 1} contains hardcoded label prefix: "${optText.slice(0, 10)}..."`,
          severity: 'Medium',
          autoFixable: true,
        });
      }

      // Check for duplicate options
      const normText = optText.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normText && optionTextSet.has(normText)) {
        issues.push({
          field: `options[${idx}].text`,
          code: 'DUPLICATE_OPTION',
          message: `MCQ contains duplicate option text: "${optText}".`,
          severity: 'Critical',
          autoFixable: true,
        });
      }
      optionTextSet.add(normText);
    }

    if (opt.isCorrect) {
      correctCount++;
    }
  });

  // 4. Correct Answer Key Validation
  if (options.length >= 2) {
    if (correctCount === 0) {
      issues.push({
        field: 'options',
        code: 'NO_CORRECT_ANSWER',
        message: 'MCQ does not specify a correct answer among its options.',
        severity: 'High',
        autoFixable: true,
      });
    } else if (correctCount > 1) {
      issues.push({
        field: 'options',
        code: 'MULTIPLE_CORRECT_ANSWERS',
        message: `Single-answer MCQ contains ${correctCount} correct answers. Exactly 1 correct answer is required.`,
        severity: 'High',
        autoFixable: true,
      });
    }
  }

  // 5. Whole-Question Bolding Defect
  if (/^\*\*(?!\*)[^\*]+\*\*$/.test(text)) {
    issues.push({
      field: 'text',
      code: 'WHOLE_QUESTION_BOLD',
      message: 'Entire MCQ question stem is formatted in bold instead of standard typography.',
      severity: 'Low',
      autoFixable: true,
    });
  }

  // 6. Unbolded Negative Keyword in Negative MCQ
  if (patternInfo.detectedPatterns.includes('negative')) {
    if (UNBOLDED_NEGATIVE_KEYWORDS_REGEX.test(text)) {
      issues.push({
        field: 'text',
        code: 'UNBOLDED_NEGATIVE_KEYWORD',
        message: 'Negative MCQ keyword (e.g. NOT, EXCEPT) is not visually highlighted in bold.',
        severity: 'Medium',
        autoFixable: true,
      });
    }
  }

  // 7. Merged Instruction Detection
  MERGED_MCQ_INSTRUCTIONS.forEach((pattern) => {
    if (pattern.test(text)) {
      issues.push({
        field: 'text',
        code: 'INSTRUCTION_MERGED',
        message: 'MCQ question stem contains merged instruction header.',
        severity: 'Medium',
        autoFixable: true,
      });
    }
  });

  // 8. Missing Referenced Stimulus Validation
  if (patternInfo.detectedPatterns.includes('stimulus_based')) {
    const referencesTable = /\b(table\s+below|following\s+table)\b/i.test(text);
    const referencesDiagram = /\b(diagram\s+below|figure\s+below|following\s+diagram)\b/i.test(text);

    if (referencesTable && !q.tableData) {
      issues.push({
        field: 'tableData',
        code: 'MISSING_STIMULUS',
        message: 'MCQ stem references a table below, but no tableData is attached.',
        severity: 'High',
        autoFixable: false,
      });
    }
    if (referencesDiagram && !q.svgData && !q.mermaidData && !q.smilesData) {
      issues.push({
        field: 'svgData',
        code: 'MISSING_STIMULUS',
        message: 'MCQ stem references a diagram/figure below, but no visual stimulus data is attached.',
        severity: 'High',
        autoFixable: false,
      });
    }
  }

  // 9. Forbidden answerSpace property check
  if (q.answerSpace && q.answerSpace !== 'none') {
    issues.push({
      field: 'answerSpace',
      code: 'FORBIDDEN_PROPERTY',
      message: `MCQ question type must have answerSpace set to 'none', found '${q.answerSpace}'.`,
      severity: 'Low',
      autoFixable: true,
    });
  }

  return {
    isValid: issues.filter((i) => i.severity === 'Critical' || i.severity === 'High').length === 0,
    issues,
    patternInfo,
  };
}

/**
 * Unwraps whole-sentence bolding on MCQ stem.
 */
export function unwrapWholeMcqBolding(text: string): string {
  if (!text) return text;
  let trimmed = text.trim();
  if (/^\*\*(?!\*)[^\*]+\*\*$/.test(trimmed)) {
    return trimmed.slice(2, -2).trim();
  }
  return text;
}

/**
 * Formats negative keywords (NOT, EXCEPT, INCORRECT, LEAST LIKELY) in bold.
 */
export function formatNegativeKeywordsInStem(text: string): string {
  if (!text) return text;

  // Replace unbolded negative keywords with uppercase bold counterparts
  return text.replace(
    /(?<!\*\*)\b(NOT|EXCEPT|INCORRECT|LEAST\s+LIKELY|not|except|incorrect|least\s+likely)\b(?!\*\*)/g,
    (match) => `**${match.toUpperCase()}**`
  );
}

/**
 * Strips hardcoded option prefixes (A., B., 1., a)) from option text recursively.
 */
export function stripOptionLabelPrefix(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  let changed = true;
  while (changed) {
    const next = cleaned.replace(OPTION_LABEL_PREFIX_REGEX, '').trim();
    if (next === cleaned) {
      changed = false;
    } else {
      cleaned = next;
    }
  }
  return cleaned;
}

/**
 * Sanitizes an MCQ question to enforce compliance with NESA MCQ Contract.
 */
export function sanitizeMcqQuestion(
  q: Question,
  context?: { subjectName?: string; parentInstruction?: string }
): McqSanitizationResult {
  const sanitized: Question = JSON.parse(JSON.stringify(q));
  const repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[] = [];
  const fixes: string[] = [];

  // 0. Global Deep Clean
  if (sanitized.text) {
    const cleaned = deepCleanText(sanitized.text);
    if (cleaned !== sanitized.text) {
      sanitized.text = cleaned;
      fixes.push(`Deep cleaned MCQ text (removed slop/tags)`);
    }
  }

  // 1. Split embedded sub-questions if not already a parent
  if ((!sanitized.subQuestions || sanitized.subQuestions.length === 0) && sanitized.text) {
    const split = splitEmbeddedSubQuestions(sanitized.text, 'mcq', sanitized.id || 'mcq', sanitized.marks || 0);
    if (split.subQuestions) {
      sanitized.text = split.stimulus;
      sanitized.subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from MCQ block`);
      // Recursively sanitize
      return sanitizeMcqQuestion(sanitized, context);
    }
  }

  // 1. Force answerSpace = 'none'
  if (sanitized.answerSpace !== 'none') {
    sanitized.answerSpace = 'none';
    repairLogs.push({
      questionId: sanitized.id,
      violatedRule: 'ANSWER_SPACE_AUTHORITY',
      actionTaken: 'Enforced answerSpace = none for MCQ.',
    });
    fixes.push('Enforced answerSpace = none.');
  }

  // 1b. Strip forbidden tableData if not referenced in stimulus
  if (sanitized.tableData && !/\b(table\s+below|following\s+table)\b/i.test(sanitized.text || '')) {
    delete (sanitized as any).tableData;
    repairLogs.push({
      questionId: sanitized.id,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden tableData from MCQ.',
    });
    fixes.push('Stripped forbidden tableData from MCQ.');
  }

  // 2. Separate merged instruction or imperative from question text stem
  if (sanitized.text) {
    let stem = sanitized.text.trim();

    // Check for known instruction patterns
    MERGED_MCQ_INSTRUCTIONS.forEach((pattern) => {
      const match = stem.match(pattern);
      if (match && match[0]) {
        const instText = match[0].replace(/[:\s]+$/, '.').trim();
        const remainder = stem.slice(match[0].length).trim();
        if (remainder.length > 0) {
          if (!sanitized.instruction) {
            sanitized.instruction = instText;
          }
          stem = remainder;
          fixes.push('Separated merged instruction from MCQ stem.');
        }
      }
    });

    // Move imperative verbs to instruction if not already present
    if (!sanitized.instruction && /^(Choose|Select|Identify|Determine|Pick|State|Find)\b/i.test(stem)) {
      const sentences = stem.split(/(?<=[.!?])\s+/);
      if (sentences.length > 1 && /^(Choose|Select|Identify|Determine|Pick|State|Find)\b/i.test(sentences[sentences.length - 1])) {
        const lastSentence = sentences.pop();
        sanitized.instruction = lastSentence;
        stem = sentences.join(' ');
        fixes.push('Extracted imperative sentence as instruction.');
      }
    }

    // 3. Unwrap whole-question bolding
    const unwrapped = unwrapWholeMcqBolding(stem);
    if (unwrapped !== stem) {
      stem = unwrapped;
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'WHOLE_QUESTION_BOLD',
        actionTaken: 'Unwrapped whole-question bolding from MCQ stem.',
      });
      fixes.push('Unwrapped whole-question bolding.');
    }

    // 4. Bold negative keywords for negative MCQs
    if (/\b(not|except|incorrect|least likely)\b/i.test(stem)) {
      const formattedStem = formatNegativeKeywordsInStem(stem);
      if (formattedStem !== stem) {
        stem = formattedStem;
        fixes.push('Formatted negative keyword in bold.');
      }
    }

    sanitized.text = stem;
  }

  // 5. Sanitize options array
  if (!sanitized.options || !Array.isArray(sanitized.options) || sanitized.options.length < 2) {
    // Attempt 1: Try to extract options if embedded in sanitized.text
    if (sanitized.text && /(?:^|\n|\s+)(?:[A-Da-d]\.|\([A-Da-d]\)|[A-Da-d]\))\s+/.test(sanitized.text)) {
      const optionMatches: QuestionOption[] = [];
      const parts = sanitized.text.split(/(?:^|\n|\s+)(?=[A-Da-d]\.|\([A-Da-d]\)|[A-Da-d]\)\s+)/);
      if (parts.length >= 3) {
        const stemOnly = parts[0].trim();
        for (let i = 1; i < parts.length; i++) {
          const rawOpt = parts[i].trim();
          const cleanOpt = stripOptionLabelPrefix(rawOpt);
          if (cleanOpt) {
            optionMatches.push({
              id: `opt_${i}`,
              text: cleanOpt,
              isCorrect: i === 1,
            });
          }
        }
        if (optionMatches.length >= 2) {
          sanitized.text = stemOnly;
          sanitized.options = optionMatches;
          fixes.push(`Extracted ${optionMatches.length} options from question stem text`);
        }
      }
    }
  }

  // If still missing options and not a parent with subquestions, safely convert to short answer question
  if (!sanitized.options || !Array.isArray(sanitized.options) || sanitized.options.length < 2) {
    if (sanitized.subQuestions && sanitized.subQuestions.length > 0) {
      // Parent container with subquestions - allow
    } else {
      sanitized.type = 'short';
      sanitized.answerSpace = 'medium';
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'INVALID_OPTION_COUNT',
        actionTaken: 'Converted MCQ with insufficient options to short answer question with medium answer space.',
      });
      fixes.push(`Converted MCQ Q${sanitized.number || ''} with missing options to short-answer question`);
      return {
        sanitized,
        repairLogs,
        fixes,
        isRejected: false,
      };
    }
  }

  const cleanedOptions: QuestionOption[] = [];
    const seenTexts = new Set<string>();

    sanitized.options.forEach((opt, idx) => {
      let optText = opt.text || '';

      // Strip hardcoded option prefix (A., B., 1., a))
      const strippedText = stripOptionLabelPrefix(optText);
      if (strippedText !== optText) {
        repairLogs.push({
          questionId: sanitized.id,
          violatedRule: 'LABEL_LEAK',
          actionTaken: `Stripped hardcoded label prefix from option ${idx + 1}.`,
        });
        optText = strippedText;
        fixes.push(`Stripped hardcoded option prefix from option ${idx + 1}.`);
      }

      const normText = optText.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Skip duplicate options
      if (normText && seenTexts.has(normText)) {
        fixes.push(`Removed duplicate option "${optText}".`);
        return;
      }
      if (normText) {
        seenTexts.add(normText);
      }

      cleanedOptions.push({
        ...opt,
        id: opt.id || `opt_${idx + 1}`,
        text: optText,
      });
    });

    sanitized.options = cleanedOptions;

    // Truncate to 5 options if model generated > 5
    if (sanitized.options.length > 5) {
      sanitized.options = sanitized.options.slice(0, 5);
      fixes.push('Truncated MCQ options to maximum allowed limit of 5.');
    }

    // Correct Answer Key Validation & Repair
    let correctIndices: number[] = [];
    sanitized.options.forEach((opt, idx) => {
      if (opt.isCorrect) correctIndices.push(idx);
    });

    if (correctIndices.length === 0) {
      // Check if expectedAnswer matches option ID or letter/text
      let matchedIdx = -1;
      const expectedAns = ((sanitized as any).expectedAnswer || '').toString().trim().toLowerCase();

      if (expectedAns) {
        matchedIdx = sanitized.options.findIndex((opt, i) => {
          const letter = String.fromCharCode(65 + i).toLowerCase();
          return (
            opt.id?.toLowerCase() === expectedAns ||
            letter === expectedAns ||
            opt.text?.toLowerCase() === expectedAns
          );
        });
      }

      if (matchedIdx === -1) {
        matchedIdx = 0; // Default first option as correct answer
      }

      sanitized.options[matchedIdx].isCorrect = true;
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'NO_CORRECT_ANSWER',
        actionTaken: `Assigned option ${matchedIdx + 1} (${sanitized.options[matchedIdx].text}) as correct answer.`,
      });
      fixes.push(`Set option ${matchedIdx + 1} as correct answer.`);
    } else if (correctIndices.length > 1) {
      // Retain only first correct answer for single-answer MCQ
      sanitized.options.forEach((opt, idx) => {
        if (idx !== correctIndices[0]) {
          opt.isCorrect = false;
        }
      });
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'MULTIPLE_CORRECT_ANSWERS',
        actionTaken: `Retained option ${correctIndices[0] + 1} as sole correct answer and cleared secondary correct flags.`,
      });
      fixes.push('Cleared secondary correct flags to preserve single-answer MCQ contract.');
    }

  // 6. Option Layout Variant Optimization
  if (sanitized.options && sanitized.options.length > 0) {
    const isLong = sanitized.options.some((opt) => (opt.text || '').length >= 45 || (opt.text || '').includes('\n'));
    const isVeryShort = sanitized.options.length === 4 && sanitized.options.every((opt) => (opt.text || '').length <= 18 && !(opt.text || '').includes('\n'));
    
    const subject = (context?.subjectName || '').toLowerCase();
    const isLanguage = subject.includes('english') || subject.includes('french') || subject.includes('kinyarwanda') || subject.includes('literature');

    if (isLanguage) {
      // Language exams ALWAYS use stacked layout for clarity
      sanitized.layoutVariant = 'stacked';
    } else if (isLong) {
      sanitized.layoutVariant = 'stacked';
    } else if (isVeryShort) {
      sanitized.layoutVariant = '4-col';
    } else {
      sanitized.layoutVariant = '2-col'; // Default for non-language, short options
    }
  }

  // 7. Deduplicate redundant instruction if parent or section already provides it
  if (sanitized.instruction) {
    const parentNorm = cleanInstructionFormatting(context?.parentInstruction || '').toLowerCase();
    const childNorm = cleanInstructionFormatting(sanitized.instruction).toLowerCase();

    if (
      childNorm === parentNorm ||
      /^(choose the correct answer|select the correct option|choisissez la bonne réponse)$/i.test(childNorm)
    ) {
      sanitized.instruction = undefined;
      fixes.push('Removed redundant MCQ instruction matching section/parent instruction.');
    }
  }

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
