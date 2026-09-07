/**
 * sanitizationEngine.ts
 * Global text cleaning logic for NESA Exam Builder to remove "AI Slop" and tag leaks.
 */

import { Question } from '../../types';
import { getQuestionSpec } from '../../utils/questionSpecs';
import { resolveInstruction, isSelfContainedQuestion, isGenericFillerInstruction } from '../../utils/defaultInstructions';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * Strips all HTML-like tags (e.g., <strong>, </strong>) that might have leaked from AI generation.
 */
export function fixTagLeaks(text: string): string {
  if (!text) return '';
  // Remove full tags like <strong>, <br />, etc.
  let cleaned = text.replace(/<\/?[a-z0-9]+[^>]*>/gi, '');
  // Specifically target common leaked strings that look like closing tags
  cleaned = cleaned.replace(/<\/?[a-z0-9]+\s*>/gi, '');
  cleaned = cleaned.replace(/<\/?strong>/gi, '');
  cleaned = cleaned.replace(/<\/?b>/gi, '');
  cleaned = cleaned.replace(/<\/?i>/gi, '');
  return cleaned;
}

/**
 * Normalizes bolding to ensure consistency and remove AI slop.
 */
export function normalizeBolding(text: string): string {
  if (!text) return '';
  let result = text;

  // 1. Unwrap whole-block bolding if the entire text is wrapped
  if (result.startsWith('**') && result.endsWith('**')) {
    const inner = result.slice(2, -2);
    if (!inner.includes('**')) {
      result = inner;
    }
  }

  // 2. Detect "Inconsistent Bolding" (too many small bold chunks)
  const boldChunks = result.match(/\*\*([^*]+)\*\*/g);
  if (boldChunks) {
    const totalWords = result.split(/\s+/).length;
    const boldWordCount = boldChunks.reduce((acc, chunk) => acc + chunk.split(/\s+/).length, 0);
    
    // If more than 40% of words are bolded, or there are > 3 isolated small bold chunks, it's likely slop
    if (boldWordCount > totalWords * 0.4 || (boldChunks.length > 3 && !result.includes('\n'))) {
       result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
    } else {
      // Remove tiny isolated bolding (1-2 chars or single common words)
      result = result.replace(/\*\*([^*]{1,2})\*\*/g, '$1');
      result = result.replace(/\b\*\*(the|a|an|of|in|to|is|at|on|for|all)\*\*\b/gi, '$1');
    }
  }

  // 3. Remove "trailing bold fragments" like (ALL</strong>
  result = result.replace(/<\/?[a-z0-9]+\s*>/gi, '');

  return result;
}

/**
 * Global deep-clean for any text field.
 */
