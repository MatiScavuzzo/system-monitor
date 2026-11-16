pub mod metrics;

use std::time::Instant;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use sysinfo::{System, Components, ProcessesToUpdate, Networks};
use tauri::Emitter;
use crate::metrics::{read_cpu, read_core_ids, read_processes, read_memory, read_networks};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();

            std::thread::spawn(move || {
                let mut net = Networks::new_with_refreshed_list();
                let mut last = Instant::now();
                let mut sys = System::new_all();
                let mut components = Components::new_with_refreshed_list();
                let core_ids = read_core_ids(sys.cpus().len());
                sys.refresh_cpu_all();
                sys.refresh_processes(ProcessesToUpdate::All, true);
                sys.refresh_memory();
                std::thread::sleep(std::time::Duration::from_secs(1));
                loop {
                    sys.refresh_cpu_all();
                    sys.refresh_processes(ProcessesToUpdate::All, true);
                    sys.refresh_memory();
                    components.refresh(true);
                    net.refresh(true);
                    let seconds = last.elapsed().as_secs_f64();
                    last = Instant::now();
                    let stats = read_cpu(&sys, &components, &core_ids);
                    if let Err(e) = handle.emit("cpu", stats) {
                        eprintln!("No se pudo emitir cpu: {e}");
                    }
                    let processes = read_processes(&sys);
                    if let Err(e) = handle.emit("processes", processes) {
                        eprintln!("No se pudo emitir processes: {e}");
                    }
                    let memory_stats = read_memory(&sys);
                    if let Err(e) = handle.emit("memory", memory_stats) {
                        eprintln!("No se pudo emitir memory: {e}");
                    }
                    let network_stats = read_networks(&net, seconds);
                    if let Err(e) = handle.emit("networks", network_stats) {
                        eprintln!("No se pudo emitir networks: {e}");
                    }
                    std::thread::sleep(std::time::Duration::from_secs(1));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
