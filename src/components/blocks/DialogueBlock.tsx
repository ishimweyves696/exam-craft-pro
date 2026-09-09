import React from 'react';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * DIALOGUE WRITING
 *
 * Fixed typesetting: alternating pre-printed speaker labels with a ruled turn
 * for each, so every dialogue item on every paper looks identical.
 */
export const DialogueBlock: React.FC<{
  speakers?: [string, string];
  turns?: number;
  marks?: number;
  language?: string;
}> = ({ speakers, turns, marks = 10, language }) => {
  const lang = normalizeLanguage(language);
  const [a, b] = speakers && speakers.length === 2 ? speakers : lang === 'fr' ? ['A', 'B'] : ['A', 'B'];
  const count = Math.max(4, Math.min(16, turns ?? Math.round(marks * 1.2)));

  return (
    <div className="examprint-dialogue">
      {Array.from({ length: count }).map((_, i) => (
        <div className="examprint-dialogue-turn" key={i}>
          <span className="examprint-dialogue-speaker">{(i % 2 === 0 ? a : b) + ':'}</span>
          <span className="examprint-dialogue-line" />
        </div>
      ))}
    </div>
  );
};
