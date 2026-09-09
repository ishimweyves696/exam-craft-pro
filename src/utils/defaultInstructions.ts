import { TableData } from '../types';
import { getQuestionSpec } from '../types/questionTypeSpecs.js';
import { normalizeLanguage, isEnglishInstruction, isFrenchInstruction, isKinyarwandaInstruction } from './languageUtils.js';

const DEFAULT_TYPE_INSTRUCTIONS: Record<string, Record<string, (q: { tableData?: TableData }) => string>> = {
  en: {
    matching: (q) => {
      const h = q.tableData?.rows?.[0];
      return h && h.length >= 2
        ? `Match the items in ${h[0]} with the correct items in ${h[1]}.`
        : `Match the items in Column A with the correct items in Column B.`;
    },
    mcq: () => `Choose and circle the letter that corresponds to the correct answer.`,
    true_false: () => `State whether each of the following statements is True or False.`,
    fill_blank: () => `Complete the blank space(s) with the most appropriate word(s).`,
    short: () => `Answer the following question briefly.`,
    short_answer: () => `Provide a concise answer to the question.`,
    essay: () => `Write a comprehensive response answering all parts of the question.`,
    case_study: () => `Read the scenario carefully and answer the questions that follow.`,
    comprehension: () => `Read the passage below carefully and answer the questions that follow.`,
    swot: () => `Complete the SWOT matrix below using the information given.`,
    matrix: () => `Complete the matrix below using the information given.`,
    transformation: () => `Rewrite the sentence according to the instructions given.`,
    sentence_rewriting: () => `Rewrite the sentence correctly as instructed.`,
    reorder: () => `Reorder the words or sentences to form a coherent sequence.`,
    summary: () => `Summarize the main points clearly.`,
    error_identification: () => `Identify the error in each sentence.`,
    error_correction: () => `Identify and correct the error in each sentence.`,
    composition: () => `Write a structured composition on the given topic.`,
    calculation: () => `Show all your working clearly to arrive at the correct answer.`,
    one_word: () => `Provide a single word answer.`,
    completion: () => `Complete the statement accurately.`,
    table: () => `Complete the data table appropriately.`,
    diagram: () => `Study the diagram carefully and answer the questions that follow.`,
    diagram_labeling: () => `Label the indicated parts in the diagram below.`,
    circuit_diagram: () => `Analyze the circuit diagram and calculate or answer the questions.`,
    chemical_structure: () => `Examine the chemical structure and answer the questions.`,
    diagram_analysis: () => `Analyze the provided diagram or graph and provide your answers.`,
    flowchart: () => `Study the flowchart and answer the questions that follow.`,
  },
  fr: {
    matching: (q) => {
      const h = q.tableData?.rows?.[0];
      return h && h.length >= 2
        ? `Associez les éléments de ${h[0]} avec les éléments corrects de ${h[1]}.`
        : `Associez les éléments de la colonne A à ceux de la colonne B.`;
    },
    mcq: () => `Choisissez et encerclez la lettre correspondant à la bonne réponse.`,
    true_false: () => `Indiquez si l'affirmation est vraie ou fausse.`,
    fill_blank: () => `Complétez le(s) espace(s) par le(s) mot(s) approprié(s).`,
    short: () => `Répondez brièvement à la question suivante.`,
    short_answer: () => `Fournissez une réponse concise à la question.`,
    essay: () => `Rédigez une réponse complète répondant à toutes les parties de la question.`,
    case_study: () => `Lisez attentivement la mise en situation et répondez aux questions.`,
    transformation: () => `Transformez la phrase selon les instructions données.`,
    sentence_rewriting: () => `Réécrivez correctement la phrase comme indiqué.`,
    reorder: () => `Réorganisez les mots ou les phrases pour former une séquence cohérente.`,
    summary: () => `Résumez clairement les points principaux.`,
    error_identification: () => `Identifiez l'erreur dans chaque phrase.`,
    error_correction: () => `Identifiez et corrigez l'erreur dans chaque phrase.`,
    composition: () => `Rédigez une composition structurée sur le sujet donné.`,
    calculation: () => `Montrez clairement tous vos calculs pour obtenir la bonne réponse.`,
    one_word: () => `Fournissez une réponse en un seul mot.`,
    completion: () => `Complétez la déclaration avec précision.`,
    table: () => `Complétez le tableau de données de manière appropriée.`,
    diagram: () => `Étudiez attentivement le schéma et répondez aux questions qui suivent.`,
    diagram_labeling: () => `Annotez les parties indiquées sur le schéma ci-dessous.`,
    circuit_diagram: () => `Analysez le schéma du circuit et résolvez les questions ci-dessous.`,
    chemical_structure: () => `Examinez la structure chimique et répondez aux questions.`,
    diagram_analysis: () => `Analysez le schéma ou graphique fourni et apportez vos réponses.`,
    flowchart: () => `Étudiez le diagramme de flux et répondez aux questions ci-dessous.`,
  },
  rw: {
    matching: (q) => {
      const h = q.tableData?.rows?.[0];
      return h && h.length >= 2
        ? `Hanisha ibintu byo muri ${h[0]} n'ibyo muri ${h[1]}.`
        : `Hanisha ibintu byo mu nkingi ya A n'ibyo mu nkingi ya B.`;
    },
    mcq: () => `Hitamo kandi ugosore inyuguti ihwanye n'igisubizo cy'ukuri.`,
    true_false: () => `Erekana niba buri nteruro ari ukuri cyangwa ikinyoma.`,
    fill_blank: () => `Wuzuza umwanya wari urangaye n'ijambo cyangwa amagambo akwiriye.`,
    short: () => `Subiza iki kibazo mu magambo make.`,
    short_answer: () => `Tanga igisubizo kigufi kandi cyumvikana.`,
    essay: () => `Andika umwandiko urambuye usubiza ibibazo byose.`,
    case_study: () => `Soma witonze inkuru hanyuma usubize ibibazo bikurikira.`,
    transformation: () => `Hingura interuro ukurikije amabwiriza utanzwe.`,
    sentence_rewriting: () => `Ongera wandike interuro neza nk'uko ubwirijwe.`,
    reorder: () => `Panga amagambo cyangwa interuro mu buryo bwumvikana.`,
    summary: () => `Zinga ingingo z'ingenzi mu nshamake gukora unyujije mu magambo make.`,
    error_identification: () => `Tahura ikosa riri muri buri nteruro.`,
    error_correction: () => `Tahura kandi ugorore ikosa riri muri buri nteruro.`,
    composition: () => `Andika umwandiko witeguye neza ku nsanganyamatsiko watanzwe.`,
    calculation: () => `Erekana intambwe zose zo kubara kugira ngo ubone igisubizo cy'ukuri.`,
    one_word: () => `Tanga igisubizo mu ijambo rimwe.`,
    completion: () => `Wuzuza iyi nteruro neza.`,
    table: () => `Wuzuza iyi mbonerahamwe neza.`,
    diagram: () => `Soma icyegeranyo/ishusho witonze maze usubize ibibazo bikurikira.`,
    diagram_labeling: () => `Andika amazina y’ibice byerekanywe ku ishusho iri hansi.`,
    circuit_diagram: () => `Sura ishusho y’umuyoboro w’amashanyarazi maze usubize ibibazo.`,
    chemical_structure: () => `Soma imiterere y’ibinyabutabire maze usubize ibibazo.`,
    diagram_analysis: () => `Sobanura ishusho yatanzwe maze utange ibisubizo.`,
    flowchart: () => `Soma igishushanyo mbonera cyatanzwe maze usubize ibibazo.`,
  },
};

