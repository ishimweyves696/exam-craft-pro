import { GeneratedExam } from '../types';

export const examTemplates: Record<string, GeneratedExam> = {
  'o-level-math': {
    header: {
      subjectName: 'Mathematics',
      subjectCode: 'MATH 101',
      examDate: 'YYYY-MM-DD',
      examTime: '3 Hours',
      academicYear: '2025-2026',
      level: 'O-Level (S3)',
      combinations: 'ALL',
      duration: '3 Hours',
      marks: 100,
      instructions: []
    },
    sections: [
      {
        title: 'SECTION A',
        instructions: 'Answer ALL questions in this section (55 marks)',
        marks: 55,
        questions: [
          {
            id: 'q1',
            number: 1,
            text: '',
            marks: 5,
            type: 'short',
            bloomLevel: 'Application',
            topic: 'Algebra'
          }
        ]
      },
      {
        title: 'SECTION B',
        instructions: 'Answer only THREE questions in this section (45 marks)',
        marks: 45,
        questions: [
          {
            id: 'q2',
            number: 16,
            text: '',
            marks: 15,
            type: 'short',
            bloomLevel: 'Analysis',
            topic: 'Geometry'
          }
        ]
      }
    ]
  },
  'a-level-biology': {
    header: {
      subjectName: 'Biology',
      subjectCode: 'BIO 201',
      examDate: 'YYYY-MM-DD',
      examTime: '3 Hours',
      academicYear: '2025-2026',
      level: 'A-Level (S6)',
      combinations: 'MCB, PCB, BCG',
      duration: '3 Hours',
      marks: 100,
      instructions: []
    },
    sections: [
      {
        title: 'SECTION A',
        instructions: 'Answer ALL questions in this section (70 marks)',
        marks: 70,
        questions: [
          {
            id: 'q1',
            number: 1,
            text: '',
            marks: 2,
            type: 'short',
            bloomLevel: 'Knowledge',
            topic: 'Cell Biology'
          }
        ]
      },
      {
        title: 'SECTION B',
        instructions: 'Answer only ONE question from this section (30 marks)',
        marks: 30,
        questions: [
          {
            id: 'q2',
            number: 15,
            text: '',
            marks: 30,
            type: 'essay',
            bloomLevel: 'Synthesis',
            topic: 'Genetics'
          }
        ]
      }
    ]
  },
  'o-level-english': {
    header: {
      subjectName: 'English',
      subjectCode: 'ENG 101',
      examDate: 'YYYY-MM-DD',
      examTime: '3 Hours',
      academicYear: '2025-2026',
      level: 'O-Level (S3)',
      combinations: 'ALL',
      duration: '3 Hours',
      marks: 100,
      instructions: []
    },
    sections: [
      {
        title: 'SECTION A: COMPREHENSION',
        instructions: 'Read the passage below and answer the questions that follow (30 marks)',
        marks: 30,
        questions: [
          {
            id: 'q1',
            number: 1,
            text: 'Read the passage...',
            marks: 5,
            type: 'short',
            bloomLevel: 'Comprehension',
            topic: 'Reading'
          }
        ]
      },
      {
        title: 'SECTION B: GRAMMAR AND PHONOLOGY',
        instructions: 'Answer all questions (40 marks)',
        marks: 40,
        questions: [
          {
            id: 'q2',
            number: 10,
            text: 'Choose the correct option',
            marks: 1,
            type: 'mcq',
            bloomLevel: 'Application',
            topic: 'Grammar',
            options: [
              { id: 'opt1', text: 'Option A' },
              { id: 'opt2', text: 'Option B' },
              { id: 'opt3', text: 'Option C' },
              { id: 'opt4', text: 'Option D' },
            ]
          }
        ]
      },
      {
        title: 'SECTION C: COMPOSITION',
        instructions: 'Choose one topic and write a composition of 250 words (30 marks)',
        marks: 30,
        questions: [
          {
            id: 'q3',
            number: 20,
            text: 'Write a composition about...',
            marks: 30,
            type: 'essay',
            bloomLevel: 'Synthesis',
            topic: 'Writing'
          }
        ]
      }
    ]
  }
};
