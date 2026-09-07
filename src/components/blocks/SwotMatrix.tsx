import React from 'react';
import { getSwotLocalization } from '../../backend/engine/swotMatrixContractEngine';
import { QuestionText } from './QuestionText';

export interface SwotData {
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
}

export interface SwotMatrixProps {
  data?: SwotData;
  language?: string;
  candidateMode?: boolean;
  minLinesPerQuadrant?: number;
}

export const SwotMatrix: React.FC<SwotMatrixProps> = ({
  data,
  language,
  candidateMode = true,
  minLinesPerQuadrant = 4,
}) => {
  const loc = getSwotLocalization(language);

  const hasData = (list?: string[]) => Boolean(list && list.length > 0);
  const showSolution = !candidateMode && data && (
    hasData(data.strengths) ||
    hasData(data.weaknesses) ||
    hasData(data.opportunities) ||
    hasData(data.threats)
  );

  const renderQuadrantContent = (items?: string[]) => {
    if (showSolution && items && items.length > 0) {
      return (
        <ul className="examprint-swot-list list-disc pl-4 space-y-1 text-[10pt] leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx} className="break-inside-avoid">
              <QuestionText text={item} />
            </li>
          ))}
        </ul>
      );
    }

    // Render candidate dotted handwriting lines
    const lineCount = Math.max(minLinesPerQuadrant, items?.length || 0);
    return (
      <div className="examprint-swot-lines flex flex-col gap-[0.35cm] pt-1">
        {Array.from({ length: lineCount }).map((_, idx) => (
          <div key={idx} className="examprint-swot-line border-b border-dotted border-slate-700 h-[0.7cm]" />
        ))}
      </div>
    );
  };

  return (
    <div className="examprint-swot-matrix my-3 w-full border-2 border-black break-inside-avoid">
      {/* Category Classification Top Bar */}
      <div className="grid grid-cols-2 text-center text-[9pt] font-extrabold uppercase bg-slate-100 border-b-2 border-black py-1 tracking-wider">
        <div className="border-r-2 border-black">{loc.internalHeader}</div>
        <div>{loc.externalHeader}</div>
      </div>

      {/* 2x2 Grid Quadrants */}
      <div className="grid grid-cols-2">
        {/* Quadrant 1: Strengths */}
        <div className="examprint-swot-quadrant border-r-2 border-b-2 border-black p-2 min-h-[3.8cm] flex flex-col">
          <div className="examprint-swot-title font-extrabold text-[10pt] uppercase mb-1.5 pb-0.5 border-b border-slate-300">
            {loc.strengthsTitle}
          </div>
          <div className="flex-1">{renderQuadrantContent(data?.strengths)}</div>
        </div>

        {/* Quadrant 2: Weaknesses */}
        <div className="examprint-swot-quadrant border-b-2 border-black p-2 min-h-[3.8cm] flex flex-col">
          <div className="examprint-swot-title font-extrabold text-[10pt] uppercase mb-1.5 pb-0.5 border-b border-slate-300">
            {loc.weaknessesTitle}
          </div>
          <div className="flex-1">{renderQuadrantContent(data?.weaknesses)}</div>
        </div>

        {/* Quadrant 3: Opportunities */}
        <div className="examprint-swot-quadrant border-r-2 border-black p-2 min-h-[3.8cm] flex flex-col">
          <div className="examprint-swot-title font-extrabold text-[10pt] uppercase mb-1.5 pb-0.5 border-b border-slate-300">
            {loc.opportunitiesTitle}
          </div>
          <div className="flex-1">{renderQuadrantContent(data?.opportunities)}</div>
        </div>

        {/* Quadrant 4: Threats */}
        <div className="examprint-swot-quadrant p-2 min-h-[3.8cm] flex flex-col">
          <div className="examprint-swot-title font-extrabold text-[10pt] uppercase mb-1.5 pb-0.5 border-b border-slate-300">
            {loc.threatsTitle}
          </div>
          <div className="flex-1">{renderQuadrantContent(data?.threats)}</div>
        </div>
      </div>
    </div>
  );
};
