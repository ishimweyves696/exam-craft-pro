/** Symbol palette used by the exam editor — grouped the way teachers look for them. */
export const SYMBOL_GROUPS: { label: string; symbols: string[] }[] = [
  {
    label: 'Maths',
    symbols: ['×', '÷', '±', '∓', '≈', '≠', '≤', '≥', '√', '∛', '∑', '∏', '∫', '∞', 'π', 'θ', 'Δ', '°', '∠', '⊥', '∥', '≡', '∴', '∵', 'ƒ'],
  },
  {
    label: 'Powers & indices',
    symbols: ['⁰', '¹', '²', '³', '⁴', 'ⁿ', '₀', '₁', '₂', '₃', '₄', 'ₙ', '½', '¼', '¾'],
  },
  {
    label: 'Science',
    symbols: ['→', '⇌', '↔', '⟶', 'Å', 'µ', 'Ω', 'λ', 'α', 'β', 'γ', '⁻', '⁺', '·', '℃', '℉', '％'],
  },
  {
    label: 'Currency & marks',
    symbols: ['FRw', '$', '€', '£', '✓', '✗', '•', '–', '—', '…', '“', '”', '‘', '’'],
  },
];
