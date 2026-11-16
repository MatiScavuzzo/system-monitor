import type { CoreStats, CpuStats, MemoryStats, NetworkStats, ProcessInfo } from "../types";

const GB = 1024 ** 3;
const MB = 1024 ** 2;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
/** Caminata aleatoria acotada: cada valor se mueve un poco respecto del anterior. */
const walk = (v: number, step: number, min: number, max: number) =>
  clamp(v + (Math.random() - 0.5) * 2 * step, min, max);

/* ---------- CPU ---------- */
const makeCore = (usage: number): CoreStats => ({
  usage,
  frequencyMhz: Math.round(400 + usage * 35),
  temperatureC: 45,
});

export const initialCpu: CpuStats = {
  total: 34,
  cores: [42, 18, 65, 30, 12, 55, 27, 71, 20, 38, 9, 46, 15, 33, 24, 50].map(makeCore),
  temperatureC: 54,
  frequencyMhz: 3200,
};

export function nextCpu(prev: CpuStats): CpuStats {
  const cores = prev.cores.map((c) => {
    const usage = walk(c.usage, 18, 1, 100);
    return {
      usage,
      frequencyMhz: Math.round(clamp(400 + usage * 40 + (Math.random() - 0.5) * 400, 400, 4700)),
      temperatureC: walk(c.temperatureC, 1.5, 38, 88),
    };
  });
  return {
    cores,
    total: cores.reduce((a, c) => a + c.usage, 0) / cores.length,
    temperatureC: Math.max(...cores.map((c) => c.temperatureC)),
    frequencyMhz: Math.round(cores.reduce((a, c) => a + c.frequencyMhz, 0) / cores.length),
  };
}

/* ---------- Memoria ---------- */
export const initialMemory: MemoryStats = {
  usedBytes: 7.4 * GB,
  cachedBytes: 4.1 * GB,
  totalBytes: 16 * GB,
  swapUsedBytes: 0.6 * GB,
  swapTotalBytes: 8 * GB,
};

export function nextMemory(prev: MemoryStats): MemoryStats {
  return {
    ...prev,
    usedBytes: walk(prev.usedBytes, 0.15 * GB, 3 * GB, 13 * GB),
    cachedBytes: walk(prev.cachedBytes, 0.05 * GB, 2 * GB, 5 * GB),
    swapUsedBytes: walk(prev.swapUsedBytes, 0.03 * GB, 0, 3 * GB),
  };
}

/* ---------- Red ---------- */
export const initialNetwork: NetworkStats[] = [
  { name: "wlo1", rxBytesPerSec: 1.2 * MB, txBytesPerSec: 0.2 * MB, physical: true },
  { name: "docker0", rxBytesPerSec: 40 * 1024, txBytesPerSec: 12 * 1024, physical: false },
  { name: "lo", rxBytesPerSec: 300 * 1024, txBytesPerSec: 300 * 1024, physical: false },
];

export function nextNetwork(prev: NetworkStats[]): NetworkStats[] {
  return prev.map((n) => {
    const scale = n.physical ? 1 : 0.15;
    const burst = n.physical && Math.random() < 0.12 ? 4 * MB : 0;
    return {
      ...n,
      rxBytesPerSec: walk(n.rxBytesPerSec, 0.9 * MB * scale, 0, 9 * MB * scale) + burst,
      txBytesPerSec: walk(n.txBytesPerSec, 0.15 * MB * scale, 0, 2 * MB * scale),
    };
  });
}

/* ---------- Procesos ---------- */
const NAMES = [
  "hyprland", "quickshell", "firefox", "rustrover", "cargo", "rust-analyzer",
  "bun", "kitty", "pipewire", "dockerd", "syncthing", "NetworkManager",
  "Xwayland", "fish", "system-monitor", "code-helper",
];

export const initialProcesses: ProcessInfo[] = NAMES.map((name, i) => ({
  pid: 800 + i * 137,
  name,
  cpu: Math.random() * 40,
  memoryBytes: (40 + Math.random() * 900) * MB,
}));

export function nextProcesses(prev: ProcessInfo[]): ProcessInfo[] {
  return prev.map((p) => ({
    ...p,
    cpu: walk(p.cpu, 9, 0, 100),
    memoryBytes: walk(p.memoryBytes, 12 * MB, 20 * MB, 1.6 * GB),
  }));
}
