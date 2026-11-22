"use client";
// Modo nube: Supabase (Postgres + Auth + Storage + Realtime).
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Llamado, Organizacion, PaqueteTv, Pantalla } from "../tipos";
import { contenidoDeEjemplo } from "../rubros";
import type { Almacen, EventoTv, FuenteTv } from "./tipos";

let cliente: SupabaseClient | null = null;
export function supabase() {
  if (!cliente) {
    cliente = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  return cliente;
}

const nombreCanal = (canal: string) => `tvi-${canal}`;

function revisar<T>(r: { data: T; error: { message: string } | null } | { data: unknown; error: { message: string } }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

// La org activa se recuerda en el navegador por si el usuario pertenece a más de una.
let orgCache: Organizacion | null = null;

async function orgActual(): Promise<Organizacion> {
  const o = orgCache ?? (await almacenNube.miOrg());
  if (!o) throw new Error("Primero crea tu negocio.");
  return o;
}

async function enviar(evento: EventoTv, canal?: string) {
  const ch = supabase().channel(nombreCanal(canal ?? (await orgActual()).canal));
  await new Promise<void>((ok) => {
    const t = setTimeout(ok, 4000);
    ch.subscribe((estado) => {
      if (estado === "SUBSCRIBED") {
        clearTimeout(t);
        ok();
      }
    });
  });
  await ch.send({ type: "broadcast", event: "tv", payload: evento });
  supabase().removeChannel(ch);
}

export const almacenNube: Almacen = {
  modo: "nube",
  async usuario() {
    const { data } = await supabase().auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  },
  async entrar(email, clave) {
    revisar(await supabase().auth.signInWithPassword({ email, password: clave }));
    orgCache = null;
  },
  async registrar(email, clave) {
    const r = revisar<{ session: unknown }>(
      await supabase().auth.signUp({
        email,
        password: clave,
        options: { emailRedirectTo: `${location.origin}/panel` },
      }),
    );
    return { confirmar: !r.session };
  },
  async salir() {
    await supabase().auth.signOut();
    orgCache = null;
  },
  async miOrg() {
    const filas = revisar(await supabase().from("organizaciones").select("*").order("creado").limit(1));
    orgCache = (filas?.[0] as Organizacion) ?? null;
    return orgCache;
  },
  async crearOrg(nombre, rubro) {
    const org = revisar(await supabase().rpc("crear_organizacion", { p_nombre: nombre, p_rubro: rubro })) as Organizacion;
    orgCache = org;
    const s = contenidoDeEjemplo(org.id, rubro, nombre);
    revisar(await supabase().from("listas").insert(s.lista));
    if (s.categorias.length) revisar(await supabase().from("categorias").insert(s.categorias));
    if (s.productos.length) revisar(await supabase().from("productos").insert(s.productos));
    if (s.diapositivas.length) revisar(await supabase().from("diapositivas").insert(s.diapositivas));
    return org;
  },
  async actualizarOrg(cambios) {
    const o = await orgActual();
    revisar(await supabase().from("organizaciones").update(cambios).eq("id", o.id));
    orgCache = { ...o, ...cambios };
    await enviar({ tipo: "actualizar" });
  },
  async listar(tabla) {
    const o = await orgActual();
    let q = supabase().from(tabla).select("*").eq("org_id", o.id);
    q = tabla === "llamados" ? q.order("creado", { ascending: false }).limit(50) : tabla === "listas" || tabla === "pantallas" ? q.order("creado") : q.order("orden");
    return revisar(await q) as never;
  },
  async guardar(tabla, filas) {
    const lista = Array.isArray(filas) ? filas : [filas];
    if (!lista.length) return;
    if (tabla === "pantallas") {
      // Pantallas solo permite actualizar columnas puntuales (no se crean desde aquí).
      for (const p of lista as Pantalla[]) {
        const { nombre, lista_id, orientacion, tema, llamador } = p;
        revisar(await supabase().from("pantallas").update({ nombre, lista_id, orientacion, tema, llamador }).eq("id", p.id));
      }
      return;
    }
    revisar(await supabase().from(tabla).upsert(lista as never));
  },
  async borrar(tabla, id) {
    revisar(await supabase().from(tabla).delete().eq("id", id));
  },
  async vincularPantalla(codigo, nombre, lista_id) {
    const o = await orgActual();
    const p = revisar(
      await supabase().rpc("vincular_pantalla", { p_org: o.id, p_codigo: codigo, p_nombre: nombre, p_lista: lista_id }),
    ) as Pantalla;
    await enviar({ tipo: "actualizar" }, "vincular-" + codigo.trim().toUpperCase());
    return p;
  },
  async llamar({ texto, destino }) {
    const o = await orgActual();
    const l = revisar(await supabase().rpc("llamar", { p_org: o.id, p_texto: texto ?? "", p_destino: destino })) as Llamado;
    await enviar({ tipo: "llamado", llamado: l });
    return l;
  },
  async subirArchivo(archivo, nombre) {
    const o = await orgActual();
    const limpio = nombre.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
    const ruta = `${o.id}/${Date.now()}-${limpio}`;
    revisar(await supabase().storage.from("medios").upload(ruta, archivo, { cacheControl: "31536000", upsert: false }));
    return supabase().storage.from("medios").getPublicUrl(ruta).data.publicUrl;
  },
  async avisarTvs() {
    await enviar({ tipo: "actualizar" });
  },
};

export const fuenteNube: FuenteTv = {
  modo: "nube",
  async solicitarCodigo(secreto) {
    return revisar(await supabase().rpc("tv_solicitar_codigo", { p_secreto: secreto })) as string | null;
  },
  async paquete(secreto) {
    return revisar(await supabase().rpc("tv_paquete", { p_secreto: secreto })) as PaqueteTv | null;
  },
  escuchar(canal, alRecibir) {
    const ch = supabase()
      .channel(nombreCanal(canal))
      .on("broadcast", { event: "tv" }, ({ payload }) => alRecibir(payload as EventoTv))
      .subscribe();
    return () => {
      supabase().removeChannel(ch);
    };
  },
};
