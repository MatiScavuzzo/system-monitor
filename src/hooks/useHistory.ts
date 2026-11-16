import { useEffect, useState } from "react";

/**
 * Guarda las últimas `size` muestras de un número extraído de `snapshot`.
 * Es la "lista circular" de los gráficos históricos: cada vez que llega un
 * snapshot nuevo (objeto nuevo) se agrega una muestra y se descarta la más vieja.
 */
export function useHistory<T>(snapshot: T, pick: (s: T) => number, size = 60): number[] {
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    setHistory((h) => [...h.slice(-(size - 1)), pick(snapshot)]);
    // `pick` es estable (función de módulo o inline sin estado): solo reaccionamos al snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, size]);

  return history;
}
