import { Classroom, SeniorClassInfo } from '../types';

export const SENIOR_CLASSES: SeniorClassInfo[] = [
  // O-Level Classes
  {
    id: 'grd-s1',
    code: 'S1',
    name: 'Senior 1',
    levelId: 'lvl-olevel',
    levelCode: 'ORDINARY LEVEL',
    isTerminalClass: false
  },
  {
    id: 'grd-s2',
    code: 'S2',
    name: 'Senior 2',
    levelId: 'lvl-olevel',
    levelCode: 'ORDINARY LEVEL',
    isTerminalClass: false
  },
  {
    id: 'grd-s3',
    code: 'S3',
    name: 'Senior 3',
    levelId: 'lvl-olevel',
    levelCode: 'ORDINARY LEVEL',
    isTerminalClass: true
  },
  // A-Level Classes
  {
    id: 'grd-s4',
    code: 'S4',
    name: 'Senior 4',
    levelId: 'lvl-alevel',
    levelCode: 'ADVANCED LEVEL',
    isTerminalClass: false
  },
  {
    id: 'grd-s5',
    code: 'S5',
    name: 'Senior 5',
    levelId: 'lvl-alevel',
    levelCode: 'ADVANCED LEVEL',
    isTerminalClass: false
  },
  {
    id: 'grd-s6',
    code: 'S6',
    name: 'Senior 6',
    levelId: 'lvl-alevel',
    levelCode: 'ADVANCED LEVEL',
    isTerminalClass: true
  }
];

