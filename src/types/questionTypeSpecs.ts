import { normalizeLanguage } from '../utils/languageUtils';

export interface QuestionTypeSpec {
  decomposable: boolean;
  id: string;
  name: string;
  aliases: string[];
  microInstructions: {
    en: string;
    fr: string;
    rw: string;
  };
  hierarchy: {
    isParentContainer: boolean;
    supportsSubQuestions: boolean;
    requiresPassageRef?: boolean;
  };
  answerSpace: {
    defaultFormat: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
    requiresSpace: boolean;
    allowedFormats: Array<'none' | 'small' | 'medium' | 'large' | 'xlarge'>;
  };
  visualLayout: {
    componentPreset: string;
    formattingNotes: string;
  };
  validationContract: {
    requiresOptions?: boolean;
    requiresTableData?: boolean;
    requiresDottedLine?: boolean;
    requiresBracketedConstraint?: boolean;
  };
}

export const QUESTION_TYPE_SPECS: Record<string, QuestionTypeSpec> = {
  mcq: {
    id: 'mcq',
    name: 'Multiple Choice Question',
    aliases: ['mcq', 'multiple_choice', 'multiple_choice_question', 'multiple_choice_questions', 'single_select', 'objective_choice', 'objective', 'multiple choice'],
    decomposable: false,
    microInstructions: {
      en: 'Choose and circle the letter corresponding to the correct answer.',
      fr: 'Choisissez et entourez la lettre correspondant à la bonne réponse.',
      rw: 'Hitamo kandi uruzige ku ibaruwa ihwanye n’igisubizo cy’ukuri.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: false
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none']
    },
    visualLayout: {
      componentPreset: 'MultipleChoiceGrid',
      formattingNotes: 'Horizontal grid layout for short options; stacked vertical list for long options.'
    },
    validationContract: {
      requiresOptions: true
    }
  },
  true_false: {
    id: 'true_false',
    name: 'True / False',
    aliases: ['true_false', 'true_or_false', 'boolean', 'true-false', 'tf', 'true / false', 'true/false'],
    decomposable: true,
    microInstructions: {
      en: 'State whether each of the following statements is True or False.',
      fr: 'Indiquez si chacune des affirmations suivantes est Vraie ou Fausse.',
      rw: 'Emeza niba buri interuro ari Ukuri cyangwa Ikinyoma.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none', 'small', 'medium']
    },
    visualLayout: {
      componentPreset: 'TrueFalse',
      formattingNotes: 'Inline True/False selection pills with checkboxes.'
    },
    validationContract: {}
  },
  matching: {
    id: 'matching',
    name: 'Matching Items',
    aliases: ['matching', 'match', 'matching_items', 'matching_item', 'column_matching', 'association', 'vocabulary_matching', 'matching items'],
    decomposable: false,
    microInstructions: {
      en: 'Match the items in Column A with their corresponding descriptions in Column B.',
      fr: 'Associez les éléments de la colonne A à leurs descriptions correspondantes dans la colonne B.',
      rw: 'Hwanyanisa ibintu biri mu nkingi A n’ibisobanuro byabyo biyamiye mu nkingi B.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: false
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none', 'small', 'medium']
    },
    visualLayout: {
      componentPreset: 'MatchingTable',
      formattingNotes: 'Side-by-side two-column table.'
    },
    validationContract: {
      requiresTableData: true
    }
  },
  table: {
    id: 'table',
    name: 'Table Completion / Matrix',
    aliases: ['table', 'matrix', 'data_table', 'tabular', 'table_completion', 'completion_table', 'swot'],
    decomposable: false,
    microInstructions: {
      en: 'Complete the missing information in the table below.',
      fr: 'Complétez les informations manquantes dans le tableau ci-dessous.',
      rw: 'Uzuza amakuru abura mu mbonerahamwe iri hansi.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: false,
      allowedFormats: ['none', 'small', 'medium', 'large']
    },
    visualLayout: {
      componentPreset: 'DataTable',
      formattingNotes: 'Bordered 2D grid matrix.'
    },
    validationContract: {
      requiresTableData: true
    }
  },
  short: {
    id: 'short',
    name: 'Short Answer',
    aliases: ['short', 'short_answer', 'short_answers', 'brief_answer', 'one_word', 'structured', 'problem_solving', 'short answer', 'very short answer', 'restricted response'],
    decomposable: true,
    microInstructions: {
      en: 'Answer the following question clearly and concisely in the space provided.',
      fr: 'Répondez à la question suivante de manière claire et concise dans l\'espace prévu.',
      rw: 'Subiza iki kibazo mu buryo bumvikana kandi ngufi mu mwanya wabigenewe.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: true,
      allowedFormats: ['small', 'medium', 'large']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Dotted answer lines for candidate response.'
    },
    validationContract: {}
  },
  essay: {
    id: 'essay',
    name: 'Essay / Composition',
    aliases: ['essay', 'essay_writing', 'composition', 'guided_writing', 'extended_response', 'long_answer', 'restricted_response', 'extended response (essays)', 'essay writing'],
    decomposable: true,
    microInstructions: {
      en: 'Write a well-structured essay responding to the prompt below.',
      fr: 'Rédigez une dissertation bien structurée répondant au sujet ci-dessous.',
      rw: 'Andika inyandiko ifite umutwe n’uburyo bwiza usubiza ikibazo cyabajijwe.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'xlarge',
      requiresSpace: true,
      allowedFormats: ['large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Extended multi-line writing lines.'
    },
    validationContract: {}
  },
  fill_blank: {
    id: 'fill_blank',
    name: 'Fill in the Blanks',
    aliases: ['fill_blank', 'fill_blanks', 'fill_in_the_blank', 'fill_in_the_blanks', 'fill_in_blank', 'fill_in_blanks', 'blanks', 'cloze', 'cloze_test', 'gap_fill', 'fill_gap', 'fill_in_gap', 'fill_in_gaps', 'completion', 'fill in the blanks', 'fill in the blank', 'fill in gap', 'fill in gaps'],
    decomposable: false,
    microInstructions: {
      en: 'Fill in each blank space with the most appropriate word or phrase.',
      fr: 'Remplissez chaque espace vide avec le mot ou la phrase le plus approprié.',
      rw: 'Uzuza mu mwanya wose urangaye ijambo cyangwa imvugo ikwiye.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: false
    },
    answerSpace: {
      defaultFormat: 'small',
      requiresSpace: false,
      allowedFormats: ['none', 'small']
    },
    visualLayout: {
      componentPreset: 'DottedLineFill',
      formattingNotes: 'Dotted line pattern (...........) in text stem.'
    },
    validationContract: {
      requiresDottedLine: true
    }
  },
  transformation: {
    id: 'transformation',
    name: 'Sentence Transformation',
    aliases: ['transformation', 'sentence_transformation', 'rewrite', 'sentence_rewriting'],
    decomposable: true,
    microInstructions: {
      en: 'Rewrite each sentence as directed without changing its original meaning.',
      fr: 'Réécrivez chaque phrase comme indiqué sans modifier son sens original.',
      rw: 'Andika bundi bushya buri fraze nk’uko amabwiriza abigena utagize icyo uhindura ku busobanuro bwayo.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: true,
      allowedFormats: ['small', 'medium']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Bracketed constraint directive in stem + answer space.'
    },
    validationContract: {
      requiresBracketedConstraint: false
    }
  },
  error_correction: {
    id: 'error_correction',
    name: 'Error Correction / Proofreading',
    aliases: ['error_correction', 'error_identification', 'proofreading', 'grammar_correction'],
    decomposable: true,
    microInstructions: {
      en: 'Identify and correct the grammatical or spelling errors in each sentence or text.',
      fr: 'Identifiez et corrigez les erreurs grammaticales ou d\'orthographe dans chaque phrase ou texte.',
      rw: 'Tahura kandi ugorore amakosa y\'ikibonezamvugo cyangwa y\'imyandikire mu nteruro cyangwa mu nyandiko.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'small',
      requiresSpace: true,
      allowedFormats: ['small', 'medium', 'large']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Item stem with error targets + answer space.'
    },
    validationContract: {}
  },
  reorder: {
    id: 'reorder',
    name: 'Reordering / Sequencing',
    aliases: ['reorder', 'ordering', 'sequencing', 'paragraph_reorder'],
    decomposable: false,
    microInstructions: {
      en: 'Reorder the words or sentences to form a coherent sequence.',
      fr: 'Réorganisez les mots ou les phrases pour former une séquence cohérente.',
      rw: 'Panga amagambo cyangwa interuro mu buryo bwumvikana.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: true,
      allowedFormats: ['small', 'medium', 'large']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Jumbled sequence items + answer lines for ordered sequence.'
    },
    validationContract: {}
  },
  summary: {
    id: 'summary',
    name: 'Summary Writing',
    aliases: ['summary', 'summary_writing', 'summarization', 'synopsis', 'summary_task'],
    decomposable: true,
    microInstructions: {
      en: 'In not more than the specified word limit, summarize the main points in clear sentences.',
      fr: 'En respectant la limite de mots spécifiée, résumez les points principaux en phrases claires.',
      rw: 'Mu magambo adasagambye umubare wasabwe, incamake ingingo z’ingenzi mu nteruro yumvikana.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'large',
      requiresSpace: true,
      allowedFormats: ['medium', 'large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Explicit target word count directive + answer lines.'
    },
    validationContract: {}
  },
  case_study: {
    id: 'case_study',
    name: 'Case Study',
    aliases: ['case_study', 'case-study', 'scenario_analysis'],
    decomposable: true,
    microInstructions: {
      en: 'Read the case study scenario carefully and answer the questions that follow.',
      fr: 'Lisez attentivement le scénario de l\'étude de cas et répondez aux questions qui suivent.',
      rw: 'Soma neza iyi nkuru y’urugero rwa case study maze usubize ibibazo bikurikira.'
    },
    hierarchy: {
      isParentContainer: true,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'large',
      requiresSpace: true,
      allowedFormats: ['none', 'medium', 'large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'PassageContainer',
      formattingNotes: 'Parent stem narrative container with indented analytical subquestions.'
    },
    validationContract: {}
  },
  calculation: {
    id: 'calculation',
    name: 'Calculation / Problem Solving',
    aliases: ['calculation', 'problem_solving', 'math_problem', 'quantitative'],
    decomposable: true,
    microInstructions: {
      en: 'Solve the following problem. Show all necessary working out clearly.',
      fr: 'Résolvez le problème suivant. Montrez clairement toutes les étapes du calcul.',
      rw: 'Kora iyi mibare. Garagaza neza inzira zose wakoresheje ushaka igisubizo.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: true,
      allowedFormats: ['medium', 'large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Working out area with candidate answer lines.'
    },
    validationContract: {}
  },
  comprehension: {
    id: 'comprehension',
    name: 'Reading Passage & Comprehension',
    aliases: ['reading_comprehension', 'qt-read-comp', 'passage', 'comprehension'],
    decomposable: true,
    microInstructions: {
      en: 'Read the passage below carefully and answer the questions that follow.',
      fr: 'Lisez attentivement le texte ci-dessous et répondez aux questions qui suivent.',
      rw: 'Soma inyandiko iri hansi n’ubwitonzi maze usubize ibibazo bikurikira.'
    },
    hierarchy: {
      isParentContainer: true,
      supportsSubQuestions: true,
      requiresPassageRef: true
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none']
    },
    visualLayout: {
      componentPreset: 'PassageContainer',
      formattingNotes: 'Title, passage paragraphs, and child questions.'
    },
    validationContract: {}
  }
};

/* 
 * Quarantined unverified question types (commented out pending verified source paper):
 * - composition (quarantined pending verified source paper)
 * - cloze_test (quarantined pending verified source paper)
 * - letter (quarantined pending verified source paper)
 * - report (quarantined pending verified source paper)
 * - speech (quarantined pending verified source paper)
 * - one_word (quarantined pending verified source paper)
 * - completion (quarantined pending verified source paper)
 * - open_ended (quarantined pending verified source paper)
 * - restricted_response (quarantined pending verified source paper)
 */

export function getQuestionSpec(typeStr: string): QuestionTypeSpec {
  if (!typeStr) return QUESTION_TYPE_SPECS.short;
  const normalized = typeStr.trim().toLowerCase().replace(/[-\s]+/g, '_');
  for (const spec of Object.values(QUESTION_TYPE_SPECS)) {
    if (spec.id === normalized) return spec;
    if (spec.aliases.some(alias => alias.toLowerCase().replace(/[-\s]+/g, '_') === normalized)) {
      return spec;
    }
  }
  return QUESTION_TYPE_SPECS.short;
}

export function resolveMicroInstruction(
  typeStr: string,
  existingInst?: string,
  item?: any,
  language?: string
): string {
  const lang = normalizeLanguage(language);
  const words = existingInst ? existingInst.trim().split(/\s+/).filter(w => w.length > 0) : [];
  if (words.length >= 4) {
    return existingInst!.trim();
  }
  const spec = getQuestionSpec(typeStr);
  return spec.microInstructions[lang] || spec.microInstructions.en;
}