export function isSelfContainedQuestion(text?: string): boolean {
  if (!text) return false;
  const clean = text.replace(/\*/g, "").trim().toLowerCase();

  const imperativePatterns = [
    // EN
    /^(state|define|calculate|explain|which|give|what|why|how|outline|describe|discuss|compare|differentiate|list|name|show|solve|find|evaluate|prove|identify|highlight|mention|delineate|distinguish|compute|write|complete|fill|provide|rewrite|choose|carry|study|read|match|summarise|summarize|draw|plot|arrange|correct|translate|use)\b/i,
    // FR
    /^(définissez|définir|expliquez|expliquer|calculez|calculer|donnez|donner|quel|quelle|quels|quelles|pourquoi|comment|décrivez|décrire|comparez|comparer|démontrez|prouver|identifiez|identifier|nommez|nommer|résolvez|trouver|évaluez|écrivez|complétez|remplissez|fournissez|réécrivez)\b/i,
    // RW
    /^(sobanura|sobanurira|ereka|erekana|bara|shaka|vuga|garagaza|tanga|subiza|tekereza|tonora|gereranya|tahura|andika|uzuza|wuzuza)\b/i
  ];

  return imperativePatterns.some(pattern => pattern.test(clean));
}

export function isGenericFillerInstruction(inst?: string): boolean {
  if (!inst) return false;
  const clean = inst.replace(/\*/g, '').trim().toLowerCase();
  const fillers = [
    'answer the following question',
    'answer the question below',
    'answer the following',
    'answer the question',
    'answer all questions',
    'provide a concise answer',
    'write a comprehensive response',
    'choose the correct answer',
    'select the correct answer',
    'choose and circle the letter',
    'répondez à la question',
    'répondez brièvement',
    'subiza iki kibazo',
    'subiza ibibazo',
    'tanga igisubizo',
    'attempt all',
    'attempt any'
  ];
  return fillers.some(f => clean.includes(f));
}

