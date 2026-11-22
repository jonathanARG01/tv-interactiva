"use client";
// Modo demo: todo vive en el navegador (localStorage). Panel y TV abiertos en pestañas del mismo navegador
// se sincronizan en vivo con BroadcastChannel. Sirve para probar el sistema sin cuenta y para desarrollar.
import type { FilaDe, Llamado, Organizacion, PaqueteTv, Pantalla, Tabla } from "../tipos";
import { contenidoDeEjemplo } from "../rubros";
import { nuevoId } from "../util";
import type { Almacen, EventoTv, FuenteTv } from "./tipos";

const CLAVE = "tvi-demo-db";
const CANAL = "tvi-demo";

interface Bd {
  org: Organizacion | null;
  categorias: FilaDe["categorias"][];
  productos: FilaDe["productos"][];
  listas: FilaDe["listas"][];
  diapositivas: FilaDe["diapositivas"][];
  pantallas: FilaDe["pantallas"][];
  llamados: FilaDe["llamados"][];
  codigos: Record<string, { secreto: string; vence: number }>;
  secretos: Record<string, string>; // secreto del aparato -> id de pantalla
}

const vacia = (): Bd => ({
  org: null,
  categorias: [],
  productos: [],
  listas: [],
  diapositivas: [],
  pantallas: [],
  llamados: [],
  codigos: {},
  secretos: {},
});

function leer(): Bd {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? { ...vacia(), ...JSON.parse(crudo) } : vacia();
  } catch {
    return vacia();
  }
}

function escribir(bd: Bd) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(bd));
  } catch (e) {
    throw new Error("El navegador no tiene más espacio para la demo. Usa imágenes más livianas. " + String(e));
  }
}

let canal: BroadcastChannel | null = null;
const obtenerCanal = () => {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!canal) canal = new BroadcastChannel(CANAL);
  return canal;
};
function emitir(e: EventoTv) {
  obtenerCanal()?.postMessage(e);
}

const ordenar = <T extends { orden?: number }>(f: T[]) => f.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

export function reiniciarDemo() {
  localStorage.removeItem(CLAVE);
}

