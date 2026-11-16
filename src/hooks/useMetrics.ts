import { useFeed } from "./useFeed";
import { useHistory } from "./useHistory";
import { useNetworkHistory } from "./useNetworkHistory";
import {
  initialCpu,
  initialMemory,
  initialNetwork,
  initialProcesses,
  nextCpu,
  nextMemory,
  nextNetwork,
  nextProcesses,
} from "../mock/data";
import { USE_MOCK } from "../config";
import type { CpuStats, MemoryStats, NetworkStats, ProcessInfo } from "../types";

/**
 * Estado inicial en modo real: todo en cero hasta que Rust mande el primer evento.
 * (Antes se usaban los valores del mock, y un panel sin backend parecía tener datos.)
 */
const EMPTY_CPU: CpuStats = { total: 0, cores: [], temperatureC: 0, frequencyMhz: 0 };
const EMPTY_MEMORY: MemoryStats = { usedBytes: 0, cachedBytes: 0, totalBytes: 0, swapUsedBytes: 0, swapTotalBytes: 0 };
const EMPTY_NETWORK: NetworkStats[] = [];
const EMPTY_PROCESSES: ProcessInfo[] = [];

/** Un evento por grupo de métricas, igual que el diseño del backend. */
export function useMetrics() {
  const cpu = useFeed<CpuStats>("cpu", nextCpu, USE_MOCK ? initialCpu : EMPTY_CPU);
  const memory = useFeed<MemoryStats>("memory", nextMemory, USE_MOCK ? initialMemory : EMPTY_MEMORY);
  const network = useFeed<NetworkStats[]>("networks", nextNetwork, USE_MOCK ? initialNetwork : EMPTY_NETWORK);
  const processes = useFeed<ProcessInfo[]>("processes", nextProcesses, USE_MOCK ? initialProcesses : EMPTY_PROCESSES);

  return {
    cpu,
    memory,
    network,
    processes,
    /** Historial por interfaz: cambiar de interfaz no mezcla las curvas. */
    networkHistory: useNetworkHistory(network),
    history: {
      cpuTotal: useHistory(cpu, (c) => c.total),
      temperature: useHistory(cpu, (c) => c.temperatureC),
      frequency: useHistory(cpu, (c) => c.frequencyMhz),
      swap: useHistory(memory, (m) => m.swapUsedBytes),
    },
  };
}
