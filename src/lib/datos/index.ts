"use client";
import { almacenDemo, fuenteDemo } from "./demo";
import { almacenNube, fuenteNube } from "./nube";
import type { Almacen, FuenteTv } from "./tipos";

export * from "./tipos";

export const nubeConfigurada = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const CLAVE_MODO = "tvi-modo";

export function modoGuardado(): "demo" | "nube" {
  if (!nubeConfigurada()) return "demo";
  try {
    return localStorage.getItem(CLAVE_MODO) === "demo" ? "demo" : "nube";
  } catch {
    return "nube";
  }
}

export function usarModo(modo: "demo" | "nube") {
  try {
    if (modo === "demo") localStorage.setItem(CLAVE_MODO, "demo");
    else localStorage.removeItem(CLAVE_MODO);
  } catch {}
}

export const obtenerAlmacen = (): Almacen => (modoGuardado() === "demo" ? almacenDemo : almacenNube);
export const obtenerFuenteTv = (modo: "demo" | "nube"): FuenteTv => (modo === "demo" || !nubeConfigurada() ? fuenteDemo : fuenteNube);