async function comprimirImagen(archivo: Blob): Promise<string> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = mal;
      i.src = url;
    });
    const max = 1280;
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * escala);
    c.height = Math.round(img.height * escala);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/webp", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const almacenDemo: Almacen = {
  modo: "demo",
  async usuario() {
    return { id: "demo", email: "demo@tv-interactiva" };
  },
  async entrar() {},
  async registrar() {
    return { confirmar: false };
  },
  async salir() {},
  async miOrg() {
    return leer().org;
  },
  async crearOrg(nombre, rubro) {
    const bd = vacia();
    const org: Organizacion = {
      id: nuevoId(),
      nombre,
      rubro,
      plan: "pro",
      marca: { color: "#6366f1", logo: null, fuente: "moderna" },
      moneda: "CLP",
      zona_horaria: "America/Santiago",
      canal: nuevoId(),
      turno_actual: 0,
      creado: new Date().toISOString(),
    };
    const semilla = contenidoDeEjemplo(org.id, rubro, nombre);
    bd.org = org;
    bd.categorias = semilla.categorias;
    bd.productos = semilla.productos;
    bd.listas = [semilla.lista];
    bd.diapositivas = semilla.diapositivas;
    escribir(bd);
    return org;
  },
  async actualizarOrg(cambios) {
    const bd = leer();
    if (!bd.org) return;
    bd.org = { ...bd.org, ...cambios };
    escribir(bd);
    emitir({ tipo: "actualizar" });
  },
  async listar(tabla) {
    const bd = leer();
    const filas = bd[tabla] as FilaDe[typeof tabla][];
    if (tabla === "llamados") return (filas as Llamado[]).slice().sort((a, b) => b.creado.localeCompare(a.creado)) as never;
    return ordenar(filas as { orden?: number }[]) as never;
  },
  async guardar(tabla, filas) {
    const bd = leer();
    const lista = bd[tabla] as { id: string }[];
    for (const f of Array.isArray(filas) ? filas : [filas]) {
      const i = lista.findIndex((x) => x.id === (f as { id: string }).id);
      if (i >= 0) lista[i] = f as { id: string };
      else lista.push(f as { id: string });
    }
    escribir(bd);
  },
  async borrar(tabla: Tabla, id) {
    const bd = leer();
    (bd[tabla] as { id: string }[]) = (bd[tabla] as { id: string }[]).filter((x) => x.id !== id);
    if (tabla === "listas") {
      bd.diapositivas = bd.diapositivas.filter((d) => d.lista_id !== id);
      bd.pantallas = bd.pantallas.map((p) => (p.lista_id === id ? { ...p, lista_id: null } : p));
    }
    if (tabla === "categorias") bd.productos = bd.productos.map((p) => (p.categoria_id === id ? { ...p, categoria_id: null } : p));
    if (tabla === "pantallas") for (const s of Object.keys(bd.secretos)) if (bd.secretos[s] === id) delete bd.secretos[s];
    escribir(bd);
  },
  async vincularPantalla(codigo, nombre, lista_id) {
    const bd = leer();
    const c = bd.codigos[codigo.trim().toUpperCase()];
    if (!bd.org) throw new Error("Primero crea tu negocio.");
    if (!c || c.vence < Date.now()) throw new Error("Ese código no existe o ya venció. Revisa el que aparece en la TV.");
    const p: Pantalla = {
      id: nuevoId(),
      org_id: bd.org.id,
      nombre: nombre || "Pantalla",
      lista_id,
      orientacion: "horizontal",
      tema: "oscuro",
      llamador: true,
      ultimo_contacto: null,
      creado: new Date().toISOString(),
    };
    bd.pantallas.push(p);
    bd.secretos[c.secreto] = p.id;
    delete bd.codigos[codigo.trim().toUpperCase()];
    escribir(bd);
    emitir({ tipo: "actualizar" });
    return p;
  },
  async llamar({ texto, destino }) {
    const bd = leer();
    if (!bd.org) throw new Error("Primero crea tu negocio.");
    let t = texto?.trim();
    if (!t) {
      bd.org.turno_actual += 1;
      t = String(bd.org.turno_actual);
    }
    const l: Llamado = { id: nuevoId(), org_id: bd.org.id, texto: t, destino, creado: new Date().toISOString() };
    bd.llamados = [l, ...bd.llamados].slice(0, 50);
    escribir(bd);
    emitir({ tipo: "llamado", llamado: l });
    return l;
  },
  async subirArchivo(archivo) {
    if (archivo.type.startsWith("image/")) return comprimirImagen(archivo);
    throw new Error("En la demo solo se pueden subir imágenes. Para videos pega un enlace o crea tu cuenta.");
  },
  async avisarTvs() {
    emitir({ tipo: "actualizar" });
  },
};

function codigoAleatorio() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I para que se lea bien en la TV
  return Array.from({ length: 6 }, () => letras[Math.floor(Math.random() * letras.length)]).join("");
}

export const fuenteDemo: FuenteTv = {
  modo: "demo",
  async solicitarCodigo(secreto) {
    const bd = leer();
    if (bd.secretos[secreto]) return null;
    const existente = Object.entries(bd.codigos).find(([, v]) => v.secreto === secreto && v.vence > Date.now());
    if (existente) return existente[0];
    const codigo = codigoAleatorio();
    bd.codigos[codigo] = { secreto, vence: Date.now() + 30 * 60_000 };
    escribir(bd);
    return codigo;
  },
  async paquete(secreto) {
    const bd = leer();
    const id = bd.secretos[secreto];
    const pantalla = bd.pantallas.find((p) => p.id === id);
    if (!pantalla || !bd.org) return null;
    pantalla.ultimo_contacto = new Date().toISOString();
    escribir(bd);
    const { id: oid, nombre, rubro, marca, moneda, zona_horaria, canal: c, plan } = bd.org;
    const paquete: PaqueteTv = {
      org: { id: oid, nombre, rubro, marca, moneda, zona_horaria, canal: c, plan },
      pantalla,
      diapositivas: ordenar(bd.diapositivas.filter((d) => d.lista_id === pantalla.lista_id)),
      categorias: ordenar(bd.categorias),
      productos: ordenar(bd.productos),
      llamados: bd.llamados.slice(0, 8),
      generado: new Date().toISOString(),
    };
    return paquete;
  },
  escuchar(_canal, alRecibir) {
    // Solo BroadcastChannel: el evento "storage" haría que dos TVs abiertas se despierten entre sí sin fin.
    const c = obtenerCanal();
    const enMensaje = (ev: MessageEvent<EventoTv>) => alRecibir(ev.data);
    c?.addEventListener("message", enMensaje);
    return () => c?.removeEventListener("message", enMensaje);
  },
};
