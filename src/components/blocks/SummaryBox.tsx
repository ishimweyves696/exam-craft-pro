import React from 'react';
import { normalizeLanguage } from '../../utils/languageUtils';

export interface SummaryBoxProps {
  wordLimit?: number;
  marks?: number;
  language?: string;
  gridRows?: number;
  wordsPerRow?: number;
  customInstruction?: string;
  /** When the task sentence above already states the word limit, do not repeat it. */
  hideNote?: boolean;
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({
  wordLimit = 100,
  marks = 10,
  language,
  gridRows = 10,
  wordsPerRow = 10,
  customInstruction,
  hideNote = false,
}) => {
  const normLang = normalizeLanguage(language);

  const labels = {
    en: {
      draftTitle: 'SUMMARY DRAFTING SPACE',
      wordLimitNote: `Do not exceed ${wordLimit} words. Count each word accurately.`,
      wordCountFooter: 'Actual Word Count: ______________ words',
      markAllocation: `(${marks} marks)`,
    },
    fr: {
      draftTitle: 'ESPACE DE RÉDACTION DU RÉSUMÉ',
      wordLimitNote: `Ne dépassez pas ${wordLimit} mots. Comptez chaque mot avec précision.`,
      wordCountFooter: 'Nombre réel de mots : ______________ mots',
      markAllocation: `(${marks} points)`,
    },
    rw: {
      draftTitle: 'UMWANYA WO KWANDIKAMO INCAMAKE',
      wordLimitNote: `Nturenze amagambo ${wordLimit}. Bara neza buri jambo.`,
      wordCountFooter: 'Umubare w’amagambo yose: ______________ amagambo',
      markAllocation: `(Amanota ${marks})`,
    },
  }[normLang] || {
    draftTitle: 'SUMMARY DRAFTING SPACE',
    wordLimitNote: `Do not exceed ${wordLimit} words. Count each word accurately.`,
    wordCountFooter: 'Actual Word Count: ______________ words',
    markAllocation: `(${marks} marks)`,
  };

  // Ruled lines are sized to the word limit; the gutter counter never exceeds it.
  const effectiveLines = Math.max(gridRows, Math.ceil(wordLimit / wordsPerRow));

  return (
    <div className="examprint-summary-box my-3 w-full border-2 border-black bg-white break-inside-avoid">
      {/* Header bar */}
      <div className="bg-slate-100 border-b border-black px-3 py-1.5 flex justify-between items-center text-[9pt]">
        <span className="font-bold tracking-wide uppercase text-black">
          {labels.draftTitle}
        </span>
        {!hideNote && (
          <span className="italic font-medium text-slate-700">
            {customInstruction || labels.wordLimitNote}
          </span>
        )}
      </div>

      {/* Ruled lines with 10-word column grid marks */}
      <div className="p-2.5">
        {Array.from({ length: effectiveLines }).map((_, lineIdx) => {
          const counter = (lineIdx + 1) * wordsPerRow;
          return (
            <div
              key={lineIdx}
              className="examprint-summary-line relative h-[0.85cm] border-b border-black flex items-end justify-between px-1"
            >
              <span className="text-[7pt] text-slate-400 font-mono select-none -mb-1">
                {counter <= wordLimit ? counter : ''}
              </span>
            </div>
          );
        })}
      </div>


      {/* Footer Word Count Record Slot */}
      <div className="border-t border-black bg-slate-50 px-3 py-1.5 flex justify-between items-center text-[9.5pt]">
        <span className="font-semibold text-black">
          {labels.wordCountFooter}
        </span>
        <span className="font-bold text-black">
          {labels.markAllocation}
        </span>
      </div>
    </div>
  );
};
