import React from 'react';
import { Question } from '../../types';
import { QuestionText } from './QuestionText';

export function DataTable({ data, style }: { data?: Question['tableData'], style?: string }) {
  if (!data?.rows?.length) return null;

  const hasSemantic = !!data.semanticCells && data.semanticCells.length === data.rows.length;
  
  if (hasSemantic) {
    const [head, ...rows] = data.semanticCells!;
    return (
      <table className="examprint-table" data-style={style || 'standard'}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>
                <QuestionText text={h.text} disableEmphasis={true} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                const isCandidateCell = cell.role === 'CANDIDATE_RESPONSE';
                return (
                  <td key={ci} className={isCandidateCell ? 'examprint-candidate-cell' : undefined}>
                    {isCandidateCell ? (
                      <div className="examprint-cell-dotted-lines" title="Candidate Response Space">
                        <div className="examprint-cell-dotted-line" />
                        <div className="examprint-cell-dotted-line" />
                      </div>
                    ) : (
                      <QuestionText text={cell.text} disableEmphasis={true} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const [head, ...rows] = data.rows;
  return (
    <table className="examprint-table" data-style={style || 'standard'}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i}>
              <QuestionText text={h} disableEmphasis={true} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => {
              const trimmed = (cell || '').trim();
              const isCandidateCell =
                !cell ||
                trimmed === '' ||
                /^[\._\-–—\s]{3,}$/.test(trimmed) ||
                /^\[\s*[\._\-–—\s]*\s*\]$/.test(trimmed) ||
                /^(candidate_answer|blank|\[blank\]|\(\s*\))$/i.test(trimmed);

              return (
                <td key={ci} className={isCandidateCell ? 'examprint-candidate-cell' : undefined}>
                  {isCandidateCell ? (
                    <div className="examprint-cell-dotted-lines" title="Candidate Response Space">
                      <div className="examprint-cell-dotted-line" />
                      <div className="examprint-cell-dotted-line" />
                    </div>
                  ) : (
                    <QuestionText text={cell} disableEmphasis={true} />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
