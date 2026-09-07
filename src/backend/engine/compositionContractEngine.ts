import { Question, SubQuestion, QuestionOption } from '../../types.js';
import { cleanInstructionFormatting } from './instructionEngine.js';
import { normalizeLanguage } from '../../utils/languageUtils.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export interface CompositionValidationIssue {
  field: string;
  code:
    | 'REQUIRED_MISSING'
    | 'TOPIC_MISSING'
    | 'INSTRUCTION_MERGED_INTO_TOPIC'
    | 'TOPICS_MISSING'
    | 'TOPICS_MERGED'
    | 'ANSWER_SPACE_MISSING'
    | 'INSUFFICIENT_ANSWER_SPACE'
    | 'TASK_MERGED'
    | 'MARKS_LEAKED_IN_TEXT'
    | 'AI_NUMBERING_LEAK'
    | 'INSTRUCTION_DUPLICATED'
    | 'EXCESSIVE_FORMATTING'
    | 'BOILERPLATE_LABEL_PRESENT'
    | 'INSTRUCTION_REDUNDANT'
    | 'INVALID_STRUCTURE';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface CompositionValidationResult {
  isValid: boolean;
  issues: CompositionValidationIssue[];
}

export interface CompositionSanitizationResult {
  sanitized: Question;
  repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Regex detecting leading boilerplate labels in AI-generated prompts.
 */
export const BOILERPLATE_LABEL_REGEX = /^(?:(?:question(?:\s*\d+)?(?:\s*:\s*(?:essay|composition))?|part(?:\s*[a-d0-9]+)?(?:\s*:\s*(?:essay|composition))?|essay|composition|instruction[s]?|consigne|note|nb|amabwiriza|topic(?:\s*\d+)?|sujet(?:\s*\d+)?|ingingo(?:\s*ya\s*\d+)?|mada(?:\s*ya\s*\d+)?|option\s*[a-d0-9]+)(?:[:\s-]+|$))/i;

/**
 * Regex detecting marks leaked in topic/question text like (20 marks), [15 marks], (25 points), (amanota 20).
 */
export const LEAKED_MARKS_REGEX = /[\(\[]\s*(?:\d+\s*(?:marks?|pts?|points?|amanota)|amanota\s*\d+)\s*[\)\]]/gi;

/**
 * Regex matching leading instruction clauses in English, French, Kinyarwanda, Kiswahili.
 */
export const LEADING_INSTRUCTION_REGEX = /^(?:(?:write|compose)\s+(?:a|an)\s+(?:[a-z-]+\s+)?(?:composition|essay|story|letter|article|report|piece\s+of\s+writing)|(?:choose|select|attempt)\s+(?:one|1|any)\s+(?:topic|of\s+the\s+following)|rédigez\s+(?:une|un)\s+(?:[a-z-]+\s+)?(?:composition|dissertation|rédaction|texte)|écrivez\s+(?:une|un)\s+(?:[a-z-]+\s+)?(?:composition|dissertation|texte)|(?:choisissez|traitez)\s+(?:un|l'un)\s+des\s+sujets|andika\s+(?:inyandiko|igihangano|insha)|hitamo\s+(?:imwe|ingingo\s+imwe)\s+mu\s+ngingo|andika\s+insha|chagua\s+mojawapo\s+ya\s+mada)\b[^.:\n]*[.:;]?/i;

/**
 * Cleans markdown formatting, HTML tags, boilerplate labels, and leaked marks from text.
 */
export function cleanCompositionText(text?: string): string {
  if (!text) return '';
  const lines = text
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/^#{1,6}\s*/gm, '') // Strip Markdown headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Strip bold markers
    .replace(/__([^_]+)__/g, '$1') // Strip underline markers
    .replace(LEAKED_MARKS_REGEX, '') // Strip leaked marks
    .split(/\r?\n/)
    .map((l) => {
      const trimmed = l.trim();
      // If line is solely a boilerplate label, drop it
      if (BOILERPLATE_LABEL_REGEX.test(trimmed) && trimmed.replace(BOILERPLATE_LABEL_REGEX, '').trim().length === 0) {
        return '';
      }
      return trimmed.replace(/[ \t]+/g, ' ');
    })
    .filter(Boolean);

  return lines.join('\n\n');
}

/**
 * Detects if text or instruction indicates topic options (e.g. "Choose one topic below", "Select one...", "Option A or Option B").
 */
export function requiresTopicChoices(text?: string, instruction?: string): boolean {
  const combined = `${instruction || ''} ${text || ''}`.toLowerCase();
  return (
    /choose (one|1|a|any) topic/i.test(combined) ||
    /select (one|1|a|any) topic/i.test(combined) ||
    /attempt (one|1|a|any) topic/i.test(combined) ||
    /write an? (?:essay|composition) on (?:one|1|any) (?:topic|of the following)/i.test(combined) ||
    /write an? (?:essay|composition) on (?:one|any) of the/i.test(combined) ||
    /on (?:one|1|any) topic/i.test(combined) ||
    /choose (one|1|any) of the following/i.test(combined) ||
    /choisissez (un|l'un) des sujets/i.test(combined) ||
    /traitez (un|l'un) des sujets/i.test(combined) ||
    /répondez à (un|l'un) des sujets/i.test(combined) ||
    /hitamo ingingo imwe/i.test(combined) ||
    /hitamo imwe mu ngingo/i.test(combined) ||
    /chagua mojawapo ya mada/i.test(combined)
  );
}

/**
 * Strips raw AI-generated topic prefixes like "A. ", "1. ", "(a) ", "Option 1: ", "Topic A: ", "Sujet 1: ".
 */
export function stripTopicLabelPrefix(topicText: string): string {
  return topicText
    .replace(/^(?:(?:Topic|Sujet|Ingingo|Mada|Option)\s*(?:[A-D0-9]+)?[:.]?\s*|[A-D0-9]+[\.\)]\s*|\([A-D0-9]+\)\s*)/i, '')
    .replace(LEAKED_MARKS_REGEX, '')
    .replace(BOILERPLATE_LABEL_REGEX, '')
    .replace(/^[:\s-]+/, '')
    .trim();
}

/**
 * Extracts topic choices embedded in text if they use A., B., C. or 1., 2., 3. or Either... Or... or line breaks.
 */
export function extractTopicsFromText(text: string): { mainStem: string; topics: string[]; extractedInstruction?: string } {
  if (!text) return { mainStem: '', topics: [] };

  let cleanText = text.replace(/<[^>]*>/g, '').replace(/^#{1,6}\s*/gm, '').trim();

  // Check for leading instruction
  let extractedInstruction: string | undefined;
  const leadInstMatch = cleanText.match(LEADING_INSTRUCTION_REGEX);
  if (leadInstMatch && leadInstMatch[0]) {
    extractedInstruction = leadInstMatch[0].trim();
  }

  const rawLines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const topics: string[] = [];
  const mainLines: string[] = [];

  const topicLineRegex = /^(?:[A-D][\.\)]|\d+[\.\)]|\([A-D0-9]\)|Option\s+[A-D0-9]+[:.]?|Topic\s+[A-D0-9]+[:.]?|Sujet\s+[A-D0-9]+[:.]?|Ingingo\s+ya\s+[0-9]+[:.]?|Mada\s+ya\s+[0-9]+[:.]?)\s*(.+)$/i;
  const inlineSplitLookahead = /(?=(?:^|\s+)(?:[1-9][\.\)]|[A-D][\.\)]|Option\s+[A-D0-9]+[:.]?|Topic\s+[A-D0-9]+[:.]?|Sujet\s+[A-D0-9]+[:.]?|Ingingo\s+ya\s+[0-9]+[:.]?|Mada\s+ya\s+[0-9]+[:.]?)\s+)/i;

  for (const line of rawLines) {
    const match = line.match(topicLineRegex);
    if (match && match[1]) {
      // Check if line contains further inline topics, e.g. "1. Topic One 2. Topic Two"
      const inlineParts = line.split(/(?=\s+[1-9][\.\)]\s+|\s+[A-D][\.\)]\s+|\s+Option\s+[A-D0-9]+[:.]?\s+|\s+Topic\s+[A-D0-9]+[:.]?\s+|\s+Sujet\s+[A-D0-9]+[:.]?\s+)/i);
      if (inlineParts.length >= 2) {
        inlineParts.forEach((part) => {
          const stripped = stripTopicLabelPrefix(part.trim());
          if (stripped.length > 0) topics.push(stripped);
        });
      } else {
        const stripped = stripTopicLabelPrefix(match[1].trim());
        if (stripped.length > 0) topics.push(stripped);
      }
    } else {
      // Check if this un-numbered line actually contains inline numbered topics
      const inlineParts = line.split(inlineSplitLookahead).filter((p) => p.trim());
      if (inlineParts.length >= 2 && inlineParts.some((p) => topicLineRegex.test(p.trim()))) {
        inlineParts.forEach((part) => {
          if (topicLineRegex.test(part.trim())) {
            const stripped = stripTopicLabelPrefix(part.trim());
            if (stripped.length > 0) topics.push(stripped);
          } else {
            mainLines.push(part.trim());
          }
        });
      } else {
        mainLines.push(line);
      }
    }
  }

