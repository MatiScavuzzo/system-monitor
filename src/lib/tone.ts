export type Tone = "good" | "warn" | "bad" | "neutral";
export type Trend = "up" | "down" | "flat";

/** Clases completas (Tailwind solo detecta strings literales, no concatenados). */
export const toneText: Record<Tone, string> = {
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  neutral: "text-ink",
};

/** Etiqueta con borde: el color indica el estado, no decora. */
export const tonePill: Record<Tone, string> = {
  good: "border-line text-ink",
  warn: "border-warn/60 bg-warn/10 text-warn",
  bad: "border-bad/70 bg-bad/10 text-bad",
  neutral: "border-line text-muted",
};

/** Borde de un panel según su estado. */
export const tonePanel: Record<Tone, string> = {
  good: "border-line",
  warn: "border-warn/60",
  bad: "border-bad/70 bg-bad/5",
  neutral: "border-line",
};

export const toneVar: Record<Tone, string> = {
  good: "var(--color-good)",
  warn: "var(--color-warn)",
  bad: "var(--color-bad)",
  neutral: "var(--color-accent)",
};

/** Color para medidores: cian mientras todo está normal, ámbar o rojo al pasar un umbral. */
export function gaugeVar(tone: Tone): string {
  return tone === "warn" || tone === "bad" ? toneVar[tone] : "var(--color-accent)";
}

/** Igual que gaugeVar, pero como clase de texto. */
export function gaugeText(tone: Tone): string {
  return tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "text-ink";
}

/** Semáforo para porcentajes de carga. */
export function loadTone(percent: number, warnAt = 60, badAt = 85): Tone {
  if (percent >= badAt) return "bad";
  if (percent >= warnAt) return "warn";
  return "good";
}

/** Compara las dos últimas muestras de un historial. */
export function trendOf(history: number[], epsilon = 0.05): Trend {
  if (history.length < 2) return "flat";
  const diff = history[history.length - 1] - history[history.length - 2];
  if (Math.abs(diff) <= epsilon) return "flat";
  return diff > 0 ? "up" : "down";
}
