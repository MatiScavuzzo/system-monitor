# System Monitor

Monitor del sistema de escritorio hecho con **Tauri 2**, **React** y **Rust**. Muestra en tiempo real el uso de CPU, memoria, red y procesos.

> [!WARNING]
> **Versión temprana (0.1.0).** La app funciona, pero está incompleta: le faltan funcionalidades y solo se probó en Linux. Mirá la sección [Pendiente](#pendiente).

## Qué muestra

- **CPU:** uso total, frecuencia promedio y temperatura del paquete, con historial de los últimos 60 segundos.
- **Hilos:** uso y temperatura de cada hilo. Al pasar el mouse se ve la frecuencia en MHz.
- **Memoria:** usada, en caché y libre, más el uso de swap.
- **Red:** tráfico de subida y bajada por interfaz, con historial separado para cada una.
- **Procesos:** una tabla que se puede ordenar y filtrar por nombre o PID, y un panel con el detalle del proceso elegido.
- **Avisos:** un registro que anota cuándo la CPU, la temperatura, la memoria o la swap cruzan un umbral y cuándo vuelven a la normalidad.

## Cómo funciona

El backend en Rust usa [`sysinfo`](https://crates.io/crates/sysinfo) para leer las métricas en un hilo aparte. Cada segundo emite cuatro eventos de Tauri (`cpu`, `memory`, `networks` y `processes`), y la interfaz en React los escucha y actualiza los paneles.

```
src/              interfaz en React + TypeScript (Vite, Tailwind CSS)
  components/     paneles y gráficos
  hooks/          suscripción a eventos, historiales y avisos
  mock/           datos simulados para trabajar sin backend
src-tauri/        backend en Rust
  src/lib.rs      bucle que lee las métricas y emite los eventos
  src/metrics.rs  lectura de CPU, memoria, red y procesos
```

## Requisitos

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install), versión estable
- Las [dependencias de sistema de Tauri](https://tauri.app/start/prerequisites/) para tu plataforma

## Uso

```sh
bun install
bun run tauri dev      # abre la app en modo desarrollo
bun run tauri build    # genera el instalador en src-tauri/target/release/bundle
```

Para trabajar solo en la interfaz, sin el backend, poné `USE_MOCK = true` en `src/config.ts` y corré `bun run dev`. Los paneles muestran datos simulados que cambian solos.

## Pendiente

Funcionalidades que todavía faltan o están a medias:

- **Terminar procesos:** el botón "Terminar proceso" está en la interfaz, pero el backend todavía no implementa el comando `kill_process`, así que hoy devuelve un error.
- **Soporte para otros sistemas:** varias lecturas dependen de Linux (la topología de núcleos y la detección de interfaces físicas usan `/sys`). La temperatura por núcleo busca los sensores `Package` y `Core N`, como los que expone `coretemp` en procesadores Intel. En otros equipos puede mostrar la temperatura del paquete o 0 °C. No se probó en Windows ni en macOS.
- **Configuración:** el intervalo de actualización (1 s) y los umbrales de los avisos están fijos en el código.
- **Historial:** solo se guardan los últimos 60 segundos en memoria. No hay historial persistente ni exportación.
- **Métricas de disco y GPU:** todavía no se muestran.
