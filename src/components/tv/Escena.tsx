"use client";
// Dibuja una diapositiva. Lo usa la TV y también la vista previa del panel, así lo que ves es lo que sale.
// Todo se mide en unidades de contenedor (cqw/cqh), por eso escala igual en una TV 4K y en una miniatura.
import { useEffect, useState } from "react";
import type {
  DatosAviso,
  DatosBienvenida,
  DatosImagen,
  DatosMenu,
  DatosTurnos,
  DatosVideo,
  Diapositiva,
  Llamado,
  PaqueteTv,
  Producto,
} from "@/lib/tipos";
import { formatearPrecio } from "@/lib/util";

export type Contexto = Pick<PaqueteTv, "org" | "categorias" | "productos" | "llamados"> & {
  tema: "oscuro" | "claro";
  vertical: boolean;
};

export function paleta(tema: "oscuro" | "claro", acento: string) {
  return tema === "oscuro"
    ? { fondo: "#07080c", superficie: "#12141c", tinta: "#f5f6fa", suave: "#a6abbb", linea: "#262a36", acento }
    : { fondo: "#f6f4ef", superficie: "#ffffff", tinta: "#14151a", suave: "#5f6370", linea: "#dedbd2", acento };
}

// Texto legible sobre el color de acento.
export function tintaSobre(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111111" : "#ffffff";
}

export function useReloj(zona: string) {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    setAhora(new Date());
    const t = setInterval(() => setAhora(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  const fmt = (o: Intl.DateTimeFormatOptions) => {
    if (!ahora) return "";
    try {
      return new Intl.DateTimeFormat("es-CL", { ...o, timeZone: zona }).format(ahora);
    } catch {
      return new Intl.DateTimeFormat("es-CL", o).format(ahora);
    }
  };
  return {
    hora: fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    fecha: fmt({ weekday: "long", day: "numeric", month: "long" }),
  };
}

export function Escena({ d, ctx, alTerminarVideo }: { d: Diapositiva; ctx: Contexto; alTerminarVideo?: () => void }) {
  const p = paleta(ctx.tema, ctx.org.marca.color || "#6366f1");
  const completa = d.tipo === "imagen" || d.tipo === "video";
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: p.fondo, color: p.tinta, fontFamily: "var(--font-sans)" }}
    >
      <div className="relative flex-1 min-h-0">
        {d.tipo === "bienvenida" && <Bienvenida datos={d.datos as DatosBienvenida} ctx={ctx} p={p} />}
        {d.tipo === "menu" && <Menu datos={d.datos as DatosMenu} ctx={ctx} p={p} />}
        {d.tipo === "aviso" && <Aviso datos={d.datos as DatosAviso} ctx={ctx} p={p} />}
        {d.tipo === "turnos" && <Turnos datos={d.datos as DatosTurnos} llamados={ctx.llamados} ctx={ctx} p={p} />}
        {d.tipo === "imagen" && <ImagenCompleta datos={d.datos as DatosImagen} />}
        {d.tipo === "video" && <VideoCompleto datos={d.datos as DatosVideo} alTerminar={alTerminarVideo} />}
      </div>
      {!completa && <Barra ctx={ctx} p={p} />}
    </div>
  );
}

type P = ReturnType<typeof paleta>;

function Barra({ ctx, p }: { ctx: Contexto; p: P }) {
  const { hora } = useReloj(ctx.org.zona_horaria);
  const u = ctx.vertical ? "cqh" : "cqw";
  return (
    <div
      className="flex items-center justify-between shrink-0"
      style={{ padding: `0 3.2${u}`, height: ctx.vertical ? "6cqh" : "8cqh", borderTop: `1px solid ${p.linea}`, background: p.superficie }}
    >
      <div className="flex items-center min-w-0" style={{ gap: `1${u}` }}>
        {ctx.org.marca.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ctx.org.marca.logo} alt="" style={{ height: ctx.vertical ? "3.6cqh" : "5cqh", width: "auto", objectFit: "contain" }} />
        ) : (
          <span className="rounded-full shrink-0" style={{ width: `1.1${u}`, height: `1.1${u}`, background: p.acento }} />
        )}
        <span className="font-bold truncate" style={{ fontSize: `1.6${u}`, fontFamily: "var(--font-display)" }}>
          {ctx.org.nombre}
        </span>
      </div>
      <span className="font-bold tabular-nums" style={{ fontSize: `2${u}`, color: p.suave }}>
        {hora}
      </span>
    </div>
  );
}

