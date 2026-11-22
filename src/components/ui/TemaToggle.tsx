"use client";
import { useEffect, useState } from "react";
import { Icono } from "./Icono";
import { cx } from "@/lib/util";

type Tema = "claro" | "oscuro";

export function TemaToggle({ className }: { className?: string }) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema((document.documentElement.dataset.theme as Tema) || "claro");
  }, []);

  const cambiar = () => {
    const nuevo: Tema = tema === "oscuro" ? "claro" : "oscuro";
    document.documentElement.dataset.theme = nuevo;
    try {
      localStorage.setItem("tvi-tema", nuevo);
    } catch {}
    setTema(nuevo);
  };

  return (
    <button
      type="button"
      onClick={cambiar}
      className={cx("btn-fantasma !px-0 w-10", className)}
      aria-label={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={tema === "oscuro" ? "Modo claro" : "Modo oscuro"}
    >
      <Icono nombre={tema === "oscuro" ? "sol" : "luna"} />
    </button>
  );
}
