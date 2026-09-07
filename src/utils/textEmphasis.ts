import { renderInlineMarkers } from '../lib/richText';

const COMMAND_VERBS = [

  'calculate', 'explain', 'describe',
  'compare', 'contrast', 'differentiate',
  'evaluate', 'analyse', 'analyze',
  'discuss', 'define', 'state', 'list',
  'identify', 'outline', 'justify',
  'illustrate', 'summarise', 'summarize',
  'solve', 'derive', 'prove', 'sketch',
  'label', 'classify', 'construct',
  'determine', 'estimate', 'interpret',
];
const ABSOLUTES = [
  'not', 'except', 'only', 'always', 'never',
  'most', 'least', 'best', 'correct', 'incorrect',
  'true', 'false', 'first', 'last',
  'none', 'all', 'must', 'cannot'
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function cleanRawMathAndHtml(input: string): string {
  if (!input) return '';
  let str = input;

  // 0. Decode any HTML entities if present (e.g. &lt;annotation..., &quot;)
  str = str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  // 1. Extract LaTeX formula if input contains KaTeX/MathML annotation block (even if malformed/spaced)
  str = str.replace(/<\s*annotation\s+[^>]*encoding=["']?application\/x-tex["']?[^>]*>([\s\S]*?)<\s*\/\s*annotation\s*>/gi, (_match, tex) => {
    const trimmed = tex.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('$') || trimmed.startsWith('\\(') || trimmed.startsWith('\\[')) {
      return ` ${trimmed} `;
    }
    return ` $${trimmed}$ `;
  });

  // 2. Convert common MathML structures to LaTeX/plain text
  str = str.replace(/<\s*msub\s*>[\s\S]*?<\s*\/\s*msub\s*>/gi, (m) => {
    const parts = m.match(/<\s*(?:mi|mn|mtext)\s*>([\s\S]*?)<\s*\/\s*(?:mi|mn|mtext)\s*>/gi);
    if (parts && parts.length >= 2) {
      const base = parts[0].replace(/<\s*[^>]+>/g, '').trim();
      const sub = parts[1].replace(/<\s*[^>]+>/g, '').trim();
      return `${base}_${sub}`;
    }
    return m;
  });

  str = str.replace(/<\s*msup\s*>[\s\S]*?<\s*\/\s*msup\s*>/gi, (m) => {
    const parts = m.match(/<\s*(?:mi|mn|mtext)\s*>([\s\S]*?)<\s*\/\s*(?:mi|mn|mtext)\s*>/gi);
    if (parts && parts.length >= 2) {
      const base = parts[0].replace(/<\s*[^>]+>/g, '').trim();
      const sup = parts[1].replace(/<\s*[^>]+>/g, '').trim();
      return `${base}^${sup}`;
    }
    return m;
  });

  str = str.replace(/<\s*mfrac\s*>[\s\S]*?<\s*\/\s*mfrac\s*>/gi, (m) => {
    const parts = m.match(/<\s*(?:mrow|mi|mn|mtext)\s*>([\s\S]*?)<\s*\/\s*(?:mrow|mi|mn|mtext)\s*>/gi);
    if (parts && parts.length >= 2) {
      const num = parts[0].replace(/<\s*[^>]+>/g, '').trim();
      const den = parts[1].replace(/<\s*[^>]+>/g, '').trim();
      return `\\frac{${num}}{${den}}`;
    }
    return m;
  });

  str = str.replace(/<\s*sub\s*>([\s\S]*?)<\s*\/\s*sub\s*>/gi, '_$1');
  str = str.replace(/<\s*sup\s*>([\s\S]*?)<\s*\/\s*sup\s*>/gi, '^$1');

  // 3. Remove KaTeX HTML container blocks (e.g., <span class="katex-html"...>...</span>)
  str = str.replace(/<\s*span\b[^>]*class=["']?[^"']*katex-html[^"']*["']?[^>]*>[\s\S]*?<\s*\/\s*span\s*>/gi, '');

  // 4. Strip remaining raw KaTeX HTML spans / MathML / spaced tags that leak into text (e.g. < /mo>, < /mi>, < / span >)
  str = str.replace(/<\s*\/?\s*(?:math|mathxmlns|semantics|annotation|mrow|msub|msup|mfrac|mi|mo|mn|mtext|mspace|msqrt|mroot|mtable|mtr|mtd|mstyle|mofence|span|spanclass)\b[^>]*>/gi, ' ');


  // 5. Remove dangling attribute fragments like spanclass="...", aria-hidden="...", etc.
  str = str.replace(/spanclass\s*=\s*["'][^"']*["']/gi, '');
  str = str.replace(/aria-hidden\s*=\s*["'][^"']*["']/gi, '');
  str = str.replace(/delimsizingsize\d+/gi, '');

  // 6. Clean dangling single closing brackets or fragment artifacts
  str = str.replace(/<\/span>/gi, '');

  // 7. Collapse multiple spaces
  return str.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Returns safe HTML: escapes the input first, then wraps known command
 * verbs and absolute/negative words in <strong> tags. Intended for use
 * with dangerouslySetInnerHTML on trusted, already-escaped output only.
 */
export function emphasizeQuestionText(raw: string | undefined | null): string {
  if (!raw) return '';
  const cleaned = cleanRawMathAndHtml(raw);

  // Protect math blocks BEFORE escaping HTML to prevent breaking LaTeX delimiters like \( \) or \[ \] or $
  const mathBlocks: string[] = [];
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$)[^\$\n]+?(?:\$))/g;

  let textWithTokens = cleaned.replace(mathRegex, (m) => {
    mathBlocks.push(m);
    return `___MATH_BLOCK_${mathBlocks.length - 1}___`;
  });

  let text = escapeHtml(textWithTokens);

  // Absolutes: bold + uppercase, anywhere in the sentence.
  const absolutePattern = new RegExp(`\\b(${ABSOLUTES.map(escapeRegex).join('|')})\\b`, 'gi');
  text = text.replace(absolutePattern, (m) => `<strong class="examprint-absolute">${m.toUpperCase()}</strong>`);

  // Command verbs: only bold when they open the sentence or a clause,
  // e.g. "Explain why..." or "(a) Describe..." - avoids false positives
  // like the word "state" inside "United States".
  const verbPattern = new RegExp(`(^|[.;:]\\s+|\\(\\w+\\)\\s*)(${COMMAND_VERBS.map(escapeRegex).join('|')})\\b`, 'gi');
  text = text.replace(verbPattern, (_m, lead, verb) => {
    const capitalized = verb.charAt(0).toUpperCase() + verb.slice(1).toLowerCase();
    return `${lead}<strong>${capitalized}</strong>`;
  });

  // Restore math blocks cleanly
  mathBlocks.forEach((m, idx) => {
    const safeMathBlock = escapeHtml(m);
    text = text.replace(`___MATH_BLOCK_${idx}___`, safeMathBlock);
  });

  // Teacher's own emphasis markers become the fixed tag set, last of all.
  return renderInlineMarkers(text);
}

