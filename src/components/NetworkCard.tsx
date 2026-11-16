import { useEffect, useState } from "react";
import { Card } from "./Card";
import { LineChart } from "./LineChart";
import { formatRate } from "../lib/format";
import type { RateHistory } from "../hooks/useNetworkHistory";
import type { NetworkStats } from "../types";

interface NetworkCardProps {
  interfaces: NetworkStats[];
  history: Record<string, RateHistory>;
  className?: string;
}

/** Placas reales primero, después las virtuales; dentro de cada grupo, por nombre. */
function sortInterfaces(list: NetworkStats[]): NetworkStats[] {
  return [...list].sort((a, b) => Number(b.physical) - Number(a.physical) || a.name.localeCompare(b.name));
}

/**
 * Tráfico de una interfaz, elegible como en btop:
 * las flechas del encabezado o las teclas "b" (anterior) y "n" (siguiente).
 * Por defecto muestra la primera placa física.
 */
export function NetworkCard({ interfaces, history, className }: NetworkCardProps) {
  const sorted = sortInterfaces(interfaces);
  const [chosen, setChosen] = useState<string | null>(null);

  // Si la interfaz elegida desaparece (por ejemplo, se apagó un contenedor), se vuelve a la primera.
  const current = sorted.find((n) => n.name === chosen) ?? sorted[0] ?? null;

  const step = (dir: 1 | -1) => {
    if (sorted.length === 0) return;
    const i = current ? sorted.findIndex((n) => n.name === current.name) : 0;
    setChosen(sorted[(i + dir + sorted.length) % sorted.length].name);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (e.key === "b") step(-1);
      else if (e.key === "n") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const rates = current ? history[current.name] : undefined;

  const selector = current && (
    <div className="flex items-center gap-1 font-mono text-[11px]">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Interfaz anterior (b)"
        className="px-1 text-muted hover:text-accent"
      >
        ‹
      </button>
      <span
        className={`max-w-24 truncate whitespace-nowrap rounded-sm border border-line px-1.5 text-center ${current.physical ? "text-ink" : "text-muted"}`}
        title={`${current.name} · ${current.physical ? "placa de red física" : "interfaz virtual"}`}
      >
        {current.name}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Interfaz siguiente (n)"
        className="px-1 text-muted hover:text-accent"
      >
        ›
      </button>
    </div>
  );

  return (
    <Card
      className={className}
      title="Red"
      subtitle={current ? (current.physical ? "física" : "virtual") : "sin datos"}
      action={selector}
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 whitespace-nowrap text-[11px]">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 bg-accent" />
            <span className="text-muted">Bajada</span>
            <b className="font-mono font-semibold tabular-nums">{formatRate(current?.rxBytesPerSec ?? 0)}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 bg-seg-2" />
            <span className="text-muted">Subida</span>
            <b className="font-mono font-semibold tabular-nums">{formatRate(current?.txBytesPerSec ?? 0)}</b>
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <LineChart
            fill
            series={[
              { name: "rx", color: "var(--color-accent)", values: rates?.rx ?? [] },
              { name: "tx", color: "var(--color-seg-2)", values: rates?.tx ?? [] },
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
