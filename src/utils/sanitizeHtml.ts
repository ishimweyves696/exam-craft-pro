import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  try {
    if (typeof window !== 'undefined') {
      const dp = (DOMPurify as any)?.default || DOMPurify;
      if (typeof dp?.sanitize === 'function') {
        return dp.sanitize(html);
      }
    }
  } catch (e) {
    console.warn('DOMPurify sanitize warning:', e);
  }
  return html;
}
