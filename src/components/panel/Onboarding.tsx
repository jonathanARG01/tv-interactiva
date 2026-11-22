"use client";
import { useState } from "react";
import { usePanel } from "./Contexto";
import { RUBROS } from "@/lib/rubros";
import type { Rubro } from "@/lib/tipos";
import { Logo } from "../ui/Logo";
import { TemaToggle } from "../ui/TemaToggle";
import { cx } from "@/lib/util";

export function Onboarding() {
  const { almacen, recargarOrg, avisar } = usePanel();
  const [nombre, setNombre] = useState(almacen.modo === "demo" ? "Mi negocio" : "");
  const [rubro, setRubro] = useState<Rubro>("restaurante");
  const [enviando, setEnviando] = useState(false);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setEnviando(true);
    try {
      await almacen.crearOrg(nombre.trim(), rubro);
      await recargarOrg();
    } catch (err) {
      avisar((err as Error).message, "error");
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-dvh px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Logo />
          <TemaToggle />
        </div>
        <form onSubmit={crear} className="tarjeta mt-8 p-6 sm:p-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Cuéntanos de tu negocio</h1>
          <p className="mt-1 text-sm text-muted">Con esto armamos tu primera pantalla con contenido de ejemplo. Puedes cambiar todo después.</p>
          <label className="etiqueta mt-6" htmlFor="nombre">
            Nombre del negocio
          </label>
          <input id="nombre" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Clínica Los Andes" autoFocus required />
          <div className="etiqueta mt-6">¿Para qué usarás las pantallas?</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {RUBROS.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setRubro(r.id)}
                className={cx(
                  "text-left rounded-xl border p-3 transition",
                  rubro === r.id ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2",
                )}
                aria-pressed={rubro === r.id}
              >
                <div className="text-sm font-bold">{r.nombre}</div>
                <div className="text-xs text-muted mt-0.5">{r.descripcion}</div>
              </button>
            ))}
          </div>
          <button className="btn-primario mt-6 w-full sm:w-auto" disabled={enviando}>
            {enviando ? "Creando…" : "Crear mi pantalla"}
          </button>
        </form>
      </div>
    </div>
  );
}
