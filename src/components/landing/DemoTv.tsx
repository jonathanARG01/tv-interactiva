"use client";
// TV de muestra en la portada: usa el mismo reproductor de escenas que las TVs reales.
import { useEffect, useMemo, useState } from "react";
import { CapaLlamado, Escena, type Contexto } from "../tv/Escena";
import { contenidoDeEjemplo } from "@/lib/rubros";
import type { Llamado, Organizacion, Rubro } from "@/lib/tipos";
import { cx } from "@/lib/util";

const OPCIONES: { rubro: Rubro; nombre: string; negocio: string; color: string }[] = [
  { rubro: "restaurante", nombre: "Restaurante", negocio: "La Picá de Don Lucho", color: "#f97316" },
  { rubro: "clinica", nombre: "Clínica", negocio: "Centro Médico Andes", color: "#0ea5e9" },
  { rubro: "turnos", nombre: "Turnos", negocio: "Notaría Central", color: "#6366f1" },
  { rubro: "retail", nombre: "Tienda", negocio: "Urbana Store", color: "#ec4899" },
];

const llamadosDe = (org: string): Llamado[] =>
  ["24", "23", "22", "21", "20"].map((t, i) => ({
    id: "l" + t,
    org_id: org,
    texto: t,
    destino: ["Box 2", "Box 1", "Caja 1", "Box 2", "Box 1"][i],
    creado: new Date(Date.now() - i * 120000).toISOString(),
  }));

export function DemoTv() {
  const [sel, setSel] = useState(0);
  const [i, setI] = useState(0);
  const [llamado, setLlamado] = useState<Llamado | null>(null);
  const op = OPCIONES[sel];

  const { ctx, diapositivas } = useMemo(() => {
    const id = "demo-" + op.rubro;
    const org: Organizacion = {
      id,
      nombre: op.negocio,
      rubro: op.rubro,
      plan: "pro",
      marca: { color: op.color, logo: null },
      moneda: "CLP",
      zona_horaria: "America/Santiago",
      canal: "",
      turno_actual: 24,
      creado: "",
    };
    const s = contenidoDeEjemplo(id, op.rubro, op.negocio);
    const ctx: Contexto = { org, categorias: s.categorias, productos: s.productos, llamados: llamadosDe(id), tema: "oscuro", vertical: false };
    return { ctx, diapositivas: s.diapositivas.map((d) => ({ ...d, horario: null })) };
  }, [op]);

  useEffect(() => {
    setI(0);
    setLlamado(null);
  }, [sel]);

  useEffect(() => {
    const t = setInterval(() => setI((x) => x + 1), 4200);
    return () => clearInterval(t);
  }, [sel]);

  // En clínica y turnos, simula un llamado de vez en cuando.
  useEffect(() => {
    if (op.rubro !== "clinica" && op.rubro !== "turnos") return;
    const t = setTimeout(() => setLlamado({ ...ctx.llamados[0], id: "x", texto: "25", destino: "Box 3" }), 6500);
    return () => clearTimeout(t);
  }, [op.rubro, ctx.llamados, sel]);

  useEffect(() => {
    if (!llamado) return;
    const t = setTimeout(() => setLlamado(null), 3800);
    return () => clearTimeout(t);
  }, [llamado]);

  const d = diapositivas[i % diapositivas.length];

  return (
    <div>
      <div className="relative mx-auto">
        <div className="rounded-[18px] bg-[#0b0b0f] p-[1.4%] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)] ring-1 ring-white/10">
          <div className="relative overflow-hidden rounded-[10px]" style={{ aspectRatio: "16 / 9", containerType: "size" }}>
            <Escena key={op.rubro + i} d={d} ctx={ctx} />
            {llamado && <CapaLlamado l={llamado} ctx={ctx} />}
          </div>
        </div>
        <div className="mx-auto h-5 w-[18%] bg-gradient-to-b from-[#1a1a20] to-[#0b0b0f] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
        <div className="mx-auto h-1.5 w-[34%] rounded-full bg-[#1a1a20]" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Ver ejemplo por rubro">
        {OPCIONES.map((o, k) => (
          <button
            key={o.rubro}
            role="tab"
            aria-selected={sel === k}
            onClick={() => setSel(k)}
            className={cx("chip h-9 px-4 text-sm border transition", sel === k ? "bg-ink text-bg border-ink" : "border-line text-muted hover:text-ink bg-surface")}
          >
            {o.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
