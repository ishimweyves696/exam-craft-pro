/**
 * STUDIO SHELL
 *
 * The workspace chrome ported from the uploaded Studio design: a slim top bar
 * with the paper title, stage switcher and actions, optional left/right panes
 * (slide-up sheets on small screens) and a command palette on Cmd/Ctrl+K.
 *
 * Chrome only — it never touches the printed paper's formatting.
 */
import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PanelLeft, PanelRight, Search, FileText, Printer, ListChecks, Plus } from "lucide-react";
import { Button, ModalSheet, Separator, Tooltip, cn } from "../ui/primitives";

export type Stage = "plan" | "build" | "design" | "audit";

const STAGES: { id: Stage; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "build", label: "Build" },
  { id: "design", label: "Design" },
  { id: "audit", label: "Audit" },
];

interface Props {
  title: string;
  subtitle?: string;
  stage: Stage;
  examId?: string;
  actions?: React.ReactNode;
  left?: { title: string; content: React.ReactNode };
  right?: { title: string; content: React.ReactNode };
  children: React.ReactNode;
}

export function StudioShell({
  title,
  subtitle,
  stage,
  examId,
  actions,
  left,
  right,
  children,
}: Props) {
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: Stage) => {
    if (to === "plan") {
      void navigate({ to: "/" });
      return;
    }
    if (!examId) return;
    const map = {
      build: "/exam/$id",
      design: "/exam/$id/edit",
      audit: "/exam/$id/guide",
    } as const;
    void navigate({ to: map[to], params: { id: examId } });
  };

  const commands = [
    { label: "New exam", icon: Plus, run: () => go("plan") },
    ...(examId
      ? [
          { label: "Preview paper", icon: FileText, run: () => go("build") },
          { label: "Edit paper", icon: PanelLeft, run: () => go("design") },
          { label: "Marking guide", icon: ListChecks, run: () => go("audit") },
          {
            label: "Print / PDF",
            icon: Printer,
            run: () => void navigate({ to: "/exam/$id/print", params: { id: examId } }),
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink antialiased">
      {/* Top bar */}
      <header className="no-print z-20 flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-surface/80 px-3 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 pr-1">
          <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-brand text-[13px] font-black text-brand-foreground">
            N
          </span>
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-tight">{title}</p>
          {subtitle ? (
            <p className="truncate text-[11px] font-medium text-subtle">{subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto hidden items-center gap-1 rounded-[12px] bg-canvas p-1 md:flex">
          {STAGES.map((s) => {
            const disabled = s.id !== "plan" && !examId;
            return (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => go(s.id)}
                className={cn(
                  "rounded-[9px] px-3 py-1.5 text-[13px] font-semibold tracking-tight transition-all disabled:opacity-40",
                  stage === s.id ? "bg-surface text-ink shadow-sm" : "text-subtle hover:text-ink",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Tooltip content="Search actions (⌘K)">
            <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          </Tooltip>
          {left ? (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setLeftOpen(true)}
              aria-label={left.title}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          ) : null}
          {right ? (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setRightOpen(true)}
              aria-label={right.title}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          ) : null}
          {actions ? (
            <>
              <Separator vertical className="mx-1 hidden h-6 sm:block" />
              <div className="flex items-center gap-1.5">{actions}</div>
            </>
          ) : null}
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {left ? (
          <aside className="custom-scrollbar hidden w-[320px] shrink-0 overflow-y-auto border-r border-hairline bg-surface lg:block">
            <PaneHeader title={left.title} />
            <div className="p-4">{left.content}</div>
          </aside>
        ) : null}

        <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto">{children}</main>

        {right ? (
          <aside className="custom-scrollbar hidden w-[320px] shrink-0 overflow-y-auto border-l border-hairline bg-surface xl:block">
            <PaneHeader title={right.title} />
            <div className="p-4">{right.content}</div>
          </aside>
        ) : null}
      </div>

      {/* Mobile panes */}
      {left ? (
        <ModalSheet isOpen={leftOpen} onClose={() => setLeftOpen(false)} title={left.title}>
          {left.content}
        </ModalSheet>
      ) : null}
      {right ? (
        <ModalSheet isOpen={rightOpen} onClose={() => setRightOpen(false)} title={right.title}>
          {right.content}
        </ModalSheet>
      ) : null}

      {/* Command palette */}
      <ModalSheet isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} title="Quick actions">
        <div className="space-y-1">
          {commands.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                setPaletteOpen(false);
                c.run();
              }}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] font-medium hover:bg-canvas"
            >
              <c.icon className="h-4 w-4 text-subtle" />
              {c.label}
            </button>
          ))}
        </div>
      </ModalSheet>
    </div>
  );
}

function PaneHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-hairline bg-surface/90 px-4 py-3 backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-subtle">{title}</p>
    </div>
  );
}
