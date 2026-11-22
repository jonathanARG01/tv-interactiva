"use client";
import { useEffect, useState } from "react";
import { usePanel, useTabla } from "@/components/panel/Contexto";
import { Encabezado } from "@/components/panel/MarcoPanel";
import { Icono } from "@/components/ui/Icono";
import type { Llamado } from "@/lib/tipos";
import { cx } from "@/lib/util";

const CLAVE_DESTINOS = "tvi-destinos";
const CLAVE_DESTINO = "tvi-destino-actual";

// Pantalla de operación: se deja abierta en el computador o celular de quien atiende.
export default function Llamador() {
  const { almacen, org, recargarOrg, avisar } = usePanel();
  const llamados = useTabla("llamados");
  const pantallas = useTabla("pantallas");
  const [destinos, setDestinos] = useState<string[]>(["Box 1", "Box 2", "Caja 1"]);
  const [destino, setDestino] = useState("Box 1");
  const [nombre, setNombre] = useState("");
  const [nuevoDestino, setNuevoDestino] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE_DESTINOS) || "null");
      if (Array.isArray(d) && d.length) setDestinos(d);
      const a = localStorage.getItem(CLAVE_DESTINO);
      if (a) setDestino(a);
    } catch {}
  }, []);

  const guardarDestinos = (d: string[]) => {
    setDestinos(d);
    try {
      localStorage.setItem(CLAVE_DESTINOS, JSON.stringify(d));
    } catch {}
  };
  const elegir = (d: string) => {
    setDestino(d);
    try {
      localStorage.setItem(CLAVE_DESTINO, d);
    } catch {}
  };

  if (!org) return null;
  const pantallasConLlamador = pantallas.filas.filter((p) => p.llamador).length;

  const llamar = async (texto?: string, dest = destino) => {
    setEnviando(true);
    try {
      const l = await almacen.llamar({ texto, destino: dest });
      llamados.setFilas((f) => [l, ...f]);
      setNombre("");
      if (!texto) recargarOrg();
    } catch (e) {
      avisar((e as Error).message, "error");
    } finally {
      setEnviando(false);
    }
  };

  const ultimo = llamados.filas[0];

  return (
    <>
      <Encabezado
        titulo="Llamador"
        descripcion={`Llama números o nombres y aparecen al instante en ${pantallasConLlamador} ${pantallasConLlamador === 1 ? "pantalla" : "pantallas"} con voz y sonido. Deja esta página abierta en el computador o celular de quien atiende.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] items-start">
        <section className="tarjeta p-5 sm:p-6">
          <div className="etiqueta">Atiendes en</div>
          <div className="flex flex-wrap gap-2">
            {destinos.map((d) => (
              <span key={d} className="group relative">
                <button
                  className={cx("chip h-9 px-4 text-sm border", destino === d ? "bg-accent text-accent-ink border-accent" : "border-line hover:bg-surface-2")}
                  onClick={() => elegir(d)}
                >
                  {d}
                </button>
                <button
                  className="absolute -right-1.5 -top-1.5 hidden group-hover:grid size-5 place-items-center rounded-full bg-ink text-bg"
                  onClick={() => guardarDestinos(destinos.filter((x) => x !== d))}
                  aria-label={`Quitar ${d}`}
                >
                  <Icono nombre="x" className="size-3" grosor={3} />
                </button>
              </span>
            ))}
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                const v = nuevoDestino.trim();
                if (v && !destinos.includes(v)) guardarDestinos([...destinos, v]);
                if (v) elegir(v);
                setNuevoDestino("");
              }}
            >
              <input className="campo !h-9 w-36" placeholder="Agregar (Box 3…)" value={nuevoDestino} onChange={(e) => setNuevoDestino(e.target.value)} />
            </form>
          </div>

          <button
            className="btn-primario mt-6 w-full !h-auto py-6 flex-col !gap-1 !rounded-2xl text-lg"
            onClick={() => llamar()}
            disabled={enviando}
          >
            <span className="text-sm font-semibold opacity-80">Llamar siguiente número</span>
            <span className="font-display text-5xl font-extrabold tabular-nums">{org.turno_actual + 1}</span>
            <span className="text-sm font-semibold opacity-80">a {destino}</span>
          </button>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (nombre.trim()) llamar(nombre.trim());
            }}
          >
            <input className="campo !h-11" placeholder="O llama por nombre o código (Ej: María González, A-15)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <button className="btn-secundario !h-11" disabled={enviando || !nombre.trim()}>
              <Icono nombre="campana" /> Llamar
            </button>
          </form>

          {ultimo && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 p-4">
              <div>
                <div className="text-xs font-semibold text-muted">Último llamado</div>
                <div className="font-display text-2xl font-extrabold">
                  {ultimo.texto} <span className="text-base font-semibold text-muted">· {ultimo.destino}</span>
                </div>
              </div>
              <button className="btn-secundario" onClick={() => llamar(ultimo.texto, ultimo.destino)} disabled={enviando}>
                <Icono nombre="repetir" /> Repetir
              </button>
            </div>
          )}
          {pantallasConLlamador === 0 && (
            <p className="mt-4 text-xs text-warn">Ninguna pantalla tiene activado el llamador. Actívalo en Pantallas.</p>
          )}
        </section>

        <section className="tarjeta p-5">
          <h2 className="font-bold">Historial de hoy</h2>
          <ul className="mt-3 divide-y divide-line">
            {llamados.filas.slice(0, 15).map((l: Llamado) => (
              <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-bold tabular-nums">{l.texto}</span>
                <span className="text-muted">{l.destino}</span>
                <span className="text-xs text-muted tabular-nums">
                  {new Date(l.creado).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
            {llamados.filas.length === 0 && <li className="py-6 text-center text-sm text-muted">Aún no hay llamados.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
