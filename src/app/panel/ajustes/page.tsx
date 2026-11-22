"use client";
import { useState } from "react";
import { usePanel } from "@/components/panel/Contexto";
import { Encabezado } from "@/components/panel/MarcoPanel";
import { SubirArchivo } from "@/components/panel/SubirArchivo";
import { Icono } from "@/components/ui/Icono";
import { RUBROS } from "@/lib/rubros";
import { PLANES, planPorId } from "@/lib/planes";
import type { Rubro } from "@/lib/tipos";
import { cx, formatearPrecio } from "@/lib/util";
import { reiniciarDemo } from "@/lib/datos/demo";

const COLORES = ["#6366f1", "#0ea5e9", "#14b8a6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#ec4899", "#a855f7", "#111827"];

export default function Ajustes() {
  const { almacen, org, recargarOrg, avisar } = usePanel();
  const [nombre, setNombre] = useState(org?.nombre ?? "");
  if (!org) return null;
  const plan = planPorId(org.plan);

  const guardar = async (cambios: Parameters<typeof almacen.actualizarOrg>[0]) => {
    try {
      await almacen.actualizarOrg(cambios);
      await recargarOrg();
      avisar("Guardado. Las pantallas ya se actualizaron.");
    } catch (e) {
      avisar((e as Error).message, "error");
    }
  };

  return (
    <>
      <Encabezado titulo="Ajustes" descripcion="Datos de tu negocio y cómo se ve tu marca en las pantallas." />
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <section className="tarjeta p-5 flex flex-col gap-4">
          <h2 className="font-bold">Negocio</h2>
          <div>
            <label className="etiqueta" htmlFor="a-nombre">
              Nombre (aparece en la barra de las pantallas)
            </label>
            <input id="a-nombre" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => nombre.trim() && nombre !== org.nombre && guardar({ nombre: nombre.trim() })} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="a-rubro">
              Rubro
            </label>
            <select id="a-rubro" className="campo" value={org.rubro} onChange={(e) => guardar({ rubro: e.target.value as Rubro })}>
              {RUBROS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="etiqueta" htmlFor="a-moneda">
                Moneda
              </label>
              <select id="a-moneda" className="campo" value={org.moneda} onChange={(e) => guardar({ moneda: e.target.value })}>
                {["CLP", "USD", "ARS", "PEN", "COP", "MXN", "UYU", "BRL", "EUR"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="etiqueta" htmlFor="a-zona">
                Zona horaria
              </label>
              <select id="a-zona" className="campo" value={org.zona_horaria} onChange={(e) => guardar({ zona_horaria: e.target.value })}>
                {["America/Santiago", "Pacific/Easter", "America/Punta_Arenas", "America/Argentina/Buenos_Aires", "America/Lima", "America/Bogota", "America/Mexico_City", "America/Montevideo", "America/Sao_Paulo", "Europe/Madrid"].map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="tarjeta p-5 flex flex-col gap-4">
          <h2 className="font-bold">Marca</h2>
          <div>
            <div className="etiqueta">Color principal</div>
            <div className="flex flex-wrap items-center gap-2">
              {COLORES.map((c) => (
                <button
                  key={c}
                  className={cx("size-9 rounded-full border-2 transition", org.marca.color === c ? "border-ink scale-110" : "border-transparent")}
                  style={{ background: c }}
                  onClick={() => guardar({ marca: { ...org.marca, color: c } })}
                  aria-label={`Color ${c}`}
                />
              ))}
              <input
                type="color"
                value={org.marca.color}
                onChange={(e) => guardar({ marca: { ...org.marca, color: e.target.value } })}
                className="size-9 rounded-full overflow-hidden cursor-pointer border border-line"
                aria-label="Otro color"
              />
            </div>
          </div>
          <div>
            <div className="etiqueta">Logo</div>
            <div className="flex items-center gap-3">
              {org.marca.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.marca.logo} alt="" className="h-14 max-w-40 object-contain rounded-lg bg-surface-2 p-1" />
              ) : (
                <div className="grid h-14 w-20 place-items-center rounded-lg bg-surface-2 text-muted">
                  <Icono nombre="imagen" />
                </div>
              )}
              {plan.marca ? (
                <>
                  <SubirArchivo acepta="image/png,image/svg+xml,image/webp,image/jpeg" texto={org.marca.logo ? "Cambiar" : "Subir logo"} alSubir={(logo) => guardar({ marca: { ...org.marca, logo } })} />
                  {org.marca.logo && (
                    <button className="btn-fantasma" onClick={() => guardar({ marca: { ...org.marca, logo: null } })}>
                      Quitar
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted">Tu logo en pantalla está en el plan Pro.</span>
              )}
            </div>
          </div>
        </section>

        <section className="tarjeta p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Plan</h2>
            <span className="chip bg-accent-soft text-accent">Plan actual: {plan.nombre}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PLANES.map((p) => (
              <div key={p.id} className={cx("rounded-xl border p-4", p.id === org.plan ? "border-accent bg-accent-soft/40" : "border-line")}>
                <div className="font-bold">{p.nombre}</div>
                <div className="font-display text-2xl font-extrabold mt-1">
                  {p.precio ? formatearPrecio(p.precio) : "Gratis"}
                  {p.precio > 0 && <span className="text-xs font-semibold text-muted"> /mes + IVA</span>}
                </div>
                <div className="text-xs text-muted mt-1">
                  {p.pantallas} {p.pantallas === 1 ? "pantalla" : "pantallas"} · {p.diapositivas} diapositivas
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Para cambiar de plan, escríbenos. El pago en línea llegará pronto.</p>
        </section>

        {almacen.modo === "demo" && (
          <section className="tarjeta p-5 lg:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Demo</h2>
              <p className="text-sm text-muted">Borra todo lo de la demo y empieza de nuevo con otro rubro.</p>
            </div>
            <button
              className="btn-peligro"
              onClick={() => {
                if (confirm("¿Borrar la demo?")) {
                  reiniciarDemo();
                  location.href = "/panel";
                }
              }}
            >
              <Icono nombre="repetir" /> Reiniciar demo
            </button>
          </section>
        )}
      </div>
    </>
  );
}
