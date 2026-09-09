import React from 'react';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * BALANCED CHEMICAL EQUATION
 *
 * Fixed typesetting: a ruled writing strip with the reaction arrow pre-printed,
 * exactly as chemistry papers present equation-writing items. Nothing about this
 * layout is decided per question — only the number of equation slots, which is
 * derived from the marks.
 */
export const EquationFrame: React.FC<{
  slots?: number;
  marks?: number;
  language?: string;
  stateSymbolsNote?: boolean;
}> = ({ slots, marks = 2, language, stateSymbolsNote = true }) => {
  const lang = normalizeLanguage(language);
  const count = Math.max(1, Math.min(4, slots ?? Math.max(1, Math.round(marks / 2))));

  const labels =
    lang === 'fr'
      ? { reactants: 'Réactifs', products: 'Produits', note: 'Indiquez les états physiques entre parenthèses, par ex. (s), (l), (g), (aq).' }
      : { reactants: 'Reactants', products: 'Products', note: 'Include state symbols in brackets, e.g. (s), (l), (g), (aq).' };

  return (
    <div className="examprint-equation-frame">
      {Array.from({ length: count }).map((_, i) => (
        <div className="examprint-equation-row" key={i}>
          <div className="examprint-equation-side">
            <span className="examprint-equation-caption">{labels.reactants}</span>
          </div>
          <div className="examprint-equation-arrow" aria-hidden="true">&#8594;</div>
          <div className="examprint-equation-side">
            <span className="examprint-equation-caption">{labels.products}</span>
          </div>
        </div>
      ))}
      {stateSymbolsNote && <div className="examprint-equation-note">{labels.note}</div>}
    </div>
  );
};
