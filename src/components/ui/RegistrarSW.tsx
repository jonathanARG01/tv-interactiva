"use client";
import { useEffect } from "react";

// Registra el service worker: permite instalar la app en el escritorio y que la TV funcione sin internet.
export function RegistrarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
