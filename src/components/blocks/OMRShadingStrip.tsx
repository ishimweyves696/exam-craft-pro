import React from 'react';

export interface OMRShadingStripProps {
  optionsCount?: number;
  labels?: string[];
  style?: 'bubbles' | 'box';
  questionNumber?: number | string;
}

export const OMRShadingStrip: React.FC<OMRShadingStripProps> = ({
  optionsCount = 4,
  labels = ['A', 'B', 'C', 'D'],
  style = 'bubbles',
  questionNumber,
}) => {
  const displayLabels = labels.slice(0, optionsCount);

  if (style === 'box') {
    return (
      <div className="examprint-omr-box flex items-center gap-1.5 ml-auto pl-3 select-none">
        <span className="text-[8.5pt] font-semibold text-slate-700">Answer:</span>
        <div className="w-8 h-7 border-2 border-black flex items-center justify-center font-bold text-[10pt] bg-white" />
      </div>
    );
  }

  return (
    <div className="examprint-omr-strip flex items-center gap-2 select-none my-1.5 ml-auto pl-2 break-inside-avoid">
      {questionNumber && (
        <span className="text-[9pt] font-bold text-slate-900 mr-1">
          [{questionNumber}]
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {displayLabels.map((lbl, idx) => (
          <div key={idx} className="flex items-center gap-0.5">
            <div className="w-5 h-5 rounded-full border border-black flex items-center justify-center text-[8pt] font-bold text-black bg-white hover:bg-slate-100 transition-colors">
              {lbl}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
