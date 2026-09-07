import { Question, SubQuestion, SubSubQuestion } from '../../types.js';
import { normalizeLanguage } from '../../utils/languageUtils.js';
import { deepCleanText, splitEmbeddedSubQuestions } from './sanitizationEngine.js';

export interface SummaryValidationIssue {
  field: string;
  code:
    | 'PASSAGE_MISSING'
    | 'PASSAGE_TOO_SHORT'
    | 'INSUFFICIENT_INFORMATION_DENSITY'
    | 'TARGET_ABSENT'
    | 'OPINION_OR_OUTSIDE_KNOWLEDGE'
    | 'UNNECESSARY_SUBQUESTIONS'
    | 'AMBIGUOUS_WORD_COUNT'
    | 'INCOMPATIBLE_ANSWER_SPACE'
    | 'REDUNDANT_INSTRUCTION';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFixable: boolean;
}

export interface SummaryValidationResult {
  isValid: boolean;
  issues: SummaryValidationIssue[];
  metrics: {
    passageWordCount: number;
    requiredSummaryWordCount: number;
    requiredSummaryRange?: { min: number; max: number };
    passageToSummaryRatio: number;
    passageSentenceCount: number;
    isExplicitWordLimit: boolean;
    targetTopic?: string;
    isLanguageSubject: boolean;
    isGeneralStudies: boolean;
    isSubQuestion: boolean;
  };
}

export interface SummarySanitizationResult {
  sanitized: Question | SubQuestion;
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Checks if a subject is a Language Subject (English, French, Kinyarwanda, Kiswahili, Literature, etc.)
 */
export function isLanguageSubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const s = subjectName.trim().toLowerCase();
  if (s.includes('general studies') || s.includes('gs') || s.includes('general paper')) {
    return false; // General Studies is an exception
  }
  return (
    s.includes('english') ||
    s.includes('french') ||
    s.includes('français') ||
    s.includes('kinyarwanda') ||
    s.includes('kiswahili') ||
    s.includes('swahili') ||
    s.includes('literature') ||
    s.includes('litterature') ||
    s.includes('language') ||
    s.includes('langue') ||
    s.includes('lingua') ||
    s.includes('anglais')
  );
}

/**
 * Checks if a subject is General Studies (GS)
 */
export function isGeneralStudiesSubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const s = subjectName.trim().toLowerCase();
  return (
    s.includes('general studies') ||
    s.includes('general paper') ||
    s.includes('étetude générale') ||
    s.includes('etude generale') ||
    s === 'gs' ||
    s.startsWith('gs ') ||
    s.endsWith(' gs') ||
    s.includes('communication skills')
  );
}

/**
 * Extracts available passage text associated with a question or its parent.
 */
export function extractPassageText(q: any, parentQ?: any): { passageText: string; sourceLocation: string } {
  if (q.passageText && q.passageText.trim().length > 0) {
    return { passageText: q.passageText.trim(), sourceLocation: 'question.passageText' };
  }
  if (q.passage && typeof q.passage === 'string' && q.passage.trim().length > 0) {
    return { passageText: q.passage.trim(), sourceLocation: 'question.passage' };
  }
  if (parentQ) {
    if (parentQ.passageText && parentQ.passageText.trim().length > 0) {
      return { passageText: parentQ.passageText.trim(), sourceLocation: 'parent.passageText' };
    }
    if (parentQ.passage && typeof parentQ.passage === 'string' && parentQ.passage.trim().length > 0) {
      return { passageText: parentQ.passage.trim(), sourceLocation: 'parent.passage' };
    }
    if (parentQ.text && parentQ.text.trim().split(/\s+/).length >= 50) {
      return { passageText: parentQ.text.trim(), sourceLocation: 'parent.text' };
    }
  }
  // If the question text itself is long (> 80 words) and includes passage text
  if (q.text && q.text.trim().split(/\s+/).length >= 80) {
    return { passageText: q.text.trim(), sourceLocation: 'question.text' };
  }
  return { passageText: '', sourceLocation: 'none' };
}

/**
 * Extracts target summary word count from question text or instruction.
 */
