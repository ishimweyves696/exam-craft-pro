/**
 * ASSISTANT BAR — prototype only.
 *
 * The bottom chat toolbar from the Apple-style design. It is navigation and
 * affordance wiring: every control opens a real destination that already
 * exists in the app, or an honest "coming soon" note. No AI conversation logic
 * lives here yet, and nothing here can influence the printed paper.
 */
import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Plus,
  MoreHorizontal,
  Mic,
  ChevronDown,
  ArrowUp,
  Upload,
  BookOpen,
  Printer,
  ListChecks,
  Ruler,
  FilePlus2,
} from 'lucide-react';
import { ModalSheet, cn } from '../ui/primitives';
import type { Stage } from './StudioShell';

interface Props {
  stage: Stage;
  examId?: string;
  onStage: (stage: Stage) => void;
}

const MODES: { id: Stage; label: string; hint: string }[] = [
  { id: 'plan', label: 'Plan', hint: 'Set up subject, class, sections and marks' },
  { id: 'build', label: 'Build', hint: 'Preview the generated paper' },
  { id: 'design', label: 'Design', hint: 'Edit questions and layout' },
  { id: 'audit', label: 'Audit', hint: 'Marking guide and standards check' },
];

export function AssistantBar({ stage, examId, onStage }: Props) {
  const navigate = useNavigate();
  const [sheet, setSheet] = React.useState<null | 'add' | 'more' | 'mode' | 'soon'>(null);
  const close = () => setSheet(null);
  const modeLabel = MODES.find((m) => m.id === stage)?.label ?? 'Plan';

  const addItems = [
    {
      label: 'Upload source material',
      hint: 'A textbook or notes the questions must be written from',
      icon: Upload,
      run: () => void navigate({ to: '/' }),
    },
    {
      label: 'Choose curriculum units',
      hint: 'Pick the units and topics actually taught this term',
      icon: BookOpen,
      run: () => void navigate({ to: '/' }),
    },
    {
      label: 'Start another paper',
      hint: 'A fresh setup with the official structure',
      icon: FilePlus2,
      run: () => void navigate({ to: '/' }),
    },
  ];

  const moreItems = [
    ...(examId
      ? [
          {
            label: 'Print / PDF',
            hint: 'Open the print-ready sheet',
            icon: Printer,
            run: () => void navigate({ to: '/exam/$id/print', params: { id: examId } }),
          },
          {
            label: 'Marking guide',
            hint: 'Answers and mark allocation',
            icon: ListChecks,
            run: () => void navigate({ to: '/exam/$id/guide', params: { id: examId } }),
          },
        ]
      : []),
    {
      label: 'Format check',
      hint: 'See the fixed formatting rules applied to every paper',
      icon: Ruler,
      run: () => void navigate({ to: '/format-check' }),
    },
  ];

  return (
    <>
      <div className="no-print shrink-0 px-4 pb-5 pt-3">
        <div className="mx-auto flex max-w-xl flex-col gap-3 rounded-[24px] border border-hairline bg-surface p-3 shadow-lg">
          <button
            type="button"
            onClick={() => setSheet('soon')}
            className="px-2 pt-1 text-left text-[15px] text-subtle"
          >
            Ask ExamCraft…
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Round label="Add to this paper" onClick={() => setSheet('add')}>
                <Plus className="h-4 w-4" />
              </Round>
              <Round label="More actions" onClick={() => setSheet('more')}>
                <MoreHorizontal className="h-4 w-4" />
              </Round>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSheet('mode')}
                className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
              >
                {modeLabel}
                <ChevronDown className="h-3 w-3 text-subtle" />
              </button>
              <Round label="Dictate (coming soon)" onClick={() => setSheet('soon')}>
                <Mic className="h-4 w-4" />
              </Round>
              <Round label="Send (coming soon)" onClick={() => setSheet('soon')} solid>
                <ArrowUp className="h-4 w-4" />
              </Round>
            </div>
          </div>
        </div>
      </div>

      <ModalSheet isOpen={sheet === 'add'} onClose={close} title="Add to this paper">
        <Menu items={addItems} onPick={close} />
      </ModalSheet>
      <ModalSheet isOpen={sheet === 'more'} onClose={close} title="More actions">
        <Menu items={moreItems} onPick={close} />
      </ModalSheet>
      <ModalSheet isOpen={sheet === 'mode'} onClose={close} title="Mode">
        <div className="space-y-1">
          {MODES.map((m) => {
            const disabled = m.id !== 'plan' && !examId;
            return (
              <button
                key={m.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  close();
                  onStage(m.id);
                }}
                className={cn(
                  'flex w-full flex-col rounded-[12px] px-3 py-2.5 text-left hover:bg-canvas disabled:opacity-40',
                  stage === m.id && 'bg-canvas',
                )}
              >
                <span className="text-[14px] font-semibold">{m.label}</span>
                <span className="text-[12px] text-subtle">{m.hint}</span>
              </button>
            );
          })}
        </div>
      </ModalSheet>
      <ModalSheet isOpen={sheet === 'soon'} onClose={close} title="Assistant">
        <p className="text-[14px] leading-relaxed text-subtle">
          Chatting and talking to plan, research and re-write questions is the next step. For now
          the setup screen and the editor do all of the work, and every paper keeps the official
          layout.
        </p>
      </ModalSheet>
    </>
  );
}

function Round({
  children,
  label,
  onClick,
  solid,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  solid?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full border transition active:scale-95',
        solid
          ? 'border-transparent bg-brand text-brand-foreground hover:bg-brand-hover'
          : 'border-hairline text-subtle hover:bg-canvas hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function Menu({
  items,
  onPick,
}: {
  items: { label: string; hint: string; icon: React.ElementType; run: () => void }[];
  onPick: () => void;
}) {
  return (
    <div className="space-y-1">
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          onClick={() => {
            onPick();
            it.run();
          }}
          className="flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-canvas"
        >
          <it.icon className="mt-0.5 h-4 w-4 text-subtle" />
          <span>
            <span className="block text-[14px] font-semibold">{it.label}</span>
            <span className="block text-[12px] text-subtle">{it.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
