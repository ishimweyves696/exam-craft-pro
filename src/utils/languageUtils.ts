// quarantined pending verified Kinyarwanda source paper per AGENTS.md
export type SupportedLanguage = 'en' | 'fr'; // | 'rw' (quarantined)

/**
 * Robustly normalizes any language string into a standard language code: 'en' | 'fr'. Defaults to 'en'.
 */
export function normalizeLanguage(lang?: string): SupportedLanguage {
  if (!lang) return 'en';
  const l = lang.trim().toLowerCase();
  if (l.startsWith('fr') || l.includes('french') || l.includes('français')) return 'fr';
  // quarantined pending verified Kinyarwanda source paper per AGENTS.md:
  // if (l.startsWith('rw') || l.includes('kiny') || l.includes('rwanda')) return 'rw';
  return 'en';
}

/**
 * Checks if a string contains common English instructional text phrases.
 */
export function isEnglishInstruction(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes('state whether') ||
    t.includes('true or false') ||
    t.includes('choose and circle') ||
    t.includes('correct answer') ||
    t.includes('match the items') ||
    t.includes('answer the following') ||
    t.includes('read the passage') ||
    t.includes('read the case study') ||
    t.includes('write a well-structured') ||
    t.includes('in not more than') ||
    t.includes('summarize the main') ||
    t.includes('complete the blank') ||
    t.includes('show all your working') ||
    t.includes('rewrite the sentence') ||
    t.includes('reorder the words') ||
    t.includes('identify the error') ||
    t.includes('attempt all questions') ||
    t.includes('attempt any') ||
    t.includes('attempt all')
  );
}

/**
 * Checks if a string contains common French instructional text phrases.
 */
export function isFrenchInstruction(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes('indiquez si') ||
    t.includes('vraie ou fausse') ||
    t.includes('vrai ou faux') ||
    t.includes('choisissez et encerclez') ||
    t.includes('la bonne réponse') ||
    t.includes('associez les éléments') ||
    t.includes('répondez aux questions') ||
    t.includes('répondez à toutes') ||
    t.includes('répondez à') ||
    t.includes('lisez attentivement') ||
    t.includes('rédigez une') ||
    t.includes('en pas plus de') ||
    t.includes('en 80 mots') ||
    t.includes('résumez clairement') ||
    t.includes('complétez le') ||
    t.includes('montrez clairement') ||
    t.includes('réécrivez la phrase') ||
    t.includes('réorganisez les') ||
    t.includes('identifiez l\'erreur')
  );
}

/**
 * Checks if a string contains common Kinyarwanda instructional text phrases.
 */
export function isKinyarwandaInstruction(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes('erekana niba') ||
    t.includes('ukuri cyangwa') ||
    t.includes('hitamo kandi') ||
    t.includes('hanisha ibintu') ||
    t.includes('subiza ibibazo') ||
    t.includes('soma witonze') ||
    t.includes('andika umwandiko') ||
    t.includes('zinga ingingo') ||
    t.includes('wuzuza umwanya') ||
    t.includes('erekana intambwe') ||
    t.includes('hingura interuro') ||
    t.includes('tanga igisubizo')
  );
}
