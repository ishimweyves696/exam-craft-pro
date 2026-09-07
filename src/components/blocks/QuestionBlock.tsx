import React from 'react';
import { Question } from '../../types';
import { AnswerSpace } from './AnswerSpace';
import { MultipleChoiceGrid } from './MultipleChoiceGrid';
import { TrueFalse } from './TrueFalse';
import { DataTable } from './DataTable';
import { MatchingTable } from './MatchingTable';
import { QuestionText } from './QuestionText';
import { formatNumber } from '../ExamPrintView';
import { resolveInstruction, analyzeGroupInstructions } from '../../utils/defaultInstructions';
import { getQuestionSpec } from '../../utils/questionSpecs';
import { DiagramViewer } from './DiagramViewer';
import { SwotMatrix } from './SwotMatrix';
import { CalculationWorkingArea } from './CalculationWorkingArea';
import { CoordinateGrid } from './CoordinateGrid';
import { SummaryBox } from './SummaryBox';
import { SentenceTransformationBlock } from './SentenceTransformationBlock';
import { OMRShadingStrip } from './OMRShadingStrip';
import { matchingLayoutFor, trueFalseVariantFor } from '../../lib/layoutVariants';

interface GenericQuestionItem {
  id?: string;
  number?: number | string;
  type: string;
  text?: string;
  leadInstruction?: string;
  instruction?: string;
  options?: any;
  tableData?: any;
  answerSpace?: any;
  numberingStyle?: any;
  presentation?: any;
  layoutVariant?: string;
  layoutIntent?: any;
  markingScheme?: any;
  subQuestions?: any[];
  svgData?: string;
  smilesData?: string;
  mermaidData?: string;
  wordLimit?: number;
  summaryTask?: string;
  givenData?: string;
  formula?: string;
  context?: string;
  wordBank?: string[];
  swotData?: any;
  finalAnswerSlot?: boolean;
  unit?: string;
  marks?: number;
}

import { normalizeLanguage } from '../../utils/languageUtils';

function markLabel(marks: number, lang?: string): string {
  const norm = normalizeLanguage(lang);
  if (norm === 'fr') {
    return `${marks} point${marks === 1 ? '' : 's'}`;
  }
  return `${marks} mark${marks === 1 ? '' : 's'}`;
}

export const QuestionInstructions: React.FC<{
  item: GenericQuestionItem;
  sectionInstruction?: string;
  parentInstruction?: string;
  language?: string;
  forcedInstructions?: string[];
  suppressInstruction?: boolean;
}> = ({ item, suppressInstruction, forcedInstructions }) => {
  if (suppressInstruction) return null;

  const rawToRender = forcedInstructions && forcedInstructions.length > 0 
    ? forcedInstructions 
    : (item.instruction ? [item.instruction] : []);

  const cleanLead = item.leadInstruction ? item.leadInstruction.replace(/\*/g, '').trim() : '';
  
  // Deduplicate instructions to render against lead instruction
  const finalInstructions = rawToRender.filter(inst => {
    if (!inst) return false;
    const cleanInstStr = inst.replace(/\*/g, '').trim();
    if (cleanLead && (cleanInstStr.toLowerCase() === cleanLead.toLowerCase() || cleanInstStr.toLowerCase().includes(cleanLead.toLowerCase()) || cleanLead.toLowerCase().includes(cleanInstStr.toLowerCase()))) {
      return false; // Skip duplicate
    }
    return true;
  });

  if (finalInstructions.length === 0 && !cleanLead) return null;

  return (
    <div className="examprint-instructions mb-1">
      {cleanLead && (
        <div className="font-bold mb-1 italic">
          {cleanLead}
        </div>
      )}
      {finalInstructions.map((inst, idx) => (
        <div key={idx} className="italic text-[0.95em] text-slate-800">
          {inst.replace(/\*/g, '')}
        </div>
      ))}
    </div>
  );
};

const CalculationMetadata: React.FC<{ item: GenericQuestionItem }> = ({ item }) => {
  if (!item.context && !item.givenData) return null;

  return (
    <div className="examprint-calculation-metadata mb-2 pl-8">
      {item.context && (
        <div className="examprint-calculation-context mb-2 text-slate-800 leading-relaxed">
          <QuestionText text={item.context} />
        </div>
      )}
      {item.givenData && (
        <div className="examprint-calculation-given-data p-2 bg-slate-50 border-l-2 border-slate-200 text-sm">
          <div className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-1">Given Data:</div>
          <QuestionText text={item.givenData} />
        </div>
      )}
    </div>
  );
};

