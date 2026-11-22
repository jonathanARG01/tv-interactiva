"use client";
import Link from "next/link";
import { usePanel, useTabla } from "@/components/panel/Contexto";
import { Encabezado } from "@/components/panel/MarcoPanel";
import { Vista } from "@/components/panel/Vista";
import { Icono } from "@/components/ui/Icono";
import { enLinea } from "@/lib/util";
import { infoRubro } from "@/lib/rubros";

export default function Inicio() {
  const { org, almacen } = usePanel();
  const pantallas = useTabla("pantallas");
  const diapositivas = useTabla("diapositivas");
  const categorias = useTabla("categorias");
  const productos = useTabla("productos");
  const llamados = useTabla("llamados");
  if (!org) return null;
  const rubro = infoRubro(org.rubro);
  const conectadas = pantallas.filas.filter((p) => enLinea(p.ultimo_contacto)).length;
  const primera = diapositivas.filas.find((d) => d.activa);
  const urlTv = almacen.modo === "demo" ? "/tv?demo=1" : "/tv";

  const pasos = [
    { hecho: true, titulo: "Crea tu cuenta", texto: "Listo." },
    {
      hecho: pantallas.filas.length > 0,
      titulo: "Vincula tu primera pantalla",
      texto: "Abre el reproductor en la TV y escribe el código que aparece.",
      href: "/panel/pantallas",
    },
    { hecho: diapositivas.filas.length > 3, titulo: "Arma tu contenido", texto: "Cambia los textos de ejemplo por los tuyos.", href: "/panel/contenido" },
    { hecho: productos.filas.length > 0, titulo: `Revisa la sección ${rubro.catalogo}`, texto: "Precios y descripciones se actualizan solos en la TV.", href: "/panel/catalogo" },
  ];

  return (
    <>
      <Encabezado
        titulo={`Hola, ${org.nombre}`}
        descripcion="Desde aquí controlas lo que se ve en todas tus pantallas. Cada cambio llega a la TV en segundos."
        accion={
          <a href={urlTv} target="_blank" className="btn-primario">
            <Icono nombre="tv" /> Abrir reproductor
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Dato titulo="Pantallas" valor={pantallas.filas.length} detalle={`${conectadas} conectadas ahora`} href="/panel/pantallas" />
        <Dato titulo="Diapositivas" valor={diapositivas.filas.filter((d) => d.activa).length} detalle="activas" href="/panel/contenido" />
        <Dato titulo={rubro.catalogo} valor={productos.filas.length} detalle={`en ${categorias.filas.length} categorías`} href="/panel/catalogo" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="tarjeta p-5">
          <h2 className="font-bold">Primeros pasos</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {pasos.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    p.hecho ? "bg-ok text-white" : "border border-line text-muted"
                  }`}
                >
                  {p.hecho ? <Icono nombre="check" className="size-3.5" grosor={3} /> : i + 1}
                </span>
                <div className="min-w-0">
                  {p.href && !p.hecho ? (
                    <Link href={p.href} className="text-sm font-bold hover:text-accent">
                      {p.titulo} →
                    </Link>
                  ) : (
                    <div className={`text-sm font-bold ${p.hecho ? "text-muted line-through" : ""}`}>{p.titulo}</div>
                  )}
                  <div className="text-xs text-muted">{p.texto}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="tarjeta p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Así se ve tu pantalla</h2>
            <Link href="/panel/contenido" className="text-xs font-semibold text-accent">
              Editar
            </Link>
          </div>
          {primera ? (
            <Vista d={primera} org={org} categorias={categorias.filas} productos={productos.filas} llamados={llamados.filas} className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-muted">Aún no tienes diapositivas.</p>
          )}
        </section>
      </div>

      <section className="tarjeta mt-6 p-5 flex flex-wrap items-center gap-4">
        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icono nombre="enlace" />
        </span>
        <div className="flex-1 min-w-[220px]">
          <div className="font-bold">¿Usas Platovi?</div>
          <div className="text-sm text-muted">Pronto podrás conectar tu carta de Platovi y mostrar los mismos platos y precios en tus TVs, sin cargarlos dos veces.</div>
        </div>
        <span className="chip bg-surface-2 text-muted">Próximamente</span>
      </section>
    </>
  );
}

function Dato({ titulo, valor, detalle, href }: { titulo: string; valor: number; detalle: string; href: string }) {
  return (
    <Link href={href} className="tarjeta p-5 hover:border-accent/50 transition">
      <div className="text-xs font-semibold text-muted">{titulo}</div>
      <div className="mt-1 font-display text-3xl font-extrabold">{valor}</div>
      <div className="text-xs text-muted">{detalle}</div>
    </Link>
  );
}
