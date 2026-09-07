import React from 'react';
import { QuestionText } from './QuestionText';

const MATCHING_PREFIX_REGEX = /^(?:\d+[\.\)]\s*|[A-Za-z][\.\)]\s*|\([A-Za-z0-9]+\)\s*)/i;

function cleanMatchingText(text?: string): string {
  if (!text) return '';
  return text.trim().replace(MATCHING_PREFIX_REGEX, '').trim();
}

export function MatchingTable({
  columnA,
  columnB,
  headers,
  layout = 'traditional',
  language = 'en',
}: {
  columnA?: string[];
  columnB?: string[];
  headers?: string[];
  layout?: string;
  language?: string;
}) {
  if (!columnA || !columnB) return null;
  const rowsCount = Math.max(columnA.length, columnB.length);
  const rows = Array.from({ length: rowsCount });

  const headerA = headers?.[0] || 'Column A';
  const headerB = headers?.[1] || 'Column B';

  const answerLabel = language === 'fr' ? 'Réponses :' : language === 'rw' ? 'Ibisubizo :' : 'Answers:';

  const renderAnswerSlots = () => (
    <div className="examprint-matching-answers mt-3 mb-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-sans">
      <span className="font-bold underline">{answerLabel}</span>
      {columnA.map((_, i) => (
        <span key={i} className="inline-flex items-baseline">
          <span className="font-semibold">{i + 1}</span>
          <span className="mx-1 font-bold">-</span>
          <span className="inline-block w-12 border-b border-black border-dotted"></span>
        </span>
      ))}
    </div>
  );

  if (layout === 'table') {
    return (
      <div className="my-3 w-full">
        <table className="examprint-table w-full border-collapse border border-black text-sm" data-style="standard">
          <thead>
            <tr className="font-bold border-b-2 border-black">
              <th className="p-2 border-r border-black text-left w-1/2">{headerA}</th>
              <th className="p-2 border-black text-left w-1/2">{headerB}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((_, i) => (
              <tr key={i} className="border-b border-black">
                <td className="p-2 border-r border-black align-top">
                  <span className="font-semibold mr-1.5">{i + 1}.</span>
                  {columnA[i] ? <QuestionText text={cleanMatchingText(columnA[i])} disableEmphasis={true} /> : ''}
                </td>
                <td className="p-2 align-top">
                  <span className="font-semibold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                  {columnB[i] ? <QuestionText text={cleanMatchingText(columnB[i])} disableEmphasis={true} /> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {renderAnswerSlots()}
      </div>
    );
  }

  if (layout === 'response-column') {
    return (
      <table className="examprint-table my-3 w-full border-collapse border border-black text-sm">
        <thead>
          <tr className="font-bold border-b-2 border-black">
            <th className="p-2 border-r border-black text-center w-12">No.</th>
            <th className="p-2 border-r border-black text-left">{headerA}</th>
            <th className="p-2 border-r border-black text-center w-24">Answer</th>
            <th className="p-2 border-black text-left">{headerB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, i) => (
            <tr key={i} className="border-b border-black">
              <td className="p-2 border-r border-black text-center font-bold align-top">{i + 1}.</td>
              <td className="p-2 border-r border-black align-top">
                {columnA[i] ? <QuestionText text={cleanMatchingText(columnA[i])} disableEmphasis={true} /> : ''}
              </td>
              <td className="p-2 border-r border-black text-center align-middle font-mono">
                [ &nbsp;&nbsp;&nbsp;&nbsp; ]
              </td>
              <td className="p-2 align-top">
                {columnB[i] ? (
                  <div className="flex items-start">
                    <span className="font-bold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                    <QuestionText text={cleanMatchingText(columnB[i])} disableEmphasis={true} />
                  </div>
                ) : (
                  ''
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (layout === 'ordering') {
    return (
      <div className="ml-4 mt-2 mb-4">
        {rows.map((_, i) => (
          <div key={i} className="flex mb-2 items-start">
            <span className="inline-block w-8 font-bold">{i + 1}.</span>
            <span className="flex-1"><QuestionText text={cleanMatchingText(columnA[i] || columnB[i])} disableEmphasis={true} /></span>
            <span className="inline-block w-24 border-b border-black border-dotted ml-4"></span>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'one-to-many') {
    return (
      <div className="flex flex-col w-full mt-2 mb-4">
        <div className="flex w-full">
          <div className="w-1/3 border-r pr-4 border-black">
            {rows.map((_, i) => columnA[i] ? (
              <div key={`a-${i}`} className="mb-3 font-semibold"><QuestionText text={cleanMatchingText(columnA[i])} disableEmphasis={true} /></div>
            ) : null)}
          </div>
          <div className="w-2/3 pl-4">
            <ul className="list-disc pl-5">
              {rows.map((_, i) => columnB[i] ? (
                <li key={`b-${i}`} className="mb-2"><QuestionText text={cleanMatchingText(columnB[i])} disableEmphasis={true} /></li>
              ) : null)}
            </ul>
          </div>
        </div>
        {renderAnswerSlots()}
      </div>
    );
  }

  if (layout === 'widely-separated') {
    return (
      <div className="flex flex-col w-full mt-2 mb-4">
        <div className="flex w-full gap-8">
          <div className="w-2/5 pr-2">
            <div className="font-bold mb-2 pb-1 border-b border-black">{headerA}</div>
            {rows.map((_, i) => (
              <div key={`a-${i}`} className="flex mb-3 items-start">
                <span className="inline-block w-7 font-bold shrink-0">{i + 1}.</span>
                <span className="flex-1">{columnA[i] ? <QuestionText text={cleanMatchingText(columnA[i])} disableEmphasis={true} /> : ''}</span>
              </div>
            ))}
          </div>
          <div className="w-3/5 pl-2">
            <div className="font-bold mb-2 pb-1 border-b border-black">{headerB}</div>
            {rows.map((_, i) => (
              <div key={`b-${i}`} className="flex mb-3 items-start">
                <span className="inline-block w-7 font-bold shrink-0">{String.fromCharCode(65 + i)}.</span>
                <span className="flex-1">{columnB[i] ? <QuestionText text={cleanMatchingText(columnB[i])} disableEmphasis={true} /> : ''}</span>
              </div>
            ))}
          </div>
        </div>
        {renderAnswerSlots()}
      </div>
    );
  }

  // traditional or two-column (default)
  return (
    <div className="examprint-matching-container flex flex-col w-full my-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <div className="flex w-full gap-6">
        <div className="w-1/2 pr-3">
          <div className="font-bold mb-2 pb-1 border-b border-black text-sm uppercase tracking-wide">{headerA}</div>
          {rows.map((_, i) => (
            <div key={`a-${i}`} className="flex mb-2.5 items-start">
              <span className="inline-block w-7 font-bold shrink-0 text-sm">{i + 1}.</span>
              <span className="flex-1 text-sm leading-snug">{columnA[i] ? <QuestionText text={cleanMatchingText(columnA[i])} disableEmphasis={true} /> : ''}</span>
            </div>
          ))}
        </div>
        <div className="w-1/2 pl-3">
          <div className="font-bold mb-2 pb-1 border-b border-black text-sm uppercase tracking-wide">{headerB}</div>
          {rows.map((_, i) => (
            <div key={`b-${i}`} className="flex mb-2.5 items-start">
              <span className="inline-block w-7 font-bold shrink-0 text-sm">{String.fromCharCode(65 + i)}.</span>
              <span className="flex-1 text-sm leading-snug">{columnB[i] ? <QuestionText text={cleanMatchingText(columnB[i])} disableEmphasis={true} /> : ''}</span>
            </div>
          ))}
        </div>
      </div>
      {renderAnswerSlots()}
    </div>
  );
}