const WordBank: React.FC<{ words: string[] }> = ({ words }) => {
  if (!words || words.length === 0) return null;

  // Split any concatenated/delimited word bank entries into individual clean words
  const cleanWords: string[] = [];
  words.forEach(w => {
    if (!w) return;
    const cleanStr = w.replace(/[\*\_\(\)\[\]]/g, '').trim();
    if (!cleanStr) return;
    if (cleanStr.includes(',') || cleanStr.includes('/') || cleanStr.includes(';') || cleanStr.includes('•')) {
      cleanStr.split(/[,/;•]|\s+and\s+|\s+or\s+/i).forEach(part => {
        const t = part.trim();
        if (t && !cleanWords.includes(t)) cleanWords.push(t);
      });
    } else if (cleanStr.includes(' ')) {
      cleanStr.split(/\s+/).forEach(part => {
        const t = part.trim();
        if (t && !cleanWords.includes(t)) cleanWords.push(t);
      });
    } else if (/^[A-Z]{12,}$/.test(cleanStr) || /^[A-Z][a-z]+[A-Z]/.test(cleanStr)) {
      const parts = cleanStr.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);
      if (parts.length > 1) {
        parts.forEach(p => {
          const t = p.trim();
          if (t && !cleanWords.includes(t)) cleanWords.push(t);
        });
      } else {
        cleanWords.push(cleanStr);
      }
    } else {
      cleanWords.push(cleanStr);
    }
  });

  if (cleanWords.length === 0) return null;

  return (
    <div className="examprint-word-bank border-2 border-slate-300 p-2.5 mb-3 mx-auto max-w-[92%] text-center bg-slate-50/70 rounded-sm">
      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 font-bold uppercase tracking-wider text-xs text-slate-900">
        {cleanWords.map((word, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-400 font-normal select-none">•</span>}
            <span className="whitespace-nowrap">{word}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const QuestionContent: React.FC<{
  item: GenericQuestionItem;
  sectionInstruction?: string;
  parentInstruction?: string;
  language?: string;
  forcedInstructions?: string[];
  suppressInstruction?: boolean;
}> = ({ item, language }) => {
  const spec = getQuestionSpec(item.type);
  const canonicalType = spec.id;
  const hasSubQuestions = Boolean(item.subQuestions && item.subQuestions.length > 0);
  const columnA = item.tableData?.rows ? item.tableData.rows.slice(1).map((row: string[]) => row[0]).filter((x: any) => x !== undefined) : undefined;
  const columnB = item.tableData?.rows ? item.tableData.rows.slice(1).map((row: string[]) => row[1]).filter((x: any) => x !== undefined) : undefined;
  const headers = item.tableData?.rows && item.tableData.rows.length > 0 ? item.tableData.rows[0] : undefined;
  
  return (
    <>
      {item.wordBank && item.wordBank.length > 0 && (
        <WordBank words={item.wordBank} />
      )}

      {canonicalType === 'mcq' && (
        <>
          <MultipleChoiceGrid options={item.options} layout={item.layoutIntent?.optionArrangement || item.layoutVariant || item.presentation?.layout} />
          {item.layoutVariant === 'omr' && (
            <OMRShadingStrip questionNumber={item.number} optionsCount={item.options?.length || 4} />
          )}
        </>
      )}

      {(canonicalType === 'essay' || item.type === 'composition') && item.options && item.options.length > 0 && (
        <div className="examprint-composition-topics">
          {item.options.map((opt: any, idx: number) => {
            const topicLabel = formatNumber(idx, item.numberingStyle || 'alpha-upper');
            return (
              <div key={opt.id || idx} className="examprint-composition-topic">
                <span className="examprint-topic-label">{topicLabel}</span>
                <span className="examprint-topic-text">
                  <QuestionText text={opt.text} />
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      {canonicalType === 'calculation' ? (
        <CalculationWorkingArea
          formula={item.formula}
          givenData={item.givenData}
          unit={item.unit}
          marks={item.marks}
          height={item.answerSpace && item.answerSpace !== 'none' ? item.answerSpace : 'medium'}
          showFinalAnswerSlot={item.finalAnswerSlot !== false}
          language={language}
        />
      ) : null}

      {(canonicalType === 'swot' || canonicalType === 'matrix' || item.type === 'swot' || item.type === 'matrix' || item.layoutVariant === 'swot-matrix') ? (
        <SwotMatrix data={item.swotData} language={language} candidateMode={true} />
      ) : null}

      {(canonicalType === 'summary' || item.type === 'summary') && !hasSubQuestions ? (
        <SummaryBox
          wordLimit={item.wordLimit}
          marks={item.marks}
          language={language}
          customInstruction={item.summaryTask}
        />
      ) : null}

      {(canonicalType === 'transformation' || item.type === 'transformation') && (
        <SentenceTransformationBlock
          originalSentence={item.text}
          marks={item.marks}
        />
      )}

      {(item.layoutIntent?.workspaceType === 'graph_grid' || item.layoutVariant === 'graph-grid' || item.type === 'graph' || item.presentation?.answerStyle === 'grid') && (
        <CoordinateGrid marks={item.marks} />
      )}

      {canonicalType === 'true_false' && !(/\.{3,}|_{2,}|─{2,}|—{2,}|–{2,}|\*{2}_+\*{2}|\[\s*\]|\[blank\]|\{\s*\}|\(\s*\.\.\.\s*\)/.test(item.text || '')) && (
        <TrueFalse
          language={language}
          variant={
            item.presentation?.trueFalseStyle ??
            trueFalseVariantFor(String(item.id ?? item.number ?? item.text ?? ''))
          }
        />
      )}
      
      {canonicalType === 'matching' && columnA && columnB && (
        <MatchingTable
          columnA={columnA}
          columnB={columnB}
          headers={headers}
          layout={
            item.layoutVariant ||
            item.presentation?.layout ||
            matchingLayoutFor(String(item.id ?? item.number ?? item.text ?? ''))
          }
          language={language}
        />
      )}


      {(canonicalType === 'table' || (item.tableData && canonicalType !== 'matching')) && (
        <DataTable data={item.tableData} style={item.presentation?.tableStyle} />
      )}

      {(() => {
        if (hasSubQuestions || canonicalType === 'instruction' || item.type === 'instruction') return null;
        if (canonicalType === 'calculation' || canonicalType === 'swot' || canonicalType === 'matrix' || item.type === 'swot' || item.type === 'matrix' || item.layoutVariant === 'swot-matrix') return null;
        if (canonicalType === 'summary' || item.type === 'summary' || canonicalType === 'transformation' || item.type === 'transformation') return null;
        if (item.layoutIntent?.workspaceType === 'graph_grid' || item.layoutVariant === 'graph-grid' || item.type === 'graph' || item.presentation?.answerStyle === 'grid') return null;
        if (item.layoutIntent?.workspaceType === 'none') return null;
        
        // Inline fill-in-the-blank items or items with inline blanks MUST NOT render extra answer lines underneath
        const hasInlineBlanks = Boolean(item.text && (/\.{3,}|_{2,}|─{2,}|—{2,}|–{2,}|\*{2}_+\*{2}|\[\s*\]|\[blank\]|\{\s*\}|\(\s*\.\.\.\s*\)/.test(item.text)));
        if (canonicalType === 'fill_blank' || item.type === 'cloze' || hasInlineBlanks) return null;

        const effectiveSpace = (item.answerSpace && item.answerSpace !== 'none') 
          ? item.answerSpace 
          : (item.presentation?.customLines ? 'custom' : (spec.answerSpace.requiresSpace ? spec.answerSpace.defaultFormat : null));

        if ((effectiveSpace && effectiveSpace !== 'none') || (item.presentation?.customLines && item.presentation.customLines > 0)) {
          const styleFromIntent = item.layoutIntent?.workspaceType === 'calculation_box' ? 'box' 
            : item.layoutIntent?.workspaceType === 'graph_grid' ? 'grid' 
            : item.presentation?.answerStyle;
            
          return (
            <AnswerSpace 
              size={effectiveSpace as any} 
              style={styleFromIntent} 
              customLines={item.presentation?.customLines}
              marks={item.marks}
            />
          );
        }
        return null;
      })()}
    </>
  );
};

export interface ParsedPassage {
  instruction?: string;
  title: string;
  bodyParagraphs: string[];
}

export function isPassageQuestion(q: Question): boolean {
  const t = (q.type || '').toLowerCase();
  if (t === 'case_study' || t === 'passage' || t === 'comprehension' || t === 'reading_comprehension' || t === 'scenario' || t === 'summary') return true;
  if (!q.text) return false;
  const text = q.text.trim();
  if (q.subQuestions && q.subQuestions.length > 0) {
    if (
      text.includes('\n\n') ||
      text.startsWith('**') ||
      /^Title:/i.test(text) ||
      /^Read the (passage|text|following|case study|scenario)/i.test(text) ||
      (text.length > 250 && !/^Based on the/i.test(text) && !/^Discuss the/i.test(text) && !/^Consider/i.test(text) && !/^Analyse/i.test(text) && !/^Evaluate/i.test(text))
    ) {
      return true;
    }
  }
  return false;
}

const BOILERPLATE_TITLE_REGEX = /^(?:case\s*study|business\s*scenario|scenario\s*analysis|reading\s*(?:passage|comprehension|comprehension\s*passage)|comprehension\s*(?:passage|text)?|comprehension|text\s*for\s*comprehension|context\s*(?:&|and)\s*data|read\s*the\s*following\s*(?:case|passage|scenario)|scenario)$/i;

function getDefaultPassageInstruction(subjectName?: string): string {
  const subj = (subjectName || '').toLowerCase();
  if (/entrepreneurship|business|economics|accounting|finance|management/i.test(subj)) {
    return 'Read the scenario below carefully and answer the questions that follow.';
  }
  if (/physics|chemistry|biology|science|math|stem|computer|technology/i.test(subj)) {
    return 'Study the provided context or data carefully and answer the questions that follow.';
  }
  return 'Read the passage below carefully and answer the questions that follow.';
}

export function parsePassageStructure(text: string, existingInstruction?: string, subjectName?: string): ParsedPassage {
  const defaultInst = getDefaultPassageInstruction(subjectName);

  if (!text) {
    return { instruction: existingInstruction || defaultInst, title: '', bodyParagraphs: [] };
  }

  let raw = text.trim();
  let extractedInstruction = existingInstruction;
  let title = '';

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Strategy: Better Instruction Extraction
  if (!extractedInstruction && lines.length > 1) {
    if (/^Read the (passage|text|following|case study|scenario|situation|article)/i.test(lines[0]) || 
        /^Lisez (attentivement )?le (texte|passage|document)/i.test(lines[0]) ||
        /^Soma (iki|iyi) (gitekerezo|nyandiko)/i.test(lines[0]) ||
        /^Study the (provided|context|data|scenario)/i.test(lines[0])) {
      extractedInstruction = lines[0];
      lines.shift();
      raw = lines.join('\n\n');
    }
  }

  // Strategy: Professional Title Extraction (All caps or wrapped bold or first short line)
  if (lines.length > 0) {
    const firstLine = lines[0];
    
    const isAllCaps = /^[A-Z\s0-9.,'"&!-]{10,100}$/.test(firstLine.replace(/\*/g, ''));
    const isWrappedBold = firstLine.startsWith('**') && firstLine.endsWith('**') && firstLine.length < 100;
    const isShortHeading = firstLine.length < 80 && !firstLine.includes('.') && !firstLine.includes('?') && !firstLine.toLowerCase().startsWith('read ') && !firstLine.toLowerCase().startsWith('study ');

    if (isAllCaps || isWrappedBold || isShortHeading) {
      const candidateTitle = firstLine.replace(/\*\*/g, '').trim();
      if (!BOILERPLATE_TITLE_REGEX.test(candidateTitle)) {
        title = candidateTitle;
        lines.shift();
        raw = lines.join('\n\n');
      }
    }
  }

  // Clean remaining text of obvious artifacts
  const bodyParagraphs = raw
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Strategy: Clean "AI Slop" bolding artifacts in paragraphs
  const cleanedBody = bodyParagraphs.map(para => {
    // If paragraph has multiple bold chunks but isn't just one bold line, strip them
    const boldChunks = para.match(/\*\*([^*]+)\*\*/g);
    if (boldChunks && boldChunks.length >= 2 && para.length > 50) {
      if (!(para.startsWith('**') && para.endsWith('**') && para.indexOf('**', 2) === para.length - 2)) {
        para = para.replace(/\*\*([^*]+)\*\*/g, '$1');
      }
    }
    // Remove isolated single-word bolding in the middle of sentences
    para = para.replace(/(?<=\s|^)\*\*([^*]{1,20})\*\*(?=\s|[.,!?;:]|$)/g, '$1');
    return para;
  });

  // Avoid duplicating the instruction or title string into body paragraphs
  const finalInst = extractedInstruction || defaultInst;
  const cleanInstStr = finalInst.replace(/\*/g, '').trim().toLowerCase();
  const normTitle = title ? title.replace(/\*/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  let finalBody = cleanedBody.filter(p => {
    const cleanP = p.replace(/\*/g, '').trim().toLowerCase();
    if (cleanP === cleanInstStr) return false;
    if (normTitle && cleanP.replace(/[^a-z0-9]/g, '') === normTitle) return false;
    return true;
  });

  if (normTitle && finalBody.length > 0) {
    const normFirst = finalBody[0].replace(/\*/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normFirst === normTitle || finalBody[0].trim().toLowerCase() === title.trim().toLowerCase()) {
      finalBody.shift();
    }
  }

  return {
    instruction: finalInst,
    title,
    bodyParagraphs: finalBody.length > 0 ? finalBody : [raw]
  };
}

export const QuestionBlock: React.FC<{
  q: Question;
  sectionInstruction?: string;
  language?: string;
  /** Fixed rule: an identical instruction is printed once per run of same-type questions. */
  suppressInstruction?: boolean;
}> = ({ q, sectionInstruction, language, suppressInstruction }) => {
  const hasSubQuestions = Boolean(q.subQuestions && q.subQuestions.length > 0);
  const rawAnalysis = analyzeGroupInstructions(q, sectionInstruction, undefined, language);
  // Fixed rule: within one question, a sub-part instruction is printed only when it
  // differs from the instruction already printed above it.
  const seenInst = new Set<string>(
    rawAnalysis.parentInstructionsToShow.map((i) => (i || '').trim().toLowerCase()),
  );
  const dedupedSubInst = rawAnalysis.subQuestionInstructionsToShow.map((inst) => {
    const key = (inst || '').trim().toLowerCase();
    if (!key) return inst;
    if (seenInst.has(key)) return null;
    seenInst.add(key);
    return inst;
  });
  const parentAnalysis = {
    ...rawAnalysis,
    subQuestionInstructionsToShow: dedupedSubInst,
    parentInstructionsToShow: suppressInstruction ? ([] as string[]) : rawAnalysis.parentInstructionsToShow,
  };

  if (isPassageQuestion(q)) {
    const forcedInst = parentAnalysis.parentInstructionsToShow.length > 0 ? parentAnalysis.parentInstructionsToShow[0] : q.instruction;
    const parsedPassage = parsePassageStructure(q.text, forcedInst, (q as any).subjectName);
    if (q.presentation?.title) {
      if (!BOILERPLATE_TITLE_REGEX.test(q.presentation.title.trim())) {
        parsedPassage.title = q.presentation.title;
      } else {
        parsedPassage.title = '';
      }
    } else if (BOILERPLATE_TITLE_REGEX.test(parsedPassage.title.trim())) {
      parsedPassage.title = '';
    }

    // Deduplicate title against first body paragraph if identical
    if (parsedPassage.title && parsedPassage.bodyParagraphs.length > 0) {
      const normTitle = parsedPassage.title.replace(/\*/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const normFirst = parsedPassage.bodyParagraphs[0].replace(/\*/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normFirst === normTitle || parsedPassage.bodyParagraphs[0].trim().toLowerCase() === parsedPassage.title.trim().toLowerCase()) {
        parsedPassage.bodyParagraphs.shift();
      }
    }

    return (
      <div 
        className={`examprint-question examprint-passage-unit examprint-layout-${q.layoutVariant || 'standard'}`} 
        data-question-id={q.id}
        data-question-number={q.number}
        data-type={q.type}
        data-layout={q.presentation?.layout || 'standard'}
        style={{
          breakInside: 'auto',
          pageBreakInside: 'auto',
          marginLeft: q.presentation?.indentation || '0'
        }}
      >
        <div className="examprint-question-row flex items-baseline gap-1 mb-1">
          <span className="examprint-question-number">{q.number}.</span>
          <span className="examprint-marks ml-auto">({markLabel(q.marks, language)})</span>
        </div>

        {/* Summary Task - Positioning above passage if it exists for summary types */}
        {q.type === 'summary' && (q.summaryTask || q.wordLimit) && (
          <div className="examprint-summary-task-top mb-4">
            {q.summaryTask && (
              <div className="examprint-summary-task font-semibold mb-1">
                <QuestionText text={q.summaryTask} />
              </div>
            )}
            {q.wordLimit && (
              <div className="examprint-summary-word-limit italic text-[0.9em]">
                (Word limit: {q.wordLimit} words)
              </div>
            )}
          </div>
        )}

        {/* Passage Instruction with consistent bottom space */}
        {(parsedPassage.instruction || sectionInstruction) && (
          <div className="examprint-passage-instruction">
            <QuestionText text={(parsedPassage.instruction || sectionInstruction || '').replace(/\*/g, '')} />
          </div>
        )}

        {/* Passage Title - Only rendered if explicit title exists */}
        {parsedPassage.title ? (
          <div className="examprint-passage-title">
            <strong><QuestionText text={parsedPassage.title} /></strong>
          </div>
        ) : null}

        {/* Passage Body - Continuous block of text */}
        <div className="examprint-passage-body">
          {parsedPassage.bodyParagraphs.map((paragraph, pIdx) => (
            <p key={pIdx} className="examprint-passage-paragraph">
              <QuestionText text={paragraph} />
            </p>
          ))}
        </div>

        {/* Clear visual separation between passage and questions */}
        <div className="examprint-passage-separator" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }} />

        <DiagramViewer smilesData={q.smilesData} mermaidData={q.mermaidData} svgData={q.svgData} />

        <div style={{ breakBefore: 'avoid', pageBreakBefore: 'avoid' }}>
          <QuestionContent 
            item={q} 
            sectionInstruction={sectionInstruction} 
            language={language} 
            forcedInstructions={[]}
            suppressInstruction={true}
          />
        </div>

        {/* Questions Following the Passage - Small consistent vertical space */}
        {hasSubQuestions && (
          <div className="examprint-subquestions">
            {q.subQuestions!.map((subQ, sIdx) => {
              const hasSubSub = Boolean(subQ.subQuestions && subQ.subQuestions.length > 0);
              const subNum = formatNumber((subQ.number ? subQ.number - 1 : sIdx), subQ.numberingStyle || 'alpha-lower');
              const subQInstOverride = parentAnalysis.subQuestionInstructionsToShow[sIdx];
              
              let subAnalysis = { parentInstructionsToShow: [] as string[], subQuestionInstructionsToShow: [] as (string | null)[] };
              if (hasSubSub) {
                subAnalysis = analyzeGroupInstructions(subQ, sectionInstruction, parentAnalysis.parentInstructionsToShow.join(' '), language);
              }

              return (
                <div key={subQ.id || sIdx} className="examprint-subquestion ml-[0.25in]">
                  <QuestionInstructions 
                    item={subQ} 
                    sectionInstruction={sectionInstruction} 
                    parentInstruction={parentAnalysis.parentInstructionsToShow.join(' ')} 
                    language={language}
                    forcedInstructions={hasSubSub ? subAnalysis.parentInstructionsToShow : (subQInstOverride ? [subQInstOverride] : [])}
                    suppressInstruction={!hasSubSub && subQInstOverride === null}
                  />

                  <CalculationMetadata item={subQ} />

                  <div className="examprint-question-row flex items-baseline gap-1">
                    <span className="examprint-question-number">{subNum}</span>
                    <span className="examprint-question-text">
                      <QuestionText text={subQ.text} />
                    </span>
                    <span className="examprint-marks ml-auto pl-4 shrink-0">({markLabel(subQ.marks, language)})</span>
                  </div>
                  
                  <DiagramViewer smilesData={subQ.smilesData} mermaidData={subQ.mermaidData} svgData={subQ.svgData} />

                  <QuestionContent 
                    item={subQ} 
                    sectionInstruction={sectionInstruction} 
                    parentInstruction={parentAnalysis.parentInstructionsToShow.join(' ')} 
                    language={language}
                    forcedInstructions={hasSubSub ? subAnalysis.parentInstructionsToShow : (subQInstOverride ? [subQInstOverride] : [])}
                    suppressInstruction={!hasSubSub && subQInstOverride === null}
                  />

                  {hasSubSub && (
                    <div className="examprint-subsubquestions">
                      {subQ.subQuestions!.map((subSubQ, ssIdx) => {
                        const subSubNum = formatNumber((subSubQ.number ? subSubQ.number - 1 : ssIdx), subSubQ.numberingStyle || 'roman-lower');
                        const subSubQInstOverride = subAnalysis.subQuestionInstructionsToShow[ssIdx];

                        return (
                          <div key={subSubQ.id || ssIdx} className="examprint-subsubquestion ml-[0.5in]">
                            <QuestionInstructions 
                              item={subSubQ} 
                              sectionInstruction={sectionInstruction} 
                              parentInstruction={subAnalysis.parentInstructionsToShow.join(' ')} 
                              language={language}
                              forcedInstructions={subSubQInstOverride ? [subSubQInstOverride] : []}
                              suppressInstruction={subSubQInstOverride === null}
                            />
                            <div className="examprint-question-row flex items-baseline gap-1">
                              <span className="examprint-question-number">{subSubNum}</span>
                              <span className="examprint-question-text">
                                <QuestionText text={subSubQ.text} />
                              </span>
                              <span className="examprint-marks ml-auto pl-4 shrink-0">({markLabel(subSubQ.marks, language)})</span>
                            </div>

                            <DiagramViewer smilesData={subSubQ.smilesData} mermaidData={subSubQ.mermaidData} svgData={subSubQ.svgData} />

                            <QuestionContent 
                              item={subSubQ} 
                              sectionInstruction={sectionInstruction} 
                              parentInstruction={subAnalysis.parentInstructionsToShow.join(' ')} 
                              language={language}
                              forcedInstructions={subSubQInstOverride ? [subSubQInstOverride] : []}
                              suppressInstruction={subSubQInstOverride === null}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Determine if this question should be allowed to break across pages
  // Default to keeping atomic units together (break-inside: avoid).
  // Only allow breaking if it's a parent container (hasSubQuestions) or contains a large essay space.
  const isLargeAnswer = q.answerSpace === 'large' || q.answerSpace === 'xlarge';
  const explicitBreak = q.layoutIntent?.breakConstraint === 'allow_split' || q.presentation?.keepTogether === false;
  const forceKeepTogether = q.layoutIntent?.breakConstraint === 'keep_together';
  const shouldKeepTogether = forceKeepTogether || (!hasSubQuestions && !isLargeAnswer && !explicitBreak);

  return (
    <div 
      className={`examprint-question examprint-layout-${q.layoutVariant || 'standard'}`} 
      data-question-id={q.id}
      data-question-number={q.number}
      data-type={q.type}
      data-layout={q.presentation?.layout || 'standard'}
      style={{
        breakInside: shouldKeepTogether ? 'avoid' : 'auto',
        pageBreakInside: shouldKeepTogether ? 'avoid' : 'auto'
      }}
    >
      <QuestionInstructions 
        item={q} 
        sectionInstruction={sectionInstruction} 
        language={language} 
        forcedInstructions={parentAnalysis.parentInstructionsToShow}
      />
      
      <CalculationMetadata item={q} />

      <div className="examprint-question-row flex items-baseline gap-1" style={{ breakAfter: hasSubQuestions ? 'avoid' : 'auto', pageBreakAfter: hasSubQuestions ? 'avoid' : 'auto' }}>
        <span className="examprint-question-number">{q.number}.</span>
        <span className="examprint-question-text">
          <QuestionText text={q.text} />
        </span>
        <span className="examprint-marks ml-auto pl-4 shrink-0">({markLabel(q.marks, language)})</span>
      </div>
      
      <DiagramViewer smilesData={q.smilesData} mermaidData={q.mermaidData} svgData={q.svgData} />

      <QuestionContent 
        item={q} 
        sectionInstruction={sectionInstruction} 
        language={language} 
        forcedInstructions={parentAnalysis.parentInstructionsToShow}
      />

      {hasSubQuestions && (
        <div className="examprint-subquestions">
          {q.subQuestions!.map((subQ, sIdx) => {
            const hasSubSub = Boolean(subQ.subQuestions && subQ.subQuestions.length > 0);
            const subNum = formatNumber((subQ.number ? subQ.number - 1 : sIdx), subQ.numberingStyle || 'alpha-lower');
            const subQInstOverride = parentAnalysis.subQuestionInstructionsToShow[sIdx];
            
            let subAnalysis = { parentInstructionsToShow: [] as string[], subQuestionInstructionsToShow: [] as (string | null)[] };
            if (hasSubSub) {
              subAnalysis = analyzeGroupInstructions(subQ, sectionInstruction, parentAnalysis.parentInstructionsToShow.join(' '), language);
            }

            const isSubLargeAnswer = subQ.answerSpace === 'large' || subQ.answerSpace === 'xlarge';
            const subExplicitBreak = subQ.presentation?.keepTogether === false;
            const subShouldKeepTogether = !hasSubSub && !isSubLargeAnswer && !subExplicitBreak;

            return (
              <div 
                key={subQ.id || sIdx} 
                className="examprint-subquestion ml-[0.25in]"
                style={{
                  breakInside: subShouldKeepTogether ? 'avoid' : 'auto',
                  pageBreakInside: subShouldKeepTogether ? 'avoid' : 'auto'
                }}
              >
                <QuestionInstructions 
                  item={subQ} 
                  sectionInstruction={sectionInstruction} 
                  parentInstruction={parentAnalysis.parentInstructionsToShow.join(' ')} 
                  language={language}
                  forcedInstructions={hasSubSub ? subAnalysis.parentInstructionsToShow : (subQInstOverride ? [subQInstOverride] : [])}
                  suppressInstruction={!hasSubSub && subQInstOverride === null}
                />
                <div className="examprint-question-row flex items-baseline gap-1">
                  <span className="examprint-question-number">{subNum}</span>
                  <span className="examprint-question-text">
                    <QuestionText text={subQ.text} />
                  </span>
                  <span className="examprint-marks ml-auto pl-4 shrink-0">({markLabel(subQ.marks, language)})</span>
                </div>
                
                <DiagramViewer smilesData={subQ.smilesData} mermaidData={subQ.mermaidData} svgData={subQ.svgData} />

                <QuestionContent 
                  item={subQ} 
                  sectionInstruction={sectionInstruction} 
                  parentInstruction={parentAnalysis.parentInstructionsToShow.join(' ')} 
                  language={language}
                  forcedInstructions={hasSubSub ? subAnalysis.parentInstructionsToShow : (subQInstOverride ? [subQInstOverride] : [])}
                  suppressInstruction={!hasSubSub && subQInstOverride === null}
                />

                {hasSubSub && (
                  <div className="examprint-subsubquestions">
                    {subQ.subQuestions!.map((subSubQ, ssIdx) => {
                      const subSubNum = formatNumber((subSubQ.number ? subSubQ.number - 1 : ssIdx), subSubQ.numberingStyle || 'roman-lower');
                      const subSubQInstOverride = subAnalysis.subQuestionInstructionsToShow[ssIdx];

                      const isSubSubLargeAnswer = subSubQ.answerSpace === 'large' || subSubQ.answerSpace === 'xlarge';
                      const subSubExplicitBreak = subSubQ.presentation?.keepTogether === false;
                      const subSubShouldKeepTogether = !isSubSubLargeAnswer && !subSubExplicitBreak;

                      return (
                        <div 
                          key={subSubQ.id || ssIdx} 
                          className="examprint-subsubquestion ml-[0.5in]"
                          style={{
                            breakInside: subSubShouldKeepTogether ? 'avoid' : 'auto',
                            pageBreakInside: subSubShouldKeepTogether ? 'avoid' : 'auto'
                          }}
                        >
                          <QuestionInstructions 
                            item={subSubQ} 
                            sectionInstruction={sectionInstruction} 
                            parentInstruction={subAnalysis.parentInstructionsToShow.join(' ')} 
                            language={language}
                            forcedInstructions={subSubQInstOverride ? [subSubQInstOverride] : []}
                            suppressInstruction={subSubQInstOverride === null}
                          />

                          <CalculationMetadata item={subSubQ} />

                          <div className="examprint-question-row flex items-baseline gap-1">
                            <span className="examprint-question-number">{subSubNum}</span>
                            <span className="examprint-question-text">
                              <QuestionText text={subSubQ.text} />
                            </span>
                            <span className="examprint-marks ml-auto pl-4 shrink-0">({markLabel(subSubQ.marks, language)})</span>
                          </div>

                          <DiagramViewer smilesData={subSubQ.smilesData} mermaidData={subSubQ.mermaidData} svgData={subSubQ.svgData} />

                          <QuestionContent 
                            item={subSubQ} 
                            sectionInstruction={sectionInstruction} 
                            parentInstruction={subAnalysis.parentInstructionsToShow.join(' ')} 
                            language={language}
                            forcedInstructions={subSubQInstOverride ? [subSubQInstOverride] : []}
                            suppressInstruction={subSubQInstOverride === null}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
