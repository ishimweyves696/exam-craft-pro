import { Question, SubQuestion, SubSubQuestion, TableData } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import { isCandidateAnswerCell } from '../../types/questionContracts.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export interface FillableElement {
  id: string;
  isCandidateFillable: true;
  expectedType?: 'single_char' | 'word' | 'phrase' | 'number' | 'unknown';
  expectedLength?: 'short' | 'medium' | 'large';
  displayStyle?: 'inline' | 'block';
  rawMatched?: string;
  index: number;
}

export interface FillBlankValidationIssue {
  field: string;
  code:
    | 'NO_FILLABLE_ELEMENT'
    | 'INSTRUCTION_MERGED'
    | 'WHOLE_QUESTION_BOLD'
    | 'LABEL_LEAK'
    | 'DUPLICATE_LABEL'
    | 'REDUNDANT_INSTRUCTION'
    | 'HEADER_BLANKED_OUT'
    | 'PUNCTUATION_CORRUPTED'
    | 'REQUIRED_MISSING'
    | 'INVALID_STRUCTURE';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface FillBlankValidationResult {
  isValid: boolean;
  issues: FillBlankValidationIssue[];
  blankCount: number;
}

export interface FillBlankSanitizationResult {
  sanitized: Question;
  repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Regex patterns matching candidate blanks inside question text or passages.
 * Added support for indexed NESA gaps like (a). and dots followed by bracketed constraints.
 */
export const BLANK_PATTERN_REGEX =
  /(?:\*\*(?:_{2,}|[─—–]{2,}|\.{3,}|\[\s*\]|\[blank\]|\{\s*\}\|\(\s*\.\.\.\s*\))\*\*|_{2,}|[─—–]{2,}|\.{3,}|\[\s*\]|\[blank\]|\{\s*blank\s*\}|\{\s*\}|\(\s*blank\s*\)|\(\s*\.\.\.\s*\)|\(\s*[a-z0-9]\s*\)\s*[\.]|(?<=\s|^)\.{3,}(?=\s|[,.!?:;]|$)|(?<=\s|^)[\.]{2,}\s*\[[^\]]+\])/gi;

/**
 * Extracts a word bank from the question text or instructions.
 * NESA word banks are typically lists of words in parentheses or bold blocks.
 */
export function extractWordBank(q: Question): { bank?: string[]; cleanText: string; cleanInstruction?: string } {
  let bank: string[] = [];
  let text = q.text || '';
  let instruction = q.instruction || '';

  // Pattern for "Words in the box: [word1, word2, word3]" or similar
  const bankPatterns = [
    /(?:words\s+in\s+the\s+(?:box|list|bank)[:\s]*)\s*\(([^)]+)\)/i,
    /(?:mots\s+dans\s+le\s+(?:cadre|liste)[:\s]*)\s*\(([^)]+)\)/i,
    /(?:words?[:\s]*)\s*\(([^)]+)\)/i,
    /(?:using\s+(?:the\s+following\s+)?words?|words?\s+(?:in\s+the\s+(?:box|list|bank)|below|to\s+use)?)\s*[:]\s*([a-zA-Z0-9_\-\s,/•;]+?)(?:\.|\n\n|$)/i,
    /\((?:symbolism|protagonist|motifs|proverbs|exposition|[^)]{20,})\)/i, // Catch the specific example words if they are in parentheses
  ];

  // Try extracting from text first
  for (const pattern of bankPatterns) {
    const match = text.match(pattern);
    if (match) {
      const wordsStr = match[1] || match[0].replace(/[()]/g, '');
      const words = wordsStr.split(/[,;/•]|\s+and\s+/).map(w => w.trim().replace(/^['"]|['"]$/g, '')).filter(w => w.length > 0 && !/^(?:the|following|words|below|using)$/i.test(w));
      if (words.length >= 2) {
        bank = words;
        text = text.replace(match[0], '').trim();
        break;
      }
    }
  }

  // If not found, try instruction
  if (bank.length === 0) {
    for (const pattern of bankPatterns) {
      const match = instruction.match(pattern);
      if (match) {
        const wordsStr = match[1] || match[0].replace(/[()]/g, '');
        const words = wordsStr.split(/[,;/•]|\s+and\s+/).map(w => w.trim().replace(/^['"]|['"]$/g, '')).filter(w => w.length > 0 && !/^(?:the|following|words|below|using)$/i.test(w));
        if (words.length >= 2) {
          bank = words;
          instruction = instruction.replace(match[0], '').trim();
          break;
        }
      }
    }
  }

  // Catch the "box" pattern like "(word1, word2, ...)" at the very start of text
  if (bank.length === 0) {
    const startMatch = text.match(/^\s*\(([^)]{10,})\)/);
    if (startMatch) {
      const words = startMatch[1].split(/[,;/•]|\s+and\s+/).map(w => w.trim().replace(/\*/g, '')).filter(w => w.length > 2);
      if (words.length >= 2) {
        bank = words;
        text = text.replace(startMatch[0], '').trim();
      }
    }
  }

  return { 
    bank: bank.length > 0 ? bank : undefined, 
    cleanText: text, 
    cleanInstruction: instruction || undefined 
  };
}

/**
 * Common instruction patterns indicating fill-in-the-blank commands.
 */
const INSTRUCTION_STEM_PREFIXES = [
  /^(?:fill\s+in\s+the\s+blank(?:\s+space)?s?\s*(?:below|in\s+the\s+following\s+sentences?)?(?:\s+(?:with|using)\s+[^:.]+)?[:.]?\s*)/i,
  /^(?:complete\s+the\s+(?:following\s+)?(?:sentence[s]?|paragraph|passage|text|table|statements?)\s*(?:below)?(?:\s*by\s+filling\s+in\s+the\s+missing\s+(?:word[s]?|information|term[s]?))?(?:\s+(?:using|with)\s+[^:.]+)?[:.]?\s*)/i,
  /^(?:complétez\s+les\s+(?:phrases|textes|espaces)\s+(?:suivantes?|suivants?)?(?:\s+avec\s+[^:.]+)?[:.]?\s*)/i,
  /^(?:uzana\s+imyanya\s+yabigenewe[:.]?\s*)/i,
  /^(?:uzuza\s+imyanya\s+ikurikira[:.]?\s*)/i,
];

/**
 * Detects if a text string contains candidate-fillable elements.
 */
export function countFillableBlanks(text?: string): number {
  if (!text) return 0;
  const matches = text.match(BLANK_PATTERN_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Extracts all explicit FillableElement descriptors from a text string.
 */
export function extractFillableElementsFromText(text?: string): FillableElement[] {
  if (!text) return [];
  const elements: FillableElement[] = [];
  const regex = new RegExp(BLANK_PATTERN_REGEX.source, 'gi');
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    idx++;
    const raw = match[0];
    let expectedLength: 'short' | 'medium' | 'large' = 'medium';
    if (raw.length <= 4) expectedLength = 'short';
    else if (raw.length >= 15) expectedLength = 'large';

    elements.push({
      id: `blank_${idx}`,
      isCandidateFillable: true,
      expectedType: 'unknown',
      expectedLength,
      displayStyle: 'inline',
      rawMatched: raw,
      index: match.index,
    });
  }

  return elements;
}

/**
 * Separates merged instruction from question text stem if AI combined them into one block.
 */
export function separateInstructionAndStem(text: string): { instruction?: string; cleanText: string } {
  if (!text) return { cleanText: '' };

  let trimmed = text.trim();

  for (const pattern of INSTRUCTION_STEM_PREFIXES) {
    const match = trimmed.match(pattern);
    if (match && match[0]) {
      const instructionText = match[0].replace(/[:\s]+$/, '.').trim();
      let remainder = trimmed.slice(match[0].length).trim();

      // Ensure we do not truncate into broken fragments like "spaces with..."
      if (/^spaces\s+with/i.test(remainder)) {
        continue;
      }

      // If remainder was left empty or is short, check if it had subquestions
      if (remainder.length > 0) {
        return {
          instruction: instructionText,
          cleanText: remainder,
        };
      }
    }
  }

  return { cleanText: trimmed };
}

/**
 * Unwraps whole-sentence bolding (e.g. "**The capital of Rwanda is ______**") so that ONLY the fillable blank is bold.
 */
export function unwrapWholeQuestionBolding(text: string): string {
  if (!text) return text;
  let trimmed = text.trim();

  // Check if text starts with ** and ends with ** without internal **
  if (/^\*\*(?!\*)[^\*]+\*\*$/.test(trimmed)) {
    // Unwrap the outer **
    const inner = trimmed.slice(2, -2).trim();

    // Bold any blanks inside
    const boldedInner = inner.replace(/(_{2,}|[─—–]{2,}|\.{4,}|\[\s*\]|\[blank\])/g, '**__________**');
    return boldedInner;
  }

  return text;
}

/**
 * Formats inline blanks in text to guarantee bold fillable element formatting.
 * Preserves punctuation directly adjacent to the blank.
 * Added adaptive line length based on matched type.
 */
export function formatFillableBlanksInText(text: string): string {
  if (!text) return text;

  // Split text into bold spans (**...**) vs normal text
  const parts = text.split(/(\*\*[^\*]+\*\*)/g);
  const formattedParts = parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return part; // keep existing bold spans untouched
    }
    
    // Replace various gap markers with a standardized bold dotted line
    return part.replace(
      /(_{2,}|[─—–]{2,}|\.{3,}|\[\s*\]|\[blank\]|\{\s*blank\s*\}|\{\s*\}|\(\s*blank\s*\)|\(\s*\.\.\.\s*\)|\(\s*[a-z0-9]\s*\)\s*[\.]|(?<=\s|^)\.{3,}(?=\s|[,.!?:;]|$)|(?<=\s|^)[\.]{2,}\s*\[[^\]]+\])/gi,
      (match) => {
        // Strategy C: If it's an indexed NESA gap (a)., preserve the index inside the dots or nearby
        if (/\([a-z0-9]\)\s*[\.]/.test(match)) {
          const index = match.match(/\(([a-z0-9])\)/i)?.[1] || '';
          return `**(${index}) ...................................**`;
        }
        
        // If it's a bracketed transformation [WORD], preserve the word
        if (/\[[^\]]+\]/.test(match)) {
          const bracketContent = match.match(/\[([^\]]+)\]/)?.[1] || '';
          return `**................................... [${bracketContent}]**`;
        }

        // Standard gap
        return '**...................................**';
      }
    );
  });

  return formattedParts.join('');
}

