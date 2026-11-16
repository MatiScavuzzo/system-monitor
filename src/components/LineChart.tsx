export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

interface LineChartProps {
  series: LineSeries[];
  /** Cantidad de muestras que entran en el ancho del gráfico. */
  points?: number;
  /** Valor máximo del eje Y. Si no se pasa, se calcula con los datos. */
  max?: number;
  fill?: boolean;
}

const W = 300;
const H = 100;

/** Gráfico de líneas en SVG puro, sin librerías. Las muestras nuevas entran por la derecha. */
export function LineChart({ series, points = 60, max, fill = false }: LineChartProps) {
  const peak = max ?? Math.max(1, ...series.flatMap((s) => s.values)) * 1.15;

  const toXY = (values: number[]) =>
    values.map((v, i) => {
      const x = ((points - values.length + i) / (points - 1)) * W;
      const y = H - Math.min(1, v / peak) * H;
      return [x, y] as const;
    });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={W}
          y1={H * f}
          y2={H * f}
          stroke="var(--color-line)"
          strokeWidth={1}
          strokeDasharray={f === 0 || f === 1 ? undefined : "2 4"}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {series.map((s) => {
        const xy = toXY(s.values);
        if (xy.length < 2) return null;
        const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
        return (
          <g key={s.name}>
            {fill && (
              <polygon
                points={`${xy[0][0].toFixed(1)},${H} ${line} ${xy[xy.length - 1][0].toFixed(1)},${H}`}
                fill={s.color}
                opacity={0.12}
              />
            )}
            <polyline
              points={line}
              fill="none"
              stroke={s.color}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
    </svg>
  );
}
