import React from 'react';
import { Question } from '../../types';

export const ANSWER_LINES: Record<string, number> = { none: 0, small: 2, medium: 4, large: 8, xlarge: 16 };

export function AnswerSpace({ size, style, customLines, marks }: { size?: Question['answerSpace'], style?: string, customLines?: number, marks?: number }) {
  let lines = 0;
  
  if (customLines !== undefined && customLines !== null) {
    lines = customLines;
  } else if (size && size !== 'none') {
    lines = ANSWER_LINES[size] ?? 4;
    if (size === 'xlarge' && marks && marks >= 10) {
      lines = Math.max(lines, Math.min(26, Math.round(marks * 1.5)));
    }
  }

  if (lines <= 0) return null;
  
  if (style === 'box' || style === 'grid') {
     return <div className={`examprint-answer-space examprint-answer-space--${size || 'medium'}`} data-style={style} style={customLines !== undefined ? { height: `${customLines * 0.85}cm` } : { height: `${lines * 0.85}cm` }} />;
  }
  
  return (
    <div className={`examprint-answer-space examprint-answer-space--${size || 'medium'}`} data-style={style || 'dotted'} style={{ pageBreakInside: lines >= 8 ? 'auto' : 'avoid', breakInside: lines >= 8 ? 'auto' : 'avoid' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div className="examprint-answer-line" key={i} />
      ))}
    </div>
  );
}

