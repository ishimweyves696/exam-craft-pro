/**
 * STUDIO UI PRIMITIVES
 *
 * Ported from the uploaded Studio design system. Every value is expressed with
 * the semantic tokens declared in src/styles.css so the workspace can be
 * re-themed in one place. These primitives are chrome only — they never touch
 * the printed paper, whose formatting stays governed by print.css.
 */
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------------- Button ---------------- */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const buttonVariants = {
  primary: 'bg-brand text-brand-foreground shadow-sm hover:bg-brand-hover',
  secondary: 'bg-canvas text-ink hover:bg-surface-muted',
  outline: 'border border-hairline bg-transparent text-ink hover:bg-canvas',
  ghost: 'text-ink hover:bg-canvas',
  destructive: 'bg-danger text-brand-foreground hover:opacity-90',
  glass: 'bg-surface/70 backdrop-blur-md border border-hairline/60 text-ink hover:bg-surface shadow-sm',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-[13px] rounded-[10px]',
  md: 'h-10 px-4 text-[15px] rounded-[12px]',
  lg: 'h-12 px-6 text-[17px] rounded-[14px]',
  icon: 'h-10 w-10 p-0 rounded-[12px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-semibold tracking-tight transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none antialiased outline-none focus-visible:ring-2 focus-visible:ring-brand',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

/* ---------------- Surfaces ---------------- */

export const Surface = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('bg-canvas text-ink font-sans antialiased selection:bg-brand/20', className)}
    {...props}
  >
    {children}
  </div>
);

export const GlassSurface = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('bg-surface/70 backdrop-blur-2xl border border-hairline/50 shadow-sm antialiased', className)}
    {...props}
  >
    {children}
  </div>
);

export const Separator = ({ className, vertical = false }: { className?: string; vertical?: boolean }) => (
  <div className={cn('bg-hairline/60', vertical ? 'w-px h-full' : 'h-px w-full', className)} />
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outline';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-surface rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-canvas',
    glass: 'bg-surface/80 backdrop-blur-xl border border-hairline/40 rounded-[20px] shadow-lg',
    elevated: 'bg-surface rounded-[20px] shadow-[0_12px_48px_rgba(0,0,0,0.08)] border border-canvas',
    outline: 'border border-hairline rounded-[20px]',
  };
  return <div className={cn(variants[variant], 'overflow-hidden antialiased', className)} {...props} />;
}

/* ---------------- Form controls ---------------- */

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-[12px] border-none bg-canvas px-3.5 py-2 text-[15px] tracking-tight text-ink transition-all placeholder:text-subtle focus:ring-2 focus:ring-brand focus:bg-surface disabled:opacity-50 antialiased outline-none',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-[12px] border-none bg-canvas px-3.5 py-2.5 text-[14px] leading-relaxed tracking-tight text-ink transition-all placeholder:text-subtle focus:ring-2 focus:ring-brand focus:bg-surface antialiased outline-none resize-y',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-[12px] border-none bg-canvas px-3.5 py-2 text-[14px] font-semibold tracking-tight text-ink transition-all focus:ring-2 focus:ring-brand focus:bg-surface disabled:opacity-50 antialiased outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export interface SegmentedControlProps {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn('bg-surface-muted p-1 rounded-full flex gap-1 select-none', className)}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200',
              isActive ? 'bg-surface text-brand shadow-sm' : 'text-subtle hover:text-ink',
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Feedback ---------------- */

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blue' | 'green' | 'orange' | 'red' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-canvas text-ink',
    blue: 'bg-brand-soft text-brand',
    green: 'bg-ok-soft text-ok',
    orange: 'bg-warn-soft text-warn',
    red: 'bg-danger-soft text-danger',
    outline: 'border border-hairline text-ink',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight antialiased',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse bg-surface-muted rounded-[8px]', className)} {...props} />;
}

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-ink/90 px-3 py-1.5 text-[12px] font-medium text-brand-foreground shadow-lg group-hover:block">
        {content}
      </span>
    </span>
  );
}

export const Spinner = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn('inline-block animate-spin rounded-full border-2 border-current/25 border-t-current', className)}
  />
);

/* ---------------- Mobile chrome ---------------- */

export function BottomTabBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <GlassSurface
      className={cn(
        'fixed bottom-0 left-0 right-0 h-[72px] pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-2 z-50 border-t',
        className,
      )}
    >
      {children}
    </GlassSurface>
  );
}

export function TabItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-1 transition-colors',
        isActive ? 'text-brand' : 'text-subtle',
      )}
    >
      <span className={cn('transition-transform', isActive && 'scale-110')}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

export function Fab({
  icon,
  className,
  ...props
}: { icon: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'fixed bottom-[88px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all active:scale-95 outline-none',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

export interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ModalSheet({ isOpen, onClose, title, children, className }: ModalSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={cn(
              'relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-hairline/40 bg-surface/95 shadow-2xl backdrop-blur-2xl antialiased sm:rounded-[28px]',
              className,
            )}
          >
            <div className="mx-auto mt-3 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-hairline sm:hidden" />
            <div className="flex items-center justify-between px-5 py-4">
              {title ? <Typography.Title2>{title}</Typography.Title2> : <span />}
              <Button variant="secondary" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4 text-subtle" />
              </Button>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Typography ---------------- */

export const Typography = {
  LargeTitle: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('text-[34px] font-black leading-tight tracking-tight text-ink antialiased', className)} {...props} />
  ),
  Title1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn('text-[24px] font-bold tracking-tight text-ink antialiased', className)} {...props} />
  ),
  Title2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-[19px] font-bold tracking-tight text-ink antialiased', className)} {...props} />
  ),
  Headline: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('text-[12px] font-black uppercase tracking-widest text-ink antialiased', className)} {...props} />
  ),
  Body: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-[15px] leading-relaxed text-ink antialiased', className)} {...props} />
  ),
  Footnote: ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn('text-[12.5px] font-medium tracking-tight text-subtle antialiased', className)} {...props} />
  ),
  Caption: ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn('text-[11px] font-bold uppercase tracking-widest text-subtle antialiased', className)} {...props} />
  ),
};