export function deepCleanText(text: string): string {
  if (!text) return '';
  let result = text;
  
  // A. Kill Tag Leaks
  result = fixTagLeaks(result);
  
  // B. Normalize Bolding (Anti-Slop)
  result = normalizeBolding(result);
  
  // C. Punctuation Clean
  result = result.replace(/\.\.+/g, '...'); // Normalize ellipses
  result = result.replace(/\s+([.,!?;:])/g, '$1'); // Fix spaces before punctuation
  
  // D. Strip AI labels if they leaked
  result = result.replace(/^(?:Question|Answer|Note|Instruction):\s*/i, '');
  
  // E. Remove markdown headers if they are inside a paragraph
  result = result.replace(/^(?:#+\s*)+/gm, '');

  return result.trim();
}

/**
 * Splits a text block into a stimulus and sub-questions if it contains (a), (b) markers.
 */
export function splitEmbeddedSubQuestions(text: string, type: string, baseId: string, baseMarks: number): {
  stimulus: string;
  subQuestions?: any[];
} {
  if (!text) return { stimulus: '' };
  
  // Markers must be subquestion labels like (a)... (b)... or a)... b)... or (i)... (ii)... or (1)... (2)...
  const subqMarkerRegex = /(?:^|\s+)(?:\(([a-h])\)|\b([a-h])\)|\(([ivx]+)\)|\b([ivx]+)\)|\((\d{1,2})\)|\b(\d{1,2})\))\s+/gi;
  const matches = Array.from(text.matchAll(subqMarkerRegex));
  
  if (matches && matches.length >= 1) {
    const firstLabel = (matches[0][1] || matches[0][2] || matches[0][3] || matches[0][4] || matches[0][5] || matches[0][6] || '').toLowerCase();
    const secondLabel = matches.length >= 2
      ? (matches[1][1] || matches[1][2] || matches[1][3] || matches[1][4] || matches[1][5] || matches[1][6] || '').toLowerCase()
      : '';

    const isLetterSeqA = firstLabel === 'a' && secondLabel === 'b';
    const isLetterSeqB = firstLabel === 'b' && (secondLabel === 'c' || matches.length === 1);
    const isRomanSeq = firstLabel === 'i' && secondLabel === 'ii';
    const isNumSeq = firstLabel === '1' && secondLabel === '2';

    if (isLetterSeqA || isLetterSeqB || isRomanSeq || isNumSeq) {
      const parts = text.split(/(?:^|\s+)(?:\([a-h]\)|[a-h]\)|\([ivx]+\)|[ivx]+\)|\(\d{1,2}\)|\d{1,2}\))\s+/i);
      
      let stimulus = '';
      let childTexts: string[] = [];

      if (isLetterSeqB) {
        // parts[0] is sub-question (a), and parts[1...] are (b), (c)...
        childTexts = parts.map(p => p.trim()).filter(Boolean);
        stimulus = '';
      } else {
        // parts[0] is the introductory stem/stimulus (or empty if text started with (a))
        stimulus = parts[0].trim().replace(/[:\s]+$/, '');
        childTexts = parts.slice(1).map(p => p.trim()).filter(Boolean);
      }

      if (childTexts.length >= 2) {
        const subQs = childTexts.map((rawCt, idx) => {
          let ct = rawCt;
          let explicitMarks: number | undefined;
          const markMatch = ct.match(/\[(\d+)\s*(?:marks?|pts?|points?)\]/i) || ct.match(/\((\d+)\s*(?:marks?|pts?|points?)\)$/i);
          if (markMatch) {
            explicitMarks = parseInt(markMatch[1], 10);
            ct = ct.replace(markMatch[0], '').trim();
          }

          const fallbackMarks = Math.max(1, Math.floor(baseMarks / childTexts.length));
          return {
            id: `${baseId}_split_${idx + 1}`,
            number: idx + 1,
            text: ct,
            type: type,
            marks: explicitMarks !== undefined ? explicitMarks : fallbackMarks,
            answerSpace: 'medium',
            numberingStyle: isRomanSeq ? 'roman-lower' : isNumSeq ? 'decimal' : 'alpha-lower',
            visibleLabel: isRomanSeq 
              ? `(${['i','ii','iii','iv','v','vi','vii','viii'][idx] || (idx+1)})`
              : isNumSeq
              ? `(${idx + 1})`
              : `(${String.fromCharCode(97 + idx)})`
          };
        });
        return { stimulus, subQuestions: subQs };
      }
    }
  }
  
  return { stimulus: text };
}

/**
 * Sanitizes and verifies a SINGLE question object independently.
 * Removes duplicate/unimportant/contradictory rules, cleans layout attributes,
 * ensures canonical question type mapping, and standardizes structure for any subject.
 */
