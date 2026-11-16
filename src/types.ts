/**
 * Contrato entre Rust y React.
 *
 * Cada interface es el espejo de un `struct` de Rust con
 * `#[derive(Serialize, Clone)]` y `#[serde(rename_all = "camelCase")]`.
 * Un campo `used_bytes` en Rust llega acá como `usedBytes`.
 */

/** Un hilo (CPU lógica) dentro del evento "cpu" */
export interface CoreStats {
  /** Uso, 0-100 */
  usage: number;
  frequencyMhz: number;
  /** Temperatura del núcleo físico al que pertenece el hilo */
  temperatureC: number;
}

/** Evento "cpu" */
export interface CpuStats {
  /** Uso global, 0-100 */
  total: number;
  /** Un elemento por hilo */
  cores: CoreStats[];
  /** Temperatura del package */
  temperatureC: number;
  /** Frecuencia promedio de todos los hilos */
  frequencyMhz: number;
}

/** Evento "memory" */
export interface MemoryStats {
  usedBytes: number;
  cachedBytes: number;
  totalBytes: number;
  swapUsedBytes: number;
  swapTotalBytes: number;
}

/** Una interfaz de red. El evento "network" manda una lista (bytes por segundo). */
export interface NetworkStats {
  /** Nombre del kernel: wlo1, enp3s0, lo, docker0… */
  name: string;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  /** true si es una placa real (existe /sys/class/net/<name>/device) */
  physical: boolean;
}

/** Evento "processes" (lista) */
export interface ProcessInfo {
  pid: number;
  name: string;
  /** 0-100 (de un núcleo, como en top) */
  cpu: number;
  memoryBytes: number;
}
