export interface NesaSectionBlueprint {
  id: string;
  title: string;
  purpose: string;
  totalMarks: number;
  numberOfQuestions: number;
  allowedQuestionTypes: string[];
  bloomsLevels: string[];
  instructions: string;
  structuralRules?: string; // Rules like "Passage must be placed here", "Praise poem evaluated here"
}

export interface NesaBlueprint {
  id: string;
  subject: string;
  level: string;
  totalMarks: number;
  globalRules?: string;
  sections: NesaSectionBlueprint[];
}

export const nesaBlueprints: Record<string, NesaBlueprint> = {
  english_primary: {
    id: 'english_primary',
    subject: 'English',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) 4-section architecture.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Comprehension',
        purpose: 'Evaluate literal reading comprehension, inferential reasoning, and vocabulary in context.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['comprehension'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Read the following passage carefully and answer the questions that follow.',
        structuralRules: 'MANDATORY: A prose reading passage (200-300 words) MUST be placed here as the parent stimulus. Sub-questions depend strictly on this passage.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Vocabulary',
        purpose: 'Evaluate contextual word replacements, synonyms/antonyms, and sentence completion.',
        totalMarks: 25,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['fill_blank', 'short', 'matching'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Answer the following vocabulary questions as instructed.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Language Use / Grammar',
        purpose: 'Evaluate structural manipulation, syntax rules, and tense corrections.',
        totalMarks: 40,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['transformation', 'short_answer', 'mcq'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Rewrite or transform the following sentences as instructed.'
      },
      {
        id: 'sec_d',
        title: 'Section D: Composition',
        purpose: 'Assess guided composition and discourse production.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis'],
        instructions: 'Write a composition of 150-250 words on ONE of the following topics.',
        structuralRules: 'Must provide an extended response space.'
      }
    ]
  },
  english_olevel: {
    id: 'english_olevel',
    subject: 'English',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA O-Level English examination (English I - 003) 4-section architecture.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Comprehension and Vocabulary',
        purpose: 'Assess advanced reading comprehension, inference, and contextual vocabulary.',
        totalMarks: 30,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['comprehension', 'fill_blank'],
        bloomsLevels: ['Comprehension', 'Analysis'],
        instructions: 'Read the passage below and answer the questions that follow.',
        structuralRules: 'MANDATORY: A reading passage (300-500 words) MUST be placed here.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Language Use',
        purpose: 'Assess active/passive voice, direct/reported speech, and grammatical transformations.',
        totalMarks: 40,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['transformation', 'short_answer'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Rewrite the following sentences according to the instructions given.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Summary Writing',
        purpose: 'Assess concise condensation of source texts.',
        totalMarks: 10,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['summary'],
        bloomsLevels: ['Synthesis'],
        instructions: 'Read the text and summarize it according to the instructions.',
        structuralRules: 'MANDATORY: The summary MUST be bounded by a strict word count.'
      },
      {
        id: 'sec_d',
        title: 'Section D: Composition',
        purpose: 'Evaluate sustained logical argument or creative narrative composition.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Choose ONE topic and write an essay of 250-350 words.',
        structuralRules: 'Must provide choices (e.g., argumentative vs narrative). Candidate attempts only one.'
      }
    ]
  },
  english_alevel: {
    id: 'english_alevel',
    subject: 'English Language',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA A-Level English Language 3-section architecture.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Comprehension and Vocabulary',
        purpose: 'Evaluate complex reading comprehension and advanced vocabulary extraction.',
        totalMarks: 30,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['comprehension'],
        bloomsLevels: ['Comprehension', 'Analysis'],
        instructions: 'Read the passage and answer the questions.',
        structuralRules: 'MANDATORY: An advanced prose passage must anchor this section.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Language Use',
        purpose: 'Evaluate advanced grammatical transformations and syntax manipulation.',
        totalMarks: 50,
        numberOfQuestions: 10,
        allowedQuestionTypes: ['transformation', 'fill_blank', 'short_answer'],
        bloomsLevels: ['Application', 'Synthesis'],
        instructions: 'Rewrite the sentences as instructed without changing the original meaning.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Composition Writing',
        purpose: 'Evaluate sophisticated academic essay writing and argumentation.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Write a composition on ONE of the following topics.',
        structuralRules: 'Provide distinct academic topics. Extended multi-page response space required.'
      }
    ]
  },
  mathematics_primary: {
    id: 'mathematics_primary',
    subject: 'Mathematics',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Mathematics structure. All questions are compulsory.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Mathematics',
        purpose: 'Evaluate arithmetic operations, geometry, fractions, percentages, and basic problem solving.',
        totalMarks: 100,
        numberOfQuestions: 35,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Attempt ALL questions in this section. Show all working clearly.',
        structuralRules: 'Provide adequate workspace for calculations.'
      }
    ]
  },
  mathematics_olevel: {
    id: 'mathematics_olevel',
    subject: 'Mathematics',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA O-Level Mathematics 2-section architecture.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Short Computational Items',
        purpose: 'Assess broad syllabus coverage via short, compulsory mathematical problems.',
        totalMarks: 55,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Attempt ALL questions in this section. Show all your working steps clearly.',
        structuralRules: 'Standalone short computational items.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Structured Problems',
        purpose: 'Evaluate problem decomposition, algorithmic execution, and multi-step derivations.',
        totalMarks: 45,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt ONLY THREE questions from this section. Show all intermediate working.',
        structuralRules: 'Extended multi-part structured problems (a, b, c) requiring significant workspace.'
      }
    ]
  },
  mathematics_alevel: {
    id: 'mathematics_alevel',
    subject: 'Mathematics',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA A-Level Subsidiary Mathematics 2-section architecture.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short Questions',
        purpose: 'Assess algebraic manipulation, geometry, calculus, and basic statistical derivations.',
        totalMarks: 55,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section. Show all working clearly.',
        structuralRules: 'Items MUST involve specific mathematical equations, formulas, or theorems.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Multi-Step Problems',
        purpose: 'Evaluate complex mathematical proofs, derivations, and multi-part problem solving.',
        totalMarks: 45,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt ONLY THREE questions from this section. Show all intermediate steps and derivations.',
        structuralRules: 'Scaffolded multi-part problems. Sub-marks must be explicitly distributed.'
      }
    ]
  },
  literature_primary: {
    id: 'literature_primary',
    subject: 'Literature in English',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Primary Literature is assessed via storytelling and reading comprehension under the PLE English umbrella. Maintain simple thematic focus.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Story Comprehension',
        purpose: 'Evaluate basic reading comprehension, recall, and understanding of characters in a short story or tale.',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Read the story carefully and answer the questions that follow.',
        structuralRules: 'A simple narrative text (150-250 words) must anchor this section.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Literary Vocabulary and Expression',
        purpose: 'Assess understanding of basic literary terms, feelings, and simple creative writing.',
        totalMarks: 40,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['fill_blank', 'short_answer'],
        bloomsLevels: ['Application', 'Synthesis'],
        instructions: 'Answer the following questions based on the story and vocabulary.',
        structuralRules: 'Use short answer spaces.'
      }
    ]
  },
  literature_olevel: {
    id: 'literature_olevel',
    subject: 'Literature in English',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA O-Level Literature in English syllabus (S1-S3). Focuses on developing critical appreciation of literary texts.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Prose and Poetry',
        purpose: 'Evaluate comprehension and analysis of unseen or prescribed prose and poetry.',
        totalMarks: 40,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['comprehension', 'short_answer'],
        bloomsLevels: ['Knowledge', 'Analysis'],
        instructions: 'Read the passage or poem and answer the questions.',
        structuralRules: 'Include an excerpt of prose or a poem.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Plays / Drama',
        purpose: 'Assess understanding of characterization, themes, and plot in dramatic literature.',
        totalMarks: 35,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['essay', 'short_answer'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Answer questions on the provided dramatic excerpt or set play.',
        structuralRules: 'Focus on dramatic techniques.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Novels / Fiction',
        purpose: 'Evaluate sustained thematic understanding and character analysis of a novel.',
        totalMarks: 25,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Write an essay on one of the given topics.',
        structuralRules: 'Extended analytical essay focusing on a novel.'
      }
    ]
  },
  literature_alevel: {
    id: 'literature_alevel',
    subject: 'Literature in English',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA A-Level Literature in English strict 3-section architecture.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Prose and Poetry',
        purpose: 'Evaluate critical analysis of literary devices, tone, and themes in prose and poetry.',
        totalMarks: 40,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['comprehension', 'short_answer'],
        bloomsLevels: ['Analysis', 'Evaluation'],
        instructions: 'Read the following text/poem and answer the questions below.',
        structuralRules: 'MANDATORY: An unseen or set literary text MUST be placed here as the primary stimulus.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Plays',
        purpose: 'Evaluate dramatic techniques, characterization, and plot synthesis.',
        totalMarks: 35,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Attempt ONE question from this section.',
        structuralRules: 'Atomic extended essay prompts only. No nested sub-questions. Requires extended booklet allocation.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Novels',
        purpose: 'Evaluate sustained thematic arguments based on prepared literature novels.',
        totalMarks: 25,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Attempt ONE question from this section.',
        structuralRules: 'Extended analytical essay focusing on novels.'
      }
    ]
  },
  entrepreneurship_primary: {
    id: 'entrepreneurship_primary',
    subject: 'Entrepreneurship',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Primary Entrepreneurship & Financial Education is grounded in basic budgeting, savings, SMART goals, and practical economic activities under the Social Studies curriculum.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Financial Literacy and Savings',
        purpose: 'Evaluate foundational understanding of money, budgeting, needs vs wants, and savings habits.',
        totalMarks: 50,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Simple scenario-based items with clear short answer lines.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Business Concepts and Enterprise Activities',
        purpose: 'Assess understanding of basic trade, teamwork, integrity, and small school/community enterprise projects.',
        totalMarks: 50,
        numberOfQuestions: 10,
        allowedQuestionTypes: ['short', 'short_answer', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Practical questions grounded in Rwandan local markets and school businesses.'
      }
    ]
  },
  entrepreneurship_olevel: {
    id: 'entrepreneurship_olevel',
    subject: 'Entrepreneurship',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA O-Level Entrepreneurship (Paper 004 / ENT I) architecture. Combines quantitative business calculations with qualitative enterprise management.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short Questions',
        purpose: 'Assess broad syllabus knowledge including business planning, budgeting, simple taxes, VAT, opportunity cost, and market research.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'table'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise questions with specific mark allocations (2-5 marks per question). May include simple VAT or profit calculations.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Case Studies and Analytical Problems',
        purpose: 'Evaluate problem-solving in business management, marketing strategies, record-keeping, and business ethics.',
        totalMarks: 45,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'case_study', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt ONLY THREE questions from this section.',
        structuralRules: 'Scaffolded multi-part problems (a, b, c) carrying 15 marks each. Often anchored to a brief enterprise scenario.'
      }
    ]
  },
  entrepreneurship_alevel: {
    id: 'entrepreneurship_alevel',
    subject: 'Entrepreneurship',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow recent NESA A-Level Entrepreneurship II (Code 019 / ENT 01) 3-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Medium Response Questions',
        purpose: 'Assess comprehensive grasp of financial statements, tax compliance, labor laws, marketing mix, business model canvas, and SWOT analysis.',
        totalMarks: 40,
        numberOfQuestions: 10,
        allowedQuestionTypes: ['short', 'short_answer', 'table', 'case_study'],
        bloomsLevels: ['Knowledge', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise and technical questions (typically 2-5 marks each, summing to 40 marks). May include SWOT matrix or break-even data.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Analytical and Strategic Problems',
        purpose: 'Evaluate business problem-solving, marketing strategies, record-keeping, and operational enterprise planning.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'case_study', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any THREE questions from this section.',
        structuralRules: 'Candidates choose 3 out of 5 questions (10 marks each, summing to 30 marks). Scaffolded questions (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Extended Case Studies and Business Project Analysis',
        purpose: 'Evaluate deep strategic decision-making, Business Model Canvas design, partnership evaluation, and comprehensive enterprise feasibility.',
        totalMarks: 30,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['essay', 'case_study', 'short_answer'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any TWO questions from this section.',
        structuralRules: 'Candidates choose 2 out of 3/4 questions (15 marks each, summing to 30 marks). In-depth scenario evaluation requiring sustained analysis.'
      }
    ]
  },
  general_studies_alevel: {
    id: 'general_studies_alevel',
    subject: 'General Studies and Communication Skills',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow NESA A-Level General Studies and Communication Skills (GSC 01 / 024) 3-section format. Duration: 3 hours. Explores national development programs, civics, global affairs, and communication competence.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Conceptual Questions and Communication Skills',
        purpose: 'Assess understanding of Rwandan governance, socio-economic programs (e.g. Vision 2050, NST1), civic duties, media literacy, and formal communication.',
        totalMarks: 25,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['short', 'short_answer', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise questions evaluating civics, ethical reasoning, and business/administrative communication formats.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Discursive Essays on National and Global Issues',
        purpose: 'Evaluate sustained argument, critical evaluation, and structured discourse on contemporary socio-economic, environmental, or technological issues.',
        totalMarks: 50,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Answer any TWO questions from this section.',
        structuralRules: 'Choice of extended essay topics (25 marks each). Must require balanced arguments, Rwandan contextual grounding, and multi-page booklet response space.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Comprehension, Data Interpretation, and Applied Communication',
        purpose: 'Assess textual extraction, synthesis of data/charts, and functional writing (e.g. formal memorandum, press release, or proposal).',
        totalMarks: 25,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['comprehension', 'case_study', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Application'],
        instructions: 'Attempt the question in this section based on the provided passage or data.',
        structuralRules: 'Anchored by a contemporary case study, analytical report, or data text (250-400 words).'
      }
    ]
  },
  kinyarwanda_primary: {
    id: 'kinyarwanda_primary',
    subject: 'Ikinyarwanda',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Ikinyarwanda standards. All 4 sections compulsory. Language: Kinyarwanda.',
    sections: [
      {
        id: 'sec_a',
        title: 'IGICE CYA MBERE: KUMVA NO GUSESENGURA UMWANDIKO',
        purpose: 'Gusuzuma ubumenyi bwo gusoma no kumva umwandiko, gusesengura inyito y\'amagambo mu mwandiko n\'ibitekerezo by\'ingenzi.',
        totalMarks: 30,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Soma umwandiko ukurikira witonze maze usubize ibibazo byawubajijweho.',
        structuralRules: 'MANDATORY: Umwandiko (amagambo 150-250) ugomba gushyirwa hano nk\'inkingi y\'ibibazo byose byo mu gice cya mbere.'
      },
      {
        id: 'sec_b',
        title: 'IGICE CYA KABIRI: IKIBONEZAMVUGO',
        purpose: 'Gusuzuma iyiganteruro, insimburangingo, inshinga, ingingo z\'ubumenyi bw\'imiterere y\'ikinyarwanda.',
        totalMarks: 30,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['short', 'short_answer', 'transformation', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Subiza ibibazo by\'ikibonezamvugo bikurikira ukurikije amabwiriza.'
      },
      {
        id: 'sec_c',
        title: 'IGICE CYA GATATU: UBUMENYI RUSANGE BW\'URURIMI N\'UMUCO',
        purpose: 'Gusuzuma imigani, ibisakuzo, imvugo zizimije n\'umuco nyarwanda.',
        totalMarks: 20,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['matching', 'short_answer', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Subiza ibibazo by\'ubumenyi rusange bw\'ururimi n\'umuco bikurikira.'
      },
      {
        id: 'sec_d',
        title: 'IGICE CYA KANE: IHANGAMWANDIKO',
        purpose: 'Gusuzuma ubushobozi bwo guhanga inyandiko inoze kandi ifite ubutumwa bunoze.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Hitamo insanganyamatsiko imwe muri ebyiri zikurikira maze wandike umwandiko urambuye (amagambo 100-150).'
      }
    ]
  },
  kinyarwanda_olevel: {
    id: 'kinyarwanda_olevel',
    subject: 'Ikinyarwanda',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Ikinyarwanda (Subject Code 001 / KIN I) 4-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'IGICE CYA MBERE: KUMVA NO GUSESENGURA UMWANDIKO',
        purpose: 'Gusuzuma ubushobozi bwo gusoma no gusesengura umwandiko, ibisobanuro by\'amagambo mu nyito ndangazina n\'inzigamvugo.',
        totalMarks: 30,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Analysis'],
        instructions: 'Soma umwandiko ukurikira witonze maze usubize ibibazo byawubajijweho.',
        structuralRules: 'MANDATORY: Umwandiko nyarwanda w\'amagambo 300-450 ugomba gutegurwa hano.'
      },
      {
        id: 'sec_b',
        title: 'IGICE CYA KABIRI: IKIBONEZAMVUGO N\'IYIGARURIMI',
        purpose: 'Gusuzuma amategeko y\'imyandikire y\'ikinyarwanda, isesengurangerero, inyangingo, n\'isesenguranshinga.',
        totalMarks: 30,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['transformation', 'short_answer', 'fill_blank', 'matching'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Subiza ibibazo byose by\'ikibonezamvugo bikurikira.'
      },
      {
        id: 'sec_c',
        title: 'IGICE CYA GATATU: UBUMENYI RUSANGE BW\'URURIMI N\'UBUVANGANZO',
        purpose: 'Gusuzuma ubuvanganzo nyemvugo (imigani, ibyivugo, amazina y\'inka, imyato) n\'imikoreshereze y\'ururimi.',
        totalMarks: 20,
        numberOfQuestions: 4,
        allowedQuestionTypes: ['short_answer', 'matching', 'short'],
        bloomsLevels: ['Comprehension', 'Analysis', 'Synthesis'],
        instructions: 'Subiza ibibazo by\'ubuvanganzo n\'ubumenyi bw\'ururimi bikurikira.'
      },
      {
        id: 'sec_d',
        title: 'IGICE CYA KANE: IHANGAMWANDIKO',
        purpose: 'Gusuzuma ubushobozi bwo guhanga inyandiko ifite intondeke nziza n\'imyandikire iboneye.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Hitamo insanganyamatsiko imwe mu zatanzwe maze uyandikeho umwandiko urambuye w\'amagambo 250 kugeza kuri 300.'
      }
    ]
  },
  kinyarwanda_alevel: {
    id: 'kinyarwanda_alevel',
    subject: 'Ikinyarwanda',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Ikinyarwanda (Code KIN 01 / KIN 02) 4-section architecture for combinations (e.g., LFK, HEG, EKK). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'IGICE CYA MBERE: KUMVA NO GUSESENGURA UMWANDIKO',
        purpose: 'Gusuzuma usesengura ryimbitse ry\'inyandiko, inyito y\'amagambo mu nteruro, n\'isesenguramitekerereze.',
        totalMarks: 25,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq'],
        bloomsLevels: ['Comprehension', 'Analysis', 'Evaluation'],
        instructions: 'Soma umwandiko ukurikira witonze maze usubize ibibazo byawubajijweho.',
        structuralRules: 'MANDATORY: Umwandiko usobanutse neza (amagambo 400-600) ugomba gushyirwa hano.'
      },
      {
        id: 'sec_b',
        title: 'IGICE CYA KABIRI: IYIGAMIYOBORERE N\'IKIBONEZAMVUGO',
        purpose: 'Gusuzuma isesengurangerero, imikoreshereze y\'inshinga, ubumenyi bw\'amategeko y\'imyandikire yemewe n\'isesenguranzira ry\'amagambo.',
        totalMarks: 35,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['transformation', 'short_answer', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Subiza ibibazo byose by\'ikibonezamvugo ukurikije amabwiriza yatanzwe.'
      },
      {
        id: 'sec_c',
        title: 'IGICE CYA GATATU: UBUVANGANZO NYARWANDA',
        purpose: 'Gusuzuma ubuvanganzo gakondo (ibisigo nyabami, ibyivugo, amazina y\'inka, imigani miremire) n\'ubuvanganzo bwanditse.',
        totalMarks: 20,
        numberOfQuestions: 4,
        allowedQuestionTypes: ['short_answer', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Subiza ibibazo bikurikira byerekeye ubuvanganzo nyarwanda.'
      },
      {
        id: 'sec_d',
        title: 'IGICE CYA KANE: IHANGAMWANDIKO',
        purpose: 'Gusuzuma ubushobozi bwo guhanga inyandiko ifite ireme, ibitekerezo byubaka, n\'imyandikire inoze y\'ururimi rw\'ikinyarwanda.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Hitamo insanganyamatsiko imwe mu zatanzwe maze uyandikeho umwandiko urambuye w\'amagambo 300 kugeza kuri 350.'
      }
    ]
  },
  french_primary: {
    id: 'french_primary',
    subject: 'Français',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Français guidelines. All sections compulsory. Language: French.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compréhension du texte',
        purpose: 'Évaluer la compréhension globale et détaillée d\'un texte simple et l\'explication de mots en contexte.',
        totalMarks: 30,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Lisez attentivement le texte ci-dessous et répondez aux questions posées.',
        structuralRules: 'MANDATORY: Un texte narratif ou descriptif simple (150-250 mots) doit ancrer cette section.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Grammaire et Vocabulaire',
        purpose: 'Évaluer la maîtrise des temps verbaux (présent, passé composé, futur simple), accords et vocabulaire usuel.',
        totalMarks: 40,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['fill_blank', 'transformation', 'matching', 'short_answer'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Répondez à toutes les questions de grammaire et de vocabulaire selon les consignes.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Production écrite',
        purpose: 'Évaluer la capacité à rédiger un texte court, cohérent et bien structuré.',
        totalMarks: 30,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis'],
        instructions: 'Choisissez UN sujet parmi les sujets proposés et rédigez un texte de 80 à 120 mots.'
      }
    ]
  },
  french_olevel: {
    id: 'french_olevel',
    subject: 'Français',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Français (Code 003 / FR I) 4-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compréhension du texte',
        purpose: 'Évaluer la compréhension littérale, inférentielle et lexicale d\'un texte informatif ou narratif.',
        totalMarks: 30,
        numberOfQuestions: 7,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Analysis'],
        instructions: 'Lisez attentivement le texte suivant et répondez aux questions de compréhension.',
        structuralRules: 'MANDATORY: Un texte de 300 à 450 mots doit être inséré ici comme stimulus principal.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Connaissance de la langue (Grammaire et Vocabulaire)',
        purpose: 'Évaluer les structures syntaxiques, voix active/passive, discours direct/indirect, pronoms, temps et modes.',
        totalMarks: 40,
        numberOfQuestions: 10,
        allowedQuestionTypes: ['transformation', 'fill_blank', 'short_answer', 'matching'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Répondez à toutes les questions de grammaire et vocabulaire selon les consignes.'
      },
      {
        id: 'sec_c',
        title: 'Section C: Résumé ou Questions thématiques',
        purpose: 'Évaluer la capacité de synthèse ou de reformulation concise des idées principales.',
        totalMarks: 10,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['summary', 'short_answer'],
        bloomsLevels: ['Synthesis'],
        instructions: 'Résumez les idées principales du texte selon la consigne donnée.'
      },
      {
        id: 'sec_d',
        title: 'Section D: Production écrite',
        purpose: 'Évaluer la rédaction structurée, l\'argumentation et la correction de la langue écrite.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Choisissez UN sujet parmi les deux proposés et développez-le en 200 à 250 mots.'
      }
    ]
  },
  french_alevel: {
    id: 'french_alevel',
    subject: 'Français',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Français II (Paper Code 020 / FR 02) 4-section architecture for combinations (LFK, LKF). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Compréhension du texte',
        purpose: 'Évaluer l\'analyse critique, l\'inférence et la signification lexicale en contexte sur un texte littéraire ou journalistique.',
        totalMarks: 25,
        numberOfQuestions: 7,
        allowedQuestionTypes: ['mcq', 'short_answer', 'true_false'],
        bloomsLevels: ['Comprehension', 'Analysis', 'Evaluation'],
        instructions: 'Lisez attentivement le texte et répondez aux questions suivantes. Choisissez la réponse correcte parmi celles qui sont proposées sous chaque question.',
        structuralRules: 'MANDATORY: Un texte littéraire ou argumentatif approfondi (400-600 mots) doit être inséré ici.'
      },
      {
        id: 'sec_b',
        title: 'Connaissance de la langue française',
        purpose: 'Évaluer la maîtrise syntaxique avancée, les transformations de phrases, la concordance des temps, subjonctif/conditionnel, et le lexique.',
        totalMarks: 45,
        numberOfQuestions: 13,
        allowedQuestionTypes: ['transformation', 'fill_blank', 'mcq', 'matching', 'reorder', 'true_false'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Complétez, transformez ou associez selon la consigne de chaque question.'
      },
      {
        id: 'sec_c',
        title: 'Littérature',
        purpose: 'Évaluer l\'histoire littéraire, les mouvements littéraires (classicisme, romantisme, négritude, etc.), l\'analyse stylistique et les figures de style.',
        totalMarks: 15,
        numberOfQuestions: 4,
        allowedQuestionTypes: ['mcq', 'true_false', 'short_answer'],
        bloomsLevels: ['Knowledge', 'Analysis', 'Evaluation'],
        instructions: 'Répondez aux questions de littérature selon la consigne donnée pour chaque item.'
      },
      {
        id: 'sec_d',
        title: 'Expression écrite',
        purpose: 'Évaluer l\'essai argumentatif, la dissertation ou la réflexion critique sur des thèmes sociétaux ou littéraires.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Deux sujets sont proposés ; le candidat en choisit un et le développe de manière cohérente en 250 à 280 mots.'
      }
    ]
  },
  physics_primary: {
    id: 'physics_primary',
    subject: 'Physics',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Science and Elementary Technology (SET) standards with physical science focus (matter, energy, light, electricity, simple machines, magnetism, forces). Single compulsory section.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Physical Science Questions',
        purpose: 'Evaluate fundamental concepts of physical science including forces, simple machines, energy transformations, light reflection/refraction, basic circuits, magnets, and properties of matter.',
        totalMarks: 100,
        numberOfQuestions: 30,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section. Write your answers in the spaces provided.',
        structuralRules: 'Direct recall and simple application items with concise answer lines and diagrams.'
      }
    ]
  },
  physics_olevel: {
    id: 'physics_olevel',
    subject: 'Physics',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Physics I (Subject Code 011 / 005) 3-section architecture. Total: 100 marks. Duration: 3 hours. Non-programmable calculators and geometrical instruments are permitted.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short Questions',
        purpose: 'Assess broad syllabus foundation including mechanics, thermal physics, optics, electrostatics, current electricity, magnetism, and wave motion.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'table'],
        bloomsLevels: ['Knowledge', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section. Show all formulas and calculations clearly.',
        structuralRules: 'Concise computational and conceptual questions (typically 2 to 5 marks each, summing to 55 marks). Provide bounded formula workspace.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Problem-Solving Questions',
        purpose: 'Evaluate multi-step quantitative problem decomposition, kinematics, energy conservation, circuit analysis, and ray diagrams.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any THREE (3) questions from this section. Show all intermediate calculations and units.',
        structuralRules: 'Candidates choose 3 out of 5 questions (10 marks each, summing to 30 marks). Scaffolded structured questions (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Practical and Experimental Application',
        purpose: 'Evaluate experimental methodology, dry practical procedures, circuit setup, graphical analysis, and measurement error determination.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Evaluation'],
        instructions: 'Attempt the question in this section. (Compulsory practical/experimental analysis).',
        structuralRules: 'Compulsory 15-mark experimental analysis item focusing on laboratory setups, table data, and slope calculation.'
      }
    ]
  },
  physics_alevel: {
    id: 'physics_alevel',
    subject: 'Physics',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Physics II (Paper II: Theory, Code 030 / PHY 02) 2-section architecture. Total: 100 marks. Duration: 3 hours. Non-programmable scientific calculators permitted. Combinations: PCM, PCB, MPG, MPC.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Structured Questions',
        purpose: 'Assess comprehensive mastery of classical mechanics, rotational dynamics, thermodynamics, oscillations, electromagnetic induction, wave optics, modern physics, and quantum/nuclear phenomena.',
        totalMarks: 70,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'table'],
        bloomsLevels: ['Knowledge', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section. Show formulas, substitution, and appropriate SI units.',
        structuralRules: 'Concise and structured computational questions (typically 3 to 6 marks each, summing to 70 marks). Must include standard LaTeX equations.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Multi-Step Problems and Derivations',
        purpose: 'Evaluate mathematical derivations, physical law proofs, complex alternating current circuits, wave interference, and thermodynamic cycles.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any THREE (3) questions from this section. Show all intermediate derivation steps.',
        structuralRules: 'Candidates choose 3 out of 5 questions (10 marks each, summing to 30 marks). In-depth structured items (a, b, c) with explicit sub-mark breakdowns.'
      }
    ]
  },
  chemistry_primary: {
    id: 'chemistry_primary',
    subject: 'Chemistry',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Science and Elementary Technology (SET) standards with chemical science focus (states of matter, changes of state, air, water, mixtures, solutions, separation of mixtures, soil properties, safe chemical handling). Single compulsory section.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Chemical Science Questions',
        purpose: 'Evaluate foundational understanding of matter, reversible/irreversible changes, composition of air, water purification, solutions and suspensions, acids/bases in everyday life, and laboratory safety.',
        totalMarks: 100,
        numberOfQuestions: 30,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section. Write your answers in the spaces provided.',
        structuralRules: 'Direct questions and practical identification items with concise answer lines.'
      }
    ]
  },
  chemistry_olevel: {
    id: 'chemistry_olevel',
    subject: 'Chemistry',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Chemistry I (Subject Code 012 / 006) 3-section architecture. Total: 100 marks. Duration: 3 hours. Non-programmable calculators permitted. Periodic table is not required unless specific data is provided.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short Questions',
        purpose: 'Assess atomic structure, bonding, periodic trends, stoichiometry, acids/bases/salts, metals/non-metals, and basic organic chemistry.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'fill_blank', 'table'],
        bloomsLevels: ['Knowledge', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section. Write balanced chemical equations where applicable.',
        structuralRules: 'Concise conceptual questions and calculations (typically 2 to 5 marks each, summing to 55 marks). Balanced state symbols and formula notation required.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Multi-Part Questions',
        purpose: 'Evaluate quantitative stoichiometry, mole calculations, redox reactions, gas laws, thermochemistry, and electrolysis.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any THREE (3) questions from this section. Show all working and balanced chemical equations.',
        structuralRules: 'Candidates choose 3 out of 5 questions (10 marks each, summing to 30 marks). Scaffolded structured questions (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Applied Chemistry and Experimental Design',
        purpose: 'Assess laboratory preparation of gases, industrial chemical extraction (Haber process, Contact process), qualitative analysis, titration procedures, and environmental chemistry.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Evaluation'],
        instructions: 'Attempt the question in this section. (Compulsory laboratory/industrial process analysis).',
        structuralRules: 'Compulsory 15-mark experimental / industrial chemistry item focusing on experimental apparatus, reagents, observations, and calculations.'
      }
    ]
  },
  chemistry_alevel: {
    id: 'chemistry_alevel',
    subject: 'Chemistry',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Chemistry II (Paper II: Theory, Code 029 / CHE 02) 2-section architecture. Total: 100 marks. Duration: 3 hours. Non-programmable scientific calculators permitted. Combinations: BCG, MCB, PCB, PCM, ANP.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Structured Questions',
        purpose: 'Assess core physical, inorganic, and organic chemistry: electronic configuration, chemical bonding, kinetics, chemical equilibria (Kc, Kp, pH), transition metals, and aliphatic/aromatic reaction pathways.',
        totalMarks: 70,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'table'],
        bloomsLevels: ['Knowledge', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section. Provide balanced equations and mechanisms where appropriate.',
        structuralRules: 'Structured questions (typically 3 to 6 marks each, summing to 70 marks). Must include balanced chemical equations and stoichiometric calculations.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Multi-Step Synthesis and Analytical Chemistry',
        purpose: 'Evaluate organic synthesis reaction routes, electrochemistry / electrode potentials (Nernst), coordination complexes, thermodynamics (Born-Haber cycles, Gibbs free energy), and spectroscopic analysis.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any THREE (3) questions from this section. Show detailed mechanisms, calculations, and balanced equations.',
        structuralRules: 'Candidates choose 3 out of 5 questions (10 marks each, summing to 30 marks). Multi-part structured questions (a, b, c) with explicit sub-mark allocations.'
      }
    ]
  },
  economics_alevel: {
    id: 'economics_alevel',
    subject: 'Economics',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Economics (Paper Code 017 / ECO 01) 2-section architecture for combinations (HEG, MEG, LEG, MCE, HEL, PEM). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Medium Response Questions',
        purpose: 'Assess comprehensive microeconomic and macroeconomic theories, market structures, price determination, national income, fiscal/monetary policies, and international trade.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'table', 'fill_blank', 'mcq'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise and rigorous questions (typically 2-5 marks each, summing to 55 marks). May include elasticity calculations, multiplier formulas, or table interpretations.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Analytical and Policy Essays',
        purpose: 'Evaluate sustained theoretical argumentation, economic evaluation, policy critique, and macroeconomic synthesis.',
        totalMarks: 45,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['essay', 'case_study'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any THREE (3) questions from this section.',
        structuralRules: 'Candidates choose 3 out of 5 extended essay prompts (15 marks each, summing to 45 marks). Questions demand structured arguments, economic models, and real-world policy application.'
      }
    ]
  },
  kiswahili_primary: {
    id: 'kiswahili_primary',
    subject: 'Kiswahili',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Kiswahili guidelines. All sections compulsory. Language: Kiswahili.',
    sections: [
      {
        id: 'sec_a',
        title: 'SEHEMU YA A: UFAHAMU WA KUSOMA',
        purpose: 'Kutathmini uwezo wa kusoma na kuelewa kifungu cha habari, msamiati na maana ya maneno kulingana na muktadha.',
        totalMarks: 30,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Soma kifungu cha habari kifuatacho kwa makini kisha ujibu maswali yote yanayofuata.',
        structuralRules: 'MANDATORY: Kifungu cha habari (maneno 150-250) lazima kiwekwe kama msingi wa maswali ya ufahamu.'
      },
      {
        id: 'sec_b',
        title: 'SEHEMU YA B: SARUFI NA MATUMIZI YA LUGHA',
        purpose: 'Kutathmini ngeli za nomino, nyakati na hali, viambishi, uakifishaji na msamiati wa kimsingi.',
        totalMarks: 40,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['transformation', 'fill_blank', 'matching', 'short_answer'],
        bloomsLevels: ['Knowledge', 'Application'],
        instructions: 'Jibu maswali yote ya sarufi na matumizi ya lugha kulingana na maagizo uliyopewa.'
      },
      {
        id: 'sec_c',
        title: 'SEHEMU YA C: UTUNGAJI / INSHA',
        purpose: 'Kutathmini uwezo wa kuandika insha fupi yenye mtiririko mzuri na uakifishaji sahihi.',
        totalMarks: 30,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis'],
        instructions: 'Chagua mada MOJA kati ya mada zilizotolewa uandike insha ya maneno 80 hadi 120.'
      }
    ]
  },
  kiswahili_olevel: {
    id: 'kiswahili_olevel',
    subject: 'Kiswahili',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Kiswahili (Code 005 / S3 Kiswahili) 3-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'SEHEMU YA KWANZA: UFAHAMU',
        purpose: 'Kutathmini uwezo wa kuelewa kifungu cha habari, uchambuzi wa ujumbe, na maana ya msamiati katika muktadha.',
        totalMarks: 25,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Analysis'],
        instructions: 'Soma kwa makini kifungu cha habari kifuatacho kisha ujibu maswali yote.',
        structuralRules: 'MANDATORY: Kifungu cha habari (maneno 300-450) kianze sehemu hii.'
      },
      {
        id: 'sec_b',
        title: 'SEHEMU YA PILI: SARUFI NA MATUMIZI YA LUGHA',
        purpose: 'Kutathmini ngeli za nomino, miundo ya sentensi, kauli za vitenzi, ukanushaji, usemi halisi na usemi wa taarifa.',
        totalMarks: 30,
        numberOfQuestions: 8,
        allowedQuestionTypes: ['transformation', 'fill_blank', 'short_answer', 'matching'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Jibu maswali yote ya sarufi na matumizi ya lugha kulingana na maagizo.'
      },
      {
        id: 'sec_c',
        title: 'SEHEMU YA TATU: UTUNGAJI (INSHA)',
        purpose: 'Kutathmini uandishi wa insha za kiuamilifu (barua, kumbukumbu, tahariri) na insha za masimulizi au mjadala.',
        totalMarks: 45,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Chagua mada MOJA kati ya mada ulizopewa kisha uandike insha yenye maneno 250 hadi 300.'
      }
    ]
  },
  kiswahili_alevel: {
    id: 'kiswahili_alevel',
    subject: 'Kiswahili',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Kiswahili (Code 027 / KIS 01) 4-section architecture for combinations (LFK, LKF, TTC). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'SEHEMU YA KWANZA: UFAHAMU NA UFUPISHO',
        purpose: 'Kutathmini uchambuzi wa kina wa kifungu cha habari, maana za kimuktadha, na ufupisho wa mawazo makuu.',
        totalMarks: 25,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'summary'],
        bloomsLevels: ['Comprehension', 'Analysis', 'Synthesis'],
        instructions: 'Soma kifungu kifuatacho kwa makini kisha ujibu maswali yanayofuata.',
        structuralRules: 'MANDATORY: Kifungu cha habari cha kitaaluma au kifasihi (maneno 400-600) kiwekwe hapa.'
      },
      {
        id: 'sec_b',
        title: 'SEHEMU YA PILI: SARUFI NA MATUMIZI YA LUGHA',
        purpose: 'Kutathmini uchanganuzi wa sentensi, ngeli, mnyambuliko wa vitenzi, uakifishaji, na matumizi fasaha ya lugha.',
        totalMarks: 35,
        numberOfQuestions: 9,
        allowedQuestionTypes: ['transformation', 'short_answer', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Jibu maswali yote ya sarufi na matumizi ya lugha.'
      },
      {
        id: 'sec_c',
        title: 'SEHEMU YA TATU: FASIHI YA KISWAHILI',
        purpose: 'Kutathmini fasihi simulizi (nyimbo, methali, vitendawili, hadithi) na fasihi andishi (riwaya, tamthilia, ushairi).',
        totalMarks: 20,
        numberOfQuestions: 4,
        allowedQuestionTypes: ['short_answer', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Jibu maswali ya fasihi ya Kiswahili kulingana na maagizo uliyopewa.'
      },
      {
        id: 'sec_d',
        title: 'SEHEMU YA NNE: UTUNGAJI (INSHA)',
        purpose: 'Kutathmini uwezo wa kuandika insha yenye mawazo yakinifu, hoja zilizopangwa kwa mtiririko mzuri na lugha fasaha.',
        totalMarks: 20,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Synthesis', 'Evaluation'],
        instructions: 'Chagua mada MOJA kati ya mada zilizotolewa uandike insha ya maneno 300 hadi 350.'
      }
    ]
  },
  geography_primary: {
    id: 'geography_primary',
    subject: 'Geography',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Social and Religious Studies (SRS) standards with Geography and Environmental focus (physical features of Rwanda, climate, administrative districts, lakes, rivers, environmental conservation). Single compulsory paper.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Physical and Human Geography',
        purpose: 'Evaluate foundational understanding of Rwanda physical landscape, relief, national parks, weather elements, map symbols, and natural resources.',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section. Write your answers in the spaces provided.',
        structuralRules: 'Direct factual recall and brief application questions with concise response lines.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Environmental Conservation and Applied Geography',
        purpose: 'Assess understanding of soil erosion control, reforestation, wetlands protection, agriculture, trade, and economic activities.',
        totalMarks: 40,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['short_answer', 'table', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Short structured scenario and table-based questions.'
      }
    ]
  },
  geography_olevel: {
    id: 'geography_olevel',
    subject: 'Geography and Environment',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Geography and Environment (Subject Code 006 / GEO I) 3-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short Questions',
        purpose: 'Assess broad syllabus foundation covering physical geography (relief, climate, vegetation, drainage, soils) and human/economic geography of Rwanda and the East African region.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'fill_blank', 'table'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise conceptual and factual questions (typically 2 to 5 marks each, summing to 55 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Regional and Environmental Questions',
        purpose: 'Evaluate in-depth understanding of vulcanicity, weathering, mining, industrialization, agriculture, tourism, and environmental degradation.',
        totalMarks: 30,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['short_answer', 'case_study', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any TWO (2) questions from this section.',
        structuralRules: 'Candidates choose 2 out of 4 structured questions (15 marks each, summing to 30 marks). Scaffolded items (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Photographic Interpretation, Map Reading and Fieldwork',
        purpose: 'Evaluate map symbols, grid references, scale calculation, landscape sketches, photograph interpretation, and geographical inquiry fieldwork methodology.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Evaluation'],
        instructions: 'Attempt the question in this section. (Compulsory map reading / photographic interpretation / fieldwork inquiry).',
        structuralRules: 'Compulsory 15-mark practical geography question anchored to a map extract, photograph, or fieldwork dataset.'
      }
    ]
  },
  geography_alevel: {
    id: 'geography_alevel',
    subject: 'Geography',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Geography (Paper Code 016 / GEO 01) 3-section architecture for combinations (HEG, MEG, HGL, MPG, BCG, LEG). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Physical and Human Geography',
        purpose: 'Assess advanced geomorphology, plate tectonics, climatology, biogeography, hydrological systems, demographic transitions, settlement patterns, and regional economic geography.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'table', 'case_study'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Rigorous conceptual questions (typically 2 to 5 marks each, summing to 55 marks). Requires precise geographic terminology.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Analytical Problems and Regional Case Studies',
        purpose: 'Evaluate deep spatial analysis, comparative regional development (e.g. Rhine basin, Tennessee Valley, Great Lakes of Africa), urbanization, and environmental management.',
        totalMarks: 30,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['short_answer', 'case_study', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any TWO (2) questions from this section.',
        structuralRules: 'Candidates choose 2 out of 4 structured questions (15 marks each, summing to 30 marks). Multi-part structured items (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Extended Essay, Fieldwork Investigation or Applied Practical',
        purpose: 'Assess sustained evaluative essay writing, geographical fieldwork inquiry design, data collection techniques, or advanced map analysis.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['essay', 'case_study'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt ONE (1) question from this section.',
        structuralRules: 'Extended analytical essay or structured fieldwork analysis (15 marks). Requires sustained arguments and geographical examples.'
      }
    ]
  },
  biology_primary: {
    id: 'biology_primary',
    subject: 'Biology',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Science and Elementary Technology (SET) standards with Biological science and Health focus (human organ systems, plant life cycle, classification of animals, hygiene, communicable diseases, balanced diet, environment). Single compulsory paper.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Living Organisms and Human Body Systems',
        purpose: 'Evaluate foundational understanding of plant parts and functions, animal groups (vertebrates vs invertebrates), digestive/respiratory/circulatory systems, sensory organs, and personal hygiene.',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section. Write your answers in the spaces provided.',
        structuralRules: 'Direct recall and diagram identification questions with clear answer spaces.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Applied Health Sciences, Nutrition and Ecology',
        purpose: 'Assess understanding of infectious and deficiency diseases (malaria, cholera, kwashiorkor), prevention measures, food chains, ecosystems, and environmental health.',
        totalMarks: 40,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['short_answer', 'table', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Scenario-based health and ecological analysis questions.'
      }
    ]
  },
  biology_olevel: {
    id: 'biology_olevel',
    subject: 'Biology and Health Sciences',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Biology and Health Sciences (Subject Code 007 / BIO I) 3-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short Questions',
        purpose: 'Assess broad syllabus knowledge: cell structure, microscopy, enzymes, nutrition, transport in plants/animals, gaseous exchange, respiration, excretion, homeostasis, coordination, and reproduction.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'table', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise conceptual and physiological questions (typically 2 to 5 marks each, summing to 55 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Multi-Part Questions',
        purpose: 'Evaluate genetics, monohybrid crosses, DNA structure, ecosystem dynamics, energy flow, human reproductive health, immunity, and infectious disease mechanisms.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any THREE (3) questions from this section.',
        structuralRules: 'Candidates choose 3 out of 5 structured questions (10 marks each, summing to 30 marks). Scaffolded items (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Practical and Experimental Biology',
        purpose: 'Assess biological experimental procedures, enzyme action under varying temperatures/pH, food tests (Benedict, Biuret, Iodine), photosynthesis experiments, and osmosis/plasmolysis investigations.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Evaluation'],
        instructions: 'Attempt the question in this section. (Compulsory practical and experimental biology analysis).',
        structuralRules: 'Compulsory 15-mark experimental biology item anchored to data tables, experimental setups, or graph analysis.'
      }
    ]
  },
  biology_alevel: {
    id: 'biology_alevel',
    subject: 'Biology',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Biology II (Theory Paper, Code 013 / BIO II) 2-section architecture for combinations (MCB, PCB, BCG). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Structured Questions',
        purpose: 'Assess comprehensive biochemistry (macromolecules, enzyme kinetics), cell ultrastructure, membrane transport, metabolic pathways (photosynthesis, cellular respiration), molecular genetics (DNA replication, transcription, translation), histology, and organ physiology.',
        totalMarks: 70,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'table', 'case_study'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Structured multi-part questions (typically 3 to 6 marks each, summing to 70 marks). Must include biological diagrams, pathway steps, and precise biochemical terminology.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Analytical and Essay Questions',
        purpose: 'Evaluate dihybrid inheritance, gene linkage, recombinant DNA technology, gene editing, endocrine control, nerve impulse conduction, population ecology, and evolutionary mechanisms.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any THREE (3) questions from this section.',
        structuralRules: 'Candidates choose 3 out of 5 questions (10 marks each, summing to 30 marks). Scaffolded structured problems (a, b, c) or extended analytical essays.'
      }
    ]
  },
  history_primary: {
    id: 'history_primary',
    subject: 'History and Citizenship',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Social and Religious Studies (SRS) standards with History and Civics focus (pre-colonial Rwanda, traditional kingdoms, national symbols, heritage, colonialism, liberation, heroes, and civic responsibilities). Single compulsory paper.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Rwandan History and Civic Heritage',
        purpose: 'Evaluate foundational understanding of ancient Rwandan kings, social organization, clans, cultural values (Ubworoherane, Ubupfura), national symbols (flag, coat of arms, anthem), and key historical milestones.',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section. Write your answers in the spaces provided.',
        structuralRules: 'Direct factual recall and brief application questions with concise response lines.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Applied Historical Analysis and Regional Events',
        purpose: 'Assess understanding of colonial impact, resistance, struggle for independence, Rwandan liberation, unity and reconciliation, and regional community history (EAC).',
        totalMarks: 40,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['short_answer', 'table', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Short structured scenario and table-based questions.'
      }
    ]
  },
  history_olevel: {
    id: 'history_olevel',
    subject: 'History and Citizenship',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level History and Citizenship (Subject Code 005 / HIS I & II) 2-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Structured Questions',
        purpose: 'Assess broad syllabus knowledge across History of Rwanda (pre-colonial expansion, monarchs, German and Belgian colonization, 1994 Genocide against the Tutsi, reconstruction), African History (kingdoms, slave trade, scramble and partition, nationalist movements), and World History (First and Second World Wars, League of Nations, UN).',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'table', 'matching'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise conceptual and analytical questions (typically 2 to 5 marks each, summing to 60 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Essay Questions',
        purpose: 'Evaluate sustained historical analysis, cause-and-effect reasoning, comparative governance, socio-economic transformations, and deep evaluation of historical events.',
        totalMarks: 40,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['essay', 'case_study'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any TWO (2) questions from this section. Answers must be written in essay form.',
        structuralRules: 'Candidates choose 2 out of 4 essay questions (20 marks each, summing to 40 marks). Requires introduction, coherent thematic paragraphs with historical evidence, and balanced conclusion.'
      }
    ]
  },
  history_alevel: {
    id: 'history_alevel',
    subject: 'History',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level History (Paper Code 014 / HIS 01: History of Africa, Rwanda, Europe & Rest of the World) 2-section architecture for combinations (HEG, HEL, HGL, MEG). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Structured Analytical Questions',
        purpose: 'Assess advanced historiography, critical source analysis, ideological conflicts, African resistance methodologies, colonial economic policies, the Rwandan liberation struggle, the 1994 Genocide against the Tutsi, European revolutions, and modern international diplomacy.',
        totalMarks: 50,
        numberOfQuestions: 10,
        allowedQuestionTypes: ['short', 'short_answer', 'case_study', 'table'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Rigorous analytical questions (typically 4 to 6 marks each, summing to 50 marks). Demands precise historical dates, treaties, actors, and causal mechanisms.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Extended Subject Essays',
        purpose: 'Evaluate high-level historical debate, synthesis of multiple historical perspectives, critical assessment of political movements, and sustained argumentative prose.',
        totalMarks: 50,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['essay'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt any TWO (2) questions from this section. Answers must be presented in comprehensive essay form.',
        structuralRules: 'Candidates choose 2 out of 4 extended essay questions (25 marks each, summing to 50 marks). Strict academic essay structure required.'
      }
    ]
  },
  computerscience_primary: {
    id: 'computerscience_primary',
    subject: 'ICT and Elementary Technology',
    level: 'Primary',
    totalMarks: 100,
    globalRules: 'Follow NESA Primary Leaving Examination (PLE) Science and Elementary Technology (SET) with ICT stream (computer components, input/output devices, mouse and keyboard operations, storage media, basic software, digital safety, and Scratch programming basics). Single compulsory paper.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory ICT Basics and Hardware Identification',
        purpose: 'Evaluate foundational identification of computer hardware (CPU, monitor, mouse, keyboard, printer), functions of peripheral devices, operating system icons, desktop navigation, and safe technology handling.',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'mcq', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section. Write your answers in the spaces provided.',
        structuralRules: 'Direct identification and matching questions with diagram placeholders and concise answer spaces.'
      },
      {
        id: 'sec_b',
        title: 'Section B: Applied Digital Literacy and Creative Programming',
        purpose: 'Assess word processing basics (typing, formatting, saving), safe internet browsing, email etiquette, and introductory visual block programming (Scratch sprites, motions, loops).',
        totalMarks: 40,
        numberOfQuestions: 5,
        allowedQuestionTypes: ['short_answer', 'table', 'fill_blank'],
        bloomsLevels: ['Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Short structured scenario and flowchart/step-ordering questions.'
      }
    ]
  },
  computerscience_olevel: {
    id: 'computerscience_olevel',
    subject: 'Information and Communication Technology',
    level: 'O-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA O-Level Information and Communication Technology (Subject Code 009 / ICT) 3-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Short and Objective Questions',
        purpose: 'Assess broad theoretical foundations: computer architecture, memory types (RAM/ROM/Cache), operating systems, network topologies, internet protocols, cybersecurity principles, word processing, spreadsheets, and database concepts.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'true_false', 'matching', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Concise conceptual and technical questions (typically 2 to 5 marks each, summing to 55 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Technical and Data Management Questions',
        purpose: 'Evaluate spreadsheet formulas/functions (IF, VLOOKUP, SUMIF), relational database design (tables, keys, queries), network configuration, algorithm tracing, and web authoring basics (HTML tags/CSS).',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any THREE (3) questions from this section.',
        structuralRules: 'Candidates choose 3 out of 5 structured questions (10 marks each, summing to 30 marks). Scaffolded items (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Applied Problem Solving and Algorithm Design',
        purpose: 'Assess computational problem decomposition, flowchart construction, pseudocode design, or real-world ICT system implementation scenario.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Evaluation'],
        instructions: 'Attempt the question in this section. (Compulsory practical and algorithmic problem-solving item).',
        structuralRules: 'Compulsory 15-mark structured problem-solving question anchored to an algorithm specification, data structure, or system case study.'
      }
    ]
  },
  computerscience_alevel: {
    id: 'computerscience_alevel',
    subject: 'Computer Science',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Computer Science (Code 019 / CS for MCE, MPG, PCB) and TSS Level 5 Software Development 3-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Computer Science Foundations',
        purpose: 'Assess digital logic gates, Boolean algebra, computer architecture (von Neumann, fetch-decode-execute), memory hierarchy, OS process scheduling, network OSI/TCP-IP models, OOP paradigms, database normalization (1NF, 2NF, 3NF), and computational complexity.',
        totalMarks: 55,
        numberOfQuestions: 14,
        allowedQuestionTypes: ['short', 'short_answer', 'table', 'case_study'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application', 'Analysis'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Technical and algorithmic short questions (typically 2 to 5 marks each, summing to 55 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Algorithms, Data Structures and Database Systems',
        purpose: 'Evaluate data structures (arrays, linked lists, stacks, queues, binary search trees), sorting/searching algorithms, SQL queries (JOINs, aggregation, constraints), system analysis methodologies (SDLC, UML), and network security.',
        totalMarks: 30,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['short_answer', 'table', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis'],
        instructions: 'Attempt any THREE (3) questions from this section.',
        structuralRules: 'Candidates choose 3 out of 5 structured questions (10 marks each, summing to 30 marks). Scaffolded items (a, b, c).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Advanced Software Engineering and Algorithm Design',
        purpose: 'Assess complex algorithm synthesis (C++, Java, or Python syntax / pseudocode), system architecture design, database entity-relationship schema implementation, or concurrent programming.',
        totalMarks: 15,
        numberOfQuestions: 1,
        allowedQuestionTypes: ['short_answer', 'essay', 'case_study'],
        bloomsLevels: ['Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Attempt ONE (1) question from this section.',
        structuralRules: 'Candidates choose 1 out of 2 in-depth computational problems (15 marks). Requires complete, syntactically coherent code or comprehensive architectural design.'
      }
    ]
  },
  subsidiary_ict_alevel: {
    id: 'subsidiary_ict_alevel',
    subject: 'Subsidiary ICT',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level Subsidiary ICT (Subject Code SUB 03) 2-section architecture. Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Compulsory Digital Literacy and Office Applications',
        purpose: 'Assess computer hardware, software categories, internet connectivity, spreadsheet functions, database management, digital presentations, cyber ethics, and e-government services in Rwanda (Irembo).',
        totalMarks: 60,
        numberOfQuestions: 15,
        allowedQuestionTypes: ['short', 'short_answer', 'table', 'fill_blank'],
        bloomsLevels: ['Knowledge', 'Comprehension', 'Application'],
        instructions: 'Attempt ALL questions in this section.',
        structuralRules: 'Applied conceptual and practical short questions (typically 3 to 5 marks each, summing to 60 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Structured Case Studies and Information Management',
        purpose: 'Evaluate data security measures, backup strategies, spreadsheet modeling for business decisions, social media ethics, and multimedia integration.',
        totalMarks: 40,
        numberOfQuestions: 2,
        allowedQuestionTypes: ['short_answer', 'case_study', 'table'],
        bloomsLevels: ['Application', 'Analysis', 'Evaluation'],
        instructions: 'Attempt any TWO (2) questions from this section.',
        structuralRules: 'Candidates choose 2 out of 4 structured case study questions (20 marks each, summing to 40 marks).'
      }
    ]
  },
  psychology_alevel: {
    id: 'psychology_alevel',
    subject: 'Psychology',
    level: 'A-Level',
    totalMarks: 100,
    globalRules: 'Follow verified NESA A-Level & TTC National Examination standards (Paper Code 040 / PSY - Foundations of Education and Educational Psychology for Teacher Training Colleges and General Education). Total: 100 marks. Duration: 3 hours.',
    sections: [
      {
        id: 'sec_a',
        title: 'Section A: Closed Questions',
        purpose: 'Evaluate broad factual recognition across developmental stages, learning theories (classical/operant conditioning, constructivism), cognitive processes (memory, attention, perception), motivation theories (Maslow, Herzberg), and psychological terminology.',
        totalMarks: 36,
        numberOfQuestions: 18,
        allowedQuestionTypes: ['mcq', 'true_false', 'matching'],
        bloomsLevels: ['Knowledge', 'Comprehension'],
        instructions: 'Answer ALL questions in this section. Choose the correct letter or indicate True/False as instructed (36 Marks).',
        structuralRules: 'Objective closed questions (1 to 2 marks each, summing to 36 marks).'
      },
      {
        id: 'sec_b',
        title: 'Section B: Short Answer Questions',
        purpose: 'Assess conceptual precision and differentiation of psychological mechanisms: Piagetian stages of cognitive development, Vygotsky’s Zone of Proximal Development (ZPD), Erikson’s psychosocial crises, Bloom’s domains, guidance and counseling techniques, and managing special educational needs (SEN).',
        totalMarks: 19,
        numberOfQuestions: 6,
        allowedQuestionTypes: ['short_answer', 'short'],
        bloomsLevels: ['Comprehension', 'Application', 'Analysis'],
        instructions: 'Answer ALL questions in this section. Provide concise definitions and conceptual explanations (19 Marks).',
        structuralRules: 'Concise conceptual questions (typically 3 to 4 marks each, summing to 19 marks).'
      },
      {
        id: 'sec_c',
        title: 'Section C: Elective Open-Ended and Pedagogical Case Studies',
        purpose: 'Evaluate classroom pedagogical applications, student behavioral interventions, designing learner-centered environments, assessing learning disabilities, motivating disengaged learners, and analyzing developmental case studies.',
        totalMarks: 45,
        numberOfQuestions: 3,
        allowedQuestionTypes: ['essay', 'case_study'],
        bloomsLevels: ['Application', 'Analysis', 'Synthesis', 'Evaluation'],
        instructions: 'Answer any THREE (3) questions in this section (45 Marks).',
        structuralRules: 'Candidates choose 3 out of 5 structured essay / case study questions (15 marks each, summing to 45 marks).'
      }
    ]
  }
};