export function sanitizeSingleQuestion(
  q: any,
  language?: string,
  sectionInstruction?: string
): { question: any; fixes: string[] } {
  const fixes: string[] = [];
  const copy: Question = JSON.parse(JSON.stringify(q));
  const normLang = normalizeLanguage(language);

  // 1. Resolve canonical type
  const spec = getQuestionSpec(copy.type);
  const canonicalType = spec.id;
  if (copy.type !== canonicalType) {
    fixes.push(`Mapped question type '${copy.type}' to canonical '${canonicalType}'`);
    (copy as any).type = canonicalType;
  }

  // 2. Deep clean text fields
  if (copy.text) copy.text = deepCleanText(copy.text);
  if (copy.instruction) copy.instruction = deepCleanText(copy.instruction);
  if (copy.leadInstruction) copy.leadInstruction = deepCleanText(copy.leadInstruction);
  if (copy.context) copy.context = deepCleanText(copy.context);
  if (copy.givenData) copy.givenData = deepCleanText(copy.givenData);
  if ((copy as any).summaryTask) (copy as any).summaryTask = deepCleanText((copy as any).summaryTask);

  // Strip trailing true/false or MCQ indicators from text
  if (canonicalType === 'true_false' && copy.text) {
    copy.text = copy.text
      .replace(/\[\s*(True|Vrai|Ukuri)\s*\/\s*(False|Faux|Ikinyoma)\s*\]/gi, '')
      .replace(/\(\s*(True|Vrai|Ukuri)\s*\/\s*(False|Faux|Ikinyoma)\s*\)/gi, '')
      .trim();
  }

  // 3. Instruction deduplication & contradiction check
  const cleanStr = (s?: string) => s ? s.replace(/\*/g, '').trim().toLowerCase().replace(/[:.]+$|\s+/g, ' ') : '';
  const cleanInst = cleanStr(copy.instruction);
  const cleanText = cleanStr(copy.text);
  const cleanLead = cleanStr(copy.leadInstruction);
  const cleanSec = cleanStr(sectionInstruction);

  if (cleanInst) {
    if (
      (cleanText && (cleanInst === cleanText || cleanText.includes(cleanInst) || cleanInst.includes(cleanText))) ||
      (cleanLead && (cleanInst === cleanLead || cleanLead.includes(cleanInst) || cleanInst.includes(cleanLead))) ||
      (cleanSec && (cleanInst === cleanSec || cleanSec.includes(cleanInst) || cleanInst.includes(cleanSec)))
    ) {
      fixes.push(`Removed duplicate instruction: "${copy.instruction}"`);
      copy.instruction = undefined;
    } else if (isSelfContainedQuestion(copy.text)) {
      const directTypes = new Set(['short', 'short_answer', 'essay', 'calculation', 'one_word']);
      if (directTypes.has(canonicalType) && isGenericFillerInstruction(copy.instruction)) {
        fixes.push(`Removed redundant filler instruction for self-contained question: "${copy.instruction}"`);
        copy.instruction = undefined;
      }
    }
  }

  // 4. Type-specific layout & response area contract rules
  if (canonicalType === 'mcq') {
    copy.answerSpace = 'none';
    if ((copy as any).options && Array.isArray((copy as any).options)) {
      (copy as any).options = (copy as any).options.map((opt: any) => {
        if (!opt) return opt;
        if (typeof opt === 'string') {
          return { text: opt.replace(/^[A-D][\.\:\)\s]+/i, '').trim(), isCorrect: false };
        }
        if (typeof opt.text === 'string') {
          opt.text = opt.text.replace(/^[A-D][\.\:\)\s]+/i, '').trim();
        }
        return opt;
      });
    }
  } else if (canonicalType === 'fill_blank' || (copy as any).type === 'cloze') {
    const hasInlineBlanks = Boolean(copy.text && (/\.{3,}|_{2,}|─{2,}|—{2,}|–{2,}|\*{2}_+\*{2}|\[\s*\]|\[blank\]|\{\s*\}|\(\s*\.\.\.\s*\)/.test(copy.text)));
    if (hasInlineBlanks || canonicalType === 'fill_blank') {
      copy.answerSpace = 'none';
    }
  } else if (canonicalType === 'matching' || canonicalType === 'table') {
    if (!copy.tableData || !copy.tableData.rows || copy.tableData.rows.length < 2) {
      copy.tableData = {
        rows: [
          ["Column A", "Column B"],
          ["Item 1", "Match 1"],
          ["Item 2", "Match 2"]
        ]
      };
      fixes.push('Injected valid default table data structure for table/matching item');
    }
  } else {
    // Non-MCQ option handling (embedded inline choice like (is / are))
    if (copy.options && Array.isArray(copy.options) && copy.options.length > 0) {
      const optStrings = copy.options.map((o: any) => typeof o === 'string' ? o : o.text).filter(Boolean);
      if (optStrings.length >= 2) {
        const inlinePattern = ` (${optStrings.slice(0, 2).join(' / ')})`;
        if (copy.text && !copy.text.includes(inlinePattern.trim())) {
          copy.text = copy.text.replace(/\.\s*$/, '') + inlinePattern;
          fixes.push('Embedded binary options inline into question stem');
        }
      }
      delete (copy as any).options;
    }
  }

  // 5. Recursive Subquestion Sanitization
  if (copy.subQuestions && Array.isArray(copy.subQuestions) && copy.subQuestions.length > 0) {
    let subMarkSum = 0;
    copy.subQuestions = copy.subQuestions.map((sq, idx) => {
      const res = sanitizeSingleQuestion(sq, language, sectionInstruction || copy.instruction);
      fixes.push(...res.fixes.map(f => `SubQ ${idx + 1}: ${f}`));
      
      // Deduplicate diagram/media references if identical to parent
      if (res.question.svgData && res.question.svgData === copy.svgData) res.question.svgData = undefined;
      if (res.question.smilesData && res.question.smilesData === copy.smilesData) res.question.smilesData = undefined;
      if (res.question.mermaidData && res.question.mermaidData === copy.mermaidData) res.question.mermaidData = undefined;

      subMarkSum += (res.question.marks || 0);
      return res.question;
    });

    if (subMarkSum > 0 && copy.marks !== subMarkSum) {
      fixes.push(`Updated parent question mark total from ${copy.marks} to sum of subquestions (${subMarkSum})`);
      copy.marks = subMarkSum;
    }
  }

  return { question: copy, fixes };
}

