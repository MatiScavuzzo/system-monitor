import { useEffect, useRef, useState } from "react";
import type { CpuStats, MemoryStats } from "../types";

export type AlertLevel = "ok" | "warn" | "bad";

export interface AlertEntry {
  id: number;
  time: string;
  level: AlertLevel;
  text: string;
}

interface Check {
  key: string;
  level: AlertLevel;
  text: string;
  /** Texto cuando la métrica vuelve a estar bajo el umbral. */
  recovered: string;
}

/**
 * Nivel con histéresis: para salir de un estado la métrica tiene que bajar
 * `margin` por debajo del umbral. Así, un valor que oscila en 64-66 °C no
 * genera un aviso nuevo cada segundo.
 */
function levelOf(value: number, warnAt: number, badAt: number, margin: number, before: AlertLevel): AlertLevel {
  if (value >= badAt) return "bad";
  if (before === "bad" && value >= badAt - margin) return "bad";
  if (value >= warnAt) return "warn";
  if (before !== "ok" && value >= warnAt - margin) return "warn";
  return "ok";
}

/**
 * Registro de avisos: anota una línea cada vez que una métrica cruza un umbral
 * (o vuelve a la normalidad). Los umbrales son los mismos que colorean los paneles.
 */
export function useAlerts(cpu: CpuStats, memory: MemoryStats, size = 30): AlertEntry[] {
  const [entries, setEntries] = useState<AlertEntry[]>([]);
  const previous = useRef<Record<string, AlertLevel>>({});
  const nextId = useRef(0);

  useEffect(() => {
    const memPct = memory.totalBytes > 0 ? (memory.usedBytes / memory.totalBytes) * 100 : 0;
    const swapPct = memory.swapTotalBytes > 0 ? (memory.swapUsedBytes / memory.swapTotalBytes) * 100 : 0;

    const prev = (key: string): AlertLevel => previous.current[key] ?? "ok";

    const checks: Check[] = [
      {
        key: "cpu",
        level: levelOf(cpu.total, 85, 95, 10, prev("cpu")),
        text: `CPU al ${cpu.total.toFixed(0)}%`,
        recovered: "CPU bajó del 75%",
      },
      {
        key: "temp",
        level: levelOf(cpu.temperatureC, 80, 90, 5, prev("temp")),
        text: `Temperatura en ${cpu.temperatureC.toFixed(0)} °C`,
        recovered: "Temperatura bajó de 75 °C",
      },
      {
        key: "mem",
        level: levelOf(memPct, 80, 92, 5, prev("mem")),
        text: `Memoria al ${memPct.toFixed(0)}%`,
        recovered: "Memoria bajó del 75%",
      },
      {
        key: "swap",
        level: levelOf(swapPct, 60, 85, 5, prev("swap")),
        text: `Swap al ${swapPct.toFixed(0)}%`,
        recovered: "Swap bajó del 55%",
      },
    ];

    const time = new Date().toLocaleTimeString("es-AR", { hour12: false });
    const fresh: AlertEntry[] = [];

    for (const check of checks) {
      const before = previous.current[check.key] ?? "ok";
      if (before !== check.level) {
        fresh.push({
          id: nextId.current++,
          time,
          level: check.level,
          text: check.level === "ok" ? check.recovered : check.text,
        });
        previous.current[check.key] = check.level;
      }
    }

    if (fresh.length > 0) {
      setEntries((list) => [...fresh, ...list].slice(0, size));
    }
  }, [cpu, memory, size]);

  return entries;
}
