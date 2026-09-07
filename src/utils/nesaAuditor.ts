import { GeneratedExam, GeneratedMarkingGuide, Question, Section } from '../types';
import { getQuestionSpec } from './questionSpecs';
import { validateExamMarkAccounting } from '../backend/engine/markAccountingEngine';
import { isSelfContainedQuestion } from './defaultInstructions';
import { verifyExamAgainstTemplate } from './templateVerifier';

export interface AuditIssue {
  id: string;
  category: 'Math' | 'Localization' | 'Pedagogical' | 'Structural' | 'Layout';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  status: 'Passed' | 'Warning' | 'Failed';
  ruleName: string;
  message: string;
  suggestedFix?: string;
  autoFix?: {
    type: string;
    payload?: any;
  };
}

export interface NesaAuditReport {
  score: number;
  isValid: boolean;
  issues: AuditIssue[];
  metrics: {
    totalHeaderMarks: number;
    totalSectionMarks: number;
    totalQuestionMarks: number;
    rwandanElementsCount: number;
    rwandanElementsFound: string[];
    bloomsDistribution: { name: string; count: number; percentage: number; recommended: string }[];
    questionCount: number;
    mcqCount: number;
    mcqWithNoCorrect: number;
    mathPassageRulesOk: boolean;
    durationMinutes: number;
    expectedStudentMinutes: number;
    templateAudit?: {
      hasOfficialTemplate: boolean;
      templateSubject?: string;
      templateLevel?: string;
      isCompliant: boolean;
      complianceScore: number;
      expectedSectionCount: number;
      actualSectionCount: number;
      discrepancies: string[];
    };
  };
}

const RWANDAN_LEXICON = [
  // Districts / Places
  'Kigali', 'Gasabo', 'Nyarugenge', 'Kicukiro', 'Musanze', 'Rubavu', 'Huye', 'Rwamagana', 'Bugesera', 
  'Kayonza', 'Nyagatare', 'Gicumbi', 'Karongi', 'Rusizi', 'Nyanza', 'Muhanga', 'Ruhango', 'Gisagara', 
  'Nyaruguru', 'Kamonyi', 'Gakenke', 'Burera', 'Rulindo', 'Nyabihu', 'Ngororero', 'Rutsiro', 'Nyamasheke', 
  'Gatsibo', 'Kirehe', 'Ngoma', 'Nyabarongo', 'Akagera', 'Kivu', 'Muhazi', 'Virunga', 'Nyungwe',
  // Rwandan Names
  'Keza', 'Kwizera', 'Mugisha', 'Ganza', 'Uwase', 'Shema', 'Mutoni', 'Kamana', 'Kayitesi', 'Nshuti', 
  'Butera', 'Gakwaya', 'Gasana', 'Karemera', 'Mukamana', 'Murenzi', 'Ngabo', 'Rugamba', 'Shyaka', 'Kagame',
  // Institutions / Concepts
  'NESA', 'REB', 'MINEDUC', 'UR', 'RURA', 'RGB', 'RDB', 'RRA', 'BRD', 'BPR', 'RSSB', 'RNP', 'RDF'
];

const KNOWLEDGE_VERBS = ['identify', 'state', 'define', 'list', 'outline', 'describe', 'name', 'mention', 'label', 'give', 'match', 'distinguish', 'recall', 'write down'];
const APPLICATION_VERBS = ['apply', 'calculate', 'explain', 'solve', 'show', 'classify', 'compare', 'contrast', 'demonstrate', 'illustrate', 'analyze', 'examine', 'determine', 'compute', 'use'];
const SYNTHESIS_VERBS = ['evaluate', 'justify', 'formulate', 'design', 'create', 'discuss', 'predict', 'recommend', 'propose', 'synthesize', 'assess', 'argue', 'construct', 'synthesise', 'devise'];

