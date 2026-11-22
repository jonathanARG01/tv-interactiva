"use client";
import { useEffect, useState } from "react";
import { Icono } from "./Icono";

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Botón "Instalar app" (Chrome y Edge en escritorio y Android). Se oculta si ya está instalada o el navegador no lo permite.
export function BotonInstalar({ className = "btn-secundario", texto = "Instalar app" }: { className?: string; texto?: string }) {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  useEffect(() => {
    const f = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    window.addEventListener("beforeinstallprompt", f);
    window.addEventListener("appinstalled", () => setEvento(null));
    return () => window.removeEventListener("beforeinstallprompt", f);
  }, []);
  if (!evento) return null;
  return (
    <button
      className={className}
      onClick={async () => {
        await evento.prompt();
        await evento.userChoice;
        setEvento(null);
      }}
    >
      <Icono nombre="descarga" /> {texto}
    </button>
  );
}
