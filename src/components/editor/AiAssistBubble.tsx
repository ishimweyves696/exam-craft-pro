/**
 * AI ASSIST BUBBLE
 *
 * A floating composer at the bottom of the paper. The teacher types (or
 * dictates) a change for the question they have selected — "split this into
 * three questions", "turn this matching table into multiple choice", "give
 * more writing space". Only that one question reloads while the AI works.
 */
import React, { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  'Split this into multiple questions',
  'Turn this into multiple choice',
  'Increase the answering space',
  'Make it harder for this level',
  'Rewrite with a Rwandan context',
  'Add sub-parts (a), (b), (c)',
];

export function AiAssistBubble({
  targetLabel,
  hasTarget,
  busy,
  error,
  note,
  onSubmit,
  onDismissMessage,
}: {
  targetLabel: string;
  hasTarget: boolean;
  busy: boolean;
  error?: string;
  note?: string;
  onSubmit: (instruction: string) => void;
  onDismissMessage: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const speechSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const toggleDictation = () => {
    if (!speechSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new Ctor();
    rec.lang = 'en-GB';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results as any[])
        .map((r: any) => r[0]?.transcript ?? '')
        .join(' ')
        .trim();
      setValue((v) => (v ? `${v} ${text}` : text));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const submit = () => {
    const instruction = value.trim();
    if (!instruction || busy || !hasTarget) return;
    onSubmit(instruction);
    setValue('');
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 p-4 print:hidden">
      {(error || note) && (
        <div
          className={`pointer-events-auto flex max-w-xl items-start gap-2 rounded-xl border px-3 py-2 text-xs shadow-lg ${
            error
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-border bg-background text-muted-foreground'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="flex-1">{error ?? note}</span>
          <button onClick={onDismissMessage} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {open ? (
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              AI
            </span>
            <span className="text-xs font-semibold text-foreground">Ask AI to edit</span>
            <span
              className={`truncate rounded-full border px-2 py-0.5 text-[11px] ${
                hasTarget
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-600'
              }`}
            >
              {hasTarget ? targetLabel : 'Select a question on the paper first'}
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
              className="ml-auto rounded px-1.5 text-muted-foreground hover:bg-accent"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setValue(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 p-3">
            <textarea
              ref={inputRef}
              rows={2}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Describe the change — e.g. “split question into three shorter ones”"
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {speechSupported && (
              <button
                onClick={toggleDictation}
                aria-label={listening ? 'Stop dictation' : 'Dictate instruction'}
                className={`h-10 w-10 shrink-0 rounded-xl border text-base ${
                  listening
                    ? 'animate-pulse border-destructive/40 bg-destructive/10 text-destructive'
                    : 'border-input text-muted-foreground hover:bg-accent'
                }`}
              >
                🎙
              </button>
            )}
            <button
              onClick={submit}
              disabled={busy || !hasTarget || !value.trim()}
              className="h-10 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {busy ? 'Working…' : 'Apply'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask AI to edit this question"
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-2xl transition hover:scale-[1.03] hover:bg-primary/90"
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-[11px] font-bold ${
              busy ? 'animate-spin' : ''
            }`}
          >
            {busy ? '◌' : 'AI'}
          </span>
          {busy ? 'Editing question…' : 'Ask AI'}
          <kbd className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>
      )}
    </div>
  );
}

/** Skeleton shown in place of the single question the AI is rewriting. */
export function QuestionSkeleton({ label }: { label: string }) {
  return (
    <div
      className="examedit-question relative overflow-hidden rounded-md border border-primary/30 bg-primary/[0.03] p-3"
      aria-busy="true"
      role="status"
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-primary">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        {label}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-8/12 animate-pulse rounded bg-slate-200" />
        <div className="ml-8 h-3 w-6/12 animate-pulse rounded bg-slate-200" />
        <div className="ml-8 h-3 w-7/12 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
