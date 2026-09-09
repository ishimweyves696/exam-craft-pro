import React from 'react';
import { QuestionText } from './QuestionText';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * TRANSLATION
 *
 * Fixed typesetting: a boxed source text with its language named, followed by a
 * labelled ruled area for the target language. Identical on every paper.
 */
export const TranslationBlock: React.FC<{
  sourceText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  marks?: number;
  language?: string;
}> = ({ sourceText, sourceLanguage, targetLanguage, marks = 5, language }) => {
  const lang = normalizeLanguage(language);
  const lines = Math.max(4, Math.min(20, Math.round(marks * 1.5)));

  const t =
    lang === 'fr'
      ? { source: 'Texte source', target: 'Votre traduction' }
      : { source: 'Source text', target: 'Your translation' };

  return (
    <div className="examprint-translation">
      {sourceText && (
        <div className="examprint-translation-source">
          <div className="examprint-translation-caption">
            {t.source}
            {sourceLanguage ? ` (${sourceLanguage})` : ''}
          </div>
          <div className="examprint-translation-text">
            <QuestionText text={sourceText} />
          </div>
        </div>
      )}
      <div className="examprint-translation-caption">
        {t.target}
        {targetLanguage ? ` (${targetLanguage})` : ''}
      </div>
      <div className="examprint-translation-lines">
        {Array.from({ length: lines }).map((_, i) => (
          <div className="examprint-answer-line" key={i} />
        ))}
      </div>
    </div>
  );
};
