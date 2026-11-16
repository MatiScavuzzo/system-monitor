import type { CoreStats } from "../types";
import { gaugeText, gaugeVar, loadTone } from "../lib/tone";

/** Una fila por hilo: etiqueta, barra de uso, porcentaje y temperatura (como btop). */
export function ThreadList({ cores }: { cores: CoreStats[] }) {
  const rowsPerColumn = Math.ceil(cores.length / 2);

  return (
    <ul
      className="grid h-full grid-flow-col grid-cols-2 gap-x-6 gap-y-0.5 font-mono text-[11px]"
      style={{ gridTemplateRows: `repeat(${rowsPerColumn}, minmax(0, 1fr))` }}
    >
      {cores.map((core, i) => {
        const usageState = loadTone(core.usage, 70, 90);
        const tempState = loadTone(core.temperatureC, 80, 90);

        return (
          <li
            key={i}
            className="flex min-h-0 items-center gap-2"
            title={`Hilo ${i}: ${core.usage.toFixed(0)}% · ${core.frequencyMhz} MHz · ${core.temperatureC.toFixed(0)} °C`}
          >
            <span className="w-6 shrink-0 text-muted">{String(i).padStart(2, "0")}</span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden bg-line/70">
              <div
                className="h-full"
                style={{ width: `${Math.min(100, core.usage)}%`, background: gaugeVar(usageState) }}
              />
            </div>
            <span className={`w-9 shrink-0 text-right tabular-nums ${gaugeText(usageState)}`}>
              {core.usage.toFixed(0)}%
            </span>
            <span className={`w-10 shrink-0 text-right tabular-nums ${tempState === "good" ? "text-muted" : gaugeText(tempState)}`}>
              {core.temperatureC.toFixed(0)}°C
            </span>
          </li>
        );
      })}
    </ul>
  );
}
