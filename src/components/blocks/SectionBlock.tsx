import React from 'react';
import { Section, Question } from '../../types';
import { QuestionBlock } from './QuestionBlock';
import { normalizeLanguage } from '../../utils/languageUtils';

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

export function cleanSectionLevelInstructions(inst?: string): string {
  if (!inst) return '';
  const lines = inst.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // Filter out lines that are question-level instructions with leading numbers/bullets (e.g., 1), 2), 1., 2., (1))
  const nonQuestionLines = lines.filter((l) => !/^(?:\d+[\.\)]|\([0-9]+\))\s+/i.test(l));
  return nonQuestionLines.join('\n\n').trim();
}

export const SectionBlock: React.FC<{
  section: Section;
  newPage?: boolean;
  isFirstSection?: boolean;
  attemptSentence?: string;
  language?: string;
}> = ({ section, newPage, isFirstSection, attemptSentence, language }) => {
  const normLang = normalizeLanguage(language);

  // Clean instructions to prevent repeating attempt sentences and strip dumped question-level numbered instructions
  const rawInst = section.instructions ? section.instructions.replace(/\*/g, '').trim() : '';
  const cleanedInst = cleanSectionLevelInstructions(rawInst);
  const isDuplicateAttempt = isProceduralSectionInstruction(cleanedInst);

  const titleLower = (section.title || '').toLowerCase();
  const attemptLower = (attemptSentence || '').toLowerCase();
  const titleAlreadyHasAttempt = attemptLower && (titleLower.includes('attempt') || titleLower.includes('répondez') || titleLower.includes('subiza'));
  const titleAlreadyHasMarks = titleLower.includes('mark') || titleLower.includes('point');

  let headingExtra = '';
  if (attemptSentence && !titleAlreadyHasAttempt) {
    headingExtra = ` — ${attemptSentence}`;
  } else if (!titleAlreadyHasMarks && section.marks > 0) {
    headingExtra = ` (${section.marks} ${section.marks === 1 ? (normLang === 'fr' ? 'point' : 'mark') : (normLang === 'fr' ? 'points' : 'marks')})`;
  }

  const renderedPassages = new Set<string>();

  const renderPassage = (passage: any) => {
    renderedPassages.add(passage.id);
    const paragraphs = (passage.text || '').split(/\n\s*\n|\n/).map((p: string) => p.trim()).filter(Boolean);
    return (
      <div key={`passage_${passage.id}`} className="examprint-passage-unit my-3">
        {passage.title && (
          <div className="examprint-passage-title">
            {passage.title}
          </div>
        )}
        <div className="examprint-passage-body">
          {paragraphs.map((p: string, idx: number) => (
            <p key={idx} className="examprint-passage-paragraph">{p}</p>
          ))}
        </div>
        <div className="examprint-passage-separator" />
      </div>
    );
  };

  const renderPassageIfNeeded = (q: Question) => {
    if (q.passageRef && !renderedPassages.has(q.passageRef)) {
      const passage = section.passages?.find((p) => p.id === q.passageRef);
      if (passage) {
        return renderPassage(passage);
      }
    }
    return null;
  };

  // Check if any passages in section.passages are not specifically tied to future questions
  const renderUnattachedPassages = () => {
    if (!section.passages || section.passages.length === 0) return null;
    const allReferencedIds = new Set<string>();
    const gatherRefs = (questions?: Question[]) => {
      if (!questions) return;
      questions.forEach((q) => {
        if (q.passageRef) allReferencedIds.add(q.passageRef);
      });
    };
    gatherRefs(section.questions);
    if (section.parts) {
      section.parts.forEach((part) => gatherRefs(part.questions));
    }

    const unattached = section.passages.filter(
      (p) => !renderedPassages.has(p.id) && !allReferencedIds.has(p.id)
    );
    // If none of the questions have passageRefs, render all unrendered passages at the section top
    const toRender = allReferencedIds.size === 0 
      ? section.passages.filter((p) => !renderedPassages.has(p.id))
      : unattached;

    if (toRender.length === 0) return null;
    return (
      <>
        {toRender.map((p) => renderPassage(p))}
      </>
    );
  };

  return (
    <section 
      className={"examprint-section " + (section.presentation?.pageBreakBefore !== false && newPage ? "examprint-section--new-page" : "")}
      data-section-id={section.id}
      style={{
        columnCount: section.presentation?.columns || 1,
        columnGap: '2rem'
      }}
    >
      <h2 className="examprint-section-heading examprint-keep-with-next">
        {section.title}{headingExtra}
      </h2>
      {!isDuplicateAttempt && cleanedInst && (
        <p className="examprint-instructions">{cleanedInst}</p>
      )}
      {renderUnattachedPassages()}
      {section.hasParts && section.parts && section.parts.length > 0 ? (
        section.parts.map((part, pIdx) => (
          <div key={part.id || pIdx} className="examprint-section-part my-3 border-l-2 border-slate-300 pl-3">
            <h3 className="examprint-part-heading font-bold text-sm uppercase tracking-wide text-slate-800 my-2">
              {part.name}
              {part.marks ? ` (${part.marks} ${normLang === 'fr' ? 'Points' : 'Marks'})` : ''}
            </h3>
            {part.instructions && !isProceduralSectionInstruction(part.instructions) && (
              <p className="examprint-instructions italic text-xs mb-2 text-slate-600">{part.instructions}</p>
            )}
            {part.questions && part.questions.map((q, qi) => (
              <React.Fragment key={q.id}>
                {renderPassageIfNeeded(q)}
                <QuestionBlock
                  q={q}
                  sectionInstruction={part.instructions || section.instructions}
                  language={language}
                  suppressInstruction={qi > 0 && part.questions![qi - 1].type === q.type}
                />
              </React.Fragment>
            ))}
          </div>
        ))
      ) : (
        section.questions && section.questions.map((q, qi) => (
          <React.Fragment key={q.id}>
            {renderPassageIfNeeded(q)}
            <QuestionBlock
              q={q}
              sectionInstruction={section.instructions}
              language={language}
              suppressInstruction={qi > 0 && section.questions![qi - 1].type === q.type}
            />
          </React.Fragment>
        ))
      )}
      {/* Defensive catch: Render any remaining unrendered passages */}
      {section.passages && section.passages.some(p => !renderedPassages.has(p.id)) && (
        <>
          {section.passages.filter(p => !renderedPassages.has(p.id)).map(p => renderPassage(p))}
        </>
      )}
    </section>
  );
};