export const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'cls_s6_bio',
    name: 'Senior 6 Biology',
    levelId: 'lvl-alevel',
    levelCode: 'ADVANCED LEVEL',
    levelName: 'Upper Secondary (A-Level)',
    classId: 'grd-s6',
    classCode: 'S6',
    className: 'Senior 6',
    subjectName: 'Biology',
    subjectCode: 'BIO201',
    combinations: 'MCB, PCB, BCG',
    academicYear: '2024-2025',
    term: 'Term 1',
    curriculumContext: 'Molecular Genetics, Ecology, Human Physiology & Biotechnology.',
    coverageConfig: {
      mode: 'cumulative_70_30',
      currentClassPct: 70,
      previousClassesPct: 30,
      breakdown: [
        { classId: 'grd-s6', className: 'Senior 6', pct: 70 },
        { classId: 'grd-s5', className: 'Senior 5', pct: 15 },
        { classId: 'grd-s4', className: 'Senior 4', pct: 15 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls_s6_math',
    name: 'Senior 6 Mathematics',
    levelId: 'lvl-alevel',
    levelCode: 'ADVANCED LEVEL',
    levelName: 'Upper Secondary (A-Level)',
    classId: 'grd-s6',
    classCode: 'S6',
    className: 'Senior 6',
    subjectName: 'Mathematics',
    subjectCode: 'MAT201',
    combinations: 'PCM, MCG, MPC',
    academicYear: '2024-2025',
    term: 'Term 1',
    curriculumContext: 'Differential Equations, Complex Numbers, Probability & Calculus.',
    coverageConfig: {
      mode: 'cumulative_70_30',
      currentClassPct: 70,
      previousClassesPct: 30,
      breakdown: [
        { classId: 'grd-s6', className: 'Senior 6', pct: 70 },
        { classId: 'grd-s5', className: 'Senior 5', pct: 15 },
        { classId: 'grd-s4', className: 'Senior 4', pct: 15 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls_s3_eng',
    name: 'Senior 3 English Language',
    levelId: 'lvl-olevel',
    levelCode: 'ORDINARY LEVEL',
    levelName: 'Lower Secondary (O-Level)',
    classId: 'grd-s3',
    classCode: 'S3',
    className: 'Senior 3',
    subjectName: 'English Language',
    subjectCode: 'ENG101',
    academicYear: '2024-2025',
    term: 'Term 1',
    curriculumContext: 'Reading Comprehension, Essay Composition, Grammar & Literature in English.',
    coverageConfig: {
      mode: 'cumulative_70_30',
      currentClassPct: 70,
      previousClassesPct: 30,
      breakdown: [
        { classId: 'grd-s3', className: 'Senior 3', pct: 70 },
        { classId: 'grd-s2', className: 'Senior 2', pct: 15 },
        { classId: 'grd-s1', className: 'Senior 1', pct: 15 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls_s3_phy',
    name: 'Senior 3 Physics',
    levelId: 'lvl-olevel',
    levelCode: 'ORDINARY LEVEL',
    levelName: 'Lower Secondary (O-Level)',
    classId: 'grd-s3',
    classCode: 'S3',
    className: 'Senior 3',
    subjectName: 'Physics',
    subjectCode: 'PHY101',
    academicYear: '2024-2025',
    term: 'Term 1',
    curriculumContext: 'Mechanics, Heat, Light, Wave Motion & Electricity.',
    coverageConfig: {
      mode: 'cumulative_70_30',
      currentClassPct: 70,
      previousClassesPct: 30,
      breakdown: [
        { classId: 'grd-s3', className: 'Senior 3', pct: 70 },
        { classId: 'grd-s2', className: 'Senior 2', pct: 15 },
        { classId: 'grd-s1', className: 'Senior 1', pct: 15 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls_s5_chm',
    name: 'Senior 5 Chemistry',
    levelId: 'lvl-alevel',
    levelCode: 'ADVANCED LEVEL',
    levelName: 'Upper Secondary (A-Level)',
    classId: 'grd-s5',
    classCode: 'S5',
    className: 'Senior 5',
    subjectName: 'Chemistry',
    subjectCode: 'CHM201',
    combinations: 'PCB, MCB, PCM',
    academicYear: '2024-2025',
    term: 'Term 1',
    curriculumContext: 'Organic Chemistry, Chemical Kinetics, Energetics & Electrochemistry.',
    coverageConfig: {
      mode: 'single',
      currentClassPct: 100,
      previousClassesPct: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls_s1_his',
    name: 'Senior 1 History & Citizenship',
    levelId: 'lvl-olevel',
    levelCode: 'ORDINARY LEVEL',
    levelName: 'Lower Secondary (O-Level)',
    classId: 'grd-s1',
    classCode: 'S1',
    className: 'Senior 1',
    subjectName: 'History and Citizenship',
    subjectCode: 'HIS101',
    academicYear: '2024-2025',
    term: 'Term 1',
    curriculumContext: 'Pre-colonial Rwanda, Governance, Civic Responsibility & Human Rights.',
    coverageConfig: {
      mode: 'single',
      currentClassPct: 100,
      previousClassesPct: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const STORAGE_KEY_CLASSROOMS = 'nesa_exam_builder_classrooms_v1';
const STORAGE_KEY_ACTIVE = 'nesa_exam_builder_active_classroom_v1';

export function loadClassrooms(): Classroom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSROOMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(DEFAULT_CLASSROOMS));
      return DEFAULT_CLASSROOMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CLASSROOMS;
  } catch (err) {
    console.error('Failed to load classrooms from localStorage:', err);
    return DEFAULT_CLASSROOMS;
  }
}

export function saveClassrooms(classrooms: Classroom[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(classrooms));
  } catch (err) {
    console.error('Failed to save classrooms to localStorage:', err);
  }
}

export function loadActiveClassroom(): Classroom | null {
  try {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    const classrooms = loadClassrooms();
    if (activeId) {
      const found = classrooms.find(c => c.id === activeId);
      if (found) return found;
    }
    // Default to first classroom if none actively set
    return classrooms[0] || null;
  } catch (err) {
    console.error('Failed to load active classroom:', err);
    return null;
  }
}

export function saveActiveClassroom(classroom: Classroom | null): void {
  try {
    if (classroom) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, classroom.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
    }
  } catch (err) {
    console.error('Failed to save active classroom ID:', err);
  }
}