export function resolveInstruction(
  type: string,
  instruction: string | undefined,
  q: { text?: string; tableData?: TableData },
  lang?: string
): string {
  const targetLang = normalizeLanguage(lang);

  // Rule 1: Direct questions that do not need a separate instruction
  const directTypes = new Set([
    'short', 'short_answer', 'essay', 'calculation', 'one_word',
    'composition', 'swot', 'matrix', 'table', 'summary',
    'transformation', 'error_correction',
  ]);
  if (directTypes.has(type) && isSelfContainedQuestion(q.text)) {
    return "";
  }

  // Rule 2: Strictly enforce deterministic localized instructions from the static dictionary
  // Completely ignore AI-generated `instruction` strings to prevent language bleed and hallucination.
  const customRes = DEFAULT_TYPE_INSTRUCTIONS[targetLang]?.[type]?.(q) ?? DEFAULT_TYPE_INSTRUCTIONS['en']?.[type]?.(q);
  if (customRes) {
    return customRes;
  }

  // Fallback to spec microInstructions if not in DEFAULT_TYPE_INSTRUCTIONS
  const spec = getQuestionSpec(type);
  if (spec && spec.microInstructions) {
    return spec.microInstructions[targetLang] || spec.microInstructions.en || "";
  }

  return "";
}

function cleanInst(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/\*/g, '').trim().toLowerCase().replace(/[:.]+$|\s+/g, ' ');
}

