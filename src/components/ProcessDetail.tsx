import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card } from "./Card";
import { USE_MOCK } from "../config";
import { formatBytes, formatPercent } from "../lib/format";
import { gaugeVar, loadTone } from "../lib/tone";
import type { ProcessInfo } from "../types";

interface ProcessDetailProps {
  process: ProcessInfo | null;
  totalMemoryBytes: number;
  className?: string;
}

type Result = { ok: boolean; text: string } | null;

/**
 * Detalle del proceso elegido en la tabla, con la acción de terminarlo.
 *
 * "Terminar proceso" llama al comando de Rust `kill_process(pid: u32)`.
 * Mientras ese comando no exista, el panel muestra el error que devuelve Tauri.
 */
export function ProcessDetail({ process, totalMemoryBytes, className }: ProcessDetailProps) {
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const pid = process?.pid ?? null;

  // Al cambiar de proceso se descarta la confirmación pendiente y el mensaje anterior.
  useEffect(() => {
    setConfirming(false);
    setResult(null);
  }, [pid]);

  if (!process) {
    return (
      <Card title="Proceso" className={className}>
        <p className="text-xs leading-relaxed text-muted">
          Elegí un proceso de la tabla para ver su consumo y poder terminarlo.
        </p>
      </Card>
    );
  }

  const memPct = totalMemoryBytes > 0 ? (process.memoryBytes / totalMemoryBytes) * 100 : 0;

  const terminate = async () => {
    setConfirming(false);
    if (USE_MOCK) {
      setResult({ ok: true, text: "Modo demo: no se envió ninguna señal." });
      return;
    }
    try {
      await invoke("kill_process", { pid: process.pid });
      setResult({ ok: true, text: `Se pidió terminar el PID ${process.pid}.` });
    } catch (err) {
      setResult({ ok: false, text: `No se pudo terminar el proceso: ${String(err)}` });
    }
  };

  return (
    <Card title="Proceso" subtitle={`PID ${process.pid}`} className={className}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <p className="truncate text-lg font-semibold leading-tight" title={process.name}>
          {process.name}
        </p>

        <Meter
          label="CPU"
          value={formatPercent(process.cpu, 1)}
          percent={process.cpu}
          color={gaugeVar(loadTone(process.cpu, 30, 60))}
        />
        <Meter
          label="RAM"
          value={`${formatBytes(process.memoryBytes)} · ${formatPercent(memPct, 1)}`}
          percent={memPct}
          color="var(--color-accent)"
        />

        <div className="mt-auto space-y-2">
          {result && (
            <p role="status" className={`text-[11px] leading-snug ${result.ok ? "text-muted" : "text-bad"}`}>
              {result.text}
            </p>
          )}
          {confirming ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={terminate}
                className="rounded-sm border border-bad bg-bad px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-page hover:bg-bad/85"
              >
                Terminar
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-sm border border-line px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:border-accent"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="w-full rounded-sm border border-bad/70 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-bad hover:bg-bad/10"
            >
              Terminar proceso
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Meter({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</span>
        <span className="font-mono text-xs tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden bg-line/70">
        <div
          className="h-full"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color }}
        />
      </div>
    </div>
  );
}