  // If topics were found, return stem + topics
  if (topics.length >= 2) {
    return {
      mainStem: mainLines.join('\n\n'),
      topics,
      extractedInstruction,
    };
  }

  return { mainStem: text, topics: [], extractedInstruction };
}

/**
 * Separates instruction and topic text for a single-topic composition question.
 */
export function separateSingleTopicAndInstruction(
  text: string,
  existingInstruction?: string
): { instruction?: string; topicText: string } {
  if (!text) return { instruction: existingInstruction, topicText: '' };

  let clean = cleanCompositionText(text);

  // If explicit instruction already exists, ensure topicText doesn't duplicate it
  if (existingInstruction && existingInstruction.trim().length > 0) {
    const cleanInst = cleanInstructionFormatting(existingInstruction).toLowerCase();
    if (clean.toLowerCase().startsWith(cleanInst)) {
      clean = clean.substring(cleanInst.length).replace(/^[:\s-]+/, '').trim();
    }
    return {
      instruction: existingInstruction,
      topicText: stripTopicLabelPrefix(clean),
    };
  }

  // Check if text begins with a recognizable instruction pattern
  const match = clean.match(LEADING_INSTRUCTION_REGEX);
  if (match && match[0]) {
    const inst = match[0].trim().replace(/[:\s]+$/, '');
    const remainder = clean.substring(match[0].length).replace(/^[:\s-]+/, '').trim();
    return {
      instruction: inst,
      topicText: stripTopicLabelPrefix(remainder.length > 0 ? remainder : inst),
    };
  }

  // If text starts with "INSTRUCTION: ... TOPIC: ..."
  const instTopicMatch = clean.match(/^(?:instruction[s]?|consigne)[:\s]+(.*?)(?:\s+(?:topic|sujet|ingingo|mada)[:\s]+(.*))$/i);
  if (instTopicMatch) {
    return {
      instruction: instTopicMatch[1].trim(),
      topicText: stripTopicLabelPrefix(instTopicMatch[2].trim()),
    };
  }

  return {
    instruction: undefined,
    topicText: stripTopicLabelPrefix(clean),
  };
}

