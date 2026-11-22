"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Almacen, Usuario } from "@/lib/datos";
import { obtenerAlmacen, usarModo } from "@/lib/datos";
import type { FilaDe, Organizacion, Tabla } from "@/lib/tipos";

interface Valor {
  almacen: Almacen;
  usuario: Usuario | null;
  org: Organizacion | null;
  cargando: boolean;
  recargarOrg: () => Promise<void>;
  avisar: (texto: string, tipo?: "ok" | "error") => void;
}

const Ctx = createContext<Valor | null>(null);

export function usePanel() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePanel fuera de PanelProvider");
  return v;
}

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [almacen, setAlmacen] = useState<Almacen | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [org, setOrg] = useState<Organizacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState<{ texto: string; tipo: "ok" | "error"; id: number } | null>(null);

  useEffect(() => {
    // ?demo=1 en cualquier enlace del panel entra a la demo (por ejemplo, el QR que muestra la TV de demo).
    if (new URLSearchParams(location.search).get("demo") === "1") usarModo("demo");
    setAlmacen(obtenerAlmacen());
  }, []);

  const recargarOrg = useCallback(async () => {
    if (!almacen) return;
    setOrg(await almacen.miOrg());
  }, [almacen]);

  useEffect(() => {
    if (!almacen) return;
    (async () => {
      try {
        const u = await almacen.usuario();
        setUsuario(u);
        if (u) setOrg(await almacen.miOrg());
      } finally {
        setCargando(false);
      }
    })();
  }, [almacen]);

  const avisar = useCallback((texto: string, tipo: "ok" | "error" = "ok") => setAviso({ texto, tipo, id: Date.now() }), []);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!almacen) return null;
  return (
    <Ctx.Provider value={{ almacen, usuario, org, cargando, recargarOrg, avisar }}>
      {children}
      {aviso && (
        <div
          key={aviso.id}
          role="status"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-card tvi-entrar ${
            aviso.tipo === "error" ? "bg-danger text-white" : "bg-ink text-bg"
          }`}
        >
          {aviso.texto}
        </div>
      )}
    </Ctx.Provider>
  );
}

// Lee una tabla y la mantiene en memoria. `guardar` actualiza al instante y avisa a las TVs.
export function useTabla<T extends Tabla>(tabla: T) {
  const { almacen, org, avisar } = usePanel();
  const [filas, setFilas] = useState<FilaDe[T][]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    if (!org) return;
    try {
      setFilas(await almacen.listar(tabla));
    } catch (e) {
      avisar(String((e as Error).message), "error");
    } finally {
      setCargando(false);
    }
  }, [almacen, org, tabla, avisar]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const guardar = useCallback(
    async (f: FilaDe[T] | FilaDe[T][], { silencioso = false } = {}) => {
      const lista = Array.isArray(f) ? f : [f];
      setFilas((prev) => {
        const nuevo = prev.slice();
        for (const x of lista) {
          const i = nuevo.findIndex((y) => (y as { id: string }).id === (x as { id: string }).id);
          if (i >= 0) nuevo[i] = x;
          else nuevo.push(x);
        }
        return nuevo;
      });
      try {
        await almacen.guardar(tabla, f);
        await almacen.avisarTvs();
        if (!silencioso) avisar("Guardado. Las pantallas ya se actualizaron.");
      } catch (e) {
        avisar((e as Error).message, "error");
        recargar();
      }
    },
    [almacen, tabla, avisar, recargar],
  );

  const borrar = useCallback(
    async (id: string) => {
      setFilas((prev) => prev.filter((x) => (x as { id: string }).id !== id));
      try {
        await almacen.borrar(tabla, id);
        await almacen.avisarTvs();
      } catch (e) {
        avisar((e as Error).message, "error");
        recargar();
      }
    },
    [almacen, tabla, avisar, recargar],
  );

  return { filas, setFilas, cargando, recargar, guardar, borrar };
}
