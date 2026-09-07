import React from 'react';

export type TrueFalseVariantProp = 'dotted' | 'box';

export function TrueFalse({
  language,
  inline = false,
  variant = 'dotted',
}: {
  language?: string;
  inline?: boolean;
  variant?: TrueFalseVariantProp;
}) {
  const label =
    language === 'fr' ? 'Vrai / Faux' : language === 'rw' ? "Ni ukuri / Si ukuri" : 'True / False';

  if (inline) {
    if (variant === 'box') {
      return (
        <span className="examprint-truefalse-box ml-3 inline-block h-[1.15em] w-[3.2em] border-2 border-black align-baseline" />
      );
    }
    return (
      <span className="examprint-truefalse-slot inline-block ml-3 border-b-2 border-dotted border-black w-24 align-baseline translate-y-[-2px]" />
    );
  }

  if (variant === 'box') {
    return (
      <div className="examprint-truefalse-line mt-1.5 flex items-center justify-end w-full">
        <span className="examprint-dot-leader flex-1 mx-3 border-b border-dotted border-black/40 opacity-75" />
        <span className="mr-2 shrink-0 text-[0.8em] uppercase tracking-wide text-black/70">
          {label}
        </span>
        <span className="examprint-truefalse-box inline-block h-[1.6em] w-[4.5em] shrink-0 border-2 border-black" />
      </div>
    );
  }

  return (
    <div className="examprint-truefalse-line mt-1.5 flex items-center justify-end w-full">
      <span className="examprint-dot-leader flex-1 mx-3 border-b border-dotted border-black/40 opacity-75" />
      <span className="examprint-truefalse-target border-b-2 border-dotted border-black w-28 inline-block shrink-0 text-right pr-1" />
    </div>
  );
}
