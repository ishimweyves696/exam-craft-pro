import { AlignLeft } from 'lucide-react';

export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1', '#ec4899'];

export const EXAM_TEMPLATES = [
  { 
    id: 'nesa-standard', 
    name: 'NESA Standard', 
    description: 'Official structured format with standard headers, cover page, and numbered sections.', 
    subjects: 'All Subjects (Official National Standard)',
    icon: AlignLeft,
    previewStyle: 'bg-white'
  }
];

export const AVAILABLE_INSTRUCTIONS = [
  { id: 'no-open', text: 'Do not open this question paper until you are told to do so.', isDefault: true },
  { id: 'names', text: 'Write your names and index number on the answer booklet as they appear on your registration form.', isDefault: true },
  { id: 'no-extra-names', text: 'DO NOT write your names and index number on additional answer sheets if provided.', isDefault: false },
  { id: 'pen', text: 'Use only a blue or black pen.', isDefault: true },
  { id: 'calc', text: 'Calculators may be used where necessary.', isDefault: false },
  { id: 'working', text: 'Show clearly all the working. No marks will be given for answers which do not have all working steps.', isDefault: false },
  { id: 'mcq', text: 'For all multiple choice questions, circle the correct answers.', isDefault: false },
  { id: 'prose', text: 'You must answer in clear continuous prose.', isDefault: false },
  { id: 'handwriting', text: 'Your handwriting must be legible.', isDefault: false },
  { id: 'read-carefully', text: 'Read questions carefully before answering them.', isDefault: false },
];

export const AVAILABLE_QUESTION_TYPES = [
  'Multiple Choice',
  'True / False',
  'Matching Items',
  'Fill in the Blanks',
  'Short Answer',
  'Very Short Answer',
  'Structured',
  'Restricted Response',
  'Extended Response (Essays)',
  'Problem-Solving',
  'Calculation',
  'Completion',
  'Sequencing / Ordering',
  'Classification',
  'Comparison',
  'Explanation',
  'Definition',
  'Summary',
  'Sentence Transformation',
  'Comprehension',
  'Diagram / Scientific Illustration',
  'Diagram Labeling',
  'Circuit / Flowchart Diagram',
  'Chemical Structure / SMILES',
  'Diagram Analysis & Interpretation'
];


export type SubjectCategory = 'quantitative' | 'language_mechanics' | 'humanities' | 'science';

export const CATEGORY_QUESTION_TYPES: Record<SubjectCategory, string[]> = {
  quantitative: ['calculation', 'mcq', 'true_false', 'short_answer', 'essay', 'table', 'diagram', 'diagram_labeling', 'circuit_diagram', 'chemical_structure'],
  language_mechanics: [
    'mcq', 'true_false', 'matching', 'fill_blank', 'short_answer', 'one_word', 'completion', 
    'open_ended', 'restricted_response', 'summary', 'error_identification', 'error_correction', 
    'sentence_rewriting', 'transformation', 'reorder', 'paragraph_reorder', 'cloze_test',
    'composition', 'essay', 'letter', 'report', 'speech'
  ],
  humanities: ['mcq', 'true_false', 'matching', 'fill_blank', 'essay', 'case_study'],
  science: [
    'diagram', 'diagram_labeling', 'circuit_diagram', 'chemical_structure', 'diagram_analysis',
    'calculation', 'mcq', 'true_false', 'matching', 'short_answer', 'essay', 'table', 'case_study'
  ],
};

export const TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  matching: 'Matching Items',
  fill_blank: 'Fill in the Blanks',
  short_answer: 'Short Answer',
  one_word: 'One-word Answer',
  completion: 'Completion',
  open_ended: 'Open-ended',
  restricted_response: 'Restricted-response',
  summary: 'Summary Writing',
  error_identification: 'Error Identification',
  error_correction: 'Error Correction',
  sentence_rewriting: 'Sentence Rewriting',
  transformation: 'Sentence Transformation',
  reorder: 'Sentence Arrangement (Reordering Words)',
  paragraph_reorder: 'Paragraph Arrangement (Reordering Sentences)',
  cloze_test: 'Cloze Test',
  composition: 'Composition Writing',
  essay: 'Essay Writing',
  letter: 'Letter Writing',
  report: 'Report Writing',
  speech: 'Speech Writing',
  case_study: 'Case Study / Scenario',
  calculation: 'Calculation',
  table: 'Table / Data Entry',
  diagram: 'Diagram / Scientific Illustration',
  diagram_labeling: 'Diagram Labeling',
  circuit_diagram: 'Circuit / Flowchart Diagram',
  chemical_structure: 'Chemical Structure / SMILES',
  flowchart: 'Flowchart / Process Diagram',
  diagram_analysis: 'Diagram Analysis & Interpretation',
};

export const SUBJECT_CATEGORIES: Record<string, SubjectCategory[]> = {
  'French': ['language_mechanics'],
  'English Language': ['language_mechanics'],
  'Mathematics': ['quantitative', 'science'],
  'Physics': ['quantitative', 'science'],
  'Chemistry': ['quantitative', 'science'],
  'Biology': ['science'],
  'Science and Technology': ['science'],
  'Computer Science': ['quantitative', 'science'],
  'Agriculture': ['science'],
  'Entrepreneurship': ['quantitative', 'humanities'],
  'Geography': ['humanities', 'science'],
  'Psychology': ['humanities'],
  'History': ['humanities'],
};

export function recommendedTypesFor(subject: string): string[] {
  let categories: SubjectCategory[] = [];
  const sLower = subject.toLowerCase();
  if (SUBJECT_CATEGORIES[subject]) {
    categories = SUBJECT_CATEGORIES[subject];
  } else if (sLower.includes('english') || sLower.includes('french')) {
    categories = ['language_mechanics'];
  } else if (sLower.includes('math') || sLower.includes('physic') || sLower.includes('chem') || sLower.includes('bio') || sLower.includes('science') || sLower.includes('stem') || sLower.includes('tech') || sLower.includes('agri')) {
    categories = ['quantitative', 'science'];
  } else {
    categories = [];
  }
  const merged = new Set<string>();
  categories.forEach(c => CATEGORY_QUESTION_TYPES[c].forEach(t => merged.add(t)));
  return merged.size ? [...merged] : ['mcq', 'true_false', 'short_answer', 'essay', 'diagram', 'diagram_labeling'];
}

export const getTemplateStyles = (_templateId?: string) => {
  return 'max-w-4xl mx-auto bg-white shadow-lg border border-slate-200 rounded-sm overflow-hidden mb-8 font-serif text-black print:shadow-none print:m-0 print:border-none print:w-auto print:max-w-none print:bg-transparent print:p-0';
};
