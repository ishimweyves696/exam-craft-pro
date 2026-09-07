export const SUBJECT_PRESETS = [
  {
    id: 'psychology-alevel',
    name: 'Psychology (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Psychology',
      subjectCode: '040',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'EKK, SME',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: Closed Questions',
          instructions: 'Answer ALL questions in this section (36 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 10,
          marks: 36,
          questionTypes: ['mcq', 'true_false', 'matching'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: Short Answer Questions',
          instructions: 'Answer ALL questions in this section (19 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 5,
          marks: 19,
          questionTypes: ['short_answer'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SECTION C: Elective Open-Ended Questions',
          instructions: 'Answer any THREE questions in this section (45 Marks).',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['essay', 'case_study'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },

  {
    id: 'math-olevel',
    name: 'Mathematics (O-Level)',
    category: 'Sciences',
    level: 'O-Level',
    config: {
      subjectName: 'Mathematics',
      subjectCode: '042',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 11,
          marks: 55,
          questionTypes: ['Short Answer', 'Calculation'],
          bloomsTaxonomy: ['Knowledge', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (45 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Calculation', 'Problem-Solving'],
          bloomsTaxonomy: ['Analysis', 'Synthesis']
        }
      ]
    }
  },
  {
    id: 'math-alevel',
    name: 'Mathematics (A-Level)',
    category: 'Sciences',
    level: 'A-Level',
    config: {
      subjectName: 'Mathematics',
      subjectCode: '015',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'PCM, MCB, MEG, MPC, MPG',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 15,
          marks: 55,
          questionTypes: ['Short Answer', 'Calculation'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (45 Marks).',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Calculation', 'Problem-Solving', 'Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'eng-alevel',
    name: 'Literature in English (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Literature in English',
      subjectCode: '028',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'HEL, LEG, HGL, LFK',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: PROSE AND POETRY',
          instructions: 'Answer TWO questions in this section.',
          attemptRule: { mode: 'choose', chooseCount: 2 },
          numberOfQuestions: 2,
          marks: 50,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Evaluation']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: PLAYS',
          instructions: 'Answer TWO questions in this section.',
          attemptRule: { mode: 'choose', chooseCount: 2 },
          numberOfQuestions: 2,
          marks: 50,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'eng-olevel',
    name: 'English (O-Level)',
    category: 'Languages',
    level: 'O-Level',
    config: {
      subjectName: 'English',
      subjectCode: '002',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: COMPREHENSION AND VOCABULARY',
          instructions: 'Read the passage and answer questions (30 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 10,
          marks: 30,
          questionTypes: ['Multiple Choice', 'Short Answer', 'Fill in the Blanks'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: GRAMMAR AND PHONOLOGY',
          instructions: 'Answer all questions (40 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 4,
          marks: 40,
          questionTypes: ['Multiple Choice', 'Fill in the Blanks', 'Matching Items'],
          bloomsTaxonomy: ['Knowledge', 'Application']
        },
        {
          id: 'sec-c',
          name: 'SECTION C: SUMMARY AND COMPOSITION',
          instructions: 'Answer all questions (30 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 2,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'bio-alevel',
    name: 'Biology (A-Level)',
    category: 'Sciences',
    level: 'A-Level',
    config: {
      subjectName: 'Biology',
      subjectCode: '034',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'MCB, PCB, BCG',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer all questions in this section (70 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 15,
          marks: 70,
          questionTypes: ['Multiple Choice', 'Short Answer'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions from this section (30 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 30,
          questionTypes: ['Structured', 'Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'geo-olevel',
    name: 'Geography (O-Level)',
    category: 'Humanities',
    level: 'O-Level',
    config: {
      subjectName: 'Geography',
      subjectCode: '043',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          numberOfQuestions: 12,
          marks: 55,
          questionTypes: ['Short Answer', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (45 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Extended Response (Essays)', 'Structured'],
          bloomsTaxonomy: ['Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'hist-primary',
    name: 'Social and Religious Studies / History (Primary)',
    category: 'Humanities',
    level: 'Primary',
    config: {
      subjectName: 'Social and Religious Studies (History and Civics)',
      subjectCode: 'SRS 01',
      level: 'PRIMARY LEAVING EXAMINATION (P.L.E)',
      duration: '2 HOURS',
      totalMarks: 100,
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (60 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 15,
          marks: 60,
          questionTypes: ['Multiple Choice', 'Short Answer', 'Fill in the Blanks', 'Matching'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer ALL questions in this section (40 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 4,
          marks: 40,
          questionTypes: ['Structured', 'Short Answer', 'Matching'],
          bloomsTaxonomy: ['Comprehension', 'Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'hist-olevel',
    name: 'History and Citizenship (O-Level)',
    category: 'Humanities',
    level: 'O-Level',
    config: {
      subjectName: 'History and Citizenship',
      subjectCode: '005',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: History of Rwanda and Africa',
          instructions: 'Answer ALL questions in this section (60 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 15,
          marks: 60,
          questionTypes: ['Short Answer', 'Structured'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: World History and Citizenship',
          instructions: 'Answer any TWO questions from this section (40 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 2 },
          numberOfQuestions: 2,
          marks: 40,
          questionTypes: ['Extended Response (Essays)', 'Structured'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'hist-alevel',
    name: 'History (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'History',
      subjectCode: '014',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'HEG, HEL, HGL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: History of Rwanda and Africa',
          instructions: 'Answer ALL questions in this section (50 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 10,
          marks: 50,
          questionTypes: ['Short Answer', 'Structured'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Analysis']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: World History',
          instructions: 'Answer any TWO questions from this section (50 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 2 },
          numberOfQuestions: 2,
          marks: 50,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'entre-olevel',
    name: 'Entrepreneurship (O-Level)',
    category: 'Professional',
    level: 'O-Level',
    config: {
      subjectName: 'Entrepreneurship',
      subjectCode: '045',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 11,
          marks: 55,
          questionTypes: ['Short Answer'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (45 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Structured', 'Problem-Solving'],
          bloomsTaxonomy: ['Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'eng-alevel-2',
    name: 'English II (A-Level)',
    category: 'Languages',
    level: 'A-Level',
    config: {
      subjectName: 'English II',
      subjectCode: 'ENG 04',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'Section A: Comprehension and vocabulary',
          instructions: 'Read the passage below carefully and then answer the questions that follow.',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 4,
          marks: 30,
          questionTypes: ['Multiple Choice', 'Fill in the Blanks', 'Matching Items'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'Section B: Language structure',
          instructions: 'Answer all questions in this section.',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 7,
          marks: 40,
          questionTypes: ['Multiple Choice', 'Fill in the Blanks', 'Matching Items', 'Short Answer'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'Section C: Summary writing',
          instructions: 'Read the following text and summarize it as instructed.',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 1,
          marks: 10,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        },
        {
          id: 'sec-d',
          name: 'Section D: Composition',
          instructions: 'Write an essay on the given topic as instructed.',
          attemptRule: { mode: 'choose', chooseCount: 1 },
          numberOfQuestions: 1,
          marks: 20,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'chem-alevel',
    name: 'Chemistry (A-Level)',
    category: 'Sciences',
    level: 'A-Level',
    config: {
      subjectName: 'Chemistry',
      subjectCode: '033',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'PCB, MCB, BCG',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (70 Marks)',
          numberOfQuestions: 15,
          marks: 70,
          questionTypes: ['Short Answer', 'Calculation'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions from this section (30 Marks)',
          numberOfQuestions: 3,
          marks: 30,
          questionTypes: ['Calculation', 'Problem-Solving', 'Structured'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'phy-alevel',
    name: 'Physics (A-Level)',
    category: 'Sciences',
    level: 'A-Level',
    config: {
      subjectName: 'Physics',
      subjectCode: '032',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'PCM, PCB, MPG',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          numberOfQuestions: 14,
          marks: 55,
          questionTypes: ['Short Answer', 'Calculation'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions from this section (45 Marks)',
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Calculation', 'Problem-Solving'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'kiny-olevel',
    name: 'Kinyarwanda (O-Level)',
    category: 'Languages',
    level: 'O-Level',
    config: {
      subjectName: 'Kinyarwanda',
      subjectCode: '001',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'IGICE CYA MBERE: KUMVA NO GUSESENGURA UMWANDIKO',
          instructions: 'Soma umwandiko ukurikira wibande ku bisubizo nyabyo (Amanota 30).',
          numberOfQuestions: 10,
          marks: 30,
          questionTypes: ['Short Answer', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'IGICE CYA KABIRI: IYIGAMIYOBORERE N\'IKIBONEZAMVUGO',
          instructions: 'Subiza ibibazo byose (Amanota 40).',
          numberOfQuestions: 5,
          marks: 40,
          questionTypes: ['Short Answer', 'Fill in the Blanks', 'Matching Items'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'IGICE CYA GATATU: IHANGAMWANDIKO',
          instructions: 'Hitamo insanganyamatsiko imwe wandike umwandiko (Amanota 30).',
          numberOfQuestions: 1,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'ict-primary',
    name: 'SET / ICT (Primary)',
    category: 'Technology',
    level: 'Primary',
    config: {
      subjectName: 'Science and Elementary Technology (ICT)',
      subjectCode: 'SET 01',
      level: 'PRIMARY LEAVING EXAMINATION (P.L.E)',
      duration: '2 HOURS',
      totalMarks: 100,
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (60 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 15,
          marks: 60,
          questionTypes: ['Multiple Choice', 'Short Answer', 'Fill in the Blanks', 'Matching'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer ALL questions in this section (40 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 4,
          marks: 40,
          questionTypes: ['Structured', 'Short Answer'],
          bloomsTaxonomy: ['Comprehension', 'Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'ict-olevel',
    name: 'ICT (O-Level)',
    category: 'Technology',
    level: 'O-Level',
    config: {
      subjectName: 'Information and Communication Technology',
      subjectCode: '009',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: Basic ICT Concepts and Skills',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 14,
          marks: 55,
          questionTypes: ['Short Answer', 'Multiple Choice', 'Fill in the Blanks'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: Structured Applications and Problem-Solving',
          instructions: 'Answer any THREE questions from this section (30 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 30,
          questionTypes: ['Structured', 'Problem-Solving'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SECTION C: Practical Algorithm and Data Representation',
          instructions: 'Answer the question in this section (15 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 1,
          marks: 15,
          questionTypes: ['Structured', 'Problem-Solving'],
          bloomsTaxonomy: ['Analysis', 'Synthesis']
        }
      ]
    }
  },
  {
    id: 'phy-olevel',
    name: 'Physics (O-Level)',
    category: 'Sciences',
    level: 'O-Level',
    config: {
      subjectName: 'Physics',
      subjectCode: '044',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          numberOfQuestions: 14,
          marks: 55,
          questionTypes: ['Short Answer', 'Calculation'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (45 Marks)',
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Calculation', 'Problem-Solving', 'Structured'],
          bloomsTaxonomy: ['Analysis', 'Synthesis']
        }
      ]
    }
  },
  {
    id: 'chem-olevel',
    name: 'Chemistry (O-Level)',
    category: 'Sciences',
    level: 'O-Level',
    config: {
      subjectName: 'Chemistry',
      subjectCode: '043',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          numberOfQuestions: 15,
          marks: 55,
          questionTypes: ['Short Answer', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (45 Marks)',
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Calculation', 'Structured'],
          bloomsTaxonomy: ['Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'compsci-alevel',
    name: 'Computer Science (A-Level)',
    category: 'Technology',
    level: 'A-Level',
    config: {
      subjectName: 'Computer Science',
      subjectCode: '019',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'MCE, MPG, PCB',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: Computer Systems, Architecture and Programming Basics',
          instructions: 'Answer ALL questions in this section (55 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 14,
          marks: 55,
          questionTypes: ['Short Answer', 'Multiple Choice', 'Structured'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: Algorithms, Data Structures and Database Systems',
          instructions: 'Answer any THREE questions from this section (30 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 30,
          questionTypes: ['Problem-Solving', 'Structured'],
          bloomsTaxonomy: ['Application', 'Analysis', 'Synthesis']
        },
        {
          id: 'sec-c',
          name: 'SECTION C: Software Engineering and Applied System Design',
          instructions: 'Answer any ONE question from this section (15 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 1 },
          numberOfQuestions: 1,
          marks: 15,
          questionTypes: ['Problem-Solving', 'Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'subict-alevel',
    name: 'Subsidiary ICT (A-Level)',
    category: 'Technology',
    level: 'A-Level',
    config: {
      subjectName: 'Subsidiary ICT',
      subjectCode: 'SUB 03',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL A-LEVEL COMBINATIONS',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: Basic ICT and Productivity Tools',
          instructions: 'Answer ALL questions in this section (60 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 15,
          marks: 60,
          questionTypes: ['Short Answer', 'Multiple Choice', 'Fill in the Blanks', 'Matching'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: Structured ICT Applications and Problem Solving',
          instructions: 'Answer any TWO questions from this section (40 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 2 },
          numberOfQuestions: 2,
          marks: 40,
          questionTypes: ['Structured', 'Problem-Solving'],
          bloomsTaxonomy: ['Application', 'Analysis', 'Synthesis']
        }
      ]
    }
  },
  {
    id: 'psychology-alevel',
    name: 'Psychology (A-Level / TTC)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Psychology',
      subjectCode: '040',
      level: 'ADVANCED LEVEL / TEACHER TRAINING COLLEGES (TTC)',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'TTC / HUMANITIES',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: Fundamental Concepts of Psychology',
          instructions: 'Answer ALL questions in this section (36 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 12,
          marks: 36,
          questionTypes: ['Multiple Choice', 'True/False', 'Fill in the Blanks', 'Matching', 'Short Answer'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: Psychological Theories and Processes',
          instructions: 'Answer ALL questions in this section (19 Marks)',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 4,
          marks: 19,
          questionTypes: ['Short Answer', 'Structured'],
          bloomsTaxonomy: ['Comprehension', 'Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SECTION C: Applied Educational and Developmental Psychology',
          instructions: 'Answer any THREE questions from this section (45 Marks)',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Extended Response (Essays)', 'Structured', 'Case Study'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'econ-alevel',
    name: 'Economics (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Economics',
      subjectCode: '013',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'HEG, MEG, MCE',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (40 Marks)',
          numberOfQuestions: 10,
          marks: 40,
          questionTypes: ['Short Answer', 'Calculation'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE questions in this section (60 Marks)',
          numberOfQuestions: 3,
          marks: 60,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'french-olevel',
    name: 'French (O-Level)',
    category: 'Languages',
    level: 'O-Level',
    config: {
      subjectName: 'French',
      subjectCode: '003',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: COMPRÉHENSION',
          instructions: 'Lisez le texte et répondez aux questions (30 Marks)',
          numberOfQuestions: 8,
          marks: 30,
          questionTypes: ['Short Answer', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: GRAMMAIRE ET VOCABULAIRE',
          instructions: 'Répondez à toutes les questions (40 Marks)',
          numberOfQuestions: 5,
          marks: 40,
          questionTypes: ['Fill in the Blanks', 'Matching Items', 'Multiple Choice'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SECTION C: PRODUCTION ÉCRITE',
          instructions: 'Traitez un sujet au choix (30 Marks)',
          numberOfQuestions: 1,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'french-alevel-2',
    name: 'French II (A-Level)',
    category: 'Languages',
    level: 'A-Level',
    config: {
      subjectName: 'French II',
      subjectCode: '020',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'LFK',
      sections: [
        {
          id: 'sec-a',
          name: 'Compréhension du texte',
          marks: 25,
          numberOfQuestions: 7,
          questionTypes: ['Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension'],
          instructions: 'Choisis la réponse correcte parmi celles qui sont proposées sous chaque question.'
        },
        {
          id: 'sec-b',
          name: 'Connaissance de la langue française',
          marks: 45,
          numberOfQuestions: 13,
          questionTypes: ['Multiple Choice', 'Fill in the Blanks', 'Matching Items', 'Sequencing / Ordering', 'True / False'],
          bloomsTaxonomy: ['Application', 'Analysis'],
          instructions: 'Complète, transforme ou associe selon la consigne de chaque question.'
        },
        {
          id: 'sec-c',
          name: 'Littérature',
          marks: 15,
          numberOfQuestions: 4,
          questionTypes: ['Multiple Choice', 'True / False'],
          bloomsTaxonomy: ['Analysis', 'Synthesis'],
          instructions: 'Réponds selon la consigne de chaque question.'
        },
        {
          id: 'sec-d',
          name: 'Expression écrite',
          marks: 15,
          numberOfQuestions: 1,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation'],
          instructions: 'Deux sujets sont proposés ; le candidat en choisit un et le développe en 250 à 280 mots. (Represented as one question offering two topics — real either/or choice enforcement is a separate future stage, not built here.)'
        }
      ]
    }
  },
  {
    id: 'eng-language-alevel',
    name: 'English Language (A-Level)',
    category: 'Languages',
    level: 'A-Level',
    config: {
      subjectName: 'English Language',
      subjectCode: 'ENG-A',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'Comprehension and Summary',
          marks: 30,
          numberOfQuestions: 10,
          questionTypes: ['Multiple Choice', 'True / False', 'Short Answer', 'Summary'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension'],
          instructions: 'Answer ALL questions based on the passage provided.'
        },
        {
          id: 'sec-b',
          name: 'Language in Use',
          marks: 60,
          numberOfQuestions: 4,
          questionTypes: ['Sentence Transformation', 'Multiple Choice', 'Matching Items', 'Fill in the Blanks'],
          bloomsTaxonomy: ['Application', 'Analysis'],
          instructions: 'Answer ALL questions. Pay strict attention to grammar, syntax, and sentence structure.'
        },
        {
          id: 'sec-c',
          name: 'Composition',
          marks: 10,
          numberOfQuestions: 1,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation'],
          instructions: 'Choose ONE of two topics provided and write 300-400 words.'
        }
      ]
    }
  },
  {
    id: 'bio-olevel',
    name: 'Biology (O-Level)',
    category: 'Sciences',
    level: 'O-Level',
    config: {
      subjectName: 'Biology',
      subjectCode: '034',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks).',
          numberOfQuestions: 11,
          marks: 55,
          questionTypes: ['Multiple Choice', 'Short Answer', 'Fill in the Blanks'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer THREE questions in this section (45 Marks).',
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Short Answer', 'Problem-Solving', 'Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'geo-alevel',
    name: 'Geography (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Geography',
      subjectCode: '016',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'HEG, MEG, HGL, MPG, BCG, LEG',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks).',
          numberOfQuestions: 11,
          marks: 55,
          questionTypes: ['mcq', 'short_answer'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer any TWO questions in this section (30 Marks).',
          numberOfQuestions: 2,
          marks: 30,
          questionTypes: ['essay', 'case_study'],
          bloomsTaxonomy: ['Analysis', 'Synthesis']
        },
        {
          id: 'sec-c',
          name: 'SECTION C',
          instructions: 'Answer ALL questions in this section (15 Marks).',
          numberOfQuestions: 1,
          marks: 15,
          questionTypes: ['short_answer', 'essay'],
          bloomsTaxonomy: ['Application', 'Analysis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'hist-olevel',
    name: 'History and Citizenship (O-Level)',
    category: 'Humanities',
    level: 'O-Level',
    config: {
      subjectName: 'History and Citizenship',
      subjectCode: '012',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: History of Rwanda and Africa',
          instructions: 'Answer ALL questions in this section (50 Marks).',
          numberOfQuestions: 5,
          marks: 50,
          questionTypes: ['Short Answer', 'Fill in the Blanks', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: World History and Citizenship',
          instructions: 'Answer ALL questions in this section (50 Marks).',
          numberOfQuestions: 5,
          marks: 50,
          questionTypes: ['Short Answer', 'Extended Response (Essays)'],
          bloomsTaxonomy: ['Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'entre-alevel',
    name: 'Entrepreneurship (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Entrepreneurship',
      subjectCode: '025',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks).',
          numberOfQuestions: 11,
          marks: 55,
          questionTypes: ['Short Answer', 'Multiple Choice', 'Case Study'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer THREE questions in this section (45 Marks).',
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Case Study', 'Extended Response (Essays)', 'Calculation'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'kiny-alevel',
    name: 'Kinyarwanda (A-Level)',
    category: 'Languages',
    level: 'A-Level',
    config: {
      subjectName: 'Kinyarwanda',
      subjectCode: '002',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'HGK, HKL, LFK, LKL, EFK',
      sections: [
        {
          id: 'sec-a',
          name: 'IGICE CYA MBERE: KUMVA NO GUSESENGURA UMWANDIKO',
          instructions: 'Subiza ibibazo byose bishingiye ku mwandiko (30 Marks).',
          numberOfQuestions: 5,
          marks: 30,
          questionTypes: ['Short Answer', 'Multiple Choice', 'Summary'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'IGICE CYA KABIRI: IYIGAMIYOBORERE N\'IKIBONEZAMVUGO',
          instructions: 'Subiza ibibazo byose byo mu nshiamvugo no mu kibonezamvugo (40 Marks).',
          numberOfQuestions: 10,
          marks: 40,
          questionTypes: ['Fill in the Blanks', 'Sentence Transformation', 'Matching Items'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'IGICE CYA GATATU: IHANGAMWANDIKO NO SUBIRAMO',
          instructions: 'Hitamo insanganyamatsiko imwe muri ebyiri wahawemo wandike umwandiko (30 Marks).',
          numberOfQuestions: 1,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'kisw-olevel',
    name: 'Kiswahili (O-Level)',
    category: 'Languages',
    level: 'O-Level',
    config: {
      subjectName: 'Kiswahili',
      subjectCode: '004',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SEHEMU YA KWANZA: UFAHAMU NA BOKULARI',
          instructions: 'Jibu maswali yote kulingana na kifungu cha habari (30 Marks).',
          numberOfQuestions: 5,
          marks: 30,
          questionTypes: ['Multiple Choice', 'Short Answer'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SEHEMU YA PILI: SARUFI NA MATUMIZI YA LUGHA',
          instructions: 'Jibu maswali yote ya sarufi na matumizi ya lugha (40 Marks).',
          numberOfQuestions: 10,
          marks: 40,
          questionTypes: ['Fill in the Blanks', 'Sentence Transformation', 'Matching Items'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SEHEMU YA TATU: INSHA NA UTUNZI',
          instructions: 'Chagua mada moja na uandike insha (30 Marks).',
          numberOfQuestions: 1,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'kisw-alevel',
    name: 'Kiswahili (A-Level)',
    category: 'Languages',
    level: 'A-Level',
    config: {
      subjectName: 'Kiswahili',
      subjectCode: '005',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'LKL, LKF',
      sections: [
        {
          id: 'sec-a',
          name: 'SEHEMU YA KWANZA: UFAHAMU NA FASIHI',
          instructions: 'Jibu maswali yote kulingana na shairi au kifungu cha habari (30 Marks).',
          numberOfQuestions: 5,
          marks: 30,
          questionTypes: ['Short Answer', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SEHEMU YA PILI: SARUFI NA UCHAMBUZI WA LUGHA',
          instructions: 'Jibu maswali yote ya sarufi na uchambuzi wa fasihi (40 Marks).',
          numberOfQuestions: 10,
          marks: 40,
          questionTypes: ['Fill in the Blanks', 'Sentence Transformation'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SEHEMU YA TATU: UTUNZI WA INSHA',
          instructions: 'Chagua mada moja kati ya zilizotolewa uandike insha ndefu (30 Marks).',
          numberOfQuestions: 1,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'gp-alevel',
    name: 'General Paper (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'General Paper',
      subjectCode: 'GP 01',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A: Essay Writing',
          instructions: 'Answer ONE essay question from the choices provided (50 Marks).',
          numberOfQuestions: 1,
          marks: 50,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        },
        {
          id: 'sec-b',
          name: 'SECTION B: Comprehension and Critical Analysis',
          instructions: 'Answer ALL questions based on the provided passage or dataset (50 Marks).',
          numberOfQuestions: 5,
          marks: 50,
          questionTypes: ['Short Answer', 'Summary', 'Case Study'],
          bloomsTaxonomy: ['Comprehension', 'Analysis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'submath-alevel',
    name: 'Subsidiary Mathematics (A-Level)',
    category: 'Sciences',
    level: 'A-Level',
    config: {
      subjectName: 'Subsidiary Mathematics',
      subjectCode: 'SUB 02',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'PCB, HEG, HEL, HGL, LFK, HGK, HKL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (60 Marks).',
          numberOfQuestions: 12,
          marks: 60,
          questionTypes: ['Calculation', 'Short Answer'],
          bloomsTaxonomy: ['Knowledge', 'Application']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer FOUR questions in this section (40 Marks).',
          numberOfQuestions: 4,
          marks: 40,
          questionTypes: ['Calculation', 'Problem-Solving'],
          bloomsTaxonomy: ['Analysis', 'Synthesis']
        }
      ]
    }
  },
  {
    id: 'rel-olevel',
    name: 'Religious Education (O-Level)',
    category: 'Humanities',
    level: 'O-Level',
    config: {
      subjectName: 'Religious Education',
      subjectCode: '005',
      level: 'ORDINARY LEVEL',
      duration: '2 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (50 Marks).',
          numberOfQuestions: 10,
          marks: 50,
          questionTypes: ['Multiple Choice', 'Short Answer'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer ALL questions in this section (50 Marks).',
          numberOfQuestions: 5,
          marks: 50,
          questionTypes: ['Extended Response (Essays)', 'Short Answer'],
          bloomsTaxonomy: ['Application', 'Analysis']
        }
      ]
    }
  },
  {
    id: 'eco-alevel',
    name: 'Economics (A-Level)',
    category: 'Humanities',
    level: 'A-Level',
    config: {
      subjectName: 'Economics',
      subjectCode: '017',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'HEG, MEG, LEG, MCE, HEL, PEM',
      sections: [
        {
          id: 'sec-a',
          name: 'SECTION A',
          instructions: 'Answer ALL questions in this section (55 Marks).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 14,
          marks: 55,
          questionTypes: ['Short Answer', 'Calculation', 'Multiple Choice'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Application', 'Analysis']
        },
        {
          id: 'sec-b',
          name: 'SECTION B',
          instructions: 'Answer only THREE (3) questions from this section (45 Marks).',
          attemptRule: { mode: 'choose', chooseCount: 3 },
          numberOfQuestions: 3,
          marks: 45,
          questionTypes: ['Extended Response (Essays)', 'Case Study'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'kisw-primary',
    name: 'Kiswahili (Primary / PLE)',
    category: 'Languages',
    level: 'Primary',
    config: {
      subjectName: 'Kiswahili',
      subjectCode: 'KIS',
      level: 'PRIMARY LEAVING EXAMINATION',
      duration: '2 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SEHEMU YA A: UFAHAMU WA KUSOMA',
          instructions: 'Soma kifungu cha habari kisha ujibu maswali yote (Amanota 30).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 6,
          marks: 30,
          questionTypes: ['Multiple Choice', 'Short Answer', 'True/False'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension']
        },
        {
          id: 'sec-b',
          name: 'SEHEMU YA B: SARUFI NA MATUMIZI YA LUGHA',
          instructions: 'Jibu maswali yote ya sarufi (Amanota 40).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 8,
          marks: 40,
          questionTypes: ['Sentence Transformation', 'Fill in the Blanks', 'Matching Items'],
          bloomsTaxonomy: ['Knowledge', 'Application']
        },
        {
          id: 'sec-c',
          name: 'SEHEMU YA C: UTUNGAJI / INSHA',
          instructions: 'Chagua mada moja uandike insha fupi (Amanota 30).',
          attemptRule: { mode: 'choose', chooseCount: 1 },
          numberOfQuestions: 1,
          marks: 30,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis']
        }
      ]
    }
  },
  {
    id: 'kisw-olevel',
    name: 'Kiswahili (O-Level)',
    category: 'Languages',
    level: 'O-Level',
    config: {
      subjectName: 'Kiswahili',
      subjectCode: '005',
      level: 'ORDINARY LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'ALL',
      sections: [
        {
          id: 'sec-a',
          name: 'SEHEMU YA KWANZA: UFAHAMU',
          instructions: 'Soma kifungu cha habari kisha ujibu maswali yote (Amanota 25).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 6,
          marks: 25,
          questionTypes: ['Multiple Choice', 'Short Answer', 'True/False'],
          bloomsTaxonomy: ['Knowledge', 'Comprehension', 'Analysis']
        },
        {
          id: 'sec-b',
          name: 'SEHEMU YA PILI: SARUFI NA MATUMIZI YA LUGHA',
          instructions: 'Jibu maswali yote ya sarufi na matumizi ya lugha (Amanota 30).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 8,
          marks: 30,
          questionTypes: ['Sentence Transformation', 'Fill in the Blanks', 'Matching Items'],
          bloomsTaxonomy: ['Application', 'Analysis']
        },
        {
          id: 'sec-c',
          name: 'SEHEMU YA TATU: UTUNGAJI (INSHA)',
          instructions: 'Chagua mada moja uandike insha (Amanota 45).',
          attemptRule: { mode: 'choose', chooseCount: 1 },
          numberOfQuestions: 1,
          marks: 45,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  },
  {
    id: 'kisw-alevel',
    name: 'Kiswahili (A-Level)',
    category: 'Languages',
    level: 'A-Level',
    config: {
      subjectName: 'Kiswahili',
      subjectCode: '027',
      level: 'ADVANCED LEVEL',
      duration: '3 HOURS',
      totalMarks: 100,
      combinations: 'LFK, LKF, TTC',
      sections: [
        {
          id: 'sec-a',
          name: 'SEHEMU YA KWANZA: UFAHAMU NA UFUPISHO',
          instructions: 'Soma kifungu cha habari kisha ujibu maswali yote (Amanota 25).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 6,
          marks: 25,
          questionTypes: ['Short Answer', 'Multiple Choice', 'Summary'],
          bloomsTaxonomy: ['Comprehension', 'Analysis', 'Synthesis']
        },
        {
          id: 'sec-b',
          name: 'SEHEMU YA PILI: SARUFI NA MATUMIZI YA LUGHA',
          instructions: 'Jibu maswali yote ya sarufi na matumizi ya lugha (Amanota 35).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 9,
          marks: 35,
          questionTypes: ['Sentence Transformation', 'Short Answer', 'Fill in the Blanks'],
          bloomsTaxonomy: ['Application', 'Analysis', 'Synthesis']
        },
        {
          id: 'sec-c',
          name: 'SEHEMU YA TATU: FASIHI YA KISWAHILI',
          instructions: 'Jibu maswali ya fasihi simulizi na fasihi andishi (Amanota 20).',
          attemptRule: { mode: 'all' },
          numberOfQuestions: 4,
          marks: 20,
          questionTypes: ['Short Answer', 'Extended Response (Essays)'],
          bloomsTaxonomy: ['Analysis', 'Synthesis', 'Evaluation']
        },
        {
          id: 'sec-d',
          name: 'SEHEMU YA NNE: UTUNGAJI (INSHA)',
          instructions: 'Chagua mada moja uandike insha (Amanota 20).',
          attemptRule: { mode: 'choose', chooseCount: 1 },
          numberOfQuestions: 1,
          marks: 20,
          questionTypes: ['Extended Response (Essays)'],
          bloomsTaxonomy: ['Synthesis', 'Evaluation']
        }
      ]
    }
  }
];
