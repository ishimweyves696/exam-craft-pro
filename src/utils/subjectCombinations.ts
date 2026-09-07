import { SUBJECT_PRESETS } from '../data/presets.js';

/**
 * Returns the exact per-subject combinations string for a given subject and level.
 * English -> 'HEL, LEG, HGL, LFK, LKK'
 * French -> 'LFK'
 * Math -> 'PCM, MCB, MEG, MPC, MPG'
 * Non-preset or custom subjects without combinations -> ''
 */
export function lookupSubjectCombinations(subjectId: string, subjectName: string, levelName?: string): string {
  // 1. Match by preset ID
  if (subjectId) {
    const cleanId = subjectId.replace(/^sub-/, '');
    const presetById = SUBJECT_PRESETS.find(p => p.id === cleanId || p.id === subjectId);
    if (presetById && presetById.config && presetById.config.combinations !== undefined) {
      return presetById.config.combinations;
    }
  }

  const nameLower = (subjectName || '').toLowerCase().trim();
  const levelUpper = (levelName || '').toUpperCase();
  const isALevel = levelUpper.includes('ADVANCED') || levelUpper.includes('A-LEVEL');

  // 2. Match by subject name and level in SUBJECT_PRESETS
  const presetByName = SUBJECT_PRESETS.find(p => {
    const pName = p.config.subjectName.toLowerCase().trim();
    const pId = p.id.toLowerCase();
    const matchesName = pName === nameLower || pId.includes(nameLower) || nameLower.includes(pName);
    const matchesLevel = isALevel ? p.level === 'A-Level' : p.level === 'O-Level';
    return matchesName && matchesLevel;
  });

  if (presetByName && presetByName.config && presetByName.config.combinations !== undefined) {
    return presetByName.config.combinations;
  }

  // 3. Known NESA subject rules
  if (nameLower.includes('general paper') || nameLower.includes('gp')) {
    return 'ALL';
  }
  if (nameLower.includes('subsidiary math') || nameLower.includes('sub math')) {
    return 'PCB, HEG, HEL, HGL, LFK, HGK, HKL, LKL, EGF, EFK';
  }
  if (nameLower.includes('kiswahili')) {
    return isALevel ? 'LKL, LKF' : 'ALL';
  }
  if (nameLower.includes('french')) {
    return isALevel ? 'LFK, EGF, LKF, EFK' : 'ALL';
  }
  if (nameLower.includes('english') || nameLower.includes('literature')) {
    return isALevel ? 'HEL, LEG, HGL, LFK, LKK' : 'ALL';
  }
  if (nameLower.includes('math')) {
    return isALevel ? 'PCM, MCB, MEG, MPC, MPG' : 'ALL';
  }
  if (nameLower.includes('biology')) {
    return isALevel ? 'MCB, PCB, BCG' : 'ALL';
  }
  if (nameLower.includes('chemistry')) {
    return isALevel ? 'PCB, MCB, BCG' : 'ALL';
  }
  if (nameLower.includes('physics')) {
    return isALevel ? 'PCM, PCB, MPG' : 'ALL';
  }
  if (nameLower.includes('history')) {
    return isALevel ? 'HEG, HGL, MEG, HGK, HKL' : 'ALL';
  }
  if (nameLower.includes('geography')) {
    return isALevel ? 'HEG, MEG, HGL, MPG, BCG, LEG' : 'ALL';
  }
  if (nameLower.includes('kinyarwanda')) {
    return isALevel ? 'HGK, HKL, LFK, LKL, EFK' : 'ALL';
  }
  if (nameLower.includes('computer')) {
    return isALevel ? 'MCE, MPC' : 'ALL';
  }
  if (nameLower.includes('economics')) {
    return isALevel ? 'HEG, MEG, MCE, LEG, EGF, EFK' : 'ALL';
  }
  if (nameLower.includes('entrepreneurship') || nameLower.includes('ict') || nameLower.includes('religion') || nameLower.includes('religious')) {
    return 'ALL';
  }

  // 4. Default to empty string if no combinations entry exists for this subject
  return '';
}
