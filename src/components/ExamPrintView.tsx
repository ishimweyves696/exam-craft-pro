import React from 'react';
import { GeneratedExam, Section } from '../types';
import { SectionBlock } from './blocks';
import { normalizeLanguage, isEnglishInstruction, isFrenchInstruction } from '../utils/languageUtils';

function numberToWord(n: number, lang?: string): string {
  const norm = normalizeLanguage(lang);
  if (norm === 'fr') {
    const frWords = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
    return frWords[n] ?? String(n);
  }
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
  return words[n] ?? String(n);
}

export function attemptSentence(section: Section, lang?: string): string {
  const norm = normalizeLanguage(lang);
  const isFr = norm === 'fr';
  // quarantined pending verified Kinyarwanda source paper per AGENTS.md:
  // const isRw = norm === 'rw';

  const mode = section.attemptRule?.mode;
  if (!section.attemptRule || mode === 'all' || mode === 'ATTEMPT_ALL') {
    if (isFr) return `Répondez à TOUTES les questions. (${section.marks} points)`;
    // if (isRw) return `Subiza IBIBAZO BYOSE. (${section.marks} amanota)`;
    return `Attempt ALL questions. (${section.marks} marks)`;
  }
  const count = section.attemptRule.chooseCount ?? section.attemptRule.choose ?? 1;
  const countStr = numberToWord(count, lang);
  if (isFr) return `Répondez à ${countStr} questions au choix. (${section.marks} points)`;
  // if (isRw) return `Subiza ibibazo ${countStr} gusa unyuzemo. (${section.marks} amanota)`;
  return `Attempt any ${countStr} questions only. (${section.marks} marks)`;
}

const CHROME_STRINGS: Record<string, Record<string, string>> = {
  en: {
    examinerUseOnly: "FOR EXAMINER'S USE ONLY",
    names: "Names:",
    indexNumber: "Index number:",
    schoolCenter: "School / Center:",
    classOption: "Class / Option:",
    duration: "DURATION:",
    totalMarks: "TOTAL MARKS",
    instructionsTitle: "Instructions to candidates:",
    endOfExam: "— END OF EXAM PAPER —",
    questionsHeader: "Questions",
    marksHeader: "Marks",
    subject: "SUBJECT:",
    termPeriod: "TERM/PERIOD:",
    combinations: "COMBINATIONS:",
    allCombinations: "ALL COMBINATIONS",
  },
  fr: {
    examinerUseOnly: "RESERVÉ SEULEMENT AU CORRECTEUR",
    names: "Noms :",
    indexNumber: "Numéro de l'élève :",
    schoolCenter: "École / Centre :",
    classOption: "Classe / Option :",
    duration: "DURÉE :",
    totalMarks: "TOTAL DES POINTS",
    instructionsTitle: "Informations et instructions :",
    endOfExam: "— FIN DE L'EPREUVE —",
    questionsHeader: "Questions",
    marksHeader: "Points",
    subject: "DISCIPLINE :",
    termPeriod: "TRIMESTRE / PERIODE :",
    combinations: "COMBINAISONS :",
    allCombinations: "TOUTES LES COMBINAISONS",
  },
  rw: {
    examinerUseOnly: "IBIKORESHO BY'UMUKOSOSI CYANGWA MWARIMU",
    names: "Amazina:",
    indexNumber: "Numero y'agakaye:",
    schoolCenter: "Ishuri / Ikigo:",
    classOption: "Icyiciro / Ishami:",
    duration: "IGIHE:",
    totalMarks: "AMANOTA YOSE",
    instructionsTitle: "Amabwiriza ku bakandida:",
    endOfExam: "— ISHUBI RO RAZINZE —",
    questionsHeader: "Ibibazo",
    marksHeader: "Amanota",
    subject: "ISOMO:",
    termPeriod: "IGIHENGO / GIHE:",
    combinations: "AMASHAMI:",
    allCombinations: "AMASHAMI YOSE",
  },
};

export type Exam = GeneratedExam;

function levelClass(level: string): string {
  const l = (level || '').toLowerCase();
  if (l.includes('primary')) return 'examprint-level-primary';
  if (l.includes('a-level') || l.includes('advanced')) return 'examprint-level-alevel';
  if (l.includes('o-level') || l.includes('ordinary')) return 'examprint-level-olevel';
  return 'examprint-level-other';
}

function showCombinations(level: string): boolean {
  return levelClass(level) === 'examprint-level-alevel';
}

