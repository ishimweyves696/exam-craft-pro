import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ExamPrintView } from "../components/ExamPrintView";
import { useExamContent } from "../lib/useExamContent";


export const Route = createFileRoute("/exam/$id/print")({
  head: () => ({
    meta: [
      { title: "Print exam paper — NESA Exam Builder" },
      {
        name: "description",
        content: "Print-ready A4 rendering of the generated NESA-standard exam paper.",
      },
      { property: "og:title", content: "Print exam paper — NESA Exam Builder" },
      {
        property: "og:description",
        content: "Print-ready A4 rendering of the generated NESA-standard exam paper.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrintExam,
});

function PrintExam() {
  const { id } = Route.useParams();
  const { exam, loading } = useExamContent(id);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [loading]);


  return (
    <div className="bg-white">
      <div className="no-print flex items-center gap-3 border-b border-border px-4 py-3">
        <Link to="/exam/$id" params={{ id }} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to preview
        </Link>
        <button
          onClick={() => window.print()}
          className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Print
        </button>
      </div>
      <ExamPrintView exam={exam} />
    </div>
  );
}
