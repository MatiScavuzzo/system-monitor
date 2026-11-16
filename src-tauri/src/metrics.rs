use std::fs::read_to_string;
use std::path::Path;
use serde::Serialize;
use sysinfo::{Components, Networks, System};

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CoreStats {
    pub usage: f32,
    pub frequency_mhz: u64,
    pub temperature_c: f32,
}
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CpuStats {
    pub total: f32,
    pub cores: Vec<CoreStats>,
    pub temperature_c: f32,
    pub frequency_mhz: u64,
}
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MemoryStats {
    pub used_bytes: u64,
    pub cached_bytes: u64,
    pub total_bytes: u64,
    pub swap_used_bytes: u64,
    pub swap_total_bytes: u64,
}
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NetworkStats {
    pub name: String,
    pub rx_bytes_per_sec: u64,
    pub tx_bytes_per_sec: u64,
    pub physical: bool,
}
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu: f32,
    pub memory_bytes: u64,
}

pub fn read_core_ids(count: usize) -> Vec<Option<u32>> {
    let mut core_ids: Vec<Option<u32>> = Vec::new();
    for i in 0..count {
        let path = format!("/sys/devices/system/cpu/cpu{}/topology/core_id", i);
        let id = read_to_string(path).ok().and_then(|s| s.trim().parse::<u32>().ok());
        core_ids.push(id);
    }
    core_ids
}

pub fn read_frequency_mhz(cores: &[CoreStats]) -> u64 {
    let mut counter = 0;
    if cores.is_empty() {
        return 0;
    }
    for core in cores.iter() {
        counter += core.frequency_mhz;
    };
    let average_frequency = counter / cores.len() as u64;
    average_frequency
}

pub fn read_processes(sys: &System) -> Vec<ProcessInfo> {
    let processes: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .filter(|(_pid, p)| p.memory() > 0 && p.thread_kind().is_none())
        .map(|(pid, p)| ProcessInfo {
            pid: pid.as_u32(),
            name: p.name().to_string_lossy().into_owned(),
            cpu: p.cpu_usage(),
            memory_bytes: p.memory(),
        })
        .collect();
    processes
}

pub fn read_memory(sys: &System) -> MemoryStats {
    let memory_stats = MemoryStats {
        used_bytes: sys.used_memory(),
        cached_bytes: sys.available_memory().saturating_sub(sys.free_memory()),
        total_bytes: sys.total_memory(),
        swap_used_bytes: sys.used_swap(),
        swap_total_bytes: sys.total_swap(),
    };
    memory_stats
}
pub fn read_cpu(sys: &System, components: &Components, core_id: &[Option<u32>]) -> CpuStats {
    let temp_package = components.iter()
        .find(|c| c.label().contains("Package"))
        .and_then(|c| c.temperature())
        .unwrap_or(0.0);

    fn core_temperature(components: &Components, id: u32) -> Option<f32> {
        components.iter()
            .find(|c| c.label().ends_with(&format!(" Core {}", id)))
            .and_then(|c| c.temperature())
    }

    let cores: Vec<CoreStats> = sys.cpus().iter().enumerate().map(|(i, c)| {
        let id = core_id.get(i).copied().flatten();
        let temperature_c = id
            .and_then(|id| core_temperature(components, id))
            .unwrap_or(temp_package);
        CoreStats {
            usage: c.cpu_usage(),
            frequency_mhz: c.frequency(),
            temperature_c}
    }).collect();

    let frequency_mhz = read_frequency_mhz(&cores);

    CpuStats {
        total: sys.global_cpu_usage(),
        cores,
        temperature_c: temp_package,
        frequency_mhz,
    }
}

pub fn read_networks(net: &Networks, secs: f64) -> Vec<NetworkStats> {
    let net_stats: Vec<NetworkStats> = net
        .iter()
        .map(|(interface_name, n)| {
            let rx_bytes_per_sec = n.received() as f64 / secs;
            let tx_bytes_per_sec = n.transmitted() as f64 / secs;
            let physical = Path::new(&format!("/sys/class/net/{}/device", interface_name)).exists();
            NetworkStats {
                name: interface_name.to_string(),
                rx_bytes_per_sec: rx_bytes_per_sec.round() as u64,
                tx_bytes_per_sec: tx_bytes_per_sec.round() as u64,
                physical,
            }})
        .collect();
    net_stats
}
