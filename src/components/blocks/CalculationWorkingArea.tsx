import React from 'react';
import { QuestionText } from './QuestionText';
import { normalizeLanguage } from '../../utils/languageUtils';

export interface CalculationWorkingAreaProps {
  formula?: string;
  givenData?: string;
  unit?: string;
  height?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  marks?: number;
  showFinalAnswerSlot?: boolean;
  language?: string;
}

export const CalculationWorkingArea: React.FC<CalculationWorkingAreaProps> = ({
  formula,
  givenData,
  unit,
  height,
  marks = 1,
  showFinalAnswerSlot = true,
  language,
}) => {
  const normLang = normalizeLanguage(language);

  const labels = {
    en: {
      workingTitle: 'WORKING / CALCULATIONS:',
      finalAnswer: 'Final Answer / Result:',
      formula: 'Formula:',
      givenData: 'Given Data:',
    },
    fr: {
      workingTitle: 'DÉMARCHE / CALCULS :',
      finalAnswer: 'Réponse finale / Résultat :',
      formula: 'Formule :',
      givenData: 'Données fournies :',
    },
    rw: {
      workingTitle: 'INZIRA Z’IBARAZO / CALCULATIONS:',
      finalAnswer: 'Igisubizo cya nyuma:',
      formula: 'Iteganyanyobora / Formula:',
      givenData: 'Imibare yatanzwe:',
    },
  }[normLang] || {
    workingTitle: 'WORKING / CALCULATIONS:',
    finalAnswer: 'Final Answer / Result:',
    formula: 'Formula:',
    givenData: 'Given Data:',
  };

  // Determine height dynamically based on marks if not explicitly set to a semantic value
  let calcHeightStyle = {};
  if (height === 'xlarge' || marks >= 6) {
    calcHeightStyle = { minHeight: '10.5cm' }; // ~4.0 inches
  } else if (height === 'large' || marks >= 4) {
    calcHeightStyle = { minHeight: '7.5cm' };
  } else if (height === 'small' || marks <= 2) {
    calcHeightStyle = { minHeight: '3.2cm' };
  } else {
    calcHeightStyle = { minHeight: '5.0cm' }; // ~2.0 inches for 3 marks
  }

  return (
    <div className="examprint-calculation-box my-2.5 w-full border border-black rounded-none break-inside-avoid">
      {/* Optional Metadata Header: Formula & Given Data */}
      {(formula || givenData) && (
        <div className="bg-white border-b border-black p-2 text-[10pt]">
          {formula && (
            <div className="examprint-calculation-formula flex items-baseline gap-2 mb-1">
              <span className="font-bold italic text-black">{labels.formula}</span>
              <span className="font-mono bg-white px-1.5 py-0.5 border border-black rounded-none text-black font-semibold">
                <QuestionText text={formula} />
              </span>
            </div>
          )}
          {givenData && (
            <div className="examprint-calculation-given flex items-baseline gap-2 text-black">
              <span className="font-semibold text-black text-xs uppercase tracking-wide">{labels.givenData}</span>
              <span><QuestionText text={givenData} /></span>
            </div>
          )}
        </div>
      )}

      {/* Main Working & Calculation Space */}
      <div className={`examprint-calculation-workspace p-2 relative bg-white`} style={calcHeightStyle}>
        <div className="text-[8.5pt] font-extrabold uppercase tracking-wider text-black mb-1 select-none">
          {labels.workingTitle}
        </div>
        
        {/* Subtle grid line for working top boundary */}
        <div className="absolute inset-x-2 top-7 bottom-2 border-t border-dotted border-black pointer-events-none" />
      </div>

      {/* Final Answer Line */}
      {showFinalAnswerSlot && (
        <div className="examprint-final-answer-row border-t border-black bg-white p-2 flex items-center justify-between text-[10.5pt]">
          <span className="font-extrabold uppercase tracking-wide text-black mr-2">
            {labels.finalAnswer}
          </span>
          <div className="flex-1 flex items-baseline gap-2">
            <span className="flex-1 border-b-2 border-dotted border-black inline-block h-[0.6cm]" />
            {unit && (
              <span className="font-bold text-black pl-1 text-[10pt] whitespace-nowrap">
                [{unit}]
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
