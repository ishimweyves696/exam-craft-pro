import { createFileRoute } from "@tanstack/react-router";
import { ExamPrintView } from "../components/ExamPrintView";
import type { GeneratedExam } from "../types";

export const Route = createFileRoute("/format-check")({
  head: () => ({
    meta: [
      { title: "Format check — NESA Exam Builder" },
      { name: "description", content: "Internal layout check for every question format." },
      { property: "og:title", content: "Format check — NESA Exam Builder" },
      { property: "og:description", content: "Internal layout check for every question format." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FormatCheck,
});

const q = (n: number, type: string, text: string, marks: number, extra: any = {}) => ({
  id: `fc_${n}`,
  number: n,
  type,
  text,
  marks,
  answerSpace: "medium",
  ...extra,
});

const exam: GeneratedExam = {
  header: {
    subjectName: "Format check",
    subjectCode: "000",
    combinations: "ALL",
    duration: "3 hours",
    marks: 100,
    academicYear: "2022-2023",
    level: "S4",
    examDate: "",
    examTime: "",
    instructions: ["Answer all questions."],
  },
  sections: [
    {
      id: "A",
      title: "SECTION A: ALL FIFTEEN FORMATS",
      instructions: "Attempt all questions.",
      marks: 100,
      attemptRule: { mode: "ATTEMPT_ALL" },
      questions: [
        q(1, "mcq", "Which one of the following is a mammal?", 1, {
          answerSpace: "none",
          options: ["Frog", "Whale", "Trout", "Lizard"].map((t, i) => ({
            id: `o${i}`,
            text: t,
            isCorrect: i === 1,
          })),
        }),
        q(2, "true_false", "Water boils at 100 °C at sea level.", 1, { answerSpace: "none" }),
        q(3, "fill_blank", "The capital city of Rwanda is ……………………… .", 1, {
          answerSpace: "none",
        }),
        q(4, "matching", "Match the items in Column A with those in Column B.", 3, {
          answerSpace: "none",
          tableData: {
            rows: [
              ["Column A", "Column B"],
              ["Heart", "Pumps blood"],
              ["Lungs", "Gas exchange"],
              ["Kidney", "Filters blood"],
            ],
          },
        }),
        q(5, "short_answer", "State two functions of the cell membrane.", 3),
        q(6, "table", "Complete the table below.", 6, {
          answerSpace: "none",
          instruction: "Complete the table below.",
          tableData: {
            rows: [
              ["Organ", "System", "Function"],
              ["Heart", "", ""],
              ["Lungs", "", ""],
              ["Kidney", "", ""],
            ],
          },
        }),
        q(7, "calculation", "A car travels 150 km in 2 hours. Calculate its average speed.", 5, {
          givenData: "Distance = 150 km; Time = 2 h",
          unit: "km/h",
          instruction: "Show all your working clearly.",
        }),
        q(8, "transformation", "She is too young to drive a car. (Rewrite using 'enough')", 2, {
          answerSpace: "none",
          instruction: "Rewrite the sentence as instructed, keeping the same meaning.",
        }),
        q(9, "error_correction", "The children was playing outside when it started to rain.", 4, {
          answerSpace: "small",
          instruction: "Identify and correct the error in each sentence.",
        }),
        q(10, "swot", "Carry out a SWOT analysis of the business described above.", 8, {
          answerSpace: "none",
        }),
        q(
          11,
          "comprehension",
          "THE VALUE OF SAVING\n\nSaving is the part of income that a household does not spend. In Rwanda, savings groups have allowed many families to meet school fees and health costs without borrowing at high interest.\n\nA family that saves regularly can also handle emergencies without selling productive assets.",
          10,
          {
            answerSpace: "none",
            instruction: "Read the passage below carefully and answer the questions that follow.",
            subQuestions: [
              { id: "s1", number: 1, text: "Define saving as used in the passage.", marks: 2, answerSpace: "small" },
              { id: "s2", number: 2, text: "Give two benefits of saving mentioned in the passage.", marks: 4, answerSpace: "small" },
              { id: "s3", number: 3, text: "Explain why selling productive assets is harmful.", marks: 4, answerSpace: "medium" },
            ],
          },
        ),
        q(
          12,
          "case_study",
          "MUKAMANA'S BAKERY\n\nMukamana started a small bakery in Huye Town in 2021 with a capital of 500,000 Frw borrowed from a savings group. She began with one oven, two employees and a single product, ordinary bread, which she sold to shops around the market.\n\nAfter one year her monthly sales had grown to 1,200,000 Frw and she had added cakes and mandazi to her products. However, she kept no written records. Money from sales was mixed with money for family expenses, and she could not tell whether the cakes made a profit or a loss.\n\nWhen she applied for a loan of 2,000,000 Frw to buy a second oven, the bank asked for her financial statements for the past year. Mukamana could not provide them and the loan was refused.",
          12,
          {
            answerSpace: "none",
            instruction: "Read the case study below carefully and answer the questions that follow.",
            subQuestions: [
              { id: "c1", number: 1, text: "Identify two problems facing Mukamana's business.", marks: 4, answerSpace: "small" },
              { id: "c2", number: 2, text: "Explain the importance of keeping business records.", marks: 8, answerSpace: "medium" },
            ],
          },
        ),
        q(
          13,
          "summary",
          "THE VALUE OF SAVING\n\nSaving is the part of income that a household does not spend immediately. In Rwanda, savings and credit groups have made it possible for many families to meet school fees, health costs and farm inputs without borrowing from money lenders who charge very high interest.\n\nA family that saves regularly is also able to handle emergencies, such as illness or a poor harvest, without selling productive assets like land or livestock. Selling such assets solves a problem today but reduces the income of the family for many years to come.\n\nBeyond the household, savings collected by banks and cooperatives are lent to farmers and small businesses. In this way, the money that individual families put aside every month becomes the capital that creates jobs in their own communities.",
          10,
          {
            answerSpace: "none",
            wordLimit: 100,
            summaryTask: "In your own words, summarise the passage above in not more than 100 words.",
          },
        ),
        q(14, "composition", "Choose ONE of the following topics and write about it.", 15, {
          answerSpace: "xlarge",
          numberingStyle: "alpha-lower",
          instruction: "Choose ONE of the following topics and write about it.",
          options: [
            { id: "t1", text: "A day I shall never forget.", isCorrect: false },
            { id: "t2", text: "The importance of protecting the environment.", isCorrect: false },
            { id: "t3", text: "Write a story ending with: '… and that is how we won.'", isCorrect: false },
          ],
        }),
        q(15, "essay", "Discuss the role of agriculture in the economy of Rwanda.", 15, {
          answerSpace: "xlarge",
        }),
      ] as any,
    },
  ],
};

function FormatCheck() {
  return (
    <div className="bg-white">
      <ExamPrintView exam={exam} />
    </div>
  );
}
