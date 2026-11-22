"use client";
import { useEffect, useState } from "react";
import { Reproductor } from "@/components/tv/Reproductor";
import { nubeConfigurada } from "@/lib/datos";

const CLAVE = "tvi-tv-modo";

// /tv?demo=1 abre la TV de la demo (lee lo que armes en el panel de demo en este mismo navegador).
export function PaginaTv() {
  const [modo, setModo] = useState<"demo" | "nube" | null>(null);
  useEffect(() => {
    let m: "demo" | "nube" = "nube";
    try {
      const q = new URLSearchParams(location.search).get("demo");
      if (q === "1") localStorage.setItem(CLAVE, "demo");
      if (q === "0") localStorage.removeItem(CLAVE);
      m = localStorage.getItem(CLAVE) === "demo" ? "demo" : "nube";
    } catch {}
    if (!nubeConfigurada()) m = "demo";
    setModo(m);
  }, []);
  if (!modo) return <main className="fixed inset-0 bg-[#07080c]" />;
  return <Reproductor modo={modo} />;
}
