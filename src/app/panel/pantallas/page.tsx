"use client";
import { useEffect, useState } from "react";
import { usePanel, useTabla } from "@/components/panel/Contexto";
import { Encabezado } from "@/components/panel/MarcoPanel";
import { Icono } from "@/components/ui/Icono";
import type { Pantalla } from "@/lib/tipos";
import { cx, enLinea, haceCuanto } from "@/lib/util";
import { planPorId } from "@/lib/planes";

export default function Pantallas() {
  const { almacen, org, avisar } = usePanel();
  const pantallas = useTabla("pantallas");
  const listas = useTabla("listas");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [lista, setLista] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [, setTic] = useState(0);

  useEffect(() => {
    const c = new URLSearchParams(location.search).get("codigo");
    if (c) setCodigo(c.toUpperCase());
    // Refresca el estado "conectada" cada 20 s.
    const t = setInterval(() => {
      pantallas.recargar();
      setTic((x) => x + 1);
    }, 20_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lista && listas.filas[0]) setLista(listas.filas[0].id);
  }, [listas.filas, lista]);

  if (!org) return null;
  const plan = planPorId(org.plan);
  const urlTv = typeof location !== "undefined" ? `${location.origin}/tv${almacen.modo === "demo" ? "?demo=1" : ""}` : "/tv";

  const vincular = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await almacen.vincularPantalla(codigo, nombre || `Pantalla ${pantallas.filas.length + 1}`, lista || null);
      setCodigo("");
      setNombre("");
      avisar("Pantalla vinculada. En unos segundos mostrará tu contenido.");
      pantallas.recargar();
      history.replaceState(null, "", "/panel/pantallas");
    } catch (err) {
      avisar((err as Error).message, "error");
    } finally {
      setEnviando(false);
    }
  };

  const cambiar = (p: Pantalla, cambios: Partial<Pantalla>) => pantallas.guardar({ ...p, ...cambios });

  return (
    <>
      <Encabezado
        titulo="Pantallas"
        descripcion={`Tu plan ${plan.nombre} permite ${plan.pantallas} ${plan.pantallas === 1 ? "pantalla" : "pantallas"}. Cada TV puede mostrar una lista distinta.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px] items-start">
        <div className="flex flex-col gap-3">
          {pantallas.filas.map((p) => {
            const online = enLinea(p.ultimo_contacto);
            return (
              <div key={p.id} className="tarjeta p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cx("grid size-10 place-items-center rounded-xl", online ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted")}>
                    <Icono nombre="tv" />
                  </span>
                  <input
                    className="font-bold bg-transparent text-base min-w-0 flex-1 rounded-lg px-1 -mx-1 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
                    defaultValue={p.nombre}
                    aria-label="Nombre de la pantalla"
                    onBlur={(e) => e.target.value.trim() && e.target.value !== p.nombre && cambiar(p, { nombre: e.target.value.trim() })}
                  />
                  <span className={cx("chip", online ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted")}>
                    <span className={cx("size-1.5 rounded-full", online ? "bg-ok" : "bg-muted")} />
                    {online ? "Conectada" : `Última vez: ${haceCuanto(p.ultimo_contacto).toLowerCase()}`}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="etiqueta">Muestra la lista</label>
                    <select className="campo" value={p.lista_id ?? ""} onChange={(e) => cambiar(p, { lista_id: e.target.value || null })}>
                      <option value="">Ninguna</option>
                      {listas.filas.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="etiqueta">Orientación</label>
                    <select className="campo" value={p.orientacion} onChange={(e) => cambiar(p, { orientacion: e.target.value as Pantalla["orientacion"] })}>
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                  <div>
                    <label className="etiqueta">Colores</label>
                    <select className="campo" value={p.tema} onChange={(e) => cambiar(p, { tema: e.target.value as Pantalla["tema"] })}>
                      <option value="oscuro">Oscuros</option>
                      <option value="claro">Claros</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={p.llamador} onChange={(e) => cambiar(p, { llamador: e.target.checked })} />
                    Mostrar los llamados de turno encima del contenido
                  </label>
                  <button
                    className="btn-peligro h-9"
                    onClick={() => {
                      if (confirm(`¿Desvincular "${p.nombre}"? La TV volverá a mostrar un código.`)) pantallas.borrar(p.id);
                    }}
                  >
                    <Icono nombre="basura" /> Desvincular
                  </button>
                </div>
              </div>
            );
          })}
          {!pantallas.cargando && pantallas.filas.length === 0 && (
            <div className="tarjeta p-8 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                <Icono nombre="tv" className="size-6" />
              </div>
              <h2 className="mt-3 font-bold">Aún no tienes pantallas</h2>
              <p className="mt-1 text-sm text-muted">Sigue los pasos de la derecha para vincular tu primera TV.</p>
            </div>
          )}
        </div>

        <form onSubmit={vincular} className="tarjeta p-5 lg:sticky lg:top-6">
          <h2 className="font-bold">Vincular una pantalla</h2>
          <ol className="mt-3 text-sm text-muted flex flex-col gap-2 list-decimal pl-4">
            <li>
              En la TV, abre el navegador (o instala la app) y entra a:
              <button
                type="button"
                className="mt-1 flex w-full items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-ink"
                onClick={() => {
                  navigator.clipboard?.writeText(urlTv);
                  avisar("Dirección copiada");
                }}
              >
                <span className="truncate">{urlTv}</span>
                <Icono nombre="copiar" className="size-4 shrink-0" />
              </button>
            </li>
            <li>Escribe aquí el código que aparece en la TV, o escanea su QR con el celular.</li>
          </ol>
          <label className="etiqueta mt-4" htmlFor="codigo">
            Código de la TV
          </label>
          <input
            id="codigo"
            className="campo font-mono text-lg tracking-[0.3em] uppercase h-12"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            placeholder="ABC234"
            required
            minLength={6}
          />
          <label className="etiqueta mt-3" htmlFor="nombre-p">
            Nombre
          </label>
          <input id="nombre-p" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: TV del mostrador" />
          <label className="etiqueta mt-3" htmlFor="lista-p">
            Mostrar
          </label>
          <select id="lista-p" className="campo" value={lista} onChange={(e) => setLista(e.target.value)}>
            {listas.filas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
          <button className="btn-primario mt-4 w-full" disabled={enviando || codigo.length < 6}>
            <Icono nombre="enlace" /> {enviando ? "Vinculando…" : "Vincular"}
          </button>
        </form>
      </div>
    </>
  );
}
