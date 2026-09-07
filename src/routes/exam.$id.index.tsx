import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExamPrintView } from "../components/ExamPrintView";
import { PaperFrame } from "../components/PaperFrame";
import { StudioShell } from "../components/studio/StudioShell";
import { Badge, Button, Skeleton } from "../components/ui/primitives";
import { useExamContent } from "../lib/useExamContent";

export const Route = createFileRoute("/exam/$id/")({
  head: () => ({
    meta: [
      { title: "Exam preview — NESA Exam Builder" },
      {
        name: "description",
        content: "Preview the generated NESA-standard exam paper exactly as it will print on A4.",
      },
      { property: "og:title", content: "Exam preview — NESA Exam Builder" },
      {
        property: "og:description",
        content: "Preview the generated NESA-standard exam paper exactly as it will print on A4.",
      },
    ],
  }),
  component: ExamPreview,
});

function ExamPreview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { exam, config, loading, warning, report } = useExamContent(id);

  const quality = (
    <div className="space-y-4">
      <div className="rounded-[12px] border border-hairline p-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-subtle">Marks</p>
        <p className="mt-1 text-[22px] font-bold tracking-tight text-ink">
          {exam.header.marks}
          <span className="ml-1 text-[13px] font-medium text-subtle">total</span>
        </p>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-subtle">
          Section balance
        </p>
        <ul className="mt-2 space-y-1.5">
          {exam.sections.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate text-ink">{s.title}</span>
              <Badge variant="outline">{s.marks} marks</Badge>
            </li>
          ))}
        </ul>
      </div>

      {config.source === "ai" && report?.length ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-subtle">
            Compliance check
          </p>
          <ul className="mt-2 space-y-1.5">
            {report.map((r) => (
              <li key={r.type} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-subtle">{r.type.replace(/_/g, " ")}</span>
                <Badge variant={r.produced >= r.needed ? "green" : "orange"}>
                  {r.produced}/{r.needed}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warning ? (
        <p className="rounded-[10px] bg-warn-soft p-2.5 text-[12px] text-ink">{warning}</p>
      ) : null}
    </div>
  );

  return (
    <StudioShell
      title={exam.header.subjectName}
      subtitle={`${exam.header.level} · ${exam.header.marks} marks · ${
        config.source === "ai" ? "AI-written" : "Question bank"
      }`}
      stage="build"
      examId={id}
      right={{ title: "Quality", content: quality }}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/exam/$id/edit", params: { id } })}>
            Edit paper
          </Button>
          <Button
            size="sm"
            onClick={() => void navigate({ to: "/exam/$id/print", params: { id } })}
          >
            Print / PDF
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="mx-auto flex max-w-[21cm] flex-col items-center gap-4 px-4 py-20 text-center">
          <p className="text-[15px] font-semibold text-ink" role="status" aria-live="polite">
            Writing your curriculum-aligned questions…
          </p>
          <p className="max-w-md text-[12px] text-subtle">
            Every question is checked against the NESA item rules — correct level, one defensible
            answer, no duplicates — before it is allowed onto the paper.
          </p>
          <div className="mt-4 w-full space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6">
          <PaperFrame className="rounded-[14px] bg-white p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)]">
            <ExamPrintView exam={exam} />
          </PaperFrame>

          <p className="mx-auto mt-4 max-w-[21cm] text-center text-[12px] text-subtle">
            Need the answers?{" "}
            <Link
              to="/exam/$id/guide"
              params={{ id }}
              className="font-semibold text-brand hover:underline"
            >
              Open the marking guide
            </Link>
          </p>
        </div>
      )}
    </StudioShell>
  );
}
