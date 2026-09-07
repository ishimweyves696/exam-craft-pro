import { createFileRoute, Link } from "@tanstack/react-router";
import { MarkingGuidePrintView } from "../components/MarkingGuidePrintView";
import { PaperFrame } from "../components/PaperFrame";
import { useExamContent } from "../lib/useExamContent";


export const Route = createFileRoute("/exam/$id/guide")({
  head: () => ({
    meta: [
      { title: "Marking guide — NESA Exam Builder" },
      {
        name: "description",
        content: "Print-ready marking guide with expected answers and mark allocation per question.",
      },
      { property: "og:title", content: "Marking guide — NESA Exam Builder" },
      {
        property: "og:description",
        content: "Print-ready marking guide with expected answers and mark allocation per question.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const { id } = Route.useParams();
  const { exam, markingGuide, loading } = useExamContent(id);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="no-print flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Link to="/exam/$id" params={{ id }} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to exam
        </Link>
        {loading && <span className="text-xs font-medium text-primary">Writing AI answers…</span>}
        <button
          onClick={() => window.print()}

          className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Print marking guide
        </button>
      </div>
      <div className="px-4 py-4">
        <PaperFrame className="bg-white p-6 shadow-sm">
          <MarkingGuidePrintView markingGuide={markingGuide} exam={exam} />
        </PaperFrame>
      </div>
    </div>
  );
}
