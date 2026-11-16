import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import { formatBytes, formatPercent } from "../lib/format";
import { loadTone, tonePill } from "../lib/tone";
import type { ProcessInfo } from "../types";

type SortKey = "name" | "pid" | "cpu" | "memoryBytes";
type SortDir = 1 | -1;

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "name", label: "Proceso", align: "left" },
  { key: "pid", label: "PID", align: "right" },
  { key: "cpu", label: "CPU", align: "right" },
  { key: "memoryBytes", label: "RAM", align: "right" },
];

/** Mismas columnas para el encabezado y para cada fila. */
const GRID = "grid grid-cols-[minmax(0,1fr)_6rem_6rem_6rem]";

interface ProcessTableProps {
  processes: ProcessInfo[];
  selectedPid: number | null;
  onSelect: (pid: number | null) => void;
  className?: string;
}

/**
 * Tabla de procesos al estilo btop: orden por columna, filtro y selección.
 * Teclado: "/" enfoca el filtro, ↑ y ↓ mueven la selección, Esc limpia.
 */
export function ProcessTable({ processes, selectedPid, onSelect, className }: ProcessTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "cpu", dir: -1 });
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRowRef = useRef<HTMLDivElement>(null);
  /** Solo seguimos la fila con el scroll cuando la selección cambió por teclado. */
  const followSelection = useRef(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return processes
      .filter((p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q))
      .sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        const cmp = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
        return cmp * sort.dir;
      });
  }, [processes, query, sort]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = document.activeElement === inputRef.current;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (typing) {
          setQuery("");
          inputRef.current?.blur();
        } else {
          onSelect(null);
        }
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (rows.length === 0) return;
        e.preventDefault();
        const current = rows.findIndex((p) => p.pid === selectedPid);
        const step = e.key === "ArrowDown" ? 1 : -1;
        const next = current === -1 ? 0 : Math.min(rows.length - 1, Math.max(0, current + step));
        followSelection.current = true;
        onSelect(rows[next].pid);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows, selectedPid, onSelect]);

  useEffect(() => {
    if (followSelection.current) {
      selectedRowRef.current?.scrollIntoView({ block: "nearest" });
      followSelection.current = false;
    }
  }, [selectedPid]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as SortDir } : { key, dir: key === "name" ? 1 : -1 }));

  return (
    <Card
      title="Procesos"
      subtitle={`${rows.length} de ${processes.length} · / filtrar · ↑↓ elegir`}
      className={className}
      action={
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre o PID"
          aria-label="Filtrar procesos por nombre o PID"
          className="w-36 rounded-sm border border-line bg-page px-2 py-1 font-mono text-[11px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      }
    >
      {/* El encabezado queda fuera de la zona con scroll: así nunca pueden asomarse
          filas por encima, sin depender de `position: sticky` (que en WebKit falla en tablas). */}
      <div role="table" aria-label="Procesos" className="flex h-full min-h-0 flex-col font-mono text-[11px]">
        <div
          role="row"
          className={`${GRID} shrink-0 border-b border-line pb-1.5 pr-1 text-[10px] uppercase tracking-[0.12em] text-muted [scrollbar-gutter:stable] overflow-hidden`}
        >
          {COLUMNS.map((c) => (
            <div
              key={c.key}
              role="columnheader"
              aria-sort={sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
              className={c.align === "right" ? "text-right" : "pl-2 text-left"}
            >
              <button
                type="button"
                onClick={() => toggleSort(c.key)}
                className={`uppercase tracking-[0.12em] hover:text-ink ${sort.key === c.key ? "text-accent" : ""}`}
              >
                {c.label}
                {sort.key === c.key && (sort.dir === 1 ? " ▲" : " ▼")}
              </button>
            </div>
          ))}
        </div>

        <div role="rowgroup" className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
          {rows.map((p) => {
            const selected = p.pid === selectedPid;
            return (
              <div
                key={p.pid}
                role="row"
                ref={selected ? selectedRowRef : undefined}
                onClick={() => onSelect(selected ? null : p.pid)}
                aria-selected={selected}
                className={`${GRID} cursor-pointer items-center border-l-2 py-1 ${
                  selected ? "border-accent bg-accent/10" : "border-transparent hover:bg-card-hi"
                }`}
              >
                <span role="cell" className="truncate pl-2 font-sans text-xs font-medium">
                  {p.name}
                </span>
                <span role="cell" className="text-right tabular-nums text-muted">
                  {p.pid}
                </span>
                <span role="cell" className="text-right">
                  <span
                    className={`inline-block min-w-14 rounded-sm border px-1.5 text-center tabular-nums ${
                      tonePill[loadTone(p.cpu, 30, 60)]
                    }`}
                  >
                    {formatPercent(p.cpu, 1)}
                  </span>
                </span>
                <span role="cell" className="pr-1 text-right tabular-nums">
                  {formatBytes(p.memoryBytes)}
                </span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="py-6 text-center font-sans text-xs text-muted">
              {processes.length === 0
                ? "Todavía no llegó la lista de procesos."
                : `Ningún proceso coincide con "${query}". Esc borra el filtro.`}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
