import React from 'react';
import { QuestionText } from './QuestionText';

export interface SentenceTransformationItem {
  id?: string;
  originalSentence: string;
  promptStarter?: string;
  marks?: number;
}

export interface SentenceTransformationBlockProps {
  originalSentence?: string;
  promptStarter?: string;
  marks?: number;
  items?: SentenceTransformationItem[];
}

export const SentenceTransformationBlock: React.FC<SentenceTransformationBlockProps> = ({
  originalSentence,
  promptStarter,
  marks = 1,
  items,
}) => {
  const list = items && items.length > 0 
    ? items 
    : originalSentence 
      ? [{ originalSentence, promptStarter, marks }] 
      : [];

  if (list.length === 0) return null;

  return (
    <div className="examprint-transformation-block my-2 w-full flex flex-col gap-2.5 break-inside-avoid">
      {list.map((item, idx) => (
        <div key={item.id || idx} className="examprint-transformation-item flex flex-col gap-1 text-[10.5pt]">
          {/* Original Sentence */}
          <div className="text-black font-medium pl-1">
            <QuestionText text={item.originalSentence} />
          </div>

          {/* Rewrite prompt starter with dotted leader answer space */}
          <div className="flex items-baseline gap-2 pl-3">
            {item.promptStarter && (
              <span className="font-semibold text-black italic shrink-0">
                {item.promptStarter}
              </span>
            )}
            <div className="grow border-b border-dotted border-black h-4 mb-0.5" />
            {item.marks && (
              <span className="text-[9pt] font-semibold text-slate-700 shrink-0 ml-1">
                ({item.marks} mark{item.marks === 1 ? '' : 's'})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