/**
 * Validates a Composition / Essay question against the NESA Composition Contract.
 */
export function validateCompositionQuestionContract(
  q: Question,
  context?: { subjectName?: string; parentQuestion?: Question }
): CompositionValidationResult {
  const issues: CompositionValidationIssue[] = [];
  const text = q.text || '';
  const inst = q.instruction || q.leadInstruction || '';

  // 1. Check for empty question
  const hasOptions = Boolean(q.options && q.options.length >= 2);
  const hasSubQs = Boolean(q.subQuestions && q.subQuestions.length >= 1);
  if (!text.trim() && !hasOptions && !hasSubQs) {
    issues.push({
      field: 'text',
      code: 'REQUIRED_MISSING',
      message: 'Composition/Essay question is missing topic text or options.',
      severity: 'Critical',
      autoFixable: false,
    });
    return { isValid: false, issues };
  }

  // 2. Check Topic Choice requirement
  const needsTopics = requiresTopicChoices(text, inst);
  const extracted = extractTopicsFromText(text);
  const hasEmbeddedTopics = extracted.topics.length >= 2;

  if (needsTopics && !hasOptions && !hasEmbeddedTopics) {
    issues.push({
      field: 'options',
      code: 'TOPICS_MISSING',
      message: 'Instruction specifies choosing a topic, but no distinct topic choices were provided.',
      severity: 'Critical',
      autoFixable: true,
    });
  }

  // 3. Check if topic choices were merged into one paragraph or line
  if (/(?:[A-D]\.\s*.*?[\s\n][B-D]\.\s*.*?)|(?:1\.\s*.*?[\s\n]2\.\s*.*?)/i.test(text) && !hasOptions) {
    issues.push({
      field: 'text',
      code: 'TOPICS_MERGED',
      message: 'Topic choices are merged into a single text block instead of distinct options array.',
      severity: 'High',
      autoFixable: true,
    });
  }

  // 4. Check if instruction is merged directly into topic text without separation
  if (!inst && LEADING_INSTRUCTION_REGEX.test(text) && text.length > 80) {
    issues.push({
      field: 'instruction',
      code: 'INSTRUCTION_MERGED_INTO_TOPIC',
      message: 'Composition instruction is merged directly into the topic prompt rather than structured in instruction field.',
      severity: 'High',
      autoFixable: true,
    });
  }

  // 5. Check for leaked marks inside text or options
  if (LEAKED_MARKS_REGEX.test(text)) {
    issues.push({
      field: 'text',
      code: 'MARKS_LEAKED_IN_TEXT',
      message: 'Mark annotation (e.g. "(20 marks)") is embedded directly inside topic text.',
      severity: 'High',
      autoFixable: true,
    });
  }

  if (q.options && q.options.some((opt) => LEAKED_MARKS_REGEX.test(opt.text))) {
    issues.push({
      field: 'options',
      code: 'MARKS_LEAKED_IN_TEXT',
      message: 'Mark annotation is embedded directly inside one or more topic options.',
      severity: 'High',
      autoFixable: true,
    });
  }

  // 6. Check for AI numbering leaks in options
  if (q.options && q.options.some((opt) => /^(?:[A-D0-9]+[\.\)]|\([A-D0-9]+\)|Option\s+[A-D0-9][:.]?)/i.test(opt.text.trim()))) {
    issues.push({
      field: 'options',
      code: 'AI_NUMBERING_LEAK',
      message: 'Raw AI numbering prefix (e.g. "1.", "A.") is hardcoded in option text.',
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // 7. Check for merged Outline + Composition tasks
  const isOutlineAndComposition =
    /outline.*composition|composition.*outline|plan.*essay|essay.*plan/i.test(`${inst} ${text}`);
  if (isOutlineAndComposition && !hasSubQs) {
    issues.push({
      field: 'subQuestions',
      code: 'TASK_MERGED',
      message: 'Question requires both an outline and a composition, but they are merged into one prompt without separate sub-questions.',
      severity: 'Medium',
      autoFixable: true,
    });
  }

  // 8. Check Answer Space
  const leafSubQs = q.subQuestions || [];
  if (leafSubQs.length === 0) {
    if (!q.answerSpace || q.answerSpace === 'none' || q.answerSpace === 'small') {
      issues.push({
        field: 'answerSpace',
        code: 'ANSWER_SPACE_MISSING',
        message: `Composition/Essay question requires a large or xlarge answer space, found '${q.answerSpace || 'none'}'.`,
        severity: 'Critical',
        autoFixable: true,
      });
    }
  } else {
    // Check answer space on leaf subquestions
    leafSubQs.forEach((subQ, idx) => {
      if (!subQ.answerSpace || subQ.answerSpace === 'none') {
        issues.push({
          field: `subQuestions[${idx}].answerSpace`,
          code: 'ANSWER_SPACE_MISSING',
          message: `Composition task ${idx + 1} requires an explicit answer space.`,
          severity: 'High',
          autoFixable: true,
        });
      }
    });
  }

  return {
    isValid: issues.filter((i) => i.severity === 'Critical' || i.severity === 'High').length === 0,
    issues,
  };
}

/**
 * Sanitizes a Composition / Essay question to guarantee compliance with the NESA Composition Contract.
 */
export function sanitizeCompositionQuestion(
  q: Question,
  context?: { subjectName?: string; parentQuestion?: Question }
): CompositionSanitizationResult {
  const sanitized: Question = JSON.parse(JSON.stringify(q));
  const repairLogs: { questionId: string; violatedRule: string; actionTaken: string }[] = [];
  const fixes: string[] = [];

  const rawText = sanitized.text || '';
  const rawInst = sanitized.instruction || '';

  // 0. Global Deep Clean
  if (sanitized.text) {
    const cleaned = deepCleanText(sanitized.text);
    if (cleaned !== sanitized.text) {
      sanitized.text = cleaned;
      fixes.push(`Deep cleaned composition text (removed slop/tags)`);
    }
  }

  // 1. Clean Markdown headers, full-bold wrapping, and leaked marks from text
  const cleanRawText = cleanCompositionText(rawText);
  if (cleanRawText !== rawText) {
    sanitized.text = cleanRawText;
    repairLogs.push({
      questionId: sanitized.id,
      violatedRule: 'FORMATTING_POLLUTION',
      actionTaken: 'Cleaned Markdown headers, bolding artifacts, and boilerplate labels from topic text.',
    });
    fixes.push('Cleaned formatting pollution and boilerplate labels.');
  }

  // 2. Extract embedded topics if present in text and options are empty
  const extracted = extractTopicsFromText(sanitized.text || '');
  const hasExtractedTopics = extracted.topics.length >= 2;
  const needsTopics = requiresTopicChoices(sanitized.text, sanitized.instruction) || hasExtractedTopics;

  if (hasExtractedTopics && (!sanitized.options || sanitized.options.length < 2)) {
    if (!sanitized.instruction && extracted.extractedInstruction) {
      sanitized.instruction = extracted.extractedInstruction;
    }
    sanitized.text = extracted.mainStem || (sanitized.instruction ? '' : 'Choose ONE of the following topics:');
    sanitized.options = extracted.topics.map((topicText, idx) => ({
      id: `opt_${idx + 1}`,
      text: stripTopicLabelPrefix(cleanCompositionText(topicText)),
    }));
    repairLogs.push({
      questionId: sanitized.id,
      violatedRule: 'TOPICS_MERGED',
      actionTaken: 'Extracted topic choices from main text into structured options array with clean topic text.',
    });
    fixes.push('Structured embedded topics into discrete options array.');
  } else if (sanitized.options && sanitized.options.length > 0) {
    // Check if these are meaningful topic choices (with actual descriptive prompt text) or dummy MCQ options
    const hasMeaningfulTopics =
      sanitized.options.length >= 2 &&
      sanitized.options.every((o) => {
        const stripped = stripTopicLabelPrefix(o.text).trim();
        return stripped.split(/\s+/).length >= 3 || stripped.length >= 15;
      });

    if (!hasMeaningfulTopics && !needsTopics) {
      delete (sanitized as any).options;
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'FORBIDDEN_PROPERTY',
        actionTaken: 'Stripped MCQ options from essay question.',
      });
      fixes.push('Stripped forbidden options from essay question.');
    }
  }

  // 3. For single topic question, separate leading instruction from topic text if needed
  if (!sanitized.options || sanitized.options.length === 0) {
    const separated = separateSingleTopicAndInstruction(sanitized.text, sanitized.instruction);
    if (separated.instruction && !sanitized.instruction) {
      sanitized.instruction = separated.instruction;
      sanitized.text = separated.topicText;
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'INSTRUCTION_MERGED_INTO_TOPIC',
        actionTaken: 'Separated instruction and topic prompt into distinct structural nodes.',
      });
      fixes.push('Separated instruction from topic prompt.');
    } else if (separated.topicText && separated.topicText !== sanitized.text) {
      sanitized.text = separated.topicText;
    }
  }

  // 4. Clean up options prefixes and leaked marks ("A. Topic" -> "Topic")
  if (sanitized.options && sanitized.options.length > 0) {
    sanitized.options = sanitized.options.map((opt) => {
      const cleanText = stripTopicLabelPrefix(cleanCompositionText(opt.text));
      return {
        ...opt,
        text: cleanText,
      };
    });
  }

  // 5. Ensure proper answer space for composition question
  if (!sanitized.subQuestions || sanitized.subQuestions.length === 0) {
    if (!sanitized.answerSpace || sanitized.answerSpace === 'none' || sanitized.answerSpace === 'small') {
      sanitized.answerSpace = 'xlarge';
      repairLogs.push({
        questionId: sanitized.id,
        violatedRule: 'ANSWER_SPACE_MISSING',
        actionTaken: "Set answerSpace to 'xlarge' for composition question.",
      });
      fixes.push("Set answerSpace to 'xlarge'.");
    }
  } else {
    // Leaf sub-questions in composition/essay should have at least large or xlarge
    sanitized.subQuestions = sanitized.subQuestions.map((subQ) => {
      if (!subQ.answerSpace || subQ.answerSpace === 'none') {
        return { ...subQ, answerSpace: 'large' } as SubQuestion;
      }
      return subQ;
    });
  }

  // 6. Split merged Outline + Composition into separate sub-questions if indicated
  const isOutlineAndComposition =
    /prepare an outline.*write a composition|write an outline.*write a composition|essay plan.*composition/i.test(
      `${sanitized.instruction || ''} ${sanitized.text || ''}`
    );
  if (isOutlineAndComposition && (!sanitized.subQuestions || sanitized.subQuestions.length === 0)) {
    sanitized.subQuestions = [
      {
        id: `${sanitized.id}_a`,
        parentId: sanitized.id,
        number: 1,
        text: 'Prepare a structured outline for your selected composition topic.',
        marks: Math.max(2, Math.floor(sanitized.marks * 0.2)),
        type: 'short',
        answerSpace: 'large',
        numberingStyle: 'alpha-lower',
      },
      {
        id: `${sanitized.id}_b`,
        parentId: sanitized.id,
        number: 2,
        text: 'Write your composition based on the outline prepared in (a).',
        marks: Math.max(5, Math.ceil(sanitized.marks * 0.8)),
        type: 'essay',
        answerSpace: 'xlarge',
        numberingStyle: 'alpha-lower',
      },
    ];
    fixes.push('Separated merged outline and composition tasks into distinct sub-questions.');
  }

  return {
    sanitized,
    repairLogs,
    fixes,
    isRejected: false,
  };
}
