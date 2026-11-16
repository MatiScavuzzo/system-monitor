import { useState } from "react";
import { useAlerts } from "../hooks/useAlerts";
import { useMetrics } from "../hooks/useMetrics";
import { Alerts } from "./Alerts";
import { Card } from "./Card";
import { CpuHero } from "./CpuHero";
import { DonutChart } from "./DonutChart";
import { LineChart } from "./LineChart";
import { NetworkCard } from "./NetworkCard";
import { ProcessDetail } from "./ProcessDetail";
import { ProcessTable } from "./ProcessTable";
import { ThreadList } from "./ThreadList";
import { formatBytes, formatPercent } from "../lib/format";
import { gaugeVar, loadTone } from "../lib/tone";

/**
 * Layout de la consola: grilla de 12 columnas x 4 filas.
 *
 *  ┌──────────┬────────────────────────┬───────────┐
 *  │ Carga    │ Historial de CPU       │ Memoria   │
 *  │ (medidor)├────────────────────────┼───────────┤
 *  │          │ Hilos                  │ Red       │
 *  ├──────────┴──────────────┬─────────┴──┬────────┤
 *  │ Procesos                │ Proceso    │ Avisos │
 *  │                         │ elegido    │        │
 *  └─────────────────────────┴────────────┴────────┘
 */
export function Grid() {
  const { cpu, memory, network, processes, history, networkHistory } = useMetrics();
  const alerts = useAlerts(cpu, memory);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  const memUsedPct = memory.totalBytes > 0 ? (memory.usedBytes / memory.totalBytes) * 100 : 0;
  const swapPct = memory.swapTotalBytes > 0 ? (memory.swapUsedBytes / memory.swapTotalBytes) * 100 : 0;
  const freeBytes = Math.max(0, memory.totalBytes - memory.usedBytes - memory.cachedBytes);
  const memState = loadTone(memUsedPct, 80, 92);
  const swapState = loadTone(swapPct, 60, 85);
  const cpuState = loadTone(cpu.total);

  const selected = processes.find((p) => p.pid === selectedPid) ?? null;

  return (
    <section className="grid min-h-0 flex-1 grid-cols-12 grid-rows-[1fr_1fr_1fr_1fr] gap-2.5">
      <CpuHero className="col-span-3 col-start-1 row-span-2 row-start-1" cpu={cpu} />

      <Card
        className="col-span-6 col-start-4 row-start-1"
        title="Historial de CPU"
        subtitle="últimos 60 s · 0 a 100%"
      >
        <LineChart series={[{ name: "cpu", color: gaugeVar(cpuState), values: history.cpuTotal }]} max={100} fill />
      </Card>

      <Card className="col-span-6 col-start-4 row-start-2" title="Hilos" subtitle="uso y temperatura · el mouse muestra MHz">
        <ThreadList cores={cpu.cores} />
      </Card>

      <Card
        className="col-span-3 col-start-10 row-start-1"
        title="Memoria"
        subtitle={memory.totalBytes > 0 ? `${formatBytes(memory.usedBytes)} de ${formatBytes(memory.totalBytes)}` : "sin datos: falta el evento memory"}
        tone={memState === "good" ? "neutral" : memState}
      >
        <div className="flex h-full min-h-0 flex-col gap-2">
          <div className="min-h-0 flex-1">
            <DonutChart
              centerLabel="usada"
              centerValue={formatPercent(memUsedPct)}
              segments={[
                { label: "Usada", value: memory.usedBytes, color: gaugeVar(memState), display: formatBytes(memory.usedBytes) },
                { label: "Caché", value: memory.cachedBytes, color: "var(--color-seg-2)", display: formatBytes(memory.cachedBytes) },
                { label: "Libre", value: freeBytes, color: "var(--color-seg-3)", display: formatBytes(freeBytes) },
              ]}
            />
          </div>
          <div className="shrink-0">
            <div className="mb-1 flex items-baseline justify-between text-[10px]">
              <span className="uppercase tracking-[0.14em] text-muted">Swap</span>
              <span className="font-mono tabular-nums">
                {formatBytes(memory.swapUsedBytes)} de {formatBytes(memory.swapTotalBytes, 0)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden bg-line/70">
              <div
                className="h-full"
                style={{ width: `${Math.min(100, swapPct)}%`, background: gaugeVar(swapState) }}
              />
            </div>
          </div>
        </div>
      </Card>

      <NetworkCard
        className="col-span-3 col-start-10 row-start-2"
        interfaces={network}
        history={networkHistory}
      />

      <ProcessTable
        className="col-span-7 col-start-1 row-span-2 row-start-3"
        processes={processes}
        selectedPid={selectedPid}
        onSelect={setSelectedPid}
      />
      <ProcessDetail
        className="col-span-3 col-start-8 row-span-2 row-start-3"
        process={selected}
        totalMemoryBytes={memory.totalBytes}
      />
      <Alerts className="col-span-2 col-start-11 row-span-2 row-start-3" entries={alerts} />
    </section>
  );
}
