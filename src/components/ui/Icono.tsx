// Íconos de trazo (24x24), sin dependencias.
const RUTAS: Record<string, string> = {
  sol: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z",
  luna: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  tv: "M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm4 15h8",
  capas: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5",
  lista: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  campana: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a2 2 0 0 0 3.4 0",
  ajustes:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  inicio: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z",
  mas: "M12 5v14M5 12h14",
  basura: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  lapiz: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
  ojo: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  ojoNo: "m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.3 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6",
  arriba: "m6 15 6-6 6 6",
  abajo: "m6 9 6 6 6-6",
  reloj: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  imagen: "M4 5h16v14H4zM4 15l4-4 5 5m-2-2 3-3 6 6M15 9h.01",
  video: "M4 6h11v12H4zM15 10l5-3v10l-5-3",
  texto: "M5 6V4h14v2M12 4v16m-3 0h6",
  menu: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  turnos: "M4 8h16M4 16h16M8 4v16M16 4v16",
  bienvenida: "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z",
  check: "m5 12 5 5L20 7",
  x: "M6 6l12 12M18 6 6 18",
  enlace: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  salir: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
  wifiNo: "m2 2 20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.7M19 12.9a10 10 0 0 0-1.7-1.2M2 9a15 15 0 0 1 4.5-2.8M22 9a15 15 0 0 0-11.6-3.9M12 20h.01",
  volumen: "M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13",
  pantallaCompleta: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  rayo: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  escudo: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z",
  calendario: "M4 6h16v15H4zM4 10h16M8 3v4m8-4v4",
  telefono: "M7 3h10v18H7zM11 18h2",
  mundo: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  descarga: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  flecha: "M5 12h14m-6-6 6 6-6 6",
  estrella: "m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9L12 3Z",
  copiar: "M9 9h11v11H9zM5 15H4V4h11v1",
  repetir: "M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5m5 3a8 8 0 0 1-14 5.3L4 15m0 5v-5h5",
  usuario: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0",
  arrastrar: "M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01",
  platovi: "M5 4h14v16H5zM9 8h6M9 12h6M9 16h3",
};

export type NombreIcono = keyof typeof RUTAS;

export function Icono({ nombre, className = "size-[18px]", grosor = 1.8 }: { nombre: NombreIcono | string; className?: string; grosor?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={RUTAS[nombre] ?? RUTAS.tv} />
    </svg>
  );
}
