"use client";
import { useEffect, useMemo, useState } from "react";
import { usePanel, useTabla } from "@/components/panel/Contexto";
import { Encabezado } from "@/components/panel/MarcoPanel";
import { Vista } from "@/components/panel/Vista";
import { SubirArchivo } from "@/components/panel/SubirArchivo";
import { Icono } from "@/components/ui/Icono";
import { Interruptor, Segmentos } from "@/components/panel/Controles";
import type {
  DatosAviso,
  DatosBienvenida,
  DatosImagen,
  DatosMenu,
  DatosTurnos,
  DatosVideo,
  Diapositiva,
  Horario,
  TipoDiapositiva,
} from "@/lib/tipos";
import { DIAS_CORTOS, cx, describirHorario, horarioActivo, nuevoId } from "@/lib/util";
import { planPorId } from "@/lib/planes";

const TIPOS: { tipo: TipoDiapositiva; nombre: string; icono: string; descripcion: string }[] = [
  { tipo: "menu", nombre: "Menú o lista de precios", icono: "menu", descripcion: "Tus productos o servicios con precio" },
  { tipo: "aviso", nombre: "Aviso", icono: "texto", descripcion: "Un mensaje grande y claro" },
  { tipo: "imagen", nombre: "Imagen", icono: "imagen", descripcion: "Foto, afiche o promoción" },
  { tipo: "video", nombre: "Video", icono: "video", descripcion: "MP4 subido o enlace directo" },
  { tipo: "turnos", nombre: "Llamador de turnos", icono: "turnos", descripcion: "Último llamado y los anteriores" },
  { tipo: "bienvenida", nombre: "Bienvenida y reloj", icono: "bienvenida", descripcion: "Tu nombre, logo y la hora" },
];

const datosIniciales = (t: TipoDiapositiva): Diapositiva["datos"] => {
  switch (t) {
    case "menu":
      return { titulo: "Nuestro menú", categoria_ids: [], fotos: false, columnas: 2 } satisfies DatosMenu;
    case "aviso":
      return { titulo: "Nuevo aviso", texto: "", estilo: "acento" } satisfies DatosAviso;
    case "imagen":
      return { url: "", ajuste: "cubrir", texto: "" } satisfies DatosImagen;
    case "video":
      return { url: "", silencio: true } satisfies DatosVideo;
    case "turnos":
      return { titulo: "Llamando", mensaje: "" } satisfies DatosTurnos;
    case "bienvenida":
      return { titulo: "Bienvenidos", subtitulo: "", reloj: true } satisfies DatosBienvenida;
  }
};