export function ExamPrintView({ exam }: { exam: GeneratedExam }) {
  const { header, sections } = exam;
  const meta = header.metadata;
  const coverConfig = meta?.coverPage;
  const candConfig = meta?.candidate;
  const footerConfig = meta?.footer;
  
  const lang = normalizeLanguage(header.language);
  const cString = (key: string): string => CHROME_STRINGS[lang]?.[key] ?? CHROME_STRINGS['en'][key];

  const showCover = coverConfig?.showCoverPage !== false;
  const authorityText = coverConfig?.authorityName || 'NATIONAL EXAMINATION\nAND SCHOOL INSPECTION\nAUTHORITY';
  const institutionName = coverConfig?.institutionName;
  const paperNum = coverConfig?.paperNumber;
  const variant = coverConfig?.variantCode;
  const term = coverConfig?.termSemester;
  const confidentiality = coverConfig?.confidentialityNotice;

  // Clean list of general instructions
  const defaultInstructionsEn = [
    'Write your names and index number on the answer booklet as written on your registration form.',
    'Do not open this paper until you are told to do so.',
    `This paper consists of ${sections.length} section(s).`,
    'Use only a blue or black pen.',
    'For all multiple choice questions, circle the correct answers.'
  ];

  const defaultInstructionsFr = [
    'Écrivez votre nom et votre numéro d\'index sur le cahier de réponses tel qu\'inscrit sur votre fiche d\'inscription.',
    'N\'ouvrez pas ce cahier avant d\'y être invité.',
    `Cette épreuve comprend ${sections.length} section(s).`,
    'Utilisez uniquement un stylo bleu ou noir.',
    'Pour toutes les questions à choix multiples, encerclez les bonnes réponses.'
  ];

  const defaultInstructionsRw = [
    'Andika amazina yawe na numero y\'agakaye k\'ibisubizo nk\'uko byanditse ku fishi yawe y\'iyandikisha.',
    'Ntukingure iki kibazo utarabwirwa kubikora.',
    `Iki kizamini kigizwe n'ibice ${sections.length}.`,
    'Koresha gusa ikaramu y\'ubururu cyangwa y\'umukara.',
    'Ku bibazo byose by\'amahitamo mengi, gose igisubizo cy\'ukuri.'
  ];

  // quarantined pending verified Kinyarwanda source paper per AGENTS.md:
  // const defaultInstructions = lang === 'fr' ? defaultInstructionsFr : lang === 'rw' ? defaultInstructionsRw : defaultInstructionsEn;
  const defaultInstructions = lang === 'fr' ? defaultInstructionsFr : defaultInstructionsEn;

  let candidateInstructions = defaultInstructions;
  if (header.instructions && header.instructions.length > 0) {
    const hasMismatch = header.instructions.some(inst => 
      (lang === 'fr' && isEnglishInstruction(inst)) ||
      (lang === 'en' && isFrenchInstruction(inst))
    );
    if (!hasMismatch) {
      candidateInstructions = header.instructions;
    }
  }

  const fontFamily = exam.presentation?.fontFamily || 'serif';
  const fontSize = exam.presentation?.fontSize || '11pt';
  const lineHeight = exam.presentation?.lineHeight || '1.5';
  const margins = exam.presentation?.margins || { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' };

  const globalStyle = {
    fontFamily: fontFamily === 'sans-serif' ? 'Inter, Arial, sans-serif' : 
                fontFamily === 'monospace' ? 'monospace' : 'Merriweather, "Times New Roman", serif',
    fontSize: fontSize,
    lineHeight: lineHeight,
  };

  const footerLeftText = footerConfig?.footerText || exam.header.academicYear || '';
  const showPages = footerConfig?.showPageNumbers !== false;

  return (
    <div className={`examprint-root ${levelClass(header.level)}`} style={globalStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin-top: ${margins.top || '1.5cm'};
          margin-bottom: ${margins.bottom || '1.5cm'};
          margin-left: ${margins.left || '1.5cm'};
          margin-right: ${margins.right || '1.5cm'};
        }
        ${showCover ? `@page :first {
          margin: 0 !important;
        }` : ''}
        .examprint-root {
          font-family: ${fontFamily === 'sans-serif' ? 'Inter, Arial, sans-serif' : 
                         fontFamily === 'monospace' ? 'monospace' : 'Merriweather, "Times New Roman", serif'} !important;
          font-size: ${fontSize} !important;
          line-height: ${lineHeight} !important;
        }
      `}} />

      {/* Cover Page Rendering Engine */}
      {showCover && (
        <div className={`examprint-cover-page examprint-tpl-${coverConfig?.coverTemplateId || 'nesa-standard'}`}>
          {confidentiality && (
            <div className="text-center font-bold text-xs uppercase tracking-widest text-red-700 bg-red-50 py-1 border-b border-red-200 mb-2">
              {confidentiality}
            </div>
          )}

          {/* TEMPLATE 1: NESA Standard National Exam */}
          
            
              <div className="examprint-nesa-top-box border-[3px] border-black flex flex-col mb-6">
                <div className="flex border-b-[2px] border-black">
                  <div className="flex items-center gap-3 p-3 w-1/2 border-r-[2px] border-black">
                    {coverConfig?.showSchoolLogo !== false && (
                      coverConfig?.schoolLogoUrl ? (
                        <div className="w-14 h-14 min-w-[3.5rem] flex items-center justify-center border border-slate-300 rounded p-1 bg-white">
                          <img src={coverConfig.schoolLogoUrl} alt="School Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="examprint-logo-circle">
                          <div className="examprint-logo-inner">
                            <div className="examprint-logo-stripe" />
                            <div className="examprint-logo-dot" />
                          </div>
                        </div>
                      )
                    )}
                    <div className="examprint-authority-text whitespace-pre-line">
                      {institutionName ? (
                        <>
                          <strong className="text-sm block">{institutionName.toUpperCase()}</strong>
                          <span className="text-[10px] text-gray-600 block">{authorityText}</span>
                        </>
                      ) : (
                        authorityText
                      )}
                    </div>
                  </div>

                  <div className="w-1/2 p-3 text-center flex flex-col justify-center">
                    <h1 className="examprint-subject-title" style={{ fontSize: '14pt', margin: 0 }}>{header.subjectName}</h1>
                    <div className="examprint-subject-code flex items-center justify-center gap-2" style={{ marginTop: '0.1cm' }}>
                      <span>{header.subjectCode}</span>
                      {paperNum && <span className="text-sm font-normal">({paperNum})</span>}
                      {variant && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded font-mono">{variant}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-4 py-2 text-[9pt] font-bold">
                  <span>{header.examDate || '15/07/2025'}</span>
                  <span>{header.examTime || '08:30 AM – 11:30 AM'}</span>
                </div>
              </div>

              <div className="examprint-metadata-row">
                <div className="examprint-metadata-left">
                  <p><span className="font-bold">{cString('subject')}</span> {header.subjectName}</p>
                  {term && <p><span className="font-bold">{cString('termPeriod')}</span> {term}</p>}
                  {(coverConfig?.showCombinationsList === true || (coverConfig?.showCombinationsList !== false && showCombinations(header.level))) && (
                    <>
                      <p><span className="font-bold">{cString('combinations')}</span></p>
                      <div className="examprint-combinations-list">
                        {header.combinations && header.combinations.trim() ? (
                          header.combinations.split(',').map((c, i) => <div key={i}>- {c.trim()}</div>)
                        ) : (
                          <div>- {cString('allCombinations')}</div>
                        )}
                      </div>
                    </>
                  )}
                  <p className="examprint-duration-label"><span className="font-bold">{cString('duration')}</span> {header.duration || (lang === 'fr' ? '3 HEURES' : '3 HOURS')}</p>
                </div>
                {coverConfig?.showCandidateTable !== false && (
                  <div className="examprint-candidate-lines">
                    {candConfig?.includeNameField !== false && (
                      <div className="examprint-candidate-line">
                        <span className="font-bold">{candConfig?.customCandidateLabels?.nameLabel || cString('names')}</span>
                        <div className="examprint-candidate-dotted" />
                      </div>
                    )}
                    {candConfig?.includeIndexNumberField !== false && (
                      <div className="examprint-candidate-line">
                        <span className="font-bold">{candConfig?.customCandidateLabels?.indexLabel || cString('indexNumber')}</span>
                        <div className="examprint-candidate-dotted" />
                      </div>
                    )}
                    {candConfig?.includeSchoolCenterField && (
                      <div className="examprint-candidate-line">
                        <span className="font-bold">{candConfig?.customCandidateLabels?.centerLabel || cString('schoolCenter')}</span>
                        <div className="examprint-candidate-dotted" />
                      </div>
                    )}
                    {candConfig?.includeClassField && (
                      <div className="examprint-candidate-line">
                        <span className="font-bold">{candConfig?.customCandidateLabels?.classLabel || cString('classOption')}</span>
                        <div className="examprint-candidate-dotted" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="examprint-cover-middle">
                <div className="examprint-left-column">
                  <div className="examprint-s6-row">
                    <div className="examprint-s6-title">{header.level?.slice(0, 3)?.toUpperCase() || 'S6'}</div>
                    <div className="examprint-booklet-title">
                      {lang === 'fr' ? (
                        <>CAHIER DE<br />QUESTIONS ET<br />REPONSES</>
                      ) : (
                        <>QUESTIONS<br />and ANSWERS<br />BOOKLET</>
                      )}
                    </div>
                  </div>

                  <div className="examprint-exam-level">
                    {header.level}<br />
                    {institutionName ? institutionName.toUpperCase() : (lang === 'fr' ? 'EXAMENS NATIONAUX' : 'NATIONAL EXAMINATIONS')}, {header.academicYear}
                  </div>

                  {coverConfig?.showSpecialInstructions !== false && (
                    <div className="examprint-candidate-instructions">
                      <h3 className="font-bold text-lg mb-2">{cString('instructionsTitle')}</h3>
                      <ol className="list-decimal pl-5 space-y-2 font-medium">
                        {candidateInstructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {coverConfig?.showExaminerMarksTable !== false && (
                  <div className="examprint-examiner-table-container">
                    <table className="examprint-examiner-table">
                      <thead>
                        <tr>
                          <th colSpan={4} className="examprint-examiner-header-title">
                            {cString('examinerUseOnly')}
                          </th>
                        </tr>
                        <tr className="examprint-examiner-subheader-row">
                          <th className="examprint-examiner-col-head">{cString('questionsHeader')}</th>
                          <th className="examprint-examiner-col-head">{cString('marksHeader')}</th>
                          <th className="examprint-examiner-col-head">{cString('questionsHeader')}</th>
                          <th className="examprint-examiner-col-head">{cString('marksHeader')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const totalQuestions = sections.reduce(
                            (n, s: any) => n + (s.questions?.length ?? 0),
                            0,
                          );
                          const count = Math.max(totalQuestions, 1);
                          const rows = Math.ceil(count / 2);
                          return Array.from({ length: rows }).map((_, i) => {
                            const right = i + 1 + rows;
                            return (
                              <tr key={i}>
                                <td className="text-center">{i + 1}</td>
                                <td />
                                <td className="text-center">{right <= count ? right : ''}</td>
                                <td />
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="examprint-cover-bottom flex justify-between items-center">
                <div className="examprint-total-marks-box">
                  <span>{cString('totalMarks')}..................../ </span>
                  <span className="font-bold">{header.marks}</span>
                </div>
                {coverConfig?.showBarcodeStub !== false && (
                  <div className="text-right font-mono text-[9px] border border-black px-2 py-1 flex items-center gap-2">
                    <div className="w-12 h-4 bg-black/80 flex items-center justify-between px-0.5">
                      {Array.from({ length: 12 }).map((_, b) => (
                        <div key={b} className={`h-full ${b % 3 === 0 ? 'w-1 bg-white' : 'w-0.5 bg-black'}`} />
                      ))}
                    </div>
                    <span>BARCODE SEC-ID: {footerConfig?.securityBarcodeId || 'NESA-2025-001'}</span>
                  </div>
                )}
              </div>
            
          

                  </div>
      )}
      {/* Actual Questions Pages */}
      {sections.map((s, i) => (
        <SectionBlock
          section={s}
          newPage={true}
          key={i}
          isFirstSection={i === 0}
          attemptSentence={attemptSentence(s, lang)}
          language={lang}
        />
      ))}

      <div className="examprint-endnotice">{cString('endOfExam')}</div>
    </div>
  );
}

export function formatNumber(index: number, style?: string): string {
  const n = index + 1;
  if (style === 'alpha-lower') return String.fromCharCode(96 + n) + ')';
  if (style === 'alpha-upper') return String.fromCharCode(64 + n) + '.';
  if (style === 'roman-upper') return toRoman(n).toUpperCase() + ')';
  if (style === 'roman-lower') return toRoman(n) + ')';
  return n + '.';
}

export function toRoman(n: number): string {
  const vals = [10, 9, 5, 4, 1];
  const syms = ['x', 'ix', 'v', 'iv', 'i'];
  let res = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { res += syms[i]; n -= vals[i]; }
  }
  return res;
}
