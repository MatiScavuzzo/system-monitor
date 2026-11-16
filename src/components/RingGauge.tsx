interface RingGaugeProps {
  /** 0-100 */
  value: number;
  color: string;
  label: string;
  display: string;
}

const R = 78;
const C = 2 * Math.PI * R;
/** El arco ocupa 270°: deja abierto el cuarto de abajo. */
const ARC = C * 0.75;

/** Medidor circular en SVG: anillo de marcas, pista y arco de valor. */
export function RingGauge({ value, color, label, display }: RingGaugeProps) {
  const filled = ARC * Math.min(1, Math.max(0, value / 100));

  return (
    <div className="mx-auto aspect-square h-full max-h-56">
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${label}: ${display}`}>
        <g transform="rotate(135 100 100)" fill="none">
          {/* marcas exteriores */}
          <circle cx={100} cy={100} r={94} stroke="var(--color-line)" strokeWidth={5} strokeDasharray="1.5 8.34" />
          {/* pista */}
          <circle cx={100} cy={100} r={R} stroke="var(--color-line)" strokeWidth={9} strokeDasharray={`${ARC} ${C}`} />
          {/* valor */}
          <circle
            cx={100}
            cy={100}
            r={R}
            stroke={color}
            strokeWidth={9}
            strokeDasharray={`${filled} ${C}`}
          />
          {/* anillo interior fino */}
          <circle cx={100} cy={100} r={62} stroke="var(--color-line)" strokeWidth={1} strokeDasharray="3 5" />
        </g>
        {/* El texto vive dentro del SVG para escalar junto con el anillo. */}
        <text
          x={100}
          y={104}
          textAnchor="middle"
          fill={color}
          fontSize={44}
          fontWeight={600}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {display}
        </text>
        <text
          x={100}
          y={128}
          textAnchor="middle"
          fill="var(--color-muted)"
          fontSize={9.5}
          fontWeight={500}
          letterSpacing="0.2em"
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
