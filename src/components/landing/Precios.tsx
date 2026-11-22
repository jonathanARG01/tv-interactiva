"use client";
import Link from "next/link";
import { useState } from "react";
import { DESCUENTO_ANUAL, PLANES } from "@/lib/planes";
import { cx, formatearPrecio } from "@/lib/util";
import { Icono } from "../ui/Icono";

export function Precios() {
  const [anual, setAnual] = useState(false);
  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
          {[false, true].map((a) => (
            <button
              key={String(a)}
              onClick={() => setAnual(a)}
              className={cx("rounded-full h-9 px-4 text-sm font-semibold transition", anual === a ? "bg-ink text-bg" : "text-muted")}
            >
              {a ? `Anual · ${Math.round(DESCUENTO_ANUAL * 100)}% menos` : "Mensual"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANES.map((p) => {
          const mensual = anual ? Math.round(p.precio * (1 - DESCUENTO_ANUAL)) : p.precio;
          return (
            <div
              key={p.id}
              className={cx("relative flex flex-col rounded-3xl border p-6", p.destacado ? "border-accent bg-surface shadow-card ring-4 ring-accent/10" : "border-line bg-surface")}
            >
              {p.destacado && <span className="chip absolute -top-3 left-6 bg-accent text-accent-ink">Más elegido</span>}
              <div className="font-display text-xl font-extrabold">{p.nombre}</div>
              <div className="text-sm text-muted">{p.resumen}</div>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-extrabold tracking-tight">{p.precio ? formatearPrecio(mensual) : "Gratis"}</span>
                {p.precio > 0 && <span className="pb-1.5 text-sm text-muted">/mes + IVA</span>}
              </div>
              {anual && p.precio > 0 && <div className="text-xs text-muted">{formatearPrecio(mensual * 12)} al año</div>}
              <ul className="mt-6 flex flex-col gap-2.5 text-sm">
                {p.incluye.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Icono nombre="check" className="size-4 mt-0.5 shrink-0 text-accent" grosor={2.6} />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link href={p.precio ? "/entrar?registro=1" : "/demo"} className={cx("w-full", p.destacado ? "btn-primario" : "btn-secundario")}>
                  {p.precio ? "Probar 14 días gratis" : "Empezar gratis"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya usas Platovi? Pronto tendrás un descuento por usar ambos y tus platos aparecerán solos en la TV.
      </p>
    </div>
  );
}
