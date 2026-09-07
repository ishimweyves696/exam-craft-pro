import React from 'react';
import { QuestionOption } from '../../types';
import { QuestionText } from './QuestionText';

interface MultipleChoiceGridProps {
  options?: QuestionOption[];
  layout?: string;
}

export function MultipleChoiceGrid({ options, layout }: MultipleChoiceGridProps) {
  if (!options || options.length === 0) return null;
  
  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  
  let colsClass = 'grid-cols-1';
  if (layout === '4-col' || layout === 'grid-4' || layout === 'horizontal') {
    colsClass = 'grid-cols-4';
  } else if (layout === 'grid' || layout === '2-col' || layout === 'grid-2' || layout === 'two_column') {
    colsClass = 'grid-cols-2';
  } else if (layout === 'stacked' || layout === '1-col' || layout === 'vertical') {
    colsClass = 'grid-cols-1';
  } else {
    // Dynamic NESA layout inference based on option text length
    const optionTexts = options.map((opt) => {
      const rawText = typeof opt === 'string' ? opt : (opt?.text || '');
      return rawText.replace(/^[a-fA-F][\.\:\)\s]+/i, '').trim();
    });
    const maxLen = Math.max(...optionTexts.map((t) => t.length), 0);
    const count = options.length;

    if (count === 4 && maxLen <= 10) {
      // Very short options (e.g. single numbers, letters, 1-word terms) -> 4 columns
      colsClass = 'grid-cols-4';
    } else if (count <= 4 && maxLen <= 26) {
      // Short phrases (e.g. 2-3 words) -> 2 columns
      colsClass = 'grid-cols-2';
    } else {
      // Full sentences or long clauses -> 1 column vertical stack
      colsClass = 'grid-cols-1';
    }
  }

  const containerClass = `examprint-mcq-options ${colsClass}`;

  return (
    <div className={containerClass}>
      {options.map((opt, i) => {
        const rawText = typeof opt === 'string' ? opt : (opt?.text || '');
        const cleanText = rawText.replace(/^[a-fA-F][\.\:\)\s]+/i, '').trim();
        return (
          <div key={opt.id || i} className="examprint-mcq-option">
            <span className="examprint-mcq-letter">
              {letters[i] || `${i + 1}`})
            </span>
            <div className="examprint-mcq-text">
              <QuestionText text={cleanText} disableEmphasis={true} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Keep the McqOptions alias so existing components don't break
export const McqOptions = MultipleChoiceGrid;
