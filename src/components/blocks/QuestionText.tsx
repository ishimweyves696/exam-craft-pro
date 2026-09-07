import React from 'react';
import { emphasizeQuestionText, cleanRawMathAndHtml } from '../../utils/textEmphasis.js';
import { renderInlineMarkers } from '../../lib/richText';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface QuestionTextProps {
  text: string;
  className?: string;
  disableEmphasis?: boolean;
}

export function QuestionText({ text, className = '', disableEmphasis = false }: QuestionTextProps) {
  if (!text) return null;

  // 1. Run the official NESA command verb & absolute keyword highlighter if not disabled
  let formatted = disableEmphasis
    ? renderInlineMarkers(escapeHtml(cleanRawMathAndHtml(text)))
    : emphasizeQuestionText(text);

  // Convert fill-in-the-blank underscores, repeated dots, asterisks, solid dashes, or blank brackets into standardized dotted answer lines
  formatted = formatted.replace(/(?:\*{3,}|(?:\*\s*){3,}|\.{3,}|_{2,}|[─—–]{2,}|\[\s*\]|\[blank\]|\[\s*\.{2,}\s*\]|\(\s*\.{2,}\s*\)|\(\s*_{2,}\s*\))/gi, () => {
    return '<span class="inline-block w-24 border-b-2 border-dotted border-black mx-1 translate-y-[-2px] align-baseline"></span>';
  });

  // 2.5. Parenthetical choice bolding: Format choices inside parentheses like (is, are, was, were) or (is / are) in bold
  formatted = formatted.replace(/\(([^()\n]+?)\)/g, (fullMatch, inner) => {
    if (inner.includes('<strong>') || inner.includes('**')) {
      return fullMatch;
    }
    if (inner.includes(',') || inner.includes('/')) {
      const separator = inner.includes(',') ? ',' : '/';
      const parts = inner.split(separator);
      // Skip numeric tuples like (3, -4) or (1.5, 2.0)
      if (parts.every(p => /^-?\d+(\.\d+)?$/.test(p.trim()))) {
        return fullMatch;
      }
      if (parts.length >= 2 && parts.every(p => p.trim().length > 0 && p.trim().length < 50)) {
        const formattedParts = parts.map(p => {
          const trimmed = p.trim();
          const leadingSpace = p.match(/^\s*/)?.[0] || '';
          const trailingSpace = p.match(/\s*$/)?.[0] || '';
          return `${leadingSpace}<span class="examprint-option-choice"><strong>${trimmed}</strong></span>${trailingSpace}`;
        });
        return `(<span class="examprint-option-group">${formattedParts.join(separator)}</span>)`;
      }
    }
    return fullMatch;
  });

  return (
    <span
      className={`examprint-question-text-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}
