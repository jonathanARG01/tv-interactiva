"use client";
import { useEffect, useState } from "react";
import { usePanel, useTabla } from "@/components/panel/Contexto";
import { Encabezado } from "@/components/panel/MarcoPanel";
import { SubirArchivo } from "@/components/panel/SubirArchivo";
import { Interruptor } from "@/components/panel/Controles";
import { Icono } from "@/components/ui/Icono";
import type { Categoria, Producto } from "@/lib/tipos";
import { cx, formatearPrecio, nuevoId } from "@/lib/util";
import { infoRubro } from "@/lib/rubros";

export default function Catalogo() {
  const { org } = usePanel();
  const categorias = useTabla("categorias");
  const productos = useTabla("productos");
  const [catId, setCatId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Producto | null>(null);

  useEffect(() => {
    if (!catId && categorias.filas[0]) setCatId(categorias.filas[0].id);
  }, [categorias.filas, catId]);

  if (!org) return null;
  const rubro = infoRubro(org.rubro);
  const cat = categorias.filas.find((c) => c.id === catId) ?? null;
  const items = productos.filas.filter((p) => p.categoria_id === catId).sort((a, b) => a.orden - b.orden);
  const sinCategoria = productos.filas.filter((p) => !p.categoria_id || !categorias.filas.some((c) => c.id === p.categoria_id));

  const nuevaCategoria = async () => {
    const nombre = prompt("Nombre de la categoría");
    if (!nombre?.trim()) return;
    const c: Categoria = { id: nuevoId(), org_id: org.id, nombre: nombre.trim(), orden: categorias.filas.length, visible: true, origen: "propio", externo_id: null };
    await categorias.guardar(c, { silencioso: true });
    setCatId(c.id);
  };

  const nuevoProducto = () =>
    setEditando({
      id: nuevoId(),
      org_id: org.id,
      categoria_id: catId,
      nombre: "",
      descripcion: "",
      precio: null,
      foto: null,
      agotado: false,
      destacado: false,
      orden: items.length,
      origen: "propio",
      externo_id: null,
    });

  const mover = (lista: { id: string; orden: number }[], id: string, delta: number, tabla: "categorias" | "productos") => {
    const arr = lista.slice();
    const i = arr.findIndex((x) => x.id === id);
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const reordenado = arr.map((x, k) => ({ ...x, orden: k }));
    if (tabla === "categorias") categorias.guardar(reordenado as Categoria[], { silencioso: true });
    else productos.guardar(reordenado as Producto[], { silencioso: true });
  };

  return (
    <>
      <Encabezado
        titulo={rubro.catalogo}
        descripcion={`Lo que cargues aquí aparece en las diapositivas de tipo "Menú o lista de precios". Si cambias un precio o marcas algo como agotado, todas las TVs se actualizan.`}
        accion={
          <button className="btn-primario" onClick={nuevoProducto} disabled={!catId}>
            <Icono nombre="mas" /> Agregar {rubro.item}
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-[240px_1fr] items-start">
        <aside className="tarjeta p-2">
          {categorias.filas
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((c, i, arr) => (
              <div
                key={c.id}
                className={cx(
                  "group flex items-center gap-1 rounded-xl pl-3 pr-1 h-10 cursor-pointer",
                  catId === c.id ? "bg-accent-soft text-accent" : "hover:bg-surface-2",
                )}
                onClick={() => setCatId(c.id)}
              >
                <span className={cx("flex-1 truncate text-sm font-semibold", !c.visible && "line-through opacity-60")}>{c.nombre}</span>
                <span className="text-xs text-muted tabular-nums">{productos.filas.filter((p) => p.categoria_id === c.id).length}</span>
                <span className="hidden group-hover:flex" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-fantasma !h-7 !px-1" disabled={i === 0} onClick={() => mover(arr, c.id, -1, "categorias")} aria-label="Subir">
                    <Icono nombre="arriba" className="size-3.5" />
                  </button>
                  <button className="btn-fantasma !h-7 !px-1" disabled={i === arr.length - 1} onClick={() => mover(arr, c.id, 1, "categorias")} aria-label="Bajar">
                    <Icono nombre="abajo" className="size-3.5" />
                  </button>
                </span>
              </div>
            ))}
          <button className="btn-fantasma w-full justify-start mt-1" onClick={nuevaCategoria}>
            <Icono nombre="mas" /> Nueva categoría
          </button>
        </aside>

        <section className="flex flex-col gap-3 min-w-0">
          {cat && (
            <div className="tarjeta p-3 flex flex-wrap items-center gap-2">
              <input
                key={cat.id}
                className="campo flex-1 min-w-40 font-bold"
                defaultValue={cat.nombre}
                aria-label="Nombre de la categoría"
                onBlur={(e) => e.target.value.trim() && e.target.value !== cat.nombre && categorias.guardar({ ...cat, nombre: e.target.value.trim() })}
              />
              <button className="btn-secundario" onClick={() => categorias.guardar({ ...cat, visible: !cat.visible })}>
                <Icono nombre={cat.visible ? "ojo" : "ojoNo"} /> {cat.visible ? "Visible" : "Oculta"}
              </button>
              <button
                className="btn-peligro"
                onClick={() => {
                  if (confirm(`¿Borrar la categoría "${cat.nombre}"? Sus ${rubro.item}s quedarán sin categoría.`)) {
                    categorias.borrar(cat.id);
                    setCatId(null);
                    productos.recargar();
                  }
                }}
              >
                <Icono nombre="basura" />
              </button>
              {cat.origen === "platovi" && <span className="chip bg-accent-soft text-accent">Viene de Platovi</span>}
            </div>
          )}

          <div className="tarjeta divide-y divide-line overflow-hidden">
            {items.map((p, i) => (
              <FilaProducto
                key={p.id}
                p={p}
                moneda={org.moneda}
                primero={i === 0}
                ultimo={i === items.length - 1}
                alEditar={() => setEditando(p)}
                alAgotar={() => productos.guardar({ ...p, agotado: !p.agotado })}
                alMover={(d) => mover(items, p.id, d, "productos")}
              />
            ))}
            {items.length === 0 && (
              <div className="p-8 text-center text-sm text-muted">
                {categorias.filas.length ? `Esta categoría no tiene ${rubro.item}s todavía.` : "Crea una categoría para empezar."}
              </div>
            )}
          </div>

          {sinCategoria.length > 0 && (
            <div className="tarjeta p-3">
              <div className="etiqueta px-1">Sin categoría (no aparecen en pantalla)</div>
              {sinCategoria.map((p) => (
                <button key={p.id} className="btn-fantasma justify-start w-full" onClick={() => setEditando(p)}>
                  {p.nombre}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {editando && (
        <EditorProducto
          p={editando}
          categorias={categorias.filas}
          item={rubro.item}
          alCerrar={() => setEditando(null)}
          alGuardar={async (p) => {
            await productos.guardar(p);
            setEditando(null);
          }}
          alBorrar={(id) => {
            productos.borrar(id);
            setEditando(null);
          }}
          existe={productos.filas.some((x) => x.id === editando.id)}
        />
      )}
    </>
  );
}

function FilaProducto({
  p,
  moneda,
  primero,
  ultimo,
  alEditar,
  alAgotar,
  alMover,
}: {
  p: Producto;
  moneda: string;
  primero: boolean;
  ultimo: boolean;
  alEditar: () => void;
  alAgotar: () => void;
  alMover: (d: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-surface-2/60">
      {p.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.foto} alt="" className="size-12 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="size-12 rounded-lg bg-surface-2 shrink-0 grid place-items-center text-muted">
          <Icono nombre="imagen" />
        </div>
      )}
      <button className="min-w-0 flex-1 text-left" onClick={alEditar}>
        <div className="flex items-center gap-2">
          <span className={cx("font-bold truncate", p.agotado && "line-through text-muted")}>{p.nombre}</span>
          {p.destacado && <Icono nombre="estrella" className="size-3.5 text-warn shrink-0" />}
          {p.origen === "platovi" && <span className="chip bg-accent-soft text-accent !h-5">Platovi</span>}
        </div>
        {p.descripcion && <div className="text-xs text-muted truncate">{p.descripcion}</div>}
      </button>
      <div className="text-sm font-bold tabular-nums shrink-0">{formatearPrecio(p.precio, moneda)}</div>
      <button
        className={cx("chip h-8 px-3 shrink-0 border", p.agotado ? "bg-danger/10 text-danger border-danger/30" : "border-line text-muted hover:text-ink")}
        onClick={alAgotar}
        title="Marca o desmarca como agotado"
      >
        {p.agotado ? "Agotado" : "Disponible"}
      </button>
      <div className="hidden sm:flex flex-col">
        <button className="btn-fantasma !h-6 !px-1" disabled={primero} onClick={() => alMover(-1)} aria-label="Subir">
          <Icono nombre="arriba" className="size-3.5" />
        </button>
        <button className="btn-fantasma !h-6 !px-1" disabled={ultimo} onClick={() => alMover(1)} aria-label="Bajar">
          <Icono nombre="abajo" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function EditorProducto({
  p,
  categorias,
  item,
  existe,
  alCerrar,
  alGuardar,
  alBorrar,
}: {
  p: Producto;
  categorias: Categoria[];
  item: string;
  existe: boolean;
  alCerrar: () => void;
  alGuardar: (p: Producto) => void;
  alBorrar: (id: string) => void;
}) {
  const [f, setF] = useState(p);
  const [precioTexto, setPrecioTexto] = useState(p.precio === null ? "" : String(p.precio));
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [alCerrar]);

  return (
    <div className="fixed inset-0 z-40 grid place-items-end sm:place-items-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={alCerrar}>
      <form
        className="tarjeta w-full sm:max-w-lg max-h-[92dvh] overflow-auto p-5 rounded-b-none sm:rounded-2xl tvi-entrar"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          const limpio = precioTexto.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
          alGuardar({ ...f, nombre: f.nombre.trim(), precio: limpio === "" ? null : Number(limpio) });
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{existe ? `Editar ${item}` : `Nuevo ${item}`}</h2>
          <button type="button" className="btn-fantasma !px-0 w-10" onClick={alCerrar} aria-label="Cerrar">
            <Icono nombre="x" />
          </button>
        </div>
        {p.origen === "platovi" && (
          <p className="mt-2 rounded-lg bg-accent-soft text-accent text-xs font-semibold p-2.5">
            Este {item} viene de Platovi. Los cambios de nombre y precio conviene hacerlos allá para que no se sobrescriban.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="etiqueta" htmlFor="p-nombre">
              Nombre
            </label>
            <input id="p-nombre" className="campo" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required autoFocus />
          </div>
          <div>
            <label className="etiqueta" htmlFor="p-desc">
              Descripción
            </label>
            <input id="p-desc" className="campo" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="etiqueta" htmlFor="p-precio">
                Precio (opcional)
              </label>
              <input id="p-precio" className="campo tabular-nums" inputMode="numeric" value={precioTexto} onChange={(e) => setPrecioTexto(e.target.value)} placeholder="Ej: 5990" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="p-cat">
                Categoría
              </label>
              <select id="p-cat" className="campo" value={f.categoria_id ?? ""} onChange={(e) => setF({ ...f, categoria_id: e.target.value || null })}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="etiqueta">Foto</div>
            <div className="flex items-center gap-3">
              {f.foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.foto} alt="" className="size-14 rounded-lg object-cover" />
              )}
              <SubirArchivo acepta="image/*" texto={f.foto ? "Cambiar foto" : "Subir foto"} alSubir={(url) => setF({ ...f, foto: url })} />
              {f.foto && (
                <button type="button" className="btn-fantasma" onClick={() => setF({ ...f, foto: null })}>
                  Quitar
                </button>
              )}
            </div>
          </div>
          <Interruptor etiqueta="Recomendado (se destaca en pantalla)" valor={f.destacado} alCambiar={(v) => setF({ ...f, destacado: v })} />
          <Interruptor etiqueta="Agotado" valor={f.agotado} alCambiar={(v) => setF({ ...f, agotado: v })} />
        </div>
        <div className="mt-6 flex items-center justify-between gap-2">
          {existe ? (
            <button type="button" className="btn-peligro" onClick={() => confirm("¿Borrar?") && alBorrar(p.id)}>
              <Icono nombre="basura" /> Borrar
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secundario" onClick={alCerrar}>
              Cancelar
            </button>
            <button className="btn-primario">Guardar</button>
          </div>
        </div>
      </form>
    </div>
  );
}