export function analyzeGroupInstructions(
  item: { type?: string; text?: string; instruction?: string; tableData?: any; subQuestions?: any[] },
  sectionInstruction?: string,
  parentInstruction?: string,
  language?: string
): {
  parentInstructionsToShow: string[];
  subQuestionInstructionsToShow: (string | null)[];
} {
  const cleanSec = cleanInst(sectionInstruction);
  const cleanPar = cleanInst(parentInstruction);

  // 1. Resolve parent's explicit/resolved instruction
  const parentResolved = resolveInstruction(item.type || '', item.instruction, item, language);
  const cleanParResolved = cleanInst(parentResolved);

  const subQuestions = item.subQuestions || [];
  if (subQuestions.length === 0) {
    const parentInstructionsToShow: string[] = [];
    
    let isDuplicateParent = false;
    if (cleanParResolved) {
      if (cleanSec && (cleanParResolved === cleanSec || cleanSec.includes(cleanParResolved) || cleanParResolved.includes(cleanSec))) {
        isDuplicateParent = true;
      }
      if (cleanPar && (cleanParResolved === cleanPar || cleanPar.includes(cleanParResolved) || cleanParResolved.includes(cleanPar))) {
        isDuplicateParent = true;
      }
      const cleanText = cleanInst(item.text);
      if (cleanText && (cleanText === cleanParResolved || cleanText.includes(cleanParResolved) || cleanParResolved.includes(cleanText))) {
        isDuplicateParent = true;
      }
    }

    if (parentResolved && !isDuplicateParent) {
      parentInstructionsToShow.push(parentResolved);
    }
    return {
      parentInstructionsToShow,
      subQuestionInstructionsToShow: []
    };
  }

  // 2. Resolve instructions for all subquestions
  const subInsts = subQuestions.map(sq => resolveInstruction(sq.type || '', sq.instruction, sq, language));

  // 3. Rule 3 & 4: Count occurrences of subquestion instructions
  const counts = new Map<string, number>();
  const originalMap = new Map<string, string>();

  subInsts.forEach(inst => {
    if (!inst) return;
    const c = cleanInst(inst);
    if (!c) return;
    counts.set(c, (counts.get(c) || 0) + 1);
    if (!originalMap.has(c)) {
      originalMap.set(c, inst);
    }
  });

  // Identify shared instruction among subquestions (Rule 3)
  let sharedSubInst: string | null = null;
  for (const [c, count] of counts.entries()) {
    if (count >= 2 || (subQuestions.length === 1 && count === 1)) {
      const isDuplicate = 
        (cleanSec && (c === cleanSec || cleanSec.includes(c) || c.includes(cleanSec))) ||
        (cleanPar && (c === cleanPar || cleanPar.includes(c) || c.includes(cleanPar))) ||
        (cleanParResolved && (c === cleanParResolved || cleanParResolved.includes(c) || c.includes(cleanParResolved)));
      
      if (!isDuplicate) {
        sharedSubInst = originalMap.get(c) || null;
        break;
      }
    }
  }

  // 5. Determine parent instructions to show (AT MOST ONE instruction line)
  const parentInstructionsToShow: string[] = [];

  let isDuplicateParent2 = false;
  if (cleanParResolved) {
    if (cleanSec && (cleanParResolved === cleanSec || cleanSec.includes(cleanParResolved) || cleanParResolved.includes(cleanSec))) {
      isDuplicateParent2 = true;
    }
    if (cleanPar && (cleanParResolved === cleanPar || cleanPar.includes(cleanParResolved) || cleanParResolved.includes(cleanPar))) {
      isDuplicateParent2 = true;
    }
  }

  // Prefer explicit parent resolved instruction if present and not duplicate of section
  if (parentResolved && !isDuplicateParent2) {
    parentInstructionsToShow.push(parentResolved);
  } else if (sharedSubInst) {
    const cleanShared = cleanInst(sharedSubInst);
    const isDuplicateShared = 
      (cleanParResolved && (cleanShared === cleanParResolved || cleanParResolved.includes(cleanShared) || cleanShared.includes(cleanParResolved))) ||
      (cleanSec && (cleanShared === cleanSec || cleanSec.includes(cleanShared) || cleanShared.includes(cleanSec))) ||
      (cleanPar && (cleanShared === cleanPar || cleanPar.includes(cleanShared) || cleanShared.includes(cleanPar)));

    if (!isDuplicateShared) {
      parentInstructionsToShow.push(sharedSubInst);
    }
  }

  // 6. Subquestion lines NEVER render independent instructions above their subquestion letter (Tier 4 Rule)
  const subQuestionInstructionsToShow = subQuestions.map(() => null);

  return {
    parentInstructionsToShow,
    subQuestionInstructionsToShow
  };
}
