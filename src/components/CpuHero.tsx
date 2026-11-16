import { Card } from "./Card";
import { RingGauge } from "./RingGauge";
import { formatPercent } from "../lib/format";
import { gaugeText, gaugeVar, loadTone } from "../lib/tone";
import type { CpuStats } from "../types";

/** Panel principal: carga total en el medidor, con temperatura y frecuencia debajo. */
export function CpuHero({ cpu, className }: { cpu: CpuStats; className?: string }) {
  const loadState = loadTone(cpu.total);
  const tempState = loadTone(cpu.temperatureC, 80, 90);

  const freqs = cpu.cores.map((c) => c.frequencyMhz);
  const range = freqs.length ? `${Math.min(...freqs)}–${Math.max(...freqs)} MHz` : "sin datos";

  return (
    <Card
      title="Carga del sistema"
      subtitle={`${cpu.cores.length} hilos`}
      tone={loadState === "bad" ? "bad" : "neutral"}
      className={className}
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="min-h-0 flex-1">
          <RingGauge value={cpu.total} color={gaugeVar(loadState)} label="CPU total" display={formatPercent(cpu.total)} />
        </div>

        <dl className="grid shrink-0 grid-cols-2 gap-2">
          <div className={`rounded-sm border px-2.5 py-2 ${tempState === "bad" ? "border-bad/70 bg-bad/5" : tempState === "warn" ? "border-warn/60" : "border-line"}`}>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Temperatura</dt>
            <dd className={`whitespace-nowrap font-mono text-lg font-semibold tabular-nums ${gaugeText(tempState)}`}>
              {cpu.temperatureC.toFixed(0)} °C
            </dd>
            <dd className="font-mono text-[10px] text-muted">package</dd>
          </div>
          <div className="rounded-sm border border-line px-2.5 py-2">
            <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Frecuencia</dt>
            <dd className="whitespace-nowrap font-mono text-lg font-semibold tabular-nums">{(cpu.frequencyMhz / 1000).toFixed(2)} GHz</dd>
            <dd className="truncate font-mono text-[10px] text-muted" title="Mínimo y máximo entre hilos">
              {range}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
