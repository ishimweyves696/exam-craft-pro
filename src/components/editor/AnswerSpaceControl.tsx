import React from 'react';
import { ANSWER_LINES } from '../blocks/AnswerSpace';

/**
 * ANSWER SPACE — one code-owned rule set, used by both the editor preview and
 * the printed paper. The teacher chooses WHAT kind of space and HOW MUCH;
 * the exact geometry is always computed here, never improvised.
 */

export const ANSWER_STYLES: { value: string; label: string }[] = [
  { value: 'dotted', label: 'Dotted lines' },
  { value: 'solid', label: 'Solid lines' },
  { value: 'dashed', label: 'Dashed lines' },
  { value: 'box', label: 'Plain box' },
  { value: 'grid', label: 'Graph squares' },
  { value: 'blank', label: 'Blank space' },
];

export const ANSWER_SIZES: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Full page' },
];

export interface AnswerSpaceValue {
  answerSpace?: string;
  answerStyle?: string;
  customLines?: number;
}

/** The single source of truth for how many lines a question gets. */
export function resolveAnswerLines(v: AnswerSpaceValue, marks?: number): number {
  if (typeof v.customLines === 'number' && v.customLines >= 0) return v.customLines;
  const size = v.answerSpace ?? 'none';
  if (size === 'none') return 0;
  let lines = ANSWER_LINES[size] ?? 4;
  if (size === 'xlarge' && marks && marks >= 10) {
    lines = Math.max(lines, Math.min(26, Math.round(marks * 1.5)));
  }
  return lines;
}

/** Faithful, non-interactive preview of the printed answer space. */
export function AnswerSpacePreview({ value, marks }: { value: AnswerSpaceValue; marks?: number }) {
  const lines = resolveAnswerLines(value, marks);
  if (lines <= 0) return null;
  const style = value.answerStyle ?? 'dotted';

  if (style === 'box' || style === 'grid') {
    return (
      <div
        className="examedit-space"
        data-style={style}
        style={{ height: `${lines * 0.85}cm` }}
        aria-label={`${style === 'grid' ? 'Graph squares' : 'Plain box'} answer space`}
      />
    );
  }

  return (
    <div className="examedit-space" data-style={style} aria-label="Answer lines">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="examedit-space-line" />
      ))}
    </div>
  );
}

/** Compact control used in the inspector and directly on sub-parts. */
export function AnswerSpaceControl({
  value,
  marks,
  onChange,
  compact = false,
}: {
  value: AnswerSpaceValue;
  marks?: number;
  onChange: (next: AnswerSpaceValue) => void;
  compact?: boolean;
}) {
  const lines = resolveAnswerLines(value, marks);
  const custom = typeof value.customLines === 'number';

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap gap-1">
        {ANSWER_STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ ...value, answerStyle: s.value })}
            className={`rounded-full border px-2 py-1 text-[11px] ${
              (value.answerStyle ?? 'dotted') === s.value
                ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1">
          {ANSWER_SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ ...value, answerSpace: s.value, customLines: undefined })}
              className={`rounded-full border px-2 py-1 text-[11px] ${
                !custom && (value.answerSpace ?? 'none') === s.value
                  ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500">Lines</span>
        <div className="flex items-center rounded-md border border-slate-300">
          <button
            type="button"
            aria-label="Fewer lines"
            onClick={() => onChange({ ...value, customLines: Math.max(0, lines - 1) })}
            className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            −
          </button>
          <input
            type="number"
            min={0}
            max={40}
            value={lines}
            onChange={(e) =>
              onChange({ ...value, customLines: Math.max(0, Math.min(40, Number(e.target.value) || 0)) })
            }
            className="w-12 border-x border-slate-200 px-1 py-1 text-center text-xs tabular-nums outline-none"
          />
          <button
            type="button"
            aria-label="More lines"
            onClick={() => onChange({ ...value, customLines: Math.min(40, lines + 1) })}
            className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            +
          </button>
        </div>
        {custom && (
          <button
            type="button"
            onClick={() => onChange({ ...value, customLines: undefined })}
            className="text-[11px] text-indigo-600 underline"
          >
            Use standard size
          </button>
        )}
      </div>
    </div>
  );
}
