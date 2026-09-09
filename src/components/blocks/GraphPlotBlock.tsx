import React from 'react';
import { CoordinateGrid } from './CoordinateGrid';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * GRAPH PLOTTING
 *
 * Fixed typesetting: a compulsory scale directive printed above a graph grid,
 * the way plotting items appear on national papers. The scale sentence is a code
 * rule with a fixed default; only the numbers may come from the question.
 */
export const GraphPlotBlock: React.FC<{
  marks?: number;
  language?: string;
  scaleX?: string;
  scaleY?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}> = ({ marks = 4, language, scaleX, scaleY, xAxisLabel, yAxisLabel }) => {
  const lang = normalizeLanguage(language);
  const x = scaleX || '2 cm to 1 unit';
  const y = scaleY || scaleX || '2 cm to 1 unit';

  const scaleSentence =
    lang === 'fr'
      ? `Utilisez une échelle de ${x} sur l'axe des abscisses et de ${y} sur l'axe des ordonnées.`
      : `Use a scale of ${x} on the horizontal axis and ${y} on the vertical axis.`;

  return (
    <div className="examprint-graph-plot">
      <div className="examprint-graph-scale">{scaleSentence}</div>
      <CoordinateGrid marks={marks} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />
    </div>
  );
};
