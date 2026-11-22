"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePanel } from "./Contexto";
import { Onboarding } from "./Onboarding";
import { Icono } from "../ui/Icono";
import { Logo } from "../ui/Logo";
import { TemaToggle } from "../ui/TemaToggle";
import { BotonInstalar } from "../ui/BotonInstalar";
import { infoRubro } from "@/lib/rubros";
import { usarModo } from "@/lib/datos";
import { cx } from "@/lib/util";

export function MarcoPanel({ children }: { children: React.ReactNode }) {
  const { almacen, usuario, org, cargando } = usePanel();
  const ruta = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/entrar");
  }, [cargando, usuario, router]);

  useEffect(() => setMenu(false), [ruta]);

  if (cargando || !usuario) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <Logo className="opacity-60 tvi-pulso" />
      </div>
    );
  }

  if (!org) return <Onboarding />;

  const rubro = infoRubro(org.rubro);
  const enlaces = [
    { href: "/panel", icono: "inicio", texto: "Inicio" },
    { href: "/panel/pantallas", icono: "tv", texto: "Pantallas" },
    { href: "/panel/contenido", icono: "capas", texto: "Contenido" },
    { href: "/panel/catalogo", icono: "lista", texto: rubro.catalogo },
    { href: "/panel/llamador", icono: "campana", texto: "Llamador" },
    { href: "/panel/ajustes", icono: "ajustes", texto: "Ajustes" },
  ];

  const nav = (
    <nav className="flex flex-col gap-1">
      {enlaces.map((e) => {
        const activo = e.href === "/panel" ? ruta === "/panel" : ruta.startsWith(e.href);
        return (
          <Link
            key={e.href}
            href={e.href}
            className={cx(
              "flex items-center gap-3 rounded-xl px-3 h-10 text-sm font-semibold transition",
              activo ? "bg-accent-soft text-accent" : "text-muted hover:text-ink hover:bg-surface-2",
            )}
          >
            <Icono nombre={e.icono} />
            {e.texto}
          </Link>
        );
      })}
    </nav>
  );

  const salir = async () => {
    if (almacen.modo === "demo") usarModo("nube");
    await almacen.salir();
    location.href = "/";
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:flex flex-col gap-6 border-r border-line bg-surface px-4 py-5 sticky top-0 h-dvh">
        <Link href="/panel" className="px-2">
          <Logo />
        </Link>
        <div className="px-3">
          <div className="text-sm font-bold truncate">{org.nombre}</div>
          <div className="text-xs text-muted">{rubro.nombre}</div>
        </div>
        {nav}
        <div className="mt-auto flex flex-col gap-2">
          {almacen.modo === "demo" && (
            <div className="rounded-xl bg-accent-soft text-accent text-xs font-semibold p-3 leading-relaxed">
              Estás en la demo. Lo que armes queda guardado solo en este navegador.
            </div>
          )}
          <BotonInstalar className="btn-secundario w-full" />
          <div className="flex items-center justify-between">
            <TemaToggle />
            <button className="btn-fantasma" onClick={salir}>
              <Icono nombre="salir" /> {almacen.modo === "demo" ? "Salir de la demo" : "Salir"}
            </button>
          </div>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-surface/90 backdrop-blur px-4 h-14">
        <Link href="/panel">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <TemaToggle />
          <button className="btn-fantasma !px-0 w-10" onClick={() => setMenu((m) => !m)} aria-label="Menú">
            <Icono nombre={menu ? "x" : "lista"} />
          </button>
        </div>
      </header>
      {menu && (
        <div className="lg:hidden fixed inset-x-0 top-14 z-30 border-b border-line bg-surface p-4 shadow-card">
          {nav}
          <div className="mt-3 flex gap-2">
            <BotonInstalar className="btn-secundario flex-1" />
            <button className="btn-secundario flex-1" onClick={salir}>
              <Icono nombre="salir" /> Salir
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}

export function Encabezado({ titulo, descripcion, accion }: { titulo: string; descripcion?: string; accion?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-muted max-w-xl">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}
