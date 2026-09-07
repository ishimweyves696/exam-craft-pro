import React from 'react';

interface DottedLineFillProps {
  lines?: number;
  inline?: boolean;
  width?: string; // e.g. "4cm" or "100%"
}

export function DottedLineFill({ lines = 1, inline = false, width }: DottedLineFillProps) {
  if (inline) {
    return (
      <span 
        className="examprint-dotted-fill-inline inline-block border-b border-dotted border-black border-spacing-1 h-[1.2em] align-middle"
        style={{ width: width || '4cm', minWidth: '2cm' }}
      />
    );
  }

  return (
    <div className="examprint-dotted-fill-block space-y-4 my-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="examprint-dotted-line-item border-b border-dotted border-black h-[1.8rem] w-full"
        />
      ))}
    </div>
  );
}
