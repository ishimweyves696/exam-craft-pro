/**
 * PAPER FRAME
 *
 * The exam sheet is always laid out at a fixed A4 content width so the printed
 * result is identical everywhere. On narrow screens we never reflow the paper
 * (that would change the layout the teacher is checking) — we scale the whole
 * sheet down proportionally, exactly like a zoomed-out page preview.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

/** 21cm at 96dpi. */
const PAPER_WIDTH = 794;

export function PaperFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const outer = wrap.current;
    const inner = sheet.current;
    if (!outer || !inner) return;

    const update = () => {
      const next = Math.min(1, outer.clientWidth / PAPER_WIDTH);
      setScale(next);
      setHeight(inner.offsetHeight * next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrap} className="paper-frame mx-auto w-full max-w-[21cm]" style={{ height }}>
      <div
        ref={sheet}
        className={className}
        style={{
          width: PAPER_WIDTH,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
