import { createFileRoute, Link } from "@tanstack/react-router";
import { ExamEditor } from "../components/editor/ExamEditor";
import { StudioShell } from "../components/studio/StudioShell";
import { useExamContent } from "../lib/useExamContent";

export const Route = createFileRoute("/exam/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit exam paper — NESA Exam Builder" },
      {
        name: "description",
        content:
          "Edit every part of your generated NESA exam — text, marks, options, tables, answer lines and sub-parts — while the paper stays print-perfect.",
      },
      { property: "og:title", content: "Edit exam paper — NESA Exam Builder" },
      {
        property: "og:description",
        content:
          "Click-to-type editing for questions, options, tables and answer spaces on a live A4 sheet.",
      },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { exam, markingGuide, loading, saveEdits, resetEdits, editedAt } = useExamContent(id);

  return (
    <StudioShell
      title={exam.header.subjectName}
      subtitle={`${exam.header.level} · editing · ${exam.header.marks} marks`}
      stage="design"
      examId={id}
      actions={
        <Link
          to="/exam/$id/print"
          params={{ id }}
          className="inline-flex h-8 items-center rounded-[10px] bg-brand px-3 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
        >
          Print / PDF
        </Link>
      }
    >
      {loading ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-24 text-center">
          <span
            aria-hidden
            className="h-10 w-10 animate-spin rounded-full border-2 border-hairline border-t-brand"
          />
          <p className="text-[15px] font-semibold text-ink" role="status" aria-live="polite">
            Preparing your paper for editing…
          </p>
        </div>
      ) : (
        <ExamEditor
          key={id}
          exam={exam}
          markingGuide={markingGuide}
          onSave={saveEdits}
          onRevert={resetEdits}
          savedAt={editedAt}
        />
      )}
    </StudioShell>
  );
}