function Bienvenida({ datos, ctx, p }: { datos: DatosBienvenida; ctx: Contexto; p: P }) {
  const { hora, fecha } = useReloj(ctx.org.zona_horaria);
  const u = ctx.vertical ? "cqh" : "cqw";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center tvi-entrar" style={{ padding: `6${u}` }}>
      <div
        className="absolute"
        style={{
          inset: 0,
          background: `radial-gradient(60% 60% at 50% 40%, ${p.acento}33, transparent 70%)`,
        }}
      />
      {ctx.org.marca.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ctx.org.marca.logo} alt="" className="relative" style={{ height: "18cqh", width: "auto", objectFit: "contain", marginBottom: "4cqh" }} />
      )}
      <h1 className="relative font-extrabold leading-[1.02] tracking-tight" style={{ fontSize: `6.4${u}`, fontFamily: "var(--font-display)" }}>
        {datos.titulo}
      </h1>
      {datos.subtitulo && (
        <p className="relative" style={{ fontSize: `2.6${u}`, color: p.suave, marginTop: "2.5cqh" }}>
          {datos.subtitulo}
        </p>
      )}
      {datos.reloj && (
        <div className="relative" style={{ marginTop: "6cqh" }}>
          <div className="font-extrabold tabular-nums" style={{ fontSize: `7.5${u}`, color: p.acento, lineHeight: 1 }}>
            {hora}
          </div>
          <div className="first-letter:uppercase" style={{ fontSize: `1.9${u}`, color: p.suave, marginTop: "1.2cqh" }}>
            {fecha}
          </div>
        </div>
      )}
    </div>
  );
}

function Menu({ datos, ctx, p }: { datos: DatosMenu; ctx: Contexto; p: P }) {
  const cats = ctx.categorias.filter(
    (c) => c.visible && (datos.categoria_ids.length === 0 || datos.categoria_ids.includes(c.id)),
  );
  const grupos = cats
    .map((c) => ({ c, items: ctx.productos.filter((x) => x.categoria_id === c.id) }))
    .filter((g) => g.items.length);
  const total = grupos.reduce((n, g) => n + g.items.length + 1.4, 0);
  const columnas = ctx.vertical ? 1 : datos.columnas;
  // Más productos = letra más chica, para que todo quepa sin cortar.
  const filasPorCol = total / columnas;
  const escala = Math.max(0.5, Math.min(1, 7.5 / Math.max(filasPorCol, 1)));
  const u = ctx.vertical ? "cqh" : "cqw";
  const base = (ctx.vertical ? 2.2 : 2.1) * escala;

  return (
    <div className="absolute inset-0 flex flex-col tvi-entrar" style={{ padding: `4${u} 4.4${u} 2.4${u}` }}>
      <h2 className="font-extrabold tracking-tight shrink-0" style={{ fontSize: `4${u}`, fontFamily: "var(--font-display)", lineHeight: 1.05 }}>
        {datos.titulo}
        <span style={{ color: p.acento }}>.</span>
      </h2>
      <div
        className="flex-1 min-h-0"
        style={{ columnCount: columnas, columnGap: `5${u}`, columnFill: "auto", marginTop: `2.6${u}` }}
      >
        {grupos.map(({ c, items }) => (
          <section key={c.id} style={{ breakInside: "avoid-column", marginBottom: `${2.2 * escala}${u}` }}>
            <h3
              className="font-bold uppercase"
              style={{ fontSize: `${base * 0.62}${u}`, letterSpacing: "0.14em", color: p.acento, marginBottom: `${0.9 * escala}${u}` }}
            >
              {c.nombre}
            </h3>
            {items.map((x) => (
              <ItemMenu key={x.id} x={x} ctx={ctx} p={p} base={base} u={u} fotos={datos.fotos} />
            ))}
          </section>
        ))}
        {grupos.length === 0 && (
          <p style={{ fontSize: `2${u}`, color: p.suave }}>Agrega productos en el panel para verlos aquí.</p>
        )}
      </div>
    </div>
  );
}

