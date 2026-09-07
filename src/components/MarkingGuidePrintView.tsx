import React from 'react';
import { GeneratedMarkingGuide, GeneratedExam } from '../types';
import { QuestionText } from './blocks/QuestionText';

export function MarkingGuidePrintView({ markingGuide, exam }: { markingGuide: GeneratedMarkingGuide, exam: GeneratedExam }) {
  return (
    <div className="examprint-root max-w-[816px] mx-auto bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-slate-200 rounded-[2px] p-[60px] md:p-[80px] mb-8 font-serif text-black print:shadow-none print:border-none print:m-0 print:p-[1.5cm] print:w-auto print:max-w-none">
      <div className="text-center pb-6 mb-8 border-b-[3px] border-black">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="w-[60px] h-[60px] border-[3px] border-black rounded-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80">
              <div className="w-1.5 h-6 bg-black mb-0.5"></div>
              <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 uppercase">Marking Guide</h1>
        <h2 className="text-xl font-bold mb-2 uppercase">{exam.header.subjectName}</h2>
        <h3 className="text-lg font-bold tracking-widest">{exam.header.subjectCode}</h3>
        <div className="mt-4 font-bold border-2 border-black inline-block px-4 py-1 text-sm uppercase tracking-widest">
          Confidential - For Examiner's Use Only
        </div>
      </div>

      <div className="space-y-10">
        {markingGuide.sections.map((section, idx) => (
          <div key={idx} className="print:break-inside-avoid">
            <h3 className="font-bold text-lg border-b-2 border-black pb-1 mb-4 uppercase">{section.title}</h3>
            
            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent">
                  <th className="border-2 border-black p-2 w-12 text-center font-bold">Qn.</th>
                  <th className="border-2 border-black p-2 text-left font-bold">Expected Answer / Value Points</th>
                  <th className="border-2 border-black p-2 w-24 text-center font-bold">Marks</th>
                </tr>
              </thead>
              <tbody>
                {section.answers.map((a) => {
                  const rubricItems = Array.isArray(a.rubric)
                    ? a.rubric.filter((r) => typeof r === 'string' && r.trim().length > 0)
                    : typeof a.rubric === 'string' && (a.rubric as string).trim().length > 0
                      ? [(a.rubric as string).trim()]
                      : [];
                  return (
                    <tr key={a.questionId} className="print:break-inside-avoid">
                      <td className="border-2 border-black p-3 text-center font-bold align-top">{a.number}</td>
                      <td className="border-2 border-black p-3 align-top">
                        <div className="whitespace-pre-wrap mb-3"><QuestionText text={a.expected} /></div>
                        
                        {a.rubricSteps && a.rubricSteps.length > 0 ? (
                          <div className="mt-2 pl-4 border-l-2 border-dashed border-black">
                            <div className="font-bold text-xs uppercase mb-1 text-slate-800 print:text-black">Detailed Marking Breakdown:</div>
                            <div className="space-y-1.5 text-sm text-slate-900 print:text-black">
                              {a.rubricSteps.map((step, sIdx) => (
                                <div key={sIdx} className="flex justify-between items-baseline gap-2">
                                  <span className="flex-1"><QuestionText text={step.step} /></span>
                                  <span className="font-bold font-mono text-xs shrink-0 px-1 border border-black bg-slate-50 print:bg-transparent">
                                    {step.markType ? `${step.markType}${step.marks}` : `${step.marks}m`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : rubricItems.length > 0 ? (
                          <div className="mt-2 pl-4 border-l-2 border-dashed border-black">
                            <div className="font-bold text-xs uppercase mb-1 text-slate-800 print:text-black">Rubric / Allocation:</div>
                            <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-slate-800 print:text-black">
                              {rubricItems.map((r, i) => <li key={i}><QuestionText text={r} /></li>)}
                            </ul>
                          </div>
                        ) : null}

                        {a.acceptableAlternatives && a.acceptableAlternatives.length > 0 && (
                          <div className="mt-2 text-xs text-slate-800 print:text-black">
                            <span className="font-bold uppercase">Acceptable Alternatives: </span>
                            {a.acceptableAlternatives.join('; ')}
                          </div>
                        )}

                        {a.doNotAwardMarksFor && a.doNotAwardMarksFor.length > 0 && (
                          <div className="mt-1 text-xs text-slate-800 print:text-black italic">
                            <span className="font-bold uppercase not-italic">Do not award marks for: </span>
                            {a.doNotAwardMarksFor.join('; ')}
                          </div>
                        )}

                        {a.examinerNotes && a.examinerNotes.length > 0 && (
                          <div className="mt-2 text-xs bg-slate-50 print:bg-transparent p-1.5 border border-black">
                            <span className="font-bold uppercase block mb-0.5">Examiner Guidance Notes:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {a.examinerNotes.map((note, nIdx) => <li key={nIdx}><QuestionText text={note} /></li>)}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="border-2 border-black p-3 text-center font-bold align-top">
                        {a.marks}
                        {a.methodMarks !== undefined && a.accuracyMarks !== undefined && (
                          <div className="text-[10px] font-normal text-slate-600 print:text-black mt-0.5">
                            (M:{a.methodMarks}, A:{a.accuracyMarks})
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