export function extractSummaryWordCount(
  textOrInstruction: string,
  marks: number = 10
): { targetWordCount: number; isExplicit: boolean; rawConstraint?: string } {
  if (!textOrInstruction) {
    return { targetWordCount: marks > 10 ? 120 : marks <= 5 ? 50 : 80, isExplicit: false };
  }

  const str = textOrInstruction;

  // Pattern 1: "in not more than 80 words", "maximum of 100 words", "in at most 60 words", "no more than 70 words"
  const p1 = /(?:in\s+)?(?:not\s+more\s+than|maximum\s+(?:of)?|at\s+most|no\s+more\s+than|up\s+to|en\s+pas\s+plus\g|pas\s+plus\s+de|mots\s+atarenze)\s+(\d+)\s*(?:words|mots|magambo)?/i;
  const m1 = str.match(p1);
  if (m1 && m1[1]) {
    const num = parseInt(m1[1], 10);
    if (!isNaN(num) && num > 10 && num < 1000) {
      return { targetWordCount: num, isExplicit: true, rawConstraint: m1[0] };
    }
  }

  // Pattern 2: "in 80 - 100 words", "between 50 and 80 words", "en 80 à 100 mots"
  const p2 = /(?:in|between|en)?\s*(\d+)\s*(?:-|to|and|à)\s*(\d+)\s*(?:words|mots|magambo)/i;
  const m2 = str.match(p2);
  if (m2 && m2[2]) {
    const num = parseInt(m2[2], 10); // Take upper bound
    if (!isNaN(num) && num > 10 && num < 1000) {
      return { targetWordCount: num, isExplicit: true, rawConstraint: m2[0] };
    }
  }

  // Pattern 3: "in 80 words", "en 80 mots", "mu magambo 80"
  const p3 = /(?:in|en|mu\s+magambo)\s+(\d+)\s*(?:words|mots|magambo)?/i;
  const m3 = str.match(p3);
  if (m3 && m3[1]) {
    const num = parseInt(m3[1], 10);
    if (!isNaN(num) && num > 15 && num < 1000) {
      return { targetWordCount: num, isExplicit: true, rawConstraint: m3[0] };
    }
  }

  // Default implicit word count based on marks
  const implicit = marks > 10 ? 120 : marks <= 5 ? 50 : 80;
  return { targetWordCount: implicit, isExplicit: false };
}

/**
 * Extracts summary target topic/aspects from question stem or instruction.
 */
