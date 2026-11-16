import { Card } from "./Card";
import type { AlertEntry, AlertLevel } from "../hooks/useAlerts";

const BORDER: Record<AlertLevel, string> = {
  ok: "border-good",
  warn: "border-warn",
  bad: "border-bad",
};

const TEXT: Record<AlertLevel, string> = {
  ok: "text-muted",
  warn: "text-warn",
  bad: "text-bad",
};

/** Registro de umbrales cruzados, del más reciente al más viejo. */
export function Alerts({ entries, className }: { entries: AlertEntry[]; className?: string }) {
  const worst = entries.length > 0 && entries[0].level === "bad" ? "bad" : "neutral";

  return (
    <Card title="Avisos" tone={worst} className={className}>
      {entries.length === 0 ? (
        <p className="text-xs leading-relaxed text-muted">
          Sin avisos. Acá se anota cuando CPU, temperatura, memoria o swap pasan su umbral.
        </p>
      ) : (
        <ul className="h-full space-y-1.5 overflow-y-auto pr-1">
          {entries.map((e) => (
            <li key={e.id} className={`border-l-2 bg-card-hi/60 px-2 py-1 ${BORDER[e.level]}`}>
              <p className={`text-xs leading-snug ${TEXT[e.level]}`}>{e.text}</p>
              <p className="font-mono text-[10px] text-muted">{e.time}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
