import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { USE_MOCK } from "../config";

/**
 * Devuelve el último valor de una métrica.
 *
 * - Con USE_MOCK, genera datos falsos cada segundo con `mock`.
 * - Sin USE_MOCK, escucha el evento `eventName` que emite Rust.
 *
 * El resto de la app no sabe de dónde vienen los datos.
 */
export function useFeed<T>(eventName: string, mock: (prev: T) => T, initial: T): T {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (USE_MOCK) {
      const id = setInterval(() => setValue((prev) => mock(prev)), 1000);
      return () => clearInterval(id);
    }

    const unlisten = listen<T>(eventName, (event) => setValue(event.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [eventName, mock]);

  return value;
}
