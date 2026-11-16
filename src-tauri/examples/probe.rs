use std::path::Path;
use std::time::Instant;
use sysinfo::{Networks};
use system_monitor_lib::metrics::NetworkStats;

fn main() {
    let mut net = Networks::new_with_refreshed_list();
    let start = Instant::now();
    std::thread::sleep(std::time::Duration::from_secs(5));
    let seconds = start.elapsed().as_secs_f64();
    net.refresh(true);
    let net_stats: Vec<NetworkStats> = net
        .iter()
        .map(|(interface_name, n)| {
            let rx_bytes_per_sec = n.received() as f64 / seconds;
            let tx_bytes_per_sec = n.transmitted() as f64 / seconds;
            let physical = Path::new(&format!("/sys/class/net/{}/device", interface_name)).exists();
            NetworkStats {
            name: interface_name.to_string(),
            rx_bytes_per_sec: rx_bytes_per_sec as u64,
            tx_bytes_per_sec: tx_bytes_per_sec as u64,
            physical,
        }})
        .collect();
    println!("{:?}", net_stats);
    }