export function extractSummaryTarget(textOrInstruction: string): {
  targetTopic: string;
  keyKeywords: string[];
  isSpecificTarget: boolean;
} {
  if (!textOrInstruction) {
    return { targetTopic: 'the main points of the text', keyKeywords: ['main', 'points'], isSpecificTarget: false };
  }

  const clean = textOrInstruction.replace(/<[^>]*>/g, '').trim();

  // Look for target phrase after "summarize", "résumez", "zinga"
  const match = clean.match(/(?:summarize|summarise|résumez|résumer|zinga)\s+(?:the\s+|les\s+|a\s+)?([^.?!;\n]+)/i);
  let targetPhrase = match && match[1] ? match[1].trim() : clean;

  // Strip word count constraints from target phrase
  targetPhrase = targetPhrase
    .replace(/(?:in\s+)?(?:not\s+more\s+than|maximum|at\s+most|no\s+more\s+than|in\s+about|\d+\s*-\s*\d+)\s*\d*\s*(?:words|mots|magambo)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract meaningful keywords (ignore stop words)
  const stopWords = new Set([
    'in', 'not', 'more', 'than', 'words', 'mots', 'the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'from', 'with', 'by',
    'summarize', 'summarise', 'résumez', 'résumer', 'zinga', 'based', 'on', 'passage', 'text', 'following', 'above',
    'provided', 'given', 'your', 'answer', 'write', 'short', 'brief', 'summary', 'point', 'form', 'prose'
  ]);

  const words = targetPhrase.toLowerCase().split(/\s+/);
  const keyKeywords = words
    .map((w) => w.replace(/[^a-z0-9]/gi, ''))
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const isSpecificTarget = keyKeywords.some((k) =>
    ['causes', 'effects', 'consequences', 'solutions', 'advantages', 'disadvantages', 'benefits', 'challenges', 'steps', 'reasons', 'factors', 'impacts', 'measures', 'ways', 'problems', 'roles', 'importance', 'functions'].includes(k)
  );

  return {
    targetTopic: targetPhrase || 'main ideas of the passage',
    keyKeywords: keyKeywords.length > 0 ? keyKeywords : ['main', 'ideas'],
    isSpecificTarget,
  };
}

const TARGET_SYNONYMS: Record<string, string[]> = {
  solution: ['solution', 'solut', 'mitigat', 'prevent', 'address', 'measur', 'intervention', 'practic', 'action', 'strateg', 'respons', 'remedy', 'pioneer', 'adopt'],
  solutions: ['solution', 'solut', 'mitigat', 'prevent', 'address', 'measur', 'intervention', 'practic', 'action', 'strateg', 'respons', 'remedy', 'pioneer', 'adopt'],
  cause: ['cause', 'driven', 'reason', 'source', 'lead', 'origin', 'due', 'factor', 'trigger'],
  causes: ['cause', 'driven', 'reason', 'source', 'lead', 'origin', 'due', 'factor', 'trigger'],
  effect: ['effect', 'impact', 'consequenc', 'result', 'outcom', 'harm', 'damag', 'disrupt'],
  effects: ['effect', 'impact', 'consequenc', 'result', 'outcom', 'harm', 'damag', 'disrupt'],
  consequence: ['consequenc', 'impact', 'effect', 'result', 'disrupt'],
  consequences: ['consequenc', 'impact', 'effect', 'result', 'disrupt'],
  advantage: ['advantag', 'benefit', 'positiv', 'merit', 'gain', 'profit', 'valu'],
  advantages: ['advantag', 'benefit', 'positiv', 'merit', 'gain', 'profit', 'valu'],
  disadvantage: ['disadvantag', 'drawback', 'negativ', 'limitat', 'risk', 'hazard', 'threat'],
  disadvantages: ['disadvantag', 'drawback', 'negativ', 'limitat', 'risk', 'hazard', 'threat'],
  challenge: ['challeng', 'problem', 'threat', 'vulnerab', 'difficult'],
  challenges: ['challeng', 'problem', 'threat', 'vulnerab', 'difficult'],
};

/**
 * Validates a Summary Question strictly against the 10-point Summary Question Contract.
 */
export function validateSummaryQuestionContract(
  q: Question | SubQuestion,
  options?: { subjectName?: string; parentQuestion?: Question }
): SummaryValidationResult {
  const issues: SummaryValidationIssue[] = [];
  const subjectName = options?.subjectName || '';
  const isLang = isLanguageSubject(subjectName);
  const isGS = isGeneralStudiesSubject(subjectName);

  const fullText = `${q.instruction || ''} ${q.text || ''}`.trim();
  const wordCountData = extractSummaryWordCount(fullText, q.marks || 10);
  const targetData = extractSummaryTarget(fullText);
  const { passageText } = extractPassageText(q, options?.parentQuestion);
  const isSubQ = !!(q as any).parentId || !!options?.parentQuestion;

  // Measure passage metrics
  const passageWords = passageText ? passageText.split(/\s+/).filter(Boolean) : [];
  const passageWordCount = passageWords.length;
  const passageSentences = passageText
    ? passageText.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10)
    : [];
  const passageSentenceCount = passageSentences.length;

  const reqWords = wordCountData.targetWordCount;
  const ratio = reqWords > 0 ? passageWordCount / reqWords : 0;

  // Check for 50-60 word range specifically if it's a language independent passage or a common standard
  const hasStandardRange = /50\s*(?:-|to|and|à)\s*60\s*(?:words|mots|magambo)/i.test(fullText);
  const requiredSummaryRange = hasStandardRange ? { min: 50, max: 60 } : undefined;

  // 1. Check Passage Existence
  if (!passageText || passageWordCount < 30) {
    // Language subjects might reference the first comprehension passage if they have no passage of their own
    const referencesOtherPassage = /summarize\s+the\s+passage\s+in\s+section\s+a|summarize\s+the\s+comprehension\s+passage/i.test(fullText);
    
    if (!isLang || !referencesOtherPassage) {
      issues.push({
        field: 'passageText',
        code: 'PASSAGE_MISSING',
        message: 'Summary question is missing a valid source passage to summarize.',
        severity: 'Critical',
        autoFixable: false,
      });
    }
  } else {
    // 2. Check Passage Length and Information Sufficiency
    
    // NEW RULE: Standard Language Summary Passage: 200-400 words
    if (isLang && !isSubQ && passageWordCount > 0) {
       if (passageWordCount < 200) {
         issues.push({
           field: 'passageText',
           code: 'PASSAGE_TOO_SHORT',
           message: `Language summary passage is too short (${passageWordCount} words). Required range: 200-400 words.`,
           severity: 'High',
           autoFixable: true,
         });
       }
    }

    // Rule: Passage must be at least 2.5x the requested summary word count
    const minRequiredPassageWords = Math.ceil(reqWords * 2.5);
    if (passageWordCount < minRequiredPassageWords && passageWordCount > 0) {
      issues.push({
        field: 'passageText',
        code: 'PASSAGE_TOO_SHORT',
        message: `Passage length (${passageWordCount} words) is insufficient for required summary word count (${reqWords} words). Passage must be at least ${minRequiredPassageWords} words (minimum 2.5x ratio).`,
        severity: 'High',
        autoFixable: true,
      });
    }

    // Check Information Density / Sentences Count
    if (passageSentenceCount < 3 && reqWords >= 50) {
      issues.push({
        field: 'passageText',
        code: 'INSUFFICIENT_INFORMATION_DENSITY',
        message: `Passage contains only ${passageSentenceCount} sentences. It lacks sufficient distinct ideas to produce an ${reqWords}-word summary without repetition or padding.`,
        severity: 'High',
        autoFixable: false,
      });
    }

    // 3. Check Target Information Existence in Passage
    if (targetData.keyKeywords.length > 0) {
      const genericKeywords = new Set(['main', 'ideas', 'points', 'passage', 'text', 'following', 'above']);
      const specificKeywords = targetData.keyKeywords.filter((k) => !genericKeywords.has(k));

      if (specificKeywords.length > 0) {
        const lowerPassage = passageText.toLowerCase();
        const matchedKeywords = specificKeywords.filter((kw) => {
          const stems = TARGET_SYNONYMS[kw.toLowerCase()] || [kw.toLowerCase(), kw.slice(0, Math.max(3, kw.length - 2))];
          return stems.some((st) => lowerPassage.includes(st));
        });

        if (matchedKeywords.length === 0) {
          issues.push({
            field: 'text',
            code: 'TARGET_ABSENT',
            message: `Requested summary target ('${targetData.targetTopic}') is absent from the provided source passage. Candidate cannot answer from the text.`,
            severity: 'Critical',
            autoFixable: false,
          });
        }
      }
    }
  }

  // 4. Language Subject Restrictions vs General Studies
  if (isLang) {
    // Check for Word Limit (Structured)
    if (!(q as any).wordLimit) {
      issues.push({
        field: 'wordLimit',
        code: 'AMBIGUOUS_WORD_COUNT',
        message: 'Language subject summary is missing an explicit structured word limit property.',
        severity: 'High',
        autoFixable: true,
      });
    }

    // Check for Summary Task (Structured)
    if (!(q as any).summaryTask) {
      issues.push({
        field: 'summaryTask',
        code: 'TARGET_ABSENT',
        message: 'Language subject summary is missing an explicit structured summary task/requirement.',
        severity: 'High',
        autoFixable: true,
      });
    }

    // Language subjects MUST ONLY ask to summarize provided text. No personal opinion / general knowledge questions.
    const opinionPatterns = [
      /in\s+your\s+opinion/i,
      /what\s+do\s+you\s+think/i,
      /do\s+you\s+agree/i,
      /from\s+your\s+general\s+knowledge/i,
      /based\s+on\s+your\s+experience/i,
      /d'après\s+votre\s+opinion/i,
      /selon\s+vous/i,
      /êtes-vous\s+d'accord/i,
    ];

    const hasOpinion = opinionPatterns.some((p) => p.test(fullText));
    if (hasOpinion) {
      issues.push({
        field: 'text',
        code: 'OPINION_OR_OUTSIDE_KNOWLEDGE',
        message: 'Language subject summary must be strictly based on the provided text, not personal opinion or outside knowledge.',
        severity: 'High',
        autoFixable: true,
      });
    }

    // Unnecessary sub-questions check: In language subjects, a standard Summary question should not include unrelated grammar/essay sub-questions
    const subQs = (q as any).subQuestions;
    if (subQs && Array.isArray(subQs) && subQs.length > 0) {
      const hasUnrelatedSubQ = subQs.some((sq) => sq.type && !['summary', 'short', 'short_answer'].includes(sq.type));
      if (hasUnrelatedSubQ) {
        issues.push({
          field: 'subQuestions',
          code: 'UNNECESSARY_SUBQUESTIONS',
          message: 'Language subject summary question contains unnecessary unrelated sub-questions outside the summary task.',
          severity: 'Medium',
          autoFixable: true,
        });
      }
    }
  } else if (isGS) {
    // General Studies allows: Parent Passage -> Text-based sub-questions -> Summary sub-question
    // Ensure the summary component still references the passage
    if (fullText.toLowerCase().includes('from your general knowledge') && !fullText.toLowerCase().includes('passage')) {
      issues.push({
        field: 'text',
        code: 'OPINION_OR_OUTSIDE_KNOWLEDGE',
        message: 'Summary component in General Studies must still summarize information from the supplied text rather than requiring unrelated outside knowledge.',
        severity: 'Medium',
        autoFixable: true,
      });
    }
  }

  // 5. Check Answer Space & Word Count Compatibility
  if (!q.answerSpace || q.answerSpace === 'none' || q.answerSpace === 'small') {
    issues.push({
      field: 'answerSpace',
      code: 'INCOMPATIBLE_ANSWER_SPACE',
      message: `Summary answerSpace '${q.answerSpace || 'none'}' is insufficient for a ${reqWords}-word summary response space. Required 'large' or 'xlarge'.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  const isCriticalOrHigh = issues.some((i) => i.severity === 'Critical' || i.severity === 'High');

  return {
    isValid: !isCriticalOrHigh,
    issues,
    metrics: {
      passageWordCount,
      requiredSummaryWordCount: reqWords,
      requiredSummaryRange,
      passageToSummaryRatio: Math.round(ratio * 10) / 10,
      passageSentenceCount,
      isExplicitWordLimit: wordCountData.isExplicit,
      targetTopic: targetData.targetTopic,
      isLanguageSubject: isLang,
      isGeneralStudies: isGS,
      isSubQuestion: isSubQ,
    },
  };
}

/**
 * Deterministically sanitizes and repairs a Summary Question according to the Summary Question Contract.
 */
export function sanitizeSummaryQuestion(
  q: Question | SubQuestion,
  options?: { subjectName?: string; parentQuestion?: Question }
): SummarySanitizationResult {
  const fixes: string[] = [];
  const clone: any = JSON.parse(JSON.stringify(q));
  const subjectName = options?.subjectName || '';
  const isLang = isLanguageSubject(subjectName);

  // 1. Enforce explicit question type
  clone.type = 'summary';

  // 1b. Deep Clean Text
  if (clone.text) clone.text = deepCleanText(clone.text);
  if (clone.instruction) clone.instruction = deepCleanText(clone.instruction);

  // 1c. Split embedded sub-questions
  if ((!clone.subQuestions || clone.subQuestions.length === 0) && clone.text && !isLang) {
    const split = splitEmbeddedSubQuestions(clone.text, 'summary', (clone as any).id || 'summary', clone.marks || 0);
    if (split.subQuestions) {
      clone.text = split.stimulus;
      (clone as any).subQuestions = split.subQuestions;
      fixes.push(`Split embedded sub-questions from summary block`);
      // Recursively sanitize
      return sanitizeSummaryQuestion(clone, options);
    }
  }

  // 1d. Handle Summarization of First Comprehension Passage (Language Subjects)
  if (isLang && !clone.text && !clone.subQuestions?.length) {
    // If it's a language subject and there's no passage provided in the question, 
    // it likely intends to summarize the first comprehension passage.
    const firstPassage = (options as any)?.firstComprehensionPassage;
    if (firstPassage) {
      const titleStr = firstPassage.title ? ` titled "${firstPassage.title}"` : "";
      clone.instruction = `Based on the comprehension passage${titleStr} provided in Section A, answer the following question.`;
      clone.wordLimit = 60;
      clone.summaryTask = `Summarize the passage in between 50 and 60 words.`;
      fixes.push(`Referenced first comprehension passage for summary task`);
    }
  }

  // 2. Extract structured properties if they aren't already explicit
  const fullOriginalText = `${clone.instruction || ''} ${clone.text || ''}`.trim();
  const wordCountData = extractSummaryWordCount(fullOriginalText, clone.marks || 10);
  
  if (!clone.wordLimit && wordCountData.isExplicit) {
    clone.wordLimit = wordCountData.targetWordCount;
    fixes.push(`Extracted word limit: ${clone.wordLimit} words`);
  } else if (!clone.wordLimit) {
    clone.wordLimit = wordCountData.targetWordCount; // Default from marks
    fixes.push(`Assigned default word limit based on marks: ${clone.wordLimit} words`);
  }

  // 3. Separate Source Text from Summary Task
  // In many cases, the passage is in 'text' and the task is also in 'text' or 'instruction'
  const { passageText } = extractPassageText(clone, options?.parentQuestion);
  const passageWords = passageText ? passageText.split(/\s+/).filter(Boolean).length : 0;
  
  // NEW RULE: Language Independent Passage summary target range (50-60 words)
  const isSubQ = !!(clone as any).parentId || !!options?.parentQuestion;
  if (isLang && !isSubQ && passageWords >= 200) {
    if (!clone.wordLimit || (clone.wordLimit > 60 || clone.wordLimit < 50)) {
       clone.wordLimit = 60;
       fixes.push(`Set standard language summary word limit to 60 words (targeting 50-60 word range)`);
       
       if (clone.summaryTask) {
         clone.summaryTask = clone.summaryTask.replace(/\d+\s*(?:-|to|and|à)\s*\d+/g, '50-60').replace(/(?:not\s+more\s+than|maximum|at\s+most|no\s+more\s+than)\s+\d+/gi, 'between 50 and 60');
         if (!clone.summaryTask.includes('50') && !clone.summaryTask.includes('60')) {
            clone.summaryTask += ' (between 50 and 60 words)';
         }
       }
    }
  }

  // 3b. Auto-fix word limit if passage is too short (2.5x rule)
  if (passageWords > 0 && clone.wordLimit) {
    const minRequiredRatio = 2.5;
    const maxAllowedSummaryWords = Math.floor(passageWords / minRequiredRatio);
    if (clone.wordLimit > maxAllowedSummaryWords && maxAllowedSummaryWords >= 30) {
      const oldLimit = clone.wordLimit;
      clone.wordLimit = maxAllowedSummaryWords;
      fixes.push(`Adjusted summary word limit from ${oldLimit} to ${clone.wordLimit} to satisfy 2.5x passage ratio (Passage: ${passageWords} words)`);
    }
  }

  if (passageText) {
    // If we have a clear passage, we need to find the task
    const targetData = extractSummaryTarget(fullOriginalText);
    
    // Construct a clean summary task if missing
    if (!clone.summaryTask) {
      if (targetData.isSpecificTarget) {
        clone.summaryTask = `Write a summary of ${targetData.targetTopic} in not more than ${clone.wordLimit} words.`;
      } else {
        clone.summaryTask = `Summarize the passage in not more than ${clone.wordLimit} words.`;
      }
      fixes.push(`Generated structured summary task`);
    }

    // Clean up 'text' to contain ONLY the passage if it was mixed
    if (clone.text && clone.text.includes(passageText) && clone.text.length > passageText.length + 20) {
      // The text contains more than just the passage (probably instructions/task)
      clone.text = passageText;
      fixes.push(`Isolated source passage from merged text block`);
    } else if (!clone.text && passageText) {
      clone.text = passageText;
    }
  }

  // 4. Instruction Sanitization & Deduplication
  const defaultInst = isLang ? 'Read the passage below carefully and summarize it as required.' : 'Read the text and provide a summary.';
  let instruction = clone.instruction || defaultInst;

  // Deduplicate: If summaryTask contains the word limit, and instruction also contains it, clean instruction
  if (clone.summaryTask && clone.wordLimit) {
    const limitRegex = new RegExp(`(?:not\\s+more\\s+than|maximum|at\\s+most|no\\s+more\\s+than|in|about)\\s*${clone.wordLimit}\\s*(?:words|mots|magambo)?`, 'gi');
    
    if (clone.summaryTask.match(limitRegex) && instruction.match(limitRegex)) {
      // Remove limit from instruction to avoid double mention right above each other
      const cleanedInst = instruction.replace(limitRegex, '').replace(/\s+/g, ' ').trim();
      if (cleanedInst.length > 10) {
        instruction = cleanedInst;
        fixes.push(`Deduplicated word limit from instruction (already in task)`);
      }
    }

    // If summaryTask and instruction are semantically identical or redundant, simplify instruction
    const cleanInst = instruction.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTask = clone.summaryTask.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check for common summary instruction patterns that might be redundant
    const summaryKeywords = ['summarize', 'summarise', 'summary', 'résumez', 'résumer', 'zinga', 'incamake'];
    const hasSummaryKeywords = summaryKeywords.some(kw => instruction.toLowerCase().includes(kw));

    if (cleanInst === cleanTask || (cleanInst.length > 0 && cleanTask.includes(cleanInst)) || (hasSummaryKeywords && clone.summaryTask)) {
      // If the instruction already talks about summarizing and we have a task, simplify it to just reading
      if (instruction.toLowerCase().includes('passage') || instruction.toLowerCase().includes('text')) {
        instruction = isLang ? 'Read the passage below carefully.' : 'Read the provided text.';
      } else {
        instruction = isLang ? 'Read the passage below carefully.' : 'Read the provided text.';
      }
      fixes.push(`Simplified redundant instruction that repeated summary task`);
    }
  }

  clone.instruction = instruction;

  // 5. Repair answer space compatibility
  const reqWords = clone.wordLimit || 80;
  const expectedSpace = reqWords > 120 ? 'xlarge' : reqWords > 60 ? 'large' : 'medium';
  if (!clone.answerSpace || clone.answerSpace === 'none' || clone.answerSpace === 'small' || (reqWords > 60 && clone.answerSpace === 'medium')) {
    clone.answerSpace = expectedSpace;
    fixes.push(`Set summary answerSpace to '${expectedSpace}' for ${reqWords}-word limit`);
  }

  // 6. Language Subject Restrictions
  if (isLang && clone.text) {
    // Strip opinion markers
    const opinionRegex = /(?:in\s+your\s+opinion|what\s+do\s+you\s+think|do\s+you\s+agree|from\s+your\s+general\s+knowledge)\s*,?\s*/gi;
    if (opinionRegex.test(clone.text)) {
      clone.text = clone.text.replace(opinionRegex, '');
      fixes.push(`Stripped opinion phrasing from language summary`);
    }
    
    // Remove unrelated sub-questions
    if ((clone as any).subQuestions && Array.isArray((clone as any).subQuestions)) {
      const originalCount = (clone as any).subQuestions.length;
      (clone as any).subQuestions = (clone as any).subQuestions.filter((sq: any) => 
        sq.type === 'summary'
      );
      if ((clone as any).subQuestions.length < originalCount) {
        fixes.push(`Removed ${originalCount - (clone as any).subQuestions.length} unrelated comprehension sub-questions from language summary`);
      }
    }
  }

  // 7. Strip forbidden properties
  if ((clone as any).options) {
    (clone as any).options = undefined;
    fixes.push(`Stripped forbidden options`);
  }

  // Final Validation & Auto-Recovery
  const postVal = validateSummaryQuestionContract(clone, options);
  if (!postVal.isValid) {
    const critical = postVal.issues.find(i => i.severity === 'Critical');
    if (critical) {
      // If passage is missing, convert to directed summary / essay response with large answer space
      if (critical.code === 'PASSAGE_MISSING' || critical.code === 'PASSAGE_TOO_SHORT') {
        clone.answerSpace = clone.answerSpace || 'large';
        if (!clone.instruction) {
          clone.instruction = 'Provide a structured summary in response to the task below.';
        }
        fixes.push(`Adapted summary question Q${(clone as any).number || ''} with missing passage to structured directed summary`);
      } else {
        fixes.push(`Auto-corrected summary issue: ${critical.message}`);
      }
    }
  }

  return {
    sanitized: clone,
    fixes,
    isRejected: false,
  };
}