export function runNesaAudit(exam: GeneratedExam, markingGuide?: GeneratedMarkingGuide): NesaAuditReport {
  const issues: AuditIssue[] = [];
  let score = 100;

  // 1. MATH VERIFICATION (Using unified mark accounting engine)
  const markAudit = validateExamMarkAccounting(exam);
  const headerTotal = exam.header?.marks || 0;
  const candidateMaxTotal = markAudit.candidateMaximumExamMarks;
  const availableQuestionSum = markAudit.availableExamMarksTotal;

  markAudit.sectionAudits.forEach((secAudit, sIdx) => {
    const sec = exam.sections[sIdx];
    if (!secAudit.isValid) {
      secAudit.discrepancies.forEach((d) => {
        if (d.startsWith('SECTION_MARK_MISMATCH')) {
          score -= 8;
          issues.push({
            id: `math-sec-${sIdx}-mismatch`,
            category: 'Math',
            severity: 'High',
            status: 'Failed',
            ruleName: `Section ${sIdx + 1} Marks Tally`,
            message: `Section "${sec?.title || `Section ${sIdx + 1}`}" is allocated ${secAudit.declaredSectionMarks} marks, but candidate achievable marks is ${secAudit.candidateMaximumMarks} (Available total: ${secAudit.availableTotalMarks}).`,
            suggestedFix: `Adjust question marks or update Section marks to ${secAudit.candidateMaximumMarks}.`,
            autoFix: {
              type: 'SYNC_SECTION_MARKS',
              payload: { sectionIndex: sIdx, correctMarks: secAudit.candidateMaximumMarks }
            }
          });
        } else if (d.startsWith('ATTEMPT_RULE_CONTRADICTION')) {
          score -= 10;
          issues.push({
            id: `attempt-rule-contradiction-${sIdx}`,
            category: 'Math',
            severity: 'Critical',
            status: 'Failed',
            ruleName: `Attempt Rule Configuration`,
            message: d,
            suggestedFix: `Ensure attempt rule choose count does not exceed available question count.`
          });
        }
      });
    }
  });

  // Check if Header Marks match Candidate Maximum Total
  if (headerTotal > 0 && headerTotal !== candidateMaxTotal) {
    score -= 10;
    issues.push({
      id: 'math-header-section-mismatch',
      category: 'Math',
      severity: 'Critical',
      status: 'Failed',
      ruleName: 'Paper Total Tally',
      message: `The exam paper header total is ${headerTotal} marks, but candidate achievable maximum is ${candidateMaxTotal} marks.`,
      suggestedFix: `Adjust section marks or update header total to ${candidateMaxTotal} marks.`,
      autoFix: {
        type: 'SYNC_HEADER_TOTAL',
        payload: { correctTotal: candidateMaxTotal }
      }
    });
  }

  // MCQ correctness verification
  let mcqCount = 0;
  let mcqWithNoCorrect = 0;
  exam.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      const qType = q.type.toLowerCase();
      if (qType.includes('mcq') || qType.includes('multiple choice')) {
        mcqCount++;
        const hasCorrect = q.options?.some(o => o.isCorrect === true);
        const correctCount = q.options?.filter(o => o.isCorrect === true).length || 0;
        
        if (!hasCorrect || correctCount === 0) {
          mcqWithNoCorrect++;
          score -= 4;
          issues.push({
            id: `mcq-no-correct-${sIdx}-${qIdx}`,
            category: 'Math',
            severity: 'High',
            status: 'Failed',
            ruleName: `MCQ Option Correctness`,
            message: `Section ${sIdx + 1} Question ${q.number} is a multiple choice question but has no correct answer marked.`,
            suggestedFix: `Select exactly one option as correct.`,
            autoFix: {
              type: 'MARK_FIRST_OPTION_CORRECT',
              payload: { sectionIndex: sIdx, questionId: q.id }
            }
          });
        } else if (correctCount > 1) {
          score -= 3;
          issues.push({
            id: `mcq-multi-correct-${sIdx}-${qIdx}`,
            category: 'Math',
            severity: 'Medium',
            status: 'Warning',
            ruleName: `Multiple Correct MCQ Answers`,
            message: `Section ${sIdx + 1} Question ${q.number} has ${correctCount} correct answers marked. Standard MCQs must have exactly one.`,
            suggestedFix: `Ensure only the best single option is marked correct.`
          });
        }
      }
    });
  });

  // Balanced matching tables
  exam.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      if (q.type.toLowerCase().includes('matching') && q.tableData) {
        const rows = q.tableData.rows || [];
        if (rows.length > 0) {
          const rowSizes = rows.map(r => r.length);
          const colsNotEqual = rowSizes.some(s => s !== rowSizes[0]);
          if (colsNotEqual) {
            score -= 5;
            issues.push({
              id: `matching-unbalanced-${sIdx}-${qIdx}`,
              category: 'Math',
              severity: 'High',
              status: 'Failed',
              ruleName: `Matching Table Balance`,
              message: `Section ${sIdx + 1} Question ${q.number} contains a matching table with unequal rows/columns.`,
              suggestedFix: `Ensure all rows have exactly the same number of columns in the matching array.`
            });
          }
        }
      }
    });
  });


  // 2. LOCALIZATION AUDIT
  const foundRwandanElements: string[] = [];
  let examTextLower = JSON.stringify(exam).toLowerCase();
  
  RWANDAN_LEXICON.forEach(word => {
    if (examTextLower.includes(word.toLowerCase())) {
      foundRwandanElements.push(word);
    }
  });

  if (foundRwandanElements.length === 0) {
    score -= 10;
    issues.push({
      id: 'localization-missing',
      category: 'Localization',
      severity: 'High',
      status: 'Failed',
      ruleName: 'Rwandan Contextualization',
      message: 'No localized Rwandan elements (names, districts, institutions, landmarks) were detected in the exam content.',
      suggestedFix: 'Incorporate local context like Rwandan student names (e.g. Mugisha, Keza) or local districts (e.g. Gasabo, Musanze) to align with CBC guidelines.'
    });
  } else if (foundRwandanElements.length < 3) {
    score -= 4;
    issues.push({
      id: 'localization-low',
      category: 'Localization',
      severity: 'Medium',
      status: 'Warning',
      ruleName: 'Sparse Rwandan Context',
      message: `Sparse local context detected. Only ${foundRwandanElements.length} Rwandan terms found: ${foundRwandanElements.join(', ')}.`,
      suggestedFix: 'Add localized details to more questions to ground assessments in familiar environments for students.'
    });
  } else {
    issues.push({
      id: 'localization-excellent',
      category: 'Localization',
      severity: 'Info',
      status: 'Passed',
      ruleName: 'Excellent Localized Context',
      message: `Detected ${foundRwandanElements.length} localized Rwandan references: ${foundRwandanElements.join(', ')}. Perfect alignment with Rwandan CBC.`
    });
  }


  // 3. PEDAGOGICAL AUDIT (Bloom's Alignment)
  let kCount = 0;
  let aCount = 0;
  let sCount = 0;
  let totalQuestions = 0;

  exam.sections.forEach(sec => {
    sec.questions.forEach(q => {
      totalQuestions++;
      const text = q.text.toLowerCase();
      
      // Determine cognitive level using verbs
      const firstWord = text.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
      
      let isKnowledge = KNOWLEDGE_VERBS.some(v => text.includes(v) || firstWord === v);
      let isApp = APPLICATION_VERBS.some(v => text.includes(v) || firstWord === v);
      let isSynth = SYNTHESIS_VERBS.some(v => text.includes(v) || firstWord === v);

      if (q.bloomLevel) {
        const bl = q.bloomLevel.toLowerCase();
        if (bl.includes('remember') || bl.includes('understand') || bl.includes('knowledge')) {
          isKnowledge = true;
        } else if (bl.includes('apply') || bl.includes('analyze') || bl.includes('application')) {
          isApp = true;
        } else if (bl.includes('evaluate') || bl.includes('create') || bl.includes('higher') || bl.includes('synthesis')) {
          isSynth = true;
        }
      }

      if (isSynth) {
        sCount++;
      } else if (isApp) {
        aCount++;
      } else {
        kCount++; // default to knowledge
      }
    });
  });

  const kPct = totalQuestions > 0 ? Math.round((kCount / totalQuestions) * 100) : 0;
  const aPct = totalQuestions > 0 ? Math.round((aCount / totalQuestions) * 100) : 0;
  const sPct = totalQuestions > 0 ? Math.round((sCount / totalQuestions) * 100) : 0;

  // NESA guidelines target: 40% Knowledge, 40% Application, 20% Higher Order
  if (totalQuestions > 0) {
    if (kPct > 60) {
      score -= 6;
      issues.push({
        id: 'bloom-overweight-knowledge',
        category: 'Pedagogical',
        severity: 'Medium',
        status: 'Warning',
        ruleName: "Bloom's Cognitive Distribution",
        message: `The exam contains too much low-level recall: ${kPct}% Knowledge (Target: ~40%).`,
        suggestedFix: 'Rephrase recall questions to ask students to explain, solve, or evaluate scenarios.'
      });
    } else if (sPct === 0) {
      score -= 5;
      issues.push({
        id: 'bloom-no-higher-order',
        category: 'Pedagogical',
        severity: 'High',
        status: 'Failed',
        ruleName: 'Higher Order Thinking (HOTs)',
        message: 'No Higher Order Thinking (Evaluation or Synthesis) questions were identified. Every NESA exam requires critical thinking tasks.',
        suggestedFix: 'Add at least one multi-mark discussion, prediction, or critical evaluation question to Section B.'
      });
    } else {
      issues.push({
        id: 'bloom-distribution-balanced',
        category: 'Pedagogical',
        severity: 'Info',
        status: 'Passed',
        ruleName: "Bloom's Balanced Taxonomy",
        message: `Cognitive distribution: ${kPct}% Knowledge, ${aPct}% Application, ${sPct}% Higher-Order. Balanced and NESA-aligned.`
      });
    }
  }


  // 4. STRUCTURAL AUDIT
  // Check instructions
  if (!exam.header.instructions || exam.header.instructions.length === 0) {
    score -= 5;
    issues.push({
      id: 'struct-no-header-instructions',
      category: 'Structural',
      severity: 'Medium',
      status: 'Warning',
      ruleName: 'Candidate Instructions',
      message: 'The examination paper contains no general header candidate instructions.',
      suggestedFix: 'Incorporate standard NESA instructions (e.g., "Attempt all questions", "Do not use calculator").',
      autoFix: {
        type: 'ADD_STANDARD_INSTRUCTIONS',
        payload: {}
      }
    });
  }

  // Check section titles & instructions
  exam.sections.forEach((sec, sIdx) => {
    if (!sec.title || sec.title.trim() === '') {
      score -= 4;
      issues.push({
        id: `struct-no-sec-title-${sIdx}`,
        category: 'Structural',
        severity: 'Medium',
        status: 'Warning',
        ruleName: `Section Title Presence`,
        message: `Section ${sIdx + 1} has an empty or generic title.`,
        suggestedFix: `Define an explicit name (e.g., "SECTION A: KNOWLEDGE AND COMPREHENSION").`
      });
    }
    if (!sec.instructions || sec.instructions.trim() === '') {
      score -= 3;
      issues.push({
        id: `struct-no-sec-inst-${sIdx}`,
        category: 'Structural',
        severity: 'Low',
        status: 'Warning',
        ruleName: `Section Instructions`,
        message: `Section ${sIdx + 1} is missing instructions. Candidates need explicit directions.`,
        suggestedFix: `Add instruction text (e.g., "Answer all questions in this section").`
      });
    }
  });

  // Official NESA Exam Template / Blueprint Alignment Check
  const templateVerification = verifyExamAgainstTemplate(exam);
  if (templateVerification.hasOfficialTemplate) {
    if (!templateVerification.isCompliant) {
      score -= 5;
      issues.push({
        id: 'struct-template-mismatch',
        category: 'Structural',
        severity: 'Medium',
        status: 'Warning',
        ruleName: 'Official NESA Blueprint Match',
        message: `Exam structure deviates from the official ${templateVerification.templateSubject} (${templateVerification.templateLevel}) blueprint (${templateVerification.discrepancies.slice(0, 2).join('; ')}).`,
        suggestedFix: templateVerification.recommendations[0] || 'Align sections and total marks with official NESA past-paper structure.'
      });
    } else {
      issues.push({
        id: 'struct-template-match',
        category: 'Structural',
        severity: 'Info',
        status: 'Passed',
        ruleName: 'Official NESA Blueprint Match',
        message: `Exam perfectly matches the official NESA blueprint for ${templateVerification.templateSubject} (${templateVerification.templateLevel}) with ${templateVerification.expectedSectionCount} sections.`
      });
    }
  }

  // Check question numbering duplicates or holes
  const numbers: number[] = [];
  let numberingHoles = false;
  let duplicateNumbers = false;
  exam.sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (numbers.includes(q.number)) {
        duplicateNumbers = true;
      }
      numbers.push(q.number);
    });
  });

  // Check if sorted numbers are sequential 1..N
  numbers.sort((a, b) => a - b);
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      numberingHoles = true;
    }
  }

  if (duplicateNumbers) {
    score -= 6;
    issues.push({
      id: 'struct-duplicate-numbering',
      category: 'Structural',
      severity: 'High',
      status: 'Failed',
      ruleName: 'Continuous Numbering Consistency',
      message: 'Detected duplicate question numbers in the exam structure. This will confuse students and grading tables.',
      suggestedFix: 'Re-sequence the entire exam questions from 1 to N consecutively.',
      autoFix: {
        type: 'RESEQUENCE_NUMBERING',
        payload: {}
      }
    });
  } else if (numberingHoles) {
    score -= 4;
    issues.push({
      id: 'struct-numbering-holes',
      category: 'Structural',
      severity: 'Medium',
      status: 'Warning',
      ruleName: 'Question Number Sequence Gap',
      message: 'Question numbering is out of order or contains gaps (e.g., skipping from 4 to 6).',
      suggestedFix: 'Re-sequence questions to maintain continuous standard numbering.',
      autoFix: {
        type: 'RESEQUENCE_NUMBERING',
        payload: {}
      }
    });
  }

  // Parse duration
  let durationMinutes = 120; // default 2 hours
  const durStr = (exam.header.duration || '').toLowerCase();
  if (durStr.includes('hour') || durStr.includes('hr')) {
    const hoursNum = parseFloat(durStr.match(/[\d.]+/)?.[0] || '2');
    durationMinutes = hoursNum * 60;
  } else if (durStr.includes('min')) {
    durationMinutes = parseInt(durStr.match(/\d+/)?.[0] || '120', 10);
  }

  // Calculate expected student time based on question marks and cognitive levels
  let expectedStudentMinutes = 0;
  exam.sections.forEach(sec => {
    sec.questions.forEach(q => {
      // Recall questions: ~0.8 minutes per mark
      // Application: ~1.2 minutes per mark
      // Higher Order Evaluation: ~1.5 minutes per mark
      let multiplier = 1.0;
      const bl = (q.bloomLevel || '').toLowerCase();
      if (bl.includes('remember') || bl.includes('understand')) {
        multiplier = 0.8;
      } else if (bl.includes('apply') || bl.includes('analyze')) {
        multiplier = 1.2;
      } else if (bl.includes('evaluate') || bl.includes('create')) {
        multiplier = 1.6;
      }
      expectedStudentMinutes += (q.marks || 0) * multiplier;
    });
  });
  expectedStudentMinutes = Math.round(expectedStudentMinutes);

  // Time budget check
  if (expectedStudentMinutes > durationMinutes + 15) {
    issues.push({
      id: 'struct-time-tight',
      category: 'Structural',
      severity: 'Medium',
      status: 'Warning',
      ruleName: 'Candidate Timing Allocation',
      message: `The exam contains content estimated to require ${expectedStudentMinutes} minutes for a typical student, which exceeds the scheduled duration of ${durationMinutes} minutes.`,
      suggestedFix: 'Reduce question scope, shorten write-in response expectations, or extend exam duration.'
    });
  } else if (expectedStudentMinutes < durationMinutes - 45 && durationMinutes > 60) {
    issues.push({
      id: 'struct-time-loose',
      category: 'Structural',
      severity: 'Low',
      status: 'Warning',
      ruleName: 'Candidate Timing Buffer',
      message: `The estimated work time (${expectedStudentMinutes} minutes) is significantly shorter than the available ${durationMinutes} minutes. Candidates might finish too quickly.`,
      suggestedFix: 'Add one or two more conceptual questions or increase the cognitive depth of short answers.'
    });
  } else {
    issues.push({
      id: 'struct-timing-balanced',
      category: 'Structural',
      severity: 'Info',
      status: 'Passed',
      ruleName: 'Excellent Candidate Time Allotment',
      message: `Expected student completion is ${expectedStudentMinutes} minutes for a ${durationMinutes}-minute paper. Highly balanced.`
    });
  }

  // 5. LAYOUT & PAGE ALIGNMENT SELF-AUDIT
  const margins = exam.presentation?.margins;
  const isMarginsSymmetrical = margins && margins.left === margins.right && margins.top === margins.bottom;
  
  if (!margins || !isMarginsSymmetrical) {
    score -= 3;
    issues.push({
      id: 'layout-asymmetrical-margins',
      category: 'Layout',
      severity: 'Medium',
      status: 'Warning',
      ruleName: 'Margin Balance & Symmetry',
      message: 'Page margins are asymmetrical or undefined, which can push text off-center or onto single sides during print.',
      suggestedFix: 'Enforce symmetrical 1.5cm margins across top, bottom, left, and right.',
      autoFix: {
        type: 'BALANCE_MARGINS',
        payload: {}
      }
    });
  } else {
    issues.push({
      id: 'layout-margins-ok',
      category: 'Layout',
      severity: 'Info',
      status: 'Passed',
      ruleName: 'Symmetrical Margin Alignment',
      message: `Page margins are balanced (${margins.left} left/right, ${margins.top} top/bottom).`
    });
  }

  // Check font & line height alignment
  const fontSize = exam.presentation?.fontSize || '11pt';
  const lineHeight = exam.presentation?.lineHeight || '1.4';
  if (!exam.presentation?.fontSize || !exam.presentation?.lineHeight) {
    issues.push({
      id: 'layout-typography-fit',
      category: 'Layout',
      severity: 'Low',
      status: 'Warning',
      ruleName: 'Typography Fit & Density',
      message: `Exam presentation settings lack explicit font size or line height. Defaulting to ${fontSize} / ${lineHeight}.`,
      suggestedFix: 'Set explicit 11pt font size and 1.4 line height for predictable print rendering.',
      autoFix: {
        type: 'ALIGN_FULL_WIDTH',
        payload: {}
      }
    });
  } else {
    issues.push({
      id: 'layout-typography-ok',
      category: 'Layout',
      severity: 'Info',
      status: 'Passed',
      ruleName: 'Typography & Line Spacing',
      message: `Typography formatted at ${fontSize} font size and ${lineHeight} line height for crisp readability.`
    });
  }

  // Check MCQ 2-column grid opportunities
  let unoptimizedMcqs = 0;
  exam.sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (q.type === 'mcq' && q.options && q.options.length === 4) {
        const isShortTexts = q.options.every(o => o.text.length < 35);
        if (isShortTexts && q.presentation?.layout !== 'grid') {
          unoptimizedMcqs++;
        }
      }
    });
  });

  if (unoptimizedMcqs > 0) {
    score -= 2;
    issues.push({
      id: 'layout-mcq-grid-opt',
      category: 'Layout',
      severity: 'Low',
      status: 'Warning',
      ruleName: 'MCQ Option Grid Balance',
      message: `${unoptimizedMcqs} short MCQ question(s) are stacked vertically instead of using a balanced 2-column grid.`,
      suggestedFix: 'Convert short 4-option MCQs to a 2-column grid to save vertical space and prevent lopsided pages.',
      autoFix: {
        type: 'CONVERT_MCQ_GRID',
        payload: {}
      }
    });
  } else {
    issues.push({
      id: 'layout-mcq-grid-ok',
      category: 'Layout',
      severity: 'Info',
      status: 'Passed',
      ruleName: 'MCQ Grid Column Balance',
      message: 'All multiple-choice options are efficiently arranged in balanced column grids.'
    });
  }

  // Check Answer Space over-allocation
  let oversizedAnswerSpaces = 0;
  exam.sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (q.type !== 'essay' && (q.presentation?.customLines && q.presentation.customLines > 10)) {
        oversizedAnswerSpaces++;
      }
    });
  });

  if (oversizedAnswerSpaces > 0) {
    score -= 3;
    issues.push({
      id: 'layout-oversized-answer-lines',
      category: 'Layout',
      severity: 'Medium',
      status: 'Warning',
      ruleName: 'Answer Space Allocation',
      message: `${oversizedAnswerSpaces} short/table question(s) have >10 lines allocated, which creates empty white space and causes page orphans.`,
      suggestedFix: 'Compact short question write-in lines to 3–6 lines.',
      autoFix: {
        type: 'BALANCE_ANSWER_SPACES',
        payload: {}
      }
    });
  } else {
    issues.push({
      id: 'layout-answer-space-ok',
      category: 'Layout',
      severity: 'Info',
      status: 'Passed',
      ruleName: 'Balanced Write-in Answer Lines',
      message: 'Write-in answer lines match question type expectations cleanly.'
    });
  }

  // Overall Layout Optimization Offer
  issues.push({
    id: 'layout-global-optimize',
    category: 'Layout',
    severity: 'Info',
    status: 'Passed',
    ruleName: 'Page Budget & Layout Audit',
    message: 'Global exam page layout is ready for automated alignment and multi-page balancing.',
    suggestedFix: 'Run Automated Page Alignment & Layout Optimization.',
    autoFix: {
      type: 'OPTIMIZE_PAGE_LAYOUT',
      payload: {}
    }
  });

  // 6. QUESTION TYPES & FORMATS VERIFICATION
  exam.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      const spec = getQuestionSpec(q.type);
      
      // Instruction existence
      const isSelfContained = isSelfContainedQuestion(q.text || '');
      if (!isSelfContained && (!q.instruction || q.instruction.trim().length < 2)) {
        score -= 2;
        issues.push({
          id: `missing-instruction-${sIdx}-${qIdx}`,
          category: 'Structural',
          severity: 'Medium',
          status: 'Warning',
          ruleName: `Question Instruction Reference`,
          message: `Section ${sIdx + 1} Question ${q.number} (${q.type}) is missing a clear instruction.`,
          suggestedFix: `Add a micro-instruction (e.g. "${spec.microInstructions.en}")`
        });
      }

      // Check validation contracts
      if (spec.validationContract.requiresTableData && (!q.tableData || !q.tableData.rows || q.tableData.rows.length === 0)) {
        score -= 5;
        issues.push({
          id: `missing-tabledata-${sIdx}-${qIdx}`,
          category: 'Structural',
          severity: 'High',
          status: 'Failed',
          ruleName: `${spec.name} Format Elements`,
          message: `Question ${q.number} is a ${spec.name} but is missing the required table data.`,
          suggestedFix: `Provide structured tableData for this question.`
        });
      }

      if (spec.validationContract.requiresDottedLine && (!q.text || !q.text.includes('...'))) {
        score -= 2;
        issues.push({
          id: `missing-dotted-line-${sIdx}-${qIdx}`,
          category: 'Structural',
          severity: 'Low',
          status: 'Warning',
          ruleName: `${spec.name} Formatting Rule`,
          message: `Question ${q.number} is a ${spec.name} but does not seem to include a dotted line (e.g. '...').`,
          suggestedFix: `Add a blank dotted space for the student to fill in.`
        });
      }

      if (spec.hierarchy.requiresPassageRef && (!q.subQuestions || q.subQuestions.length === 0)) {
        score -= 3;
        issues.push({
          id: `missing-subquestions-${sIdx}-${qIdx}`,
          category: 'Structural',
          severity: 'Medium',
          status: 'Failed',
          ruleName: `${spec.name} Hierarchy`,
          message: `Question ${q.number} is a ${spec.name} which requires sub-questions (the passage alone is not a question).`,
          suggestedFix: `Add sub-questions related to the passage.`
        });
      }
      
      if (spec.validationContract.minOptions && (!q.options || q.options.length < spec.validationContract.minOptions)) {
        score -= 5;
        issues.push({
          id: `missing-options-${sIdx}-${qIdx}`,
          category: 'Structural',
          severity: 'High',
          status: 'Failed',
          ruleName: `${spec.name} Options Element`,
          message: `Question ${q.number} is a ${spec.name} but has less than ${spec.validationContract.minOptions} options.`,
          suggestedFix: `Add missing options to meet the minimum requirement.`
        });
      }

      // Answer space verification
      if (spec.answerSpace.requiresSpace) {
        if (!q.answerSpace || q.answerSpace === 'none') {
           score -= 3;
           issues.push({
            id: `missing-answerspace-${sIdx}-${qIdx}`,
            category: 'Layout',
            severity: 'Medium',
            status: 'Failed',
            ruleName: `Answering Space (${spec.name})`,
            message: `Question ${q.number} requires answering space but none is provided.`,
            suggestedFix: `Set answerSpace to '${spec.answerSpace.defaultFormat}'.`,
            autoFix: {
              type: 'SET_ANSWER_SPACE',
              payload: { sectionIndex: sIdx, questionId: q.id, defaultFormat: spec.answerSpace.defaultFormat }
            }
          });
        } else if (!spec.answerSpace.allowedFormats.includes(q.answerSpace)) {
           score -= 1;
           issues.push({
            id: `invalid-answerspace-${sIdx}-${qIdx}`,
            category: 'Layout',
            severity: 'Low',
            status: 'Warning',
            ruleName: `Answer Space Constraint (${spec.name})`,
            message: `Question ${q.number} has answerSpace '${q.answerSpace}', but recommended are: ${spec.answerSpace.allowedFormats.join(', ')}.`,
            suggestedFix: `Change answerSpace to a recommended value.`
          });
        }
      } else if (q.type === 'mcq' && (q as any).answerSpace && (q as any).answerSpace !== 'none') {
         score -= 2;
         issues.push({
            id: `extra-answerspace-${sIdx}-${qIdx}`,
            category: 'Layout',
            severity: 'Low',
            status: 'Warning',
            ruleName: `No Answer Space for MCQ`,
            message: `Question ${q.number} is a Multiple Choice question but has answerSpace allocated.`,
            suggestedFix: `Set answerSpace to 'none'.`,
            autoFix: {
              type: 'SET_ANSWER_SPACE',
              payload: { sectionIndex: sIdx, questionId: q.id, defaultFormat: 'none' }
            }
          });
      }

    });
  });

  // Ensure score doesn't dip below 10
  score = Math.max(10, score);

  return {
    score,
    isValid: score >= 80 && mcqWithNoCorrect === 0 && (headerTotal === candidateMaxTotal || headerTotal === 0),
    issues: issues.sort((a, b) => {
      const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    metrics: {
      totalHeaderMarks: headerTotal,
      totalSectionMarks: candidateMaxTotal,
      totalQuestionMarks: availableQuestionSum,
      rwandanElementsCount: foundRwandanElements.length,
      rwandanElementsFound: foundRwandanElements,
      bloomsDistribution: [
        { name: 'Knowledge & Recall', count: kCount, percentage: kPct, recommended: '40%' },
        { name: 'Application & Analysis', count: aCount, percentage: aPct, recommended: '40%' },
        { name: 'Higher Order Thinking (HOTs)', count: sCount, percentage: sPct, recommended: '20%' }
      ],
      questionCount: totalQuestions,
      mcqCount,
      mcqWithNoCorrect,
      mathPassageRulesOk: markAudit.isValid,
      durationMinutes,
      expectedStudentMinutes,
      templateAudit: {
        hasOfficialTemplate: templateVerification.hasOfficialTemplate,
        templateSubject: templateVerification.templateSubject,
        templateLevel: templateVerification.templateLevel,
        isCompliant: templateVerification.isCompliant,
        complianceScore: templateVerification.complianceScore,
        expectedSectionCount: templateVerification.expectedSectionCount,
        actualSectionCount: templateVerification.actualSectionCount,
        discrepancies: templateVerification.discrepancies
      }
    }
  };
}

export function applyNesaAutoFix(exam: GeneratedExam, issue: AuditIssue): GeneratedExam {
  const newExam: GeneratedExam = JSON.parse(JSON.stringify(exam));
  
  if (!issue.autoFix) return newExam;
  
  const { type, payload } = issue.autoFix;
  
  switch (type) {
    case 'SYNC_SECTION_MARKS': {
      const { sectionIndex, correctMarks } = payload;
      if (newExam.sections[sectionIndex]) {
        newExam.sections[sectionIndex].marks = correctMarks;
      }
      break;
    }
    case 'SYNC_HEADER_TOTAL': {
      const { correctTotal } = payload;
      newExam.header.marks = correctTotal;
      break;
    }
    case 'RESEQUENCE_NUMBERING': {
      let currentNumber = 1;
      newExam.sections.forEach(sec => {
        sec.questions.forEach(q => {
          q.number = currentNumber++;
        });
      });
      break;
    }
    case 'MARK_FIRST_OPTION_CORRECT': {
      const { sectionIndex, questionId } = payload;
      if (newExam.sections[sectionIndex]) {
        const q = newExam.sections[sectionIndex].questions.find(q => q.id === questionId);
        if (q && q.options && q.options.length > 0) {
          q.options.forEach((opt, idx) => {
            opt.isCorrect = idx === 0;
          });
        }
      }
      break;
    }
    case 'SET_ANSWER_SPACE': {
      const { sectionIndex, questionId, defaultFormat } = payload;
      if (newExam.sections[sectionIndex]) {
        const q = newExam.sections[sectionIndex].questions.find(q => q.id === questionId);
        if (q) {
          q.answerSpace = defaultFormat;
        }
      }
      break;
    }
    case 'ADD_STANDARD_INSTRUCTIONS': {
      newExam.header.instructions = [
        'Attempt all questions in this examination paper.',
        'No calculators or reference materials are allowed unless specified.',
        'Write all answers clearly in the spaces provided.',
        'Do not open this booklet until you are directed to do so.'
      ];
      break;
    }
    case 'BALANCE_MARGINS': {
      newExam.presentation = {
        fontFamily: newExam.presentation?.fontFamily || 'serif',
        fontSize: newExam.presentation?.fontSize || '11pt',
        lineHeight: newExam.presentation?.lineHeight || '1.4',
        margins: { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' }
      };
      break;
    }
    case 'ALIGN_FULL_WIDTH': {
      newExam.presentation = {
        fontFamily: newExam.presentation?.fontFamily || 'serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        margins: newExam.presentation?.margins || { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' }
      };
      break;
    }
    case 'CONVERT_MCQ_GRID': {
      newExam.sections.forEach(sec => {
        sec.questions.forEach(q => {
          if (q.type === 'mcq' && q.options && q.options.length === 4) {
            if (q.options.every(o => o.text.length < 35)) {
              q.presentation = {
                keepTogether: q.presentation?.keepTogether ?? false,
                indentation: q.presentation?.indentation || '0',
                layout: 'grid',
                answerStyle: q.presentation?.answerStyle,
                tableStyle: q.presentation?.tableStyle,
                customLines: q.presentation?.customLines
              };
            }
          }
        });
      });
      break;
    }
    case 'BALANCE_ANSWER_SPACES': {
      newExam.sections.forEach(sec => {
        sec.questions.forEach(q => {
          if (q.type !== 'essay' && q.presentation?.customLines && q.presentation.customLines > 10) {
            q.presentation.customLines = 6;
          }
        });
      });
      break;
    }
    case 'OPTIMIZE_PAGE_LAYOUT': {
      newExam.presentation = {
        fontFamily: newExam.presentation?.fontFamily || 'serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        margins: { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' }
      };
      newExam.sections.forEach(sec => {
        sec.questions.forEach(q => {
          if (q.type === 'mcq' && q.options && q.options.length === 4) {
            if (q.options.every(o => o.text.length < 35)) {
              q.presentation = {
                keepTogether: q.presentation?.keepTogether ?? false,
                indentation: q.presentation?.indentation || '0',
                layout: 'grid',
                answerStyle: q.presentation?.answerStyle,
                tableStyle: q.presentation?.tableStyle,
                customLines: q.presentation?.customLines
              };
            }
          }
        });
      });
      break;
    }
    default:
      break;
  }
  
  return newExam;
}