function ItemMenu({ x, ctx, p, base, u, fotos }: { x: Producto; ctx: Contexto; p: P; base: number; u: string; fotos: boolean }) {
  return (
    <div className="flex items-start" style={{ gap: `${base * 0.6}${u}`, marginBottom: `${base * 0.55}${u}`, opacity: x.agotado ? 0.45 : 1, breakInside: "avoid" }}>
      {fotos && x.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={x.foto} alt="" className="object-cover shrink-0" style={{ width: `${base * 2.6}${u}`, height: `${base * 2.6}${u}`, borderRadius: `${base * 0.4}${u}` }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline" style={{ gap: `${base * 0.4}${u}` }}>
          <span className="font-bold" style={{ fontSize: `${base}${u}`, textDecoration: x.agotado ? "line-through" : undefined }}>
            {x.nombre}
          </span>
          {x.destacado && !x.agotado && (
            <span
              className="font-bold uppercase shrink-0"
              style={{
                fontSize: `${base * 0.42}${u}`,
                background: p.acento,
                color: tintaSobre(p.acento),
                padding: `${base * 0.1}${u} ${base * 0.3}${u}`,
                borderRadius: `${base}${u}`,
                letterSpacing: "0.06em",
              }}
            >
              Recomendado
            </span>
          )}
          <span className="flex-1" style={{ borderBottom: `${Math.max(1, base * 0.06)}px dotted ${p.linea}`, transform: "translateY(-0.3em)" }} />
          <span className="font-extrabold tabular-nums shrink-0" style={{ fontSize: `${base}${u}` }}>
            {x.agotado ? "Agotado" : formatearPrecio(x.precio, ctx.org.moneda)}
          </span>
        </div>
        {x.descripcion && (
          <div style={{ fontSize: `${base * 0.66}${u}`, color: p.suave, marginTop: `${base * 0.12}${u}` }}>{x.descripcion}</div>
        )}
      </div>
    </div>
  );
}

function Aviso({ datos, ctx, p }: { datos: DatosAviso; ctx: Contexto; p: P }) {
  const u = ctx.vertical ? "cqh" : "cqw";
  const fondo = datos.estilo === "acento" ? p.acento : datos.estilo === "alerta" ? "#dc2626" : p.superficie;
  const tinta = datos.estilo === "suave" ? p.tinta : tintaSobre(fondo);
  return (
    <div className="absolute inset-0 flex flex-col justify-center tvi-entrar" style={{ background: fondo, color: tinta, padding: `7${u}` }}>
      <h2 className="font-extrabold tracking-tight" style={{ fontSize: `6.2${u}`, lineHeight: 1.02, fontFamily: "var(--font-display)" }}>
        {datos.titulo}
      </h2>
      {datos.texto && (
        <p style={{ fontSize: `2.8${u}`, marginTop: "4cqh", maxWidth: "80%", opacity: 0.85, lineHeight: 1.3 }}>{datos.texto}</p>
      )}
    </div>
  );
}

function Turnos({ datos, llamados, ctx, p }: { datos: DatosTurnos; llamados: Llamado[]; ctx: Contexto; p: P }) {
  const u = ctx.vertical ? "cqh" : "cqw";
  const [ultimo, ...anteriores] = llamados;
  return (
    <div className={`absolute inset-0 flex tvi-entrar ${ctx.vertical ? "flex-col" : ""}`} style={{ padding: `4${u}`, gap: `3${u}` }}>
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ flex: 1.5, background: p.acento, color: tintaSobre(p.acento), borderRadius: `2.4${u}`, padding: `3${u}` }}
      >
        <div className="font-bold uppercase" style={{ fontSize: `1.8${u}`, letterSpacing: "0.16em", opacity: 0.8 }}>
          {datos.titulo || "Llamando"}
        </div>
        <div className="font-extrabold tabular-nums" style={{ fontSize: ultimo && ultimo.texto.length > 6 ? `6${u}` : `14${u}`, lineHeight: 1, marginTop: "2cqh", fontFamily: "var(--font-display)" }}>
          {ultimo?.texto ?? "—"}
        </div>
        {ultimo?.destino && (
          <div className="font-bold" style={{ fontSize: `3.4${u}`, marginTop: "2cqh" }}>
            {ultimo.destino}
          </div>
        )}
        {datos.mensaje && <div style={{ fontSize: `1.6${u}`, marginTop: "4cqh", opacity: 0.75 }}>{datos.mensaje}</div>}
      </div>
      <div className="flex flex-col" style={{ flex: 1, gap: `1.2${u}` }}>
        <div className="font-bold uppercase" style={{ fontSize: `1.4${u}`, letterSpacing: "0.16em", color: p.suave }}>
          Anteriores
        </div>
        {anteriores.slice(0, 5).map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between"
            style={{ background: p.superficie, border: `1px solid ${p.linea}`, borderRadius: `1.4${u}`, padding: `1.4${u} 2${u}` }}
          >
            <span className="font-extrabold tabular-nums truncate" style={{ fontSize: `2.8${u}` }}>{l.texto}</span>
            <span className="font-semibold shrink-0" style={{ fontSize: `1.9${u}`, color: p.suave, marginLeft: `1${u}` }}>{l.destino}</span>
          </div>
        ))}
        {anteriores.length === 0 && <div style={{ fontSize: `1.6${u}`, color: p.suave }}>Aún no hay llamados anteriores.</div>}
      </div>
    </div>
  );
}

