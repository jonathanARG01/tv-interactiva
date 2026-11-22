"use client";
// Miniatura en vivo de una diapositiva, con el mismo componente que usa la TV.
import { Escena, type Contexto } from "../tv/Escena";
import type { Categoria, Diapositiva, Llamado, Organizacion, Producto } from "@/lib/tipos";

export function Vista({
  d,
  org,
  categorias,
  productos,
  llamados = [],
  tema = "oscuro",
  vertical = false,
  className = "",
}: {
  d: Diapositiva;
  org: Organizacion;
  categorias: Categoria[];
  productos: Producto[];
  llamados?: Llamado[];
  tema?: "oscuro" | "claro";
  vertical?: boolean;
  className?: string;
}) {
  const ctx: Contexto = { org, categorias, productos, llamados, tema, vertical };
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-line bg-black ${className}`}
      style={{ aspectRatio: vertical ? "9 / 16" : "16 / 9", containerType: "size" }}
    >
      <Escena d={d} ctx={ctx} />
    </div>
  );
}
