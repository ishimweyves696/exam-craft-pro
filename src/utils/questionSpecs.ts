import { TableData, QuestionOption } from '../types.js';

export type AnswerSpaceFormat = 'none' | 'small' | 'medium' | 'large' | 'xlarge';

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
    defaultFormat: AnswerSpaceFormat;
    requiresSpace: boolean;
    allowedFormats: AnswerSpaceFormat[];
  };
  visualLayout: {
    componentPreset: 'MultipleChoiceGrid' | 'TrueFalse' | 'MatchingTable' | 'DataTable' | 'DottedLineFill' | 'AnswerSpace' | 'PassageContainer' | 'CalculationWorkingArea' | 'SwotMatrix';
    formattingNotes?: string;
  };
  validationContract: {
    minOptions?: number;
    requiresTableData?: boolean;
    requiresDottedLine?: boolean;
    requiresBracketedConstraint?: boolean;
  };
}

export const QUESTION_TYPE_SPECS: Record<string, QuestionTypeSpec> = {
  mcq: {
    id: 'mcq',
    name: 'Multiple Choice',
    aliases: ['mcq', 'multiple_choice', 'multiple-choice', 'choice', 'multiple_choice_question', 'multiple_choice_questions', 'single_select', 'objective_choice', 'objective', 'multiple choice'],
    decomposable: false,
    microInstructions: {
      en: 'Choose and circle the letter corresponding to the correct answer.',
      fr: 'Choisissez et encerclez la lettre correspondant à la bonne réponse.',
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
      formattingNotes: '4 options (A-D) arranged in uniform grid columns.'
    },
    validationContract: {
      minOptions: 2
    }
  },
  true_false: {
    id: 'true_false',
    name: 'True / False',
    aliases: ['true_false', 'true-false', 'tf', 'vrai_faux', 'true_or_false', 'boolean', 'true / false', 'true/false'],
    decomposable: true,
    microInstructions: {
      en: 'State whether each statement is True or False.',
      fr: 'Indiquez si chaque affirmation est Vraie ou Fausse.',
      rw: 'Emeza niba buri interuro ari Ukuri cyangwa Ikinyoma.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none', 'small']
    },
    visualLayout: {
      componentPreset: 'TrueFalse',
      formattingNotes: 'Appends [ True / False ] label or renders inline choice badges.'
    },
    validationContract: {}
  },
  matching: {
    id: 'matching',
    name: 'Matching / Association',
    aliases: ['matching', 'association', 'match', 'pair_matching', 'matching_items', 'matching_item', 'column_matching', 'vocabulary_matching', 'matching items'],
    decomposable: false,
    microInstructions: {
      en: 'Match the items in Column A with the correct definition or item in Column B.',
      fr: 'Associez les éléments de la colonne A avec la définition correcte dans la colonne B.',
      rw: 'Hwanyanisa ibintu biri mu nkingi A n’ibisobanuro byabyo biyamiye mu nkingi B.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: false
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none', 'small']
    },
    visualLayout: {
      componentPreset: 'MatchingTable',
      formattingNotes: '2-column tabular layout for Column A and Column B.'
    },
    validationContract: {
      requiresTableData: true
    }
  },
  table: {
    id: 'table',
    name: 'Table Completion',
    aliases: ['table', 'table_completion', 'grid_completion', 'matrix', 'data_table', 'tabular', 'completion_table', 'swot'],
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
    aliases: ['short', 'short_answer', 'short_answers', 'brief_answer', 'one_word', 'completion', 'structured', 'problem_solving', 'short answer', 'very short answer', 'restricted response'],
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
      defaultFormat: 'none',
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
  summary: {
    id: 'summary',
    name: 'Summary Writing',
    aliases: ['summary', 'summary_writing', 'summarization', 'synopsis'],
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
      allowedFormats: ['none', 'small', 'medium', 'large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'CalculationWorkingArea',
      formattingNotes: 'Bounded calculation workspace with optional formula, given data, and final answer slot.'
    },
    validationContract: {}
  },
  swot: {
    id: 'swot',
    name: 'SWOT Analysis Matrix',
    aliases: ['swot', 'swot_matrix', 'swot_analysis', 'matrix_swot'],
    decomposable: false,
    microInstructions: {
      en: 'Perform a SWOT analysis for the enterprise described above by completing the 4-quadrant matrix below.',
      fr: 'Effectuez une analyse SWOT pour l’entreprise décrite ci-dessus en remplissant la matrice à 4 quadrants ci-dessous.',
      rw: 'Kora isesengura rya SWOT ku bucuruzi bwavuzwe haruguru wuzuza imbonerahamwe y’ibice 4 iri hansi.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: false
    },
    answerSpace: {
      defaultFormat: 'none',
      requiresSpace: false,
      allowedFormats: ['none', 'medium']
    },
    visualLayout: {
      componentPreset: 'SwotMatrix',
      formattingNotes: '2x2 4-quadrant grid (Strengths, Weaknesses, Opportunities, Threats) with candidate dotted handwriting lines.'
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
  },
  diagram: {
    id: 'diagram',
    name: 'Diagram / Scientific Illustration',
    aliases: ['diagram', 'scientific_illustration', 'drawing', 'illustration'],
    decomposable: true,
    microInstructions: {
      en: 'Study the diagram carefully and answer the questions below.',
      fr: 'Étudiez attentivement le schéma et répondez aux questions ci-dessous.',
      rw: 'Soma icyegeranyo/ishusho witonze maze usubize ibibazo bikurikira.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: true,
      allowedFormats: ['none', 'small', 'medium', 'large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Displays diagram (SVG, Mermaid, or SMILES) with answer space or subquestions.'
    },
    validationContract: {}
  },
  diagram_labeling: {
    id: 'diagram_labeling',
    name: 'Diagram Labeling',
    aliases: ['diagram_labeling', 'labeling', 'label_diagram'],
    decomposable: true,
    microInstructions: {
      en: 'Label the parts indicated in the diagram below.',
      fr: 'Annotez les parties indiquées sur le schéma ci-dessous.',
      rw: 'Andika amazina y’ibice byerekanywe ku ishusho iri hansi.'
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
      formattingNotes: 'Diagram with callouts and labeled answer spaces.'
    },
    validationContract: {}
  },
  circuit_diagram: {
    id: 'circuit_diagram',
    name: 'Circuit / Flowchart Diagram',
    aliases: ['circuit_diagram', 'circuit', 'flowchart_diagram'],
    decomposable: true,
    microInstructions: {
      en: 'Analyze the circuit / flowchart diagram and solve the questions below.',
      fr: 'Analysez le schéma du circuit / dagramme de flux et résolvez les questions ci-dessous.',
      rw: 'Sura ishusho y’umuyoboro w’amashanyarazi / igishushanyo mbonera maze usubize ibibazo.'
    },
    hierarchy: {
      isParentContainer: false,
      supportsSubQuestions: true
    },
    answerSpace: {
      defaultFormat: 'medium',
      requiresSpace: true,
      allowedFormats: ['small', 'medium', 'large', 'xlarge']
    },
    visualLayout: {
      componentPreset: 'AnswerSpace',
      formattingNotes: 'Circuit or process diagram with working out space.'
    },
    validationContract: {}
  },
  chemical_structure: {
    id: 'chemical_structure',
    name: 'Chemical Structure / SMILES',
    aliases: ['chemical_structure', 'smiles', 'molecule', 'chemical_diagram'],
    decomposable: true,
    microInstructions: {
      en: 'Examine the chemical structure / reaction scheme and answer the questions.',
      fr: 'Examinez la structure chimique / le schéma de réaction et répondez aux questions.',
      rw: 'Soma imiterere y’ibinyabutabire / reaction maze usubize ibibazo.'
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
      formattingNotes: 'Molecule drawing or reaction scheme.'
    },
    validationContract: {}
  },
  diagram_analysis: {
    id: 'diagram_analysis',
    name: 'Diagram Analysis & Interpretation',
    aliases: ['diagram_analysis', 'graph_analysis', 'data_diagram'],
    decomposable: true,
    microInstructions: {
      en: 'Interpret the diagram / graph and provide detailed analytical answers.',
      fr: 'Interprétez le schéma / graphique et fournissez des réponses analytiques détaillées.',
      rw: 'Sobanura ishusho / igishushanyo mbonera maze utange ibisubizo birambuye.'
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
      formattingNotes: 'Diagram/graph with analytical questions.'
    },
    validationContract: {}
  }
};

/**
 * Resolves any question type string or alias to a canonical QuestionTypeSpec.
 * Defaults to 'short' spec if the type string is unrecognized.
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

import { normalizeLanguage } from './languageUtils.js';

/**
 * Pillar 1 Engine: Resolves micro-instruction for any question item given language and existing instruction.
 */
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