function ImagenCompleta({ datos }: { datos: DatosImagen }) {
  if (!datos.url) return <Vacio texto="Sin imagen" />;
  return (
    <div className="absolute inset-0 bg-black tvi-entrar">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={datos.url} alt="" className="w-full h-full" style={{ objectFit: datos.ajuste === "contener" ? "contain" : "cover" }} />
      {datos.texto && (
        <div
          className="absolute left-0 right-0 bottom-0 font-bold text-white"
          style={{ padding: "6cqh 4cqw 4cqh", fontSize: "3.2cqw", background: "linear-gradient(transparent, rgba(0,0,0,.75))" }}
        >
          {datos.texto}
        </div>
      )}
    </div>
  );
}

function VideoCompleto({ datos, alTerminar }: { datos: DatosVideo; alTerminar?: () => void }) {
  if (!datos.url) return <Vacio texto="Sin video" />;
  return (
    <video
      key={datos.url}
      src={datos.url}
      autoPlay
      muted={datos.silencio}
      playsInline
      onEnded={alTerminar}
      onError={alTerminar}
      className="absolute inset-0 w-full h-full bg-black object-contain"
    />
  );
}

function Vacio({ texto }: { texto: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: "2cqw", opacity: 0.5 }}>
      {texto}
    </div>
  );
}

// Aviso grande que aparece encima de todo cuando alguien llama un turno.
export function CapaLlamado({ l, ctx }: { l: Llamado; ctx: Contexto }) {
  const p = paleta(ctx.tema, ctx.org.marca.color || "#6366f1");
  const u = ctx.vertical ? "cqh" : "cqw";
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center tvi-llamado"
      style={{ background: p.acento, color: tintaSobre(p.acento) }}
    >
      <div className="font-bold uppercase tvi-pulso" style={{ fontSize: `2.4${u}`, letterSpacing: "0.2em" }}>
        Llamando
      </div>
      <div className="font-extrabold tabular-nums" style={{ fontSize: l.texto.length > 6 ? `9${u}` : `22${u}`, lineHeight: 1, fontFamily: "var(--font-display)", margin: "3cqh 0" }}>
        {l.texto}
      </div>
      {l.destino && (
        <div className="font-bold" style={{ fontSize: `5${u}` }}>
          {l.destino}
        </div>
      )}
    </div>
  );
}
