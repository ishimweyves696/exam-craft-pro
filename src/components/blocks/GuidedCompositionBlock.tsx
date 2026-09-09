import React from 'react';
import { QuestionText } from './QuestionText';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * GUIDED COMPOSITION
 *
 * Fixed typesetting: the guiding points are always printed as a bordered,
 * bulleted panel above the writing area, with the word limit stated on the
 * panel header. The writing area length is derived from the marks.
 */
export const GuidedCompositionBlock: React.FC<{
  points?: string[];
  wordLimit?: number;
  marks?: number;
  language?: string;
}> = ({ points, wordLimit, marks = 15, language }) => {
  const lang = normalizeLanguage(language);
  const lines = Math.max(12, Math.min(34, Math.round(marks * 1.6)));

  const t =
    lang === 'fr'
      ? { title: 'Points à développer', limit: (n: number) => `Environ ${n} mots.`, area: 'Espace de rédaction' }
      : { title: 'Use the following guiding points', limit: (n: number) => `About ${n} words.`, area: 'Writing space' };

  return (
    <div className="examprint-guided-composition">
      {points && points.length > 0 && (
        <div className="examprint-guided-panel">
          <div className="examprint-guided-panel-head">
            <span>{t.title}</span>
            {wordLimit ? <span className="examprint-guided-limit">{t.limit(wordLimit)}</span> : null}
          </div>
          <ul className="examprint-guided-points">
            {points.map((p, i) => (
              <li key={i}>
                <QuestionText text={p} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="examprint-guided-caption">{t.area}</div>
      <div className="examprint-guided-lines">
        {Array.from({ length: lines }).map((_, i) => (
          <div className="examprint-answer-line" key={i} />
        ))}
      </div>
    </div>
  );
};
