import { useEffect, useState } from "react";
import { USE_MOCK } from "../config";

/** Barra superior: nombre de la app, origen de los datos y reloj. */
export function HeaderBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-line pb-2">
      <h1 className="text-sm font-bold uppercase tracking-[0.24em]">System Monitor</h1>

      <div className="flex items-center gap-4">
        <span
          className={`flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
            USE_MOCK ? "border-warn/60 text-warn" : "border-good/60 text-good"
          }`}
          title={USE_MOCK ? "Datos inventados (USE_MOCK = true)" : "Datos reales enviados por Rust"}
        >
          <i className={`h-1.5 w-1.5 rounded-full ${USE_MOCK ? "bg-warn" : "bg-good"}`} />
          {USE_MOCK ? "Demo" : "En vivo"}
        </span>
        <time className="font-mono text-xs tabular-nums text-muted">
          {now.toLocaleTimeString("es-AR", { hour12: false })}
        </time>
      </div>
    </header>
  );
}