export default function Contenido() {
  const { org, almacen, avisar } = usePanel();
  const listas = useTabla("listas");
  const diapos = useTabla("diapositivas");
  const categorias = useTabla("categorias");
  const productos = useTabla("productos");
  const llamados = useTabla("llamados");
  const [listaId, setListaId] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    if (!listaId && listas.filas[0]) setListaId(listas.filas[0].id);
  }, [listas.filas, listaId]);

  const deLista = useMemo(
    () => diapos.filas.filter((d) => d.lista_id === listaId).sort((a, b) => a.orden - b.orden),
    [diapos.filas, listaId],
  );
  const sel = deLista.find((d) => d.id === selId) ?? null;
  useEffect(() => {
    if (!selId && deLista[0] && typeof window !== "undefined" && window.innerWidth >= 1024) setSelId(deLista[0].id);
  }, [deLista, selId]);
  if (!org) return null;
  const plan = planPorId(org.plan);

  const nuevaLista = async () => {
    const nombre = prompt("Nombre de la nueva lista", "Nueva lista");
    if (!nombre) return;
    const l = { id: nuevoId(), org_id: org.id, nombre, creado: new Date().toISOString() };
    await listas.guardar(l, { silencioso: true });
    setListaId(l.id);
  };

  const agregar = async (tipo: TipoDiapositiva) => {
    if (!listaId) return;
    if (tipo === "video" && !plan.video) return avisar("Los videos están en el plan Pro.", "error");
    if (deLista.length >= plan.diapositivas) return avisar(`Tu plan permite ${plan.diapositivas} diapositivas por lista.`, "error");
    const d: Diapositiva = {
      id: nuevoId(),
      org_id: org.id,
      lista_id: listaId,
      tipo,
      orden: deLista.length,
      duracion: tipo === "menu" ? 15 : 10,
      activa: true,
      horario: null,
      datos: datosIniciales(tipo),
    };
    await diapos.guardar(d, { silencioso: true });
    setSelId(d.id);
    setAgregando(false);
  };

  const mover = (d: Diapositiva, delta: number) => {
    const arr = deLista.slice();
    const i = arr.findIndex((x) => x.id === d.id);
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    diapos.guardar(arr.map((x, k) => ({ ...x, orden: k })), { silencioso: true });
  };

  const actualizar = (d: Diapositiva, cambios: Partial<Diapositiva>) => diapos.guardar({ ...d, ...cambios }, { silencioso: true });
  const actualizarDatos = (d: Diapositiva, cambios: object) => actualizar(d, { datos: { ...d.datos, ...cambios } as Diapositiva["datos"] });

  const listaActual = listas.filas.find((l) => l.id === listaId);

  return (
    <>
      <Encabezado
        titulo="Contenido"
        descripcion="Cada lista es lo que pasa en una o varias pantallas. Las diapositivas rotan en orden y respetan sus horarios."
        accion={
          <div className="flex flex-wrap gap-2">
            <select className="campo w-auto min-w-44" value={listaId ?? ""} onChange={(e) => (setListaId(e.target.value), setSelId(null))} aria-label="Lista">
              {listas.filas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
            <button className="btn-secundario" onClick={nuevaLista}>
              <Icono nombre="mas" /> Lista
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start">
        <section className="flex flex-col gap-2">
          {deLista.map((d, i) => {
            const t = TIPOS.find((x) => x.tipo === d.tipo)!;
            const ahora = horarioActivo(d.horario, org.zona_horaria);
            return (
              <div
                key={d.id}
                className={cx(
                  "tarjeta flex items-center gap-3 p-2.5 pr-2 cursor-pointer transition",
                  selId === d.id ? "!border-accent ring-2 ring-accent/20" : "hover:border-accent/40",
                  !d.activa && "opacity-55",
                )}
                onClick={() => setSelId(d.id)}
              >
                <div className="w-28 shrink-0">
                  <Vista d={d} org={org} categorias={categorias.filas} productos={productos.filas} llamados={llamados.filas} className="!rounded-lg pointer-events-none" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <Icono nombre={t.icono} className="size-3.5" /> {t.nombre}
                  </div>
                  <div className="truncate text-sm font-bold">{tituloDe(d) || "Sin título"}</div>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span>{d.tipo === "video" ? "Hasta que termine" : `${d.duracion} s`}</span>
                    {d.horario && (
                      <span className={cx("inline-flex items-center gap-1", ahora ? "text-ok" : "text-warn")}>
                        <Icono nombre="reloj" className="size-3" /> {describirHorario(d.horario)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-fantasma !h-7 !px-1.5" onClick={() => mover(d, -1)} disabled={i === 0} aria-label="Subir">
                    <Icono nombre="arriba" className="size-4" />
                  </button>
                  <button className="btn-fantasma !h-7 !px-1.5" onClick={() => mover(d, 1)} disabled={i === deLista.length - 1} aria-label="Bajar">
                    <Icono nombre="abajo" className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {agregando ? (
            <div className="tarjeta p-3 grid sm:grid-cols-2 gap-2">
              {TIPOS.map((t) => (
                <button key={t.tipo} className="flex items-start gap-3 rounded-xl p-3 text-left hover:bg-surface-2" onClick={() => agregar(t.tipo)}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <Icono nombre={t.icono} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">
                      {t.nombre} {t.tipo === "video" && !plan.video && <span className="chip bg-surface-2 text-muted ml-1">Pro</span>}
                    </span>
                    <span className="block text-xs text-muted">{t.descripcion}</span>
                  </span>
                </button>
              ))}
              <button className="btn-fantasma sm:col-span-2" onClick={() => setAgregando(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button className="btn-secundario h-12 border-dashed" onClick={() => setAgregando(true)} disabled={!listaId}>
              <Icono nombre="mas" /> Agregar diapositiva
            </button>
          )}

          {listaActual && listas.filas.length > 1 && (
            <button
              className="btn-peligro self-start mt-2"
              onClick={() => {
                if (confirm(`¿Borrar la lista "${listaActual.nombre}" y sus diapositivas?`)) {
                  listas.borrar(listaActual.id);
                  setListaId(null);
                  diapos.recargar();
                }
              }}
            >
              <Icono nombre="basura" /> Borrar esta lista
            </button>
          )}
        </section>

        <section className="lg:sticky lg:top-6">
          {sel ? (
            <Editor
              key={sel.id}
              d={sel}
              plan={plan}
              categorias={categorias.filas}
              vista={<Vista d={sel} org={org} categorias={categorias.filas} productos={productos.filas} llamados={llamados.filas} />}
              alCambiar={(c) => actualizar(sel, c)}
              alCambiarDatos={(c) => actualizarDatos(sel, c)}
              alBorrar={() => {
                diapos.borrar(sel.id);
                setSelId(null);
              }}
              alDuplicar={async () => {
                const copia = { ...sel, id: nuevoId(), orden: deLista.length };
                await diapos.guardar(copia, { silencioso: true });
                setSelId(copia.id);
              }}
              modo={almacen.modo}
            />
          ) : (
            <div className="tarjeta p-8 text-center text-sm text-muted">Elige una diapositiva para editarla. Los cambios se ven al instante en la TV.</div>
          )}
        </section>
      </div>
    </>
  );
}

function tituloDe(d: Diapositiva) {
  const x = d.datos as Partial<DatosMenu & DatosAviso & DatosImagen & DatosBienvenida>;
  return x.titulo || x.texto || (x.url ? x.url.split("/").pop()?.slice(0, 40) : "");
}

function Editor({
  d,
  plan,
  categorias,
  vista,
  alCambiar,
  alCambiarDatos,
  alBorrar,
  alDuplicar,
  modo,
}: {
  d: Diapositiva;
  plan: ReturnType<typeof planPorId>;
  categorias: { id: string; nombre: string }[];
  vista: React.ReactNode;
  alCambiar: (c: Partial<Diapositiva>) => void;
  alCambiarDatos: (c: object) => void;
  alBorrar: () => void;
  alDuplicar: () => void;
  modo: "demo" | "nube";
}) {
  // Los textos se editan en un borrador local y se guardan al salir del campo, para no mandar un aviso a las TVs por cada letra.
  const [borrador, setBorrador] = useState(d.datos as unknown as Record<string, unknown>);
  useEffect(() => setBorrador(d.datos as unknown as Record<string, unknown>), [d.datos]);
  const texto = (campo: string, etiqueta: string, opciones: { largo?: boolean; ph?: string } = {}) => (
    <div>
      <label className="etiqueta">{etiqueta}</label>
      {opciones.largo ? (
        <textarea
          className="campo !h-24 py-2"
          value={String(borrador[campo] ?? "")}
          placeholder={opciones.ph}
          onChange={(e) => setBorrador({ ...borrador, [campo]: e.target.value })}
          onBlur={() => borrador[campo] !== (d.datos as unknown as Record<string, unknown>)[campo] && alCambiarDatos({ [campo]: borrador[campo] })}
        />
      ) : (
        <input
          className="campo"
          value={String(borrador[campo] ?? "")}
          placeholder={opciones.ph}
          onChange={(e) => setBorrador({ ...borrador, [campo]: e.target.value })}
          onBlur={() => borrador[campo] !== (d.datos as unknown as Record<string, unknown>)[campo] && alCambiarDatos({ [campo]: borrador[campo] })}
        />
      )}
    </div>
  );

  const datos = d.datos as unknown as Record<string, unknown>;

  return (
    <div className="tarjeta p-4 sm:p-5 flex flex-col gap-4">
      {vista}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={d.activa} onChange={(e) => alCambiar({ activa: e.target.checked })} />
          {d.activa ? "Se muestra" : "Pausada"}
        </label>
        <div className="flex gap-1">
          <button className="btn-fantasma h-9" onClick={alDuplicar}>
            <Icono nombre="copiar" className="size-4" /> Duplicar
          </button>
          <button className="btn-peligro h-9" onClick={() => confirm("¿Borrar esta diapositiva?") && alBorrar()}>
            <Icono nombre="basura" className="size-4" /> Borrar
          </button>
        </div>
      </div>

      {d.tipo === "bienvenida" && (
        <>
          {texto("titulo", "Título")}
          {texto("subtitulo", "Subtítulo", { ph: "Ej: Bienvenido, en breve será atendido" })}
          <Interruptor etiqueta="Mostrar hora y fecha" valor={!!datos.reloj} alCambiar={(v) => alCambiarDatos({ reloj: v })} />
        </>
      )}
      {d.tipo === "aviso" && (
        <>
          {texto("titulo", "Título")}
          {texto("texto", "Texto", { largo: true })}
          <div>
            <label className="etiqueta">Estilo</label>
            <Segmentos
              valor={String(datos.estilo)}
              opciones={[
                ["acento", "Color de marca"],
                ["suave", "Sobrio"],
                ["alerta", "Urgente"],
              ]}
              alCambiar={(v) => alCambiarDatos({ estilo: v })}
            />
          </div>
        </>
      )}
      {d.tipo === "menu" && (
        <>
          {texto("titulo", "Título")}
          <div>
            <label className="etiqueta">Categorías a mostrar (ninguna marcada = todas)</label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => {
                const ids = (datos.categoria_ids as string[]) ?? [];
                const on = ids.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={cx("chip h-8 px-3 border", on ? "bg-accent text-accent-ink border-accent" : "border-line text-muted hover:text-ink")}
                    onClick={() => alCambiarDatos({ categoria_ids: on ? ids.filter((x) => x !== c.id) : [...ids, c.id] })}
                  >
                    {c.nombre}
                  </button>
                );
              })}
              {categorias.length === 0 && <span className="text-xs text-muted">Crea categorías en la sección de catálogo.</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="etiqueta">Columnas</label>
              <Segmentos valor={String(datos.columnas)} opciones={[["1", "1"], ["2", "2"], ["3", "3"]]} alCambiar={(v) => alCambiarDatos({ columnas: Number(v) })} />
            </div>
            <div className="flex items-end">
              <Interruptor etiqueta="Mostrar fotos" valor={!!datos.fotos} alCambiar={(v) => alCambiarDatos({ fotos: v })} />
            </div>
          </div>
        </>
      )}
      {d.tipo === "imagen" && (
        <>
          <div className="flex flex-wrap gap-2 items-end">
            <SubirArchivo acepta="image/*" texto="Subir imagen" alSubir={(url) => alCambiarDatos({ url })} />
          </div>
          {texto("url", "O pega un enlace a la imagen", { ph: "https://…" })}
          {texto("texto", "Texto sobre la imagen (opcional)")}
          <div>
            <label className="etiqueta">Ajuste</label>
            <Segmentos
              valor={String(datos.ajuste)}
              opciones={[
                ["cubrir", "Llenar la pantalla"],
                ["contener", "Mostrar completa"],
              ]}
              alCambiar={(v) => alCambiarDatos({ ajuste: v })}
            />
          </div>
        </>
      )}
      {d.tipo === "video" && (
        <>
          {modo === "nube" && <SubirArchivo acepta="video/mp4,video/webm" texto="Subir video (MP4)" alSubir={(url) => alCambiarDatos({ url })} />}
          {texto("url", modo === "nube" ? "O pega un enlace directo a un MP4" : "Enlace directo a un MP4", { ph: "https://…/video.mp4" })}
          <Interruptor etiqueta="Sin sonido" valor={!!datos.silencio} alCambiar={(v) => alCambiarDatos({ silencio: v })} />
          <p className="text-xs text-muted -mt-2">La TV pasa a la siguiente diapositiva cuando el video termina. Los navegadores solo reproducen solos los videos sin sonido.</p>
        </>
      )}
      {d.tipo === "turnos" && (
        <>
          {texto("titulo", "Título", { ph: "Llamando" })}
          {texto("mensaje", "Mensaje", { ph: "Ej: Esté atento a su número" })}
          <p className="text-xs text-muted -mt-2">Muestra el último llamado y los anteriores. Se llama desde la sección Llamador.</p>
        </>
      )}

      {d.tipo !== "video" && (
        <div>
          <label className="etiqueta">Duración en pantalla: {d.duracion} segundos</label>
          <input
            type="range"
            min={3}
            max={60}
            value={d.duracion}
            onChange={(e) => alCambiar({ duracion: Number(e.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      )}

      <EditorHorario horario={d.horario} permitido={plan.programacion} alCambiar={(h) => alCambiar({ horario: h })} />
    </div>
  );
}

function EditorHorario({ horario, permitido, alCambiar }: { horario: Horario | null; permitido: boolean; alCambiar: (h: Horario | null) => void }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <Interruptor
        etiqueta="Mostrar solo en ciertos días y horas"
        valor={!!horario}
        deshabilitado={!permitido}
        alCambiar={(v) => alCambiar(v ? { dias: [1, 2, 3, 4, 5], desde: "08:00", hasta: "12:00" } : null)}
      />
      {!permitido && <p className="mt-1 text-xs text-muted">La programación por horario está en el plan Pro.</p>}
      {horario && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {DIAS_CORTOS.map((n, i) => {
              const on = horario.dias.includes(i);
              return (
                <button
                  key={n}
                  type="button"
                  className={cx("chip h-8 w-11 justify-center border", on ? "bg-accent text-accent-ink border-accent" : "border-line text-muted")}
                  onClick={() => alCambiar({ ...horario, dias: on ? horario.dias.filter((x) => x !== i) : [...horario.dias, i] })}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="etiqueta">Desde</label>
              <input type="time" className="campo" value={horario.desde} onChange={(e) => alCambiar({ ...horario, desde: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta">Hasta</label>
              <input type="time" className="campo" value={horario.hasta} onChange={(e) => alCambiar({ ...horario, hasta: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
