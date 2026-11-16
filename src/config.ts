/**
 * Fuente de datos del dashboard.
 *
 * true  -> datos inventados que se mueven solos (etapa 3: diseño sin Rust).
 * false -> el frontend escucha los eventos que emite Rust (etapa 4+):
 *          "cpu", "memory", "network" y "processes".
 */
export const USE_MOCK: boolean = false;