export function getBlueprint(subject: string, level: string): NesaBlueprint | null {
  const normSubject = subject
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '_');
  const normLevel = level.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let key = `${normSubject}_${normLevel}`;
  if (nesaBlueprints[key]) return nesaBlueprints[key];

  // Specific alias mappings
  if (normSubject.includes('psycholog') || normSubject === 'psy') {
    if (nesaBlueprints[`psychology_${normLevel}`]) return nesaBlueprints[`psychology_${normLevel}`];
    return nesaBlueprints['psychology_alevel'];
  }
  if (normSubject.includes('history') || normSubject.includes('histoire') || normSubject === 'his') {
    key = `history_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('computer') || normSubject.includes('ict') || normSubject.includes('informatique') || normSubject === 'cs') {
    if (normSubject.includes('sub') || normSubject.includes('subsidiary')) {
      return nesaBlueprints['subsidiary_ict_alevel'];
    }
    key = `computerscience_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('geograph') || normSubject === 'geo') {
    key = `geography_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('biolog') || normSubject === 'bio') {
    key = `biology_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('physics') || normSubject.includes('physique') || normSubject === 'phy') {
    key = `physics_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('chemistry') || normSubject.includes('chimie') || normSubject === 'chem') {
    key = `chemistry_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('econom') || normSubject === 'eco') {
    key = `economics_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('kiswahili') || normSubject.includes('swahili') || normSubject === 'kis') {
    key = `kiswahili_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('entrepreneur')) {
    key = `entrepreneurship_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('general_studies') || normSubject.includes('general_paper') || normSubject.includes('communication_skills')) {
    key = `general_studies_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
    if (normLevel === 'alevel') return nesaBlueprints['general_studies_alevel'];
  }
  if (normSubject.includes('literature')) {
    key = `literature_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('math')) {
    key = `mathematics_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('english')) {
    key = `english_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('kinyarwanda') || normSubject.includes('ikinyarwanda') || normSubject === 'kin') {
    key = `kinyarwanda_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }
  if (normSubject.includes('french') || normSubject.includes('francais') || normSubject.includes('français') || normSubject === 'fre' || normSubject === 'fr') {
    key = `french_${normLevel}`;
    if (nesaBlueprints[key]) return nesaBlueprints[key];
  }

  return null;
}
