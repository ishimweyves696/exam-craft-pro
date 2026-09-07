import React from 'react';

export interface CoordinateGridProps {
  widthCm?: number;
  heightCm?: number;
  majorGridMm?: number;
  minorGridMm?: number;
  showAxes?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  marks?: number;
}

export const CoordinateGrid: React.FC<CoordinateGridProps> = ({
  widthCm = 12,
  heightCm = 8,
  showAxes = true,
  xAxisLabel,
  yAxisLabel,
  marks = 4,
}) => {
  // Dynamically scale grid size based on marks if not specified
  const effectiveHeightCm = marks >= 6 ? 10 : marks <= 2 ? 6 : heightCm;

  return (
    <div className="examprint-coordinate-grid-container my-3 w-full flex flex-col items-center break-inside-avoid">
      <div 
        className="examprint-coordinate-grid relative border-2 border-black bg-white"
        style={{
          width: `${widthCm}cm`,
          height: `${effectiveHeightCm}cm`,
          backgroundImage: `
            linear-gradient(to right, #000000 1px, transparent 1px),
            linear-gradient(to bottom, #000000 1px, transparent 1px),
            linear-gradient(to right, #94a3b8 0.5px, transparent 0.5px),
            linear-gradient(to bottom, #94a3b8 0.5px, transparent 0.5px)
          `,
          backgroundSize: `
            10mm 10mm,
            10mm 10mm,
            2mm 2mm,
            2mm 2mm
          `,
        }}
      >
        {/* Optional Origin / Axis Marker */}
        {showAxes && (
          <>
            <div className="absolute left-3 bottom-2 text-[9pt] font-mono font-bold select-none text-black">
              O
            </div>
            {xAxisLabel && (
              <div className="absolute right-2 bottom-1 text-[8.5pt] font-bold italic text-black">
                {xAxisLabel}
              </div>
            )}
            {yAxisLabel && (
              <div className="absolute left-2 top-1 text-[8.5pt] font-bold italic text-black">
                {yAxisLabel}
              </div>
            )}
          </>
        )}
      </div>
      <div className="text-[8pt] text-slate-500 italic mt-1 text-center select-none">
        [Graph plotting grid: 2mm minor divisions / 10mm major divisions]
      </div>
    </div>
  );
};