/**
 * Clean AI-generated numbering prefixes embedded in text (e.g. "(a)", "1.", "a)", "A.", "(b) (a)").
 * Strategy A: Be careful not to strip gaps that look like labels but are followed by dots.
 */
export function stripEmbeddedSubQuestionLabels(text: string): string {
  if (!text) return '';
  
  // If the label is followed by dots, it's likely a gap, not a subquestion label leak
  if (/\([a-z0-9]\)\s*[\.]/.test(text.trim())) {
    return text.trim();
  }

  let clean = text.trim();

  // Strip duplicate labels like "(a) (a) The process..."
  clean = clean.replace(/^(?:\([a-z0-9]+\)\s*){2,}/i, (m) => {
    const firstMatch = m.match(/\([a-z0-9]+\)/i);
    return firstMatch ? firstMatch[0] + ' ' : '';
  });

  // Strip leading numbering
  clean = clean.replace(/^(?:[a-z0-9]+[\.\)]\s*|\([a-z0-9]+\)\s*)+/i, '').trim();

  return clean;
}

/**
 * Validates a Fill-in-the-Blank question against the NESA Fill-in-the-Blank Contract.
 */
export function validateFillBlankQuestionContract(
  q: Question,
  context?: { subjectName?: string; parentQuestion?: Question }
): FillBlankValidationResult {
  const issues: FillBlankValidationIssue[] = [];
  const text = q.text || '';
  const subQs = q.subQuestions || [];
  const hasTable = Boolean(q.tableData && q.tableData.rows && q.tableData.rows.length >= 2);

  let totalBlanks = countFillableBlanks(text);

  // Check sub-questions for blanks
  subQs.forEach((subQ, idx) => {
    const subBlanks = countFillableBlanks(subQ.text);
    totalBlanks += subBlanks;

    // Check for label leakage in sub-question text
    if (subQ.text && /^(?:[a-z0-9]+[\.\)]|\([a-z0-9]+\))/i.test(subQ.text.trim())) {
      issues.push({
        field: `subQuestions[${idx}].text`,
        code: 'LABEL_LEAK',
        message: `Sub-question ${idx + 1} contains hardcoded numbering prefix in text.`,
        severity: 'Medium',
        autoFixable: true,
      });
    }

    // Check for duplicate sub-question instruction
    if (subQ.instruction && q.instruction) {
      const normParent = cleanInstructionFormatting(q.instruction).toLowerCase();
      const normChild = cleanInstructionFormatting(subQ.instruction).toLowerCase();
      if (normChild === normParent || /^(fill in the blank|complete the sentence|uzuza imyanya)$/i.test(normChild)) {
        issues.push({
          field: `subQuestions[${idx}].instruction`,
          code: 'REDUNDANT_INSTRUCTION',
          message: `Sub-question ${idx + 1} unnecessarily repeats parent instruction.`,
          severity: 'Low',
          autoFixable: true,
        });
      }
    }
  });

  // Check table cells if present
  let candidateCellCount = 0;
  if (hasTable && q.tableData?.rows) {
    const rows = q.tableData.rows;

    // Check header row for accidental blanks
    const headerRow = rows[0] || [];
    for (let c = 0; c < headerRow.length; c++) {
      if (isCandidateAnswerCell(headerRow[c])) {
        issues.push({
          field: `tableData.rows[0][${c}]`,
          code: 'HEADER_BLANKED_OUT',
          message: `Table header cell at column ${c + 1} is incorrectly formatted as a candidate blank.`,
          severity: 'Critical',
          autoFixable: false,
        });
      }
    }

    // Check data rows
    for (let r = 1; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (isCandidateAnswerCell(rows[r][c])) {
          candidateCellCount++;
        }
      }
    }
    totalBlanks += candidateCellCount;
  }

  // Check overall candidate fillable presence
  if (totalBlanks === 0) {
    issues.push({
      field: 'text',
      code: 'NO_FILLABLE_ELEMENT',
      message: 'Fill-in-the-blank question contains 0 candidate fillable elements or blanks.',
      severity: 'Critical',
      autoFixable: true,
    });
  }

  // Check if instruction is merged in main stem text
  const sep = separateInstructionAndStem(text);
  if (sep.instruction && (!q.instruction || q.instruction.trim() === '')) {
    issues.push({
      field: 'text',
      code: 'INSTRUCTION_MERGED',
      message: 'Instruction is merged inside question stem text instead of separate instruction field.',
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // Check for whole-question bolding defect
  if (/^\*\*(?!\*)[^\*]+\*\*$/.test(text.trim())) {
    issues.push({
      field: 'text',
      code: 'WHOLE_QUESTION_BOLD',
      message: 'Entire question text is formatted in bold instead of bolding only the fillable elements.',
      severity: 'Low',
      autoFixable: true,
    });
  }

  return {
    isValid: issues.filter((i) => i.severity === 'Critical' || i.severity === 'High').length === 0,
    issues,
    blankCount: totalBlanks,
  };
}

/**
 * Helper to normalize and expand raw word bank words into clean, individual strings.
 */
export function normalizeWordBankWords(rawWords?: string[]): string[] {
  if (!rawWords || rawWords.length === 0) return [];

  const result: string[] = [];

  for (const item of rawWords) {
    if (!item) continue;
    let cleanStr = item.replace(/[\*\_\(\)\[\]]/g, '').trim();
    if (!cleanStr) continue;

    // Split by common delimiters if glued together or delimited
    if (cleanStr.includes(',') || cleanStr.includes('/') || cleanStr.includes(';') || cleanStr.includes('•')) {
      const parts = cleanStr.split(/[,/;•]|\s+and\s+|\s+or\s+/i);
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed && !result.includes(trimmed)) {
          result.push(trimmed);
        }
      }
    } else if (cleanStr.includes(' ')) {
      const parts = cleanStr.split(/\s+/);
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed && !result.includes(trimmed)) {
          result.push(trimmed);
        }
      }
    } else {
      // Single continuous string — check if it's CamelCase or concatenated capital words (e.g., OXYMORONHYPERBOLE or SUPPLANT...)
      if (/^[A-Z]{12,}$/.test(cleanStr) || /^[A-Z][a-z]+[A-Z]/.test(cleanStr)) {
        const parts = cleanStr.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);
        if (parts.length > 1) {
          for (const p of parts) {
            const trimmed = p.trim();
            if (trimmed && !result.includes(trimmed)) {
              result.push(trimmed);
            }
          }
        } else {
          result.push(cleanStr);
        }
      } else {
        result.push(cleanStr);
      }
    }
  }

  return result;
}

