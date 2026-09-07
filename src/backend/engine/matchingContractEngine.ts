import { Question, TableData } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export type MatchingPattern =
  | 'term_definition'
  | 'concept_example'
  | 'cause_effect'
  | 'item_function'
  | 'event_date'
  | 'person_contribution'
  | 'symbol_meaning'
  | 'scientific_structure_function'
  | 'language_translation'
  | 'extra_option_set'
  | 'reusable_option'
  | 'direct';

export interface MatchingPatternResult {
  primaryPattern: MatchingPattern;
  detectedPatterns: MatchingPattern[];
}

export interface MatchingValidationIssue {
  field: string;
  code:
    | 'REQUIRED_MISSING'
    | 'INVALID_ITEM_COUNT'
    | 'DUPLICATE_LEFT_ITEM'
    | 'DUPLICATE_RIGHT_OPTION'
    | 'LABEL_LEAK'
    | 'UNMATCHED_MAPPING'
    | 'AMBIGUOUS_MATCH'
    | 'REUSE_VIOLATION'
    | 'WHOLE_QUESTION_BOLD'
    | 'INSTRUCTION_MERGED'
    | 'REDUNDANT_INSTRUCTION'
    | 'INSTRUCTION_MISMATCH'
    | 'MISSING_STIMULUS'
    | 'FORBIDDEN_PROPERTY';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface MatchingValidationResult {
  isValid: boolean;
  issues: MatchingValidationIssue[];
  patternInfo: MatchingPatternResult;
}

export interface MatchingMapping {
  leftId: string;
  leftText?: string;
  rightId?: string;
  correctRightId: string;
  rightText?: string;
}

export interface MatchingSanitizationResult {
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
 * Regex to detect hardcoded alphanumeric option/number prefixes in matching items.
 * Handles: "1.", "1)", "(1)", "A.", "a)", "(A)", "i.", etc.
 */
export const MATCHING_LABEL_PREFIX_REGEX =
  /^(?:\(?[a-zA-Z0-9]+\)?[\.\)]\s*|[a-zA-Z0-9]+\.\s+)/i;

/**
 * Regex for instructions merged into matching question stems.
 */
const MERGED_MATCHING_INSTRUCTIONS = [
  /^(?:match\s+(?:the|each|all)?\s*(?:item|term|concept|word|statement|cause|event|symbol|structure)[s]?\s*(?:in\s+column\s+[a-z0-9]+\s*)?(?:with|to)\s*(?:its|the|their)?\s*(?:correct|appropriate|corresponding)?\s*(?:definition|example|effect|function|date|contribution|meaning|translation|item|option)[s]?\s*(?:in\s+column\s+[a-z0-9]+)?[:.]?\s*)/i,
  /^(?:associez\s+(?:les|chaque)?\s*éléments?\s*(?:de\s+la\s+colonne\s+[a-z0-9]+\s*)?à\s*(?:ceux|ce)?\s*(?:de\s+la\s+colonne\s+[a-z0-9]+)?[:.]?\s*)/i,
  /^(?:hanisha\s+ibintu\s+byo\s+mu\s+nkingi\s+ya\s+[a-z0-9]+\s+n'ibyo\s+mu\s+nkingi\s+ya\s+[a-z0-9]+[:.]?\s*)/i,
];

/**
 * Strips hardcoded prefixes like "1.", "A.", "a)" from matching item text.
 */
export function stripMatchingPrefix(text?: string): string {
  if (!text) return '';
  return text.trim().replace(MATCHING_LABEL_PREFIX_REGEX, '').trim();
}

/**
 * Unwraps whole-sentence bolding from matching question stem or items.
 */
export function unwrapWholeMatchingBolding(text: string): string {
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
 * Detects matching pattern family from question structure, headers, and stem.
 */
export function detectMatchingPattern(q: Question): MatchingPatternResult {
  const text = (q.text || '').trim();
  const lowerText = text.toLowerCase();
  const detected: MatchingPattern[] = [];

  const headers = q.tableData?.rows?.[0] || [];
  const headerA = (headers[0] || '').toLowerCase().trim();
  const headerB = (headers[1] || '').toLowerCase().trim();

  const rows = q.tableData?.rows ? q.tableData.rows.slice(1) : [];
  const leftItems = rows.map((r) => r[0]).filter(Boolean);
  const rightOptions = rows.map((r) => r[1]).filter(Boolean);

  // Check for Extra Option Set pattern
  if (rightOptions.length > leftItems.length) {
    detected.push('extra_option_set');
  }

  // Check for Reusable Option pattern
  const allowReuse =
    Boolean((q as any).allowReuse) ||
    Boolean((q as any).reuseAllowed) ||
    /can be used more than once|may be used more than once|peut être utilisé plus d'une fois/i.test(
      (q.instruction || '') + ' ' + text
    );

  if (allowReuse) {
    detected.push('reusable_option');
  }

  // Specific domain pattern matching by headers & keywords
  if (
    headerA.includes('term') ||
    headerB.includes('definition') ||
    /\b(term|definition|meaning of terms)\b/i.test(lowerText)
  ) {
    detected.push('term_definition');
  } else if (
    headerA.includes('concept') ||
    headerB.includes('example') ||
    /\b(concept|example|instance)\b/i.test(lowerText)
  ) {
    detected.push('concept_example');
  } else if (
    headerA.includes('cause') ||
    headerB.includes('effect') ||
    /\b(cause|effect|consequence|impact)\b/i.test(lowerText)
  ) {
    detected.push('cause_effect');
  } else if (
    headerA.includes('item') ||
    headerA.includes('device') ||
    headerA.includes('tool') ||
    headerB.includes('function') ||
    headerB.includes('use') ||
    /\b(device|tool|instrument|function|use|purpose)\b/i.test(lowerText)
  ) {
    detected.push('item_function');
  } else if (
    headerA.includes('event') ||
    headerB.includes('date') ||
    headerB.includes('year') ||
    headerB.includes('period') ||
    /\b(event|date|year|timeline|period|era)\b/i.test(lowerText)
  ) {
    detected.push('event_date');
  } else if (
    headerA.includes('person') ||
    headerA.includes('scientist') ||
    headerA.includes('author') ||
    headerB.includes('contribution') ||
    headerB.includes('discovery') ||
    headerB.includes('achievement') ||
    /\b(person|scientist|author|leader|contribution|discovery|invented)\b/i.test(lowerText)
  ) {
    detected.push('person_contribution');
  } else if (
    headerA.includes('symbol') ||
    headerB.includes('meaning') ||
    headerA.includes('element') ||
    headerB.includes('symbol') ||
    /\b(symbol|sign|notation|chemical symbol|element symbol)\b/i.test(lowerText)
  ) {
    detected.push('symbol_meaning');
  } else if (
    headerA.includes('structure') ||
    headerA.includes('organ') ||
    headerA.includes('cell') ||
    headerB.includes('function') ||
    /\b(structure|organelle|tissue|organ|anatomical|physiological function)\b/i.test(lowerText)
  ) {
    detected.push('scientific_structure_function');
  } else if (
    headerA.includes('word') ||
    headerA.includes('phrase') ||
    headerB.includes('translation') ||
    headerB.includes('meaning') ||
    /\b(translate|translation|synonym|antonym|french|english|kinyarwanda|meaning)\b/i.test(lowerText)
  ) {
    detected.push('language_translation');
  }

  if (detected.length === 0) {
    detected.push('direct');
  }

  return {
    primaryPattern: detected[0],
    detectedPatterns: detected,
  };
}

/**
 * Validates a matching question against the core matching contract.
 */
export function validateMatchingQuestionContract(
  q: Question,
  options?: { subjectName?: string }
): MatchingValidationResult {
  const issues: MatchingValidationIssue[] = [];
  const patternInfo = detectMatchingPattern(q);

  const tableData = q.tableData;
  const rows = tableData?.rows || [];

  // Check if first row is a header or a content row
  let isFirstRowHeader = true;
  if (rows.length > 0) {
    const firstRowLeft = (rows[0][0] || '').trim();
    const firstRowRight = (rows[0][1] || '').trim();
    if (
      MATCHING_LABEL_PREFIX_REGEX.test(firstRowLeft) ||
      MATCHING_LABEL_PREFIX_REGEX.test(firstRowRight)
    ) {
      isFirstRowHeader = false;
    }
  }

  const headers = isFirstRowHeader && rows.length > 0 ? rows[0] : ['Column A', 'Column B'];
  const contentRows = isFirstRowHeader ? rows.slice(1) : rows;

  const leftItems = contentRows.map((r) => r[0]).filter((x) => x !== undefined && x !== '');
  const rightOptions = contentRows.map((r) => r[1]).filter((x) => x !== undefined && x !== '');

  // 1. Required elements check
  if (!tableData || rows.length < 2 || leftItems.length < 2) {
    issues.push({
      field: 'tableData',
      code: 'REQUIRED_MISSING',
      message: `Matching question requires 'tableData' with at least 2 rows (Column A items & Column B options).`,
      severity: 'Critical',
      autoFixable: true,
    });
  }

  if (rightOptions.length < 2) {
    issues.push({
      field: 'tableData.columnB',
      code: 'INVALID_ITEM_COUNT',
      message: `Matching question Column B must contain at least 2 options.`,
      severity: 'Critical',
      autoFixable: true,
    });
  }

  // 2. Column A item count vs Column B option count
  if (leftItems.length > rightOptions.length) {
    issues.push({
      field: 'tableData',
      code: 'INVALID_ITEM_COUNT',
      message: `Matching Column A has ${leftItems.length} items but Column B only has ${rightOptions.length} options. Right column options cannot be fewer than left items.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  // 3. Duplicate items check
  const leftSet = new Map<string, number>();
  leftItems.forEach((item, idx) => {
    const norm = stripMatchingPrefix(item).toLowerCase();
    if (leftSet.has(norm)) {
      issues.push({
        field: `tableData.columnA[${idx}]`,
        code: 'DUPLICATE_LEFT_ITEM',
        message: `Matching Column A contains duplicate item: "${item}".`,
        severity: 'Critical',
        autoFixable: true,
      });
    } else {
      leftSet.set(norm, idx);
    }
  });

  const rightSet = new Map<string, number>();
  rightOptions.forEach((opt, idx) => {
    const norm = stripMatchingPrefix(opt).toLowerCase();
    if (rightSet.has(norm)) {
      issues.push({
        field: `tableData.columnB[${idx}]`,
        code: 'DUPLICATE_RIGHT_OPTION',
        message: `Matching Column B contains duplicate option: "${opt}".`,
        severity: 'Critical',
        autoFixable: true,
      });
    } else {
      rightSet.set(norm, idx);
    }
  });

  // 4. Check for label leak / hardcoded prefix leakage
  leftItems.forEach((item, idx) => {
    if (item && MATCHING_LABEL_PREFIX_REGEX.test(item.trim())) {
      issues.push({
        field: `tableData.columnA[${idx}]`,
        code: 'LABEL_LEAK',
        message: `Matching Column A item contains hardcoded prefix: "${item.slice(0, 15)}..."`,
        severity: 'Medium',
        autoFixable: true,
      });
    }
  });

  rightOptions.forEach((opt, idx) => {
    if (opt && MATCHING_LABEL_PREFIX_REGEX.test(opt.trim())) {
      issues.push({
        field: `tableData.columnB[${idx}]`,
        code: 'LABEL_LEAK',
        message: `Matching Column B option contains hardcoded prefix: "${opt.slice(0, 15)}..."`,
        severity: 'Medium',
        autoFixable: true,
      });
    }
  });

  // 5. Answer Mappings check
  const mappings: MatchingMapping[] = (q as any).mappings || [];
  if (mappings.length > 0) {
    const allowReuse = patternInfo.detectedPatterns.includes('reusable_option');
    const usedRightIds = new Set<string>();

    mappings.forEach((m, idx) => {
      if (!m.leftId || !m.correctRightId) {
        issues.push({
          field: `mappings[${idx}]`,
          code: 'UNMATCHED_MAPPING',
          message: `Matching mapping ${idx + 1} is missing leftId or correctRightId.`,
          severity: 'Critical',
          autoFixable: true,
        });
      } else {
        if (!allowReuse) {
          if (usedRightIds.has(m.correctRightId)) {
            issues.push({
              field: `mappings[${idx}].correctRightId`,
              code: 'REUSE_VIOLATION',
              message: `Option "${m.correctRightId}" is reused across multiple left items when reuse is not permitted.`,
              severity: 'High',
              autoFixable: true,
            });
          }
          usedRightIds.add(m.correctRightId);
        }
      }
    });
  }

  // 6. Whole-question bolding check
  if (q.text && q.text.trim().startsWith('**') && q.text.trim().endsWith('**')) {
    issues.push({
      field: 'text',
      code: 'WHOLE_QUESTION_BOLD',
      message: `Matching question stem is wrapped in whole-sentence bolding.`,
      severity: 'Low',
      autoFixable: true,
    });
  }

  // 7. Forbidden properties (e.g., options array for MCQ)
  if (q.options && Array.isArray(q.options) && q.options.length > 0) {
    issues.push({
      field: 'options',
      code: 'FORBIDDEN_PROPERTY',
      message: `Matching question contains forbidden 'options' array.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  // 8. Stimulus / Diagram validation
  const referencesDiagram = /\b(diagram|figure|circuit|structure)\b/i.test(q.text || '');
  const hasDiagramAsset = Boolean(q.svgData || q.mermaidData || q.smilesData);
  if (referencesDiagram && !hasDiagramAsset) {
    issues.push({
      field: 'diagram',
      code: 'MISSING_STIMULUS',
      message: `Matching question references a diagram or structure in text, but no valid diagram asset (svgData/mermaidData/smilesData) is present.`,
      severity: 'Medium',
      autoFixable: false,
    });
  }

  const isValid = !issues.some((i) => i.severity === 'Critical');

  return {
    isValid,
    issues,
    patternInfo,
  };
}

/**
 * Sanitizes and repairs a matching question according to contract rules.
 */
export function sanitizeMatchingQuestion(
  q: Question,
  options?: {
    subjectName?: string;
    parentInstruction?: string;
  }
): MatchingSanitizationResult {
  const repairLogs: {
    questionId: string;
    violatedRule: string;
    actionTaken: string;
    originalValue?: any;
    newValue?: any;
  }[] = [];
  const fixes: string[] = [];
  const qId = q.id || 'matching_q';

  // Deep clone question
  const sanitized: Question = JSON.parse(JSON.stringify(q));

  // 0. Global Deep Clean
  if (sanitized.text) {
    const cleaned = deepCleanText(sanitized.text);
    if (cleaned !== sanitized.text) {
      sanitized.text = cleaned;
      fixes.push(`Deep cleaned matching text (removed slop/tags)`);
    }
  }

  // 1. Split embedded sub-questions if not already a parent
  if ((!sanitized.subQuestions || sanitized.subQuestions.length === 0) && sanitized.text) {
    const split = splitEmbeddedSubQuestions(sanitized.text, 'matching', qId, sanitized.marks || 0);
    if (split.subQuestions) {
      sanitized.text = split.stimulus;
      sanitized.subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from matching block`);
      // Recursively sanitize
      return sanitizeMatchingQuestion(sanitized, options);
    }
  }

  // 1. Critical structural safety check
  if (typeof sanitized.marks === 'number' && sanitized.marks <= 0) {
    return {
      sanitized,
      repairLogs,
      fixes,
      isRejected: true,
      rejectionReason: `Unsafe structural error in matching Q${sanitized.number || ''}: Invalid or non-positive marks value: ${sanitized.marks}`,
    };
  }

  // 2. Handle missing tableData / Convert forbidden options array to tableData if needed
  if (sanitized.text) sanitized.text = deepCleanText(sanitized.text);
  if (sanitized.instruction) sanitized.instruction = deepCleanText(sanitized.instruction);

  if (!sanitized.tableData || !sanitized.tableData.rows || sanitized.tableData.rows.length === 0) {
    if (sanitized.options && Array.isArray(sanitized.options) && sanitized.options.length >= 2) {
      // Build tableData from options if tableData was missing
      const rows: string[][] = [['Column A', 'Column B']];
      const mid = Math.ceil(sanitized.options.length / 2);
      const leftOpts = sanitized.options.slice(0, mid);
      const rightOpts = sanitized.options.slice(mid);

      const maxLen = Math.max(leftOpts.length, rightOpts.length);
      for (let i = 0; i < maxLen; i++) {
        const leftText = leftOpts[i] ? stripMatchingPrefix(leftOpts[i].text) : '';
        const rightText = rightOpts[i] ? stripMatchingPrefix(rightOpts[i].text) : '';
        rows.push([leftText, rightText]);
      }

      sanitized.tableData = { rows };
      repairLogs.push({
        questionId: qId,
        violatedRule: 'CONVERT_OPTIONS_TO_TABLE_DATA',
        actionTaken: 'Converted options array to matching tableData',
        originalValue: sanitized.options,
        newValue: sanitized.tableData,
      });
      fixes.push(`Converted options array to matching tableData for Q${sanitized.number || ''}`);
      delete (sanitized as any).options;
    } else {
      return {
        sanitized,
        repairLogs,
        fixes,
        isRejected: true,
        rejectionReason: `Unsafe structural error in matching Q${sanitized.number || ''}: Missing required 'tableData' matching structure.`,
      };
    }
  } else if (sanitized.options) {
    // Strip forbidden options array if tableData already exists
    repairLogs.push({
      questionId: qId,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden options array from matching question',
      originalValue: (sanitized as any).options,
      newValue: undefined,
    });
    fixes.push(`Stripped forbidden 'options' from matching Q${(sanitized as any).number || ''}`);
    delete (sanitized as any).options;
  }

  // 3. Clean headers and items in tableData
  const originalRows = sanitized.tableData.rows || [];
  let isFirstRowHeader = true;
  if (originalRows.length > 0) {
    const firstRowLeft = (originalRows[0][0] || '').trim();
    const firstRowRight = (originalRows[0][1] || '').trim();
    if (
      MATCHING_LABEL_PREFIX_REGEX.test(firstRowLeft) ||
      MATCHING_LABEL_PREFIX_REGEX.test(firstRowRight)
    ) {
      isFirstRowHeader = false;
    }
  }

  let headers = isFirstRowHeader && originalRows.length > 0 ? originalRows[0] : ['Column A', 'Column B'];
  if (headers.length < 2) {
    headers = [headers[0] || 'Column A', 'Column B'];
  }

  // Clean headers
  headers = [stripMatchingPrefix(headers[0]), stripMatchingPrefix(headers[1])];

  const contentRows = isFirstRowHeader ? originalRows.slice(1) : originalRows;
  const cleanedRows: string[][] = [headers];

  const seenLeft = new Set<string>();
  const seenRight = new Set<string>();

  contentRows.forEach((row, rIdx) => {
    let rawLeft = (row[0] || '').trim();
    let rawRight = (row[1] || '').trim();

    let cleanLeft = stripMatchingPrefix(rawLeft);
    let cleanRight = stripMatchingPrefix(rawRight);

    cleanLeft = unwrapWholeMatchingBolding(cleanLeft);
    cleanRight = unwrapWholeMatchingBolding(cleanRight);

    if (rawLeft !== cleanLeft || rawRight !== cleanRight) {
      repairLogs.push({
        questionId: qId,
        violatedRule: 'LABEL_LEAK',
        actionTaken: `Stripped hardcoded label prefix/formatting in matching row ${rIdx + 1}`,
        originalValue: [rawLeft, rawRight],
        newValue: [cleanLeft, cleanRight],
      });
      fixes.push(`Stripped label prefix from matching item in Q${sanitized.number || ''}`);
    }

    // Skip blank rows or duplicate left items
    const normLeft = cleanLeft.toLowerCase();
    const normRight = cleanRight.toLowerCase();

    if (cleanLeft || cleanRight) {
      if (normLeft && seenLeft.has(normLeft)) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'DUPLICATE_LEFT_ITEM',
          actionTaken: `Removed duplicate left item "${cleanLeft}" in row ${rIdx + 1}`,
        });
        fixes.push(`Removed duplicate left item in matching Q${sanitized.number || ''}`);
        return;
      }
      if (normLeft) seenLeft.add(normLeft);

      if (normRight && seenRight.has(normRight)) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'DUPLICATE_RIGHT_OPTION',
          actionTaken: `Removed duplicate right option "${cleanRight}" in row ${rIdx + 1}`,
        });
        fixes.push(`Removed duplicate right option in matching Q${sanitized.number || ''}`);
        return;
      }
      if (normRight) seenRight.add(normRight);

      cleanedRows.push([cleanLeft, cleanRight]);
    }
  });

  sanitized.tableData.rows = cleanedRows;

  // Verify minimum row count after cleaning
  if (cleanedRows.length < 3) {
    return {
      sanitized,
      repairLogs,
      fixes,
      isRejected: true,
      rejectionReason: `Unsafe structural error in matching Q${sanitized.number || ''}: Insufficient matching items after deduplication (found ${cleanedRows.length - 1}, minimum 2 required).`,
    };
  }

  // 4. Unwrap whole-sentence bolding in text & instruction
  if (sanitized.text) {
    const originalText = sanitized.text;
    sanitized.text = unwrapWholeMatchingBolding(sanitized.text);
    if (originalText !== sanitized.text) {
      repairLogs.push({
        questionId: qId,
        violatedRule: 'WHOLE_QUESTION_BOLD',
        actionTaken: 'Unwrapped whole-sentence bolding from matching question stem',
        originalValue: originalText,
        newValue: sanitized.text,
      });
      fixes.push(`Unwrapped whole-sentence bolding in matching Q${sanitized.number || ''}`);
    }
  }

  // 5. Instruction Engine & Redundancy Removal
  if (sanitized.text) {
    for (const pattern of MERGED_MATCHING_INSTRUCTIONS) {
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
          actionTaken: 'Separated merged matching instruction from stem',
          originalValue: match[0],
          newValue: sanitized.text,
        });
        fixes.push(`Separated merged matching instruction in Q${sanitized.number || ''}`);
        break;
      }
    }
  }

  // Clean instruction formatting
  if (sanitized.instruction) {
    sanitized.instruction = cleanInstructionFormatting(sanitized.instruction);

    // Check redundancy against parent instruction
    if (options?.parentInstruction) {
      const parentNorm = options.parentInstruction.trim().toLowerCase();
      const instNorm = sanitized.instruction.trim().toLowerCase();
      if (parentNorm.includes(instNorm) || instNorm.includes(parentNorm)) {
        repairLogs.push({
          questionId: qId,
          violatedRule: 'REDUNDANT_INSTRUCTION',
          actionTaken: 'Removed redundant matching instruction matching parent/section instruction',
          originalValue: sanitized.instruction,
          newValue: undefined,
        });
        fixes.push(`Removed redundant instruction in matching Q${sanitized.number || ''}`);
        sanitized.instruction = undefined;
      }
    }
  }

  // 6. Generate/Normalize structured mappings (internal answer key)
  const leftCount = cleanedRows.length - 1;
  const mappings: MatchingMapping[] = [];

  for (let i = 1; i <= leftCount; i++) {
    const leftText = cleanedRows[i][0];
    const rightText = cleanedRows[i][1];

    mappings.push({
      leftId: `item_${i}`,
      leftText,
      rightId: `opt_${i}`,
      correctRightId: `opt_${i}`,
      rightText,
    });
  }
  (sanitized as any).mappings = mappings;

  // 7. Enforce adequate answer space
  const isResponseColumnLayout =
    sanitized.layoutVariant === 'response-column' || (sanitized.presentation?.layout as string) === 'response-column';
  
  if (!isResponseColumnLayout) {
    if (!sanitized.answerSpace || sanitized.answerSpace === 'none') {
      sanitized.answerSpace = 'medium';
      fixes.push(`Set default 'medium' answer space for matching write-in.`);
    }
  } else {
    sanitized.answerSpace = 'none';
  }

  // Set default layout if missing
  if (!sanitized.layoutVariant) {
    sanitized.layoutVariant = 'traditional';
  }

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
