import { useEffect, useState } from "react";
import type { NetworkStats } from "../types";

export interface RateHistory {
  rx: number[];
  tx: number[];
}

/**
 * Guarda las últimas `size` muestras de cada interfaz, por nombre.
 * Se registran todas, no solo la elegida: así, al cambiar de interfaz,
 * el gráfico ya tiene su historia.
 */
export function useNetworkHistory(snapshot: NetworkStats[], size = 60): Record<string, RateHistory> {
  const [history, setHistory] = useState<Record<string, RateHistory>>({});

  useEffect(() => {
    setHistory((prev) => {
      const next: Record<string, RateHistory> = {};
      for (const n of snapshot) {
        const old = prev[n.name] ?? { rx: [], tx: [] };
        next[n.name] = {
          rx: [...old.rx.slice(-(size - 1)), n.rxBytesPerSec],
          tx: [...old.tx.slice(-(size - 1)), n.txBytesPerSec],
        };
      }
      return next;
    });
  }, [snapshot, size]);

  return history;
}
