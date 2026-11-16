export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  /** Texto a mostrar en la leyenda (por defecto, el porcentaje). */
  display?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}

const R = 40;
const C = 2 * Math.PI * R;
const GAP = 1.5;

/** Anillo en SVG con leyenda al costado. */
export function DonutChart({ segments, centerValue, centerLabel }: DonutChartProps) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex h-full min-h-0 items-center gap-3">
      <div className="relative aspect-square h-full max-h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {segments.map((s) => {
            const len = (s.value / total) * C;
            const circle = (
              <circle
                key={s.label}
                cx={50}
                cy={50}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={8}
                strokeDasharray={`${Math.max(0, len - GAP)} ${C - Math.max(0, len - GAP)}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-semibold tabular-nums leading-none">{centerValue}</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5 text-[11px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate text-muted">{s.label}</span>
            <span className="font-mono tabular-nums">
              {s.display ?? `${((s.value / total) * 100).toFixed(0)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
