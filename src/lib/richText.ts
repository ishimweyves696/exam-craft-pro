/**
 * RICH TEXT — teacher emphasis without ever letting HTML into the paper.
 *
 * The stored exam keeps plain text. Teacher emphasis (bold, italic, underline,
 * superscript, subscript) is stored as fixed sentinel markers, e.g.
 *   "The [[b]]mass[[/b]] of CO[[sub]]2[[/sub]]"
 *
 * Why markers and not HTML: the printed paper escapes all HTML so pasted Word
 * markup can never break the layout. Markers are converted to a FIXED, code-owned
 * set of tags at render time, so formatting stays predictable and identical
 * every single time.
 */

export const RICH_TAGS = ['b', 'i', 'u', 'sup', 'sub'] as const;
export type RichTag = (typeof RICH_TAGS)[number];

const MARKER_RE = /\[\[(\/?)(b|i|u|sup|sub)\]\]/g;

const TAG_HTML: Record<RichTag, [string, string]> = {
  b: ['<strong class="examprint-user-bold">', '</strong>'],
  i: ['<em class="examprint-user-italic">', '</em>'],
  u: ['<u class="examprint-user-underline">', '</u>'],
  sup: ['<sup>', '</sup>'],
  sub: ['<sub>', '</sub>'],
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Turn markers inside ALREADY-ESCAPED text into the fixed tag set. */
export function renderInlineMarkers(escaped: string): string {
  return escaped.replace(MARKER_RE, (_m, closing: string, tag: string) => {
    const pair = TAG_HTML[tag as RichTag];
    if (!pair) return '';
    return closing ? pair[1] : pair[0];
  });
}

/** Remove markers entirely (for plain-text contexts such as exports). */
export function stripMarkers(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(MARKER_RE, '');
}

export function hasMarkers(text: string | undefined | null): boolean {
  if (!text) return false;
  MARKER_RE.lastIndex = 0;
  return MARKER_RE.test(text);
}

/** Marked plain text -> safe HTML for the editable canvas. */
export function markedToHtml(text: string | undefined | null): string {
  if (!text) return '';
  return renderInlineMarkers(escapeHtml(text)).replace(/\n/g, '<br>');
}

const TAG_FOR_ELEMENT: Record<string, RichTag> = {
  B: 'b',
  STRONG: 'b',
  I: 'i',
  EM: 'i',
  U: 'u',
  SUP: 'sup',
  SUB: 'sub',
};

/** Contenteditable HTML -> marked plain text. Everything unknown is dropped. */
export function htmlToMarked(root: HTMLElement): string {
  const out: string[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out.push((node.textContent ?? '').replace(/\u00a0/g, ' '));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    if (el.tagName === 'BR') {
      out.push('\n');
      return;
    }

    let tag = TAG_FOR_ELEMENT[el.tagName];
    if (!tag) {
      // The browser sometimes applies emphasis with inline styles instead of tags.
      const style = el.style;
      const weight = style.fontWeight;
      if (weight === 'bold' || Number(weight) >= 600) tag = 'b';
      else if (style.fontStyle === 'italic') tag = 'i';
      else if (style.textDecorationLine?.includes('underline') || style.textDecoration?.includes('underline'))
        tag = 'u';
    }

    const isBlock = ['DIV', 'P', 'LI'].includes(el.tagName);
    if (isBlock && out.length && !out[out.length - 1].endsWith('\n')) out.push('\n');

    if (tag) out.push(`[[${tag}]]`);
    el.childNodes.forEach(walk);
    if (tag) out.push(`[[/${tag}]]`);
  };

  root.childNodes.forEach(walk);

  return out
    .join('')
    // Collapse empty emphasis runs so the stored text stays clean.
    .replace(/\[\[(b|i|u|sup|sub)\]\]\s*\[\[\/\1\]\]/g, '')
    .replace(/\[\[\/(b|i|u|sup|sub)\]\]\[\[\1\]\]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trimEnd();
}
