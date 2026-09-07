import React, { useEffect, useRef } from 'react';
import { htmlToMarked, markedToHtml } from '../../lib/richText';

/**
 * Click-to-type text inside the paper canvas.
 *
 * The element is uncontrolled while focused (so the caret never jumps) and is
 * synced back from props whenever the stored value changes elsewhere, e.g.
 * after undo.
 *
 * `rich` fields let the teacher apply bold / italic / underline / super- and
 * subscript. Those are stored as fixed markers (see lib/richText) — never raw
 * HTML — so the printed paper keeps its code-owned formatting rules.
 */
export function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Type here…',
  multiline = true,
  rich = false,
  onFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rich?: boolean;
  onFocus?: (el: HTMLElement) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const focused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || focused.current) return;
    if (rich) {
      const next = markedToHtml(value);
      if (el.innerHTML !== next) el.innerHTML = next;
    } else if (el.innerText !== value) {
      el.innerText = value ?? '';
    }
  }, [value, rich]);

  const readBack = (el: HTMLElement) =>
    rich ? htmlToMarked(el) : el.innerText.replace(/\u00a0/g, ' ').trimEnd();

  return (
    <span
      ref={ref}
      role="textbox"
      tabIndex={0}
      aria-label={placeholder}
      data-placeholder={placeholder}
      data-rich={rich ? 'true' : undefined}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      className={`examedit-field ${className}`}
      onFocus={(e) => {
        focused.current = true;
        onFocus?.(e.currentTarget);
      }}
      onBlur={(e) => {
        focused.current = false;
        const next = readBack(e.currentTarget);
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e) => {
        const mod = e.metaKey || e.ctrlKey;
        if (rich && mod) {
          const k = e.key.toLowerCase();
          const cmd = k === 'b' ? 'bold' : k === 'i' ? 'italic' : k === 'u' ? 'underline' : null;
          if (cmd) {
            e.preventDefault();
            document.execCommand(cmd);
            return;
          }
        }
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
        if (e.key === 'Escape') (e.currentTarget as HTMLElement).blur();
      }}
      onPaste={(e) => {
        // Paste as plain text so pasted Word markup can never break the paper.
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, multiline ? text : text.replace(/\s+/g, ' '));
      }}
    />
  );
}