/**
 * Sanitizes a Fill-in-the-Blank question to ensure compliance with NESA Fill-in-the-Blank Contract.
 */
export function sanitizeFillBlankQuestion(
  q: Question,
  context?: { subjectName?: string }
): FillBlankSanitizationResult {
  const sanitized: Question = JSON.parse(JSON.stringify(q));
  sanitized.type = 'fill_blank';
  const repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[] = [];
  const fixes: string[] = [];

  // Strategy B: Extract Word Bank
  const bankResult = extractWordBank(sanitized);

  if (sanitized.text) sanitized.text = deepCleanText(sanitized.text);
  if (sanitized.instruction) sanitized.instruction = deepCleanText(sanitized.instruction);

  if (bankResult.bank) {
    sanitized.wordBank = normalizeWordBankWords(bankResult.bank);
    sanitized.text = bankResult.cleanText;
    if (bankResult.cleanInstruction) {
      sanitized.instruction = bankResult.cleanInstruction;
    }
    fixes.push('Extracted word bank from text/instruction.');
  } else if (sanitized.wordBank) {
    sanitized.wordBank = normalizeWordBankWords(sanitized.wordBank);
  }

  // Ensure that if a word bank is present without explicit blanks or sub-questions, a valid Cloze passage with numbered blanks is provided
  if (sanitized.wordBank && sanitized.wordBank.length > 0 && (!(sanitized as any).subQuestions || (sanitized as any).subQuestions.length === 0) && !sanitized.tableData) {
    if (!sanitized.text || countFillableBlanks(sanitized.text) === 0) {
      const blanks = sanitized.wordBank.map((_, idx) => `**................................... (${idx + 1})**`).join(' ');
      sanitized.text = `Complete the passage by inserting the correct word into each numbered space:\n\n${blanks}`;
      fixes.push('Generated structured blank spaces for word bank cloze question.');
    }
  }

  // Ensure sanitized.text is populated if question has tableData or instruction
  if ((!sanitized.text || sanitized.text.trim() === '') && (sanitized.tableData || sanitized.instruction)) {
    sanitized.text = sanitized.instruction || 'Complete the table below by filling in the missing information.';
    fixes.push('Set fallback question stem text for table/instruction fill_blank question.');
  }

  // 0. Extract embedded subquestions if present in stem text
  if (sanitized.text && (!sanitized.subQuestions || sanitized.subQuestions.length === 0)) {
    const split = splitEmbeddedSubQuestions(sanitized.text, 'fill_blank', sanitized.id || 'fill', sanitized.marks || 0);
    if (split.subQuestions && split.subQuestions.length > 0) {
      sanitized.text = split.stimulus || sanitized.instruction || '';
      sanitized.subQuestions = split.subQuestions;
      fixes.push('Extracted embedded fill-in-the-blank sub-questions into structured sub-items.');
    }
  }

  // 1. Separate merged instruction from question text stem
  if (sanitized.text) {
    const sep = separateInstructionAndStem(sanitized.text);
    if (sep.instruction) {
      if (!sanitized.instruction) {
        sanitized.instruction = sep.instruction;
      }
      sanitized.text = sep.cleanText;
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'INSTRUCTION_MERGED',
        actionTaken: 'Separated instruction header from question text stem.',
      });
      fixes.push('Separated instruction from question stem.');
    }
  }

  // 2. Unwrap whole-sentence bolding
  if (sanitized.text) {
    const unwrapped = unwrapWholeQuestionBolding(sanitized.text);
    if (unwrapped !== sanitized.text) {
      sanitized.text = unwrapped;
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'WHOLE_QUESTION_BOLD',
        actionTaken: 'Unwrapped whole-sentence bolding to retain normal question typography.',
      });
      fixes.push('Unwrapped whole-sentence bolding.');
    }
  }

  // 3. Format fillable blanks to be bold and clean
  if (sanitized.text) {
    sanitized.text = formatFillableBlanksInText(sanitized.text);
  }

  // 4. Sanitize sub-questions if present
  if (sanitized.subQuestions && sanitized.subQuestions.length > 0) {
    const parentInstNorm = cleanInstructionFormatting(sanitized.instruction || '').toLowerCase();

    sanitized.subQuestions = sanitized.subQuestions.map((subQ, idx) => {
      const copy = { ...subQ };

      // Subquestions should never carry individual wordBank boxes below every line
      if (copy.wordBank) {
        delete (copy as any).wordBank;
        fixes.push(`Removed sub-question level wordBank from item ${idx + 1}.`);
      }

      // Format non-MCQ options directly into the sentence stem as inline choice parentheses
      if ((copy as any).options && Array.isArray((copy as any).options) && (copy as any).options.length > 0 && copy.type !== 'mcq') {
        const optionStrings = (copy as any).options.map((o: any) => typeof o === 'string' ? o : o.text).filter(Boolean);
        if (optionStrings.length >= 2) {
          const choicePattern = ` (${optionStrings.join(' / ')})`;
          if (copy.text && !copy.text.includes(choicePattern.trim())) {
            copy.text = copy.text.replace(/\.\s*$/, '') + choicePattern;
            fixes.push(`Formatted inline choices into sentence stem for sub-question ${idx + 1}.`);
          }
        }
        delete (copy as any).options;
      }

      // Strip embedded AI numbering prefix
      if (copy.text) {
        const cleanedText = stripEmbeddedSubQuestionLabels(copy.text);
        if (cleanedText !== copy.text) {
          copy.text = cleanedText;
          fixes.push(`Stripped AI numbering prefix from sub-question ${idx + 1}.`);
        }

        // Unwrap whole-sentence bolding on sub-question
        copy.text = unwrapWholeQuestionBolding(copy.text);

        // Format fillable blanks
        copy.text = formatFillableBlanksInText(copy.text);
      }

      // Deduplicate sub-question instruction if redundant
      if (copy.instruction) {
        const childNorm = cleanInstructionFormatting(copy.instruction).toLowerCase();
        if (childNorm === parentInstNorm || 
              /^(fill in the blank|complete the sentence|uzuza imyanya|complete the following|choose the correct|fill in each blank|fill in the blanks|complete the statement)/i.test(childNorm) ||
              (parentInstNorm && childNorm.includes(parentInstNorm)) ||
              (parentInstNorm && parentInstNorm.includes(childNorm))
          ) {
            copy.instruction = undefined;
            fixes.push(`Removed redundant instruction from sub-question ${idx + 1}.`);
          }
      }

      // For inline fill-in-the-blank items, set answerSpace to 'none' to avoid double-line redundancy
      const hasSubSub = copy.subQuestions && copy.subQuestions.length > 0;
      if (!hasSubSub && (countFillableBlanks(copy.text) > 0 || copy.type === 'fill_blank')) {
        copy.answerSpace = 'none';
      }

      return copy;
    });
  } else {
    // If standalone question has inline blanks in text, set answerSpace to 'none' to avoid double-line redundancy
    if ((countFillableBlanks(sanitized.text) > 0 || sanitized.type === 'fill_blank') && !sanitized.tableData) {
      sanitized.answerSpace = 'none';
    }
  }

  // 5. If no blanks found anywhere in a fill_blank question, add a default inline blank
  const totalBlanks =
    countFillableBlanks(sanitized.text) +
    (sanitized.subQuestions || []).reduce((acc, sq) => acc + countFillableBlanks(sq.text), 0) +
    (sanitized.tableData?.rows ? sanitized.tableData.rows.length : 0);

  if (totalBlanks === 0 && (!sanitized.subQuestions || sanitized.subQuestions.length === 0)) {
    if (sanitized.text && !sanitized.text.includes('**__________**')) {
      sanitized.text += ' **__________**';
      fixes.push('Added missing candidate fillable blank to question stem.');
    }
  }

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
