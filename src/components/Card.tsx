import type { ReactNode } from "react";
import { tonePanel, type Tone } from "../lib/tone";

interface CardProps {
  title: string;
  subtitle?: string;
  className?: string;
  /** Estado del panel: cambia el color del borde. */
  tone?: Tone;
  /** Contenido a la derecha del título (por ejemplo un filtro). */
  action?: ReactNode;
  children: ReactNode;
}

/** Panel base de la consola: borde fino, título en cian y contenido. */
export function Card({ title, subtitle, className = "", tone = "neutral", action, children }: CardProps) {
  return (
    <section
      className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-sm border bg-card/85 p-3 ${tonePanel[tone]} ${className}`}
    >
      <header className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{title}</h2>
          {subtitle && <p className="truncate font-mono text-[10px] text-muted">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
