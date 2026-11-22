"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { almacenNube } from "@/lib/datos/nube";
import { nubeConfigurada, usarModo } from "@/lib/datos";
import { Logo } from "@/components/ui/Logo";
import { TemaToggle } from "@/components/ui/TemaToggle";
import { Icono } from "@/components/ui/Icono";
import { cx } from "@/lib/util";

export function FormEntrar() {
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [nube, setNube] = useState(true);

  useEffect(() => {
    setNube(nubeConfigurada());
    if (new URLSearchParams(location.search).get("registro") === "1") setModo("registro");
  }, []);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      usarModo("nube");
      if (modo === "entrar") {
        await almacenNube.entrar(email, clave);
        location.href = "/panel";
      } else {
        const r = await almacenNube.registrar(email, clave);
        if (r.confirmar) setMensaje("Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve a entrar.");
        else location.href = "/panel";
      }
    } catch (err) {
      const m = (err as Error).message;
      setError(
        /invalid login/i.test(m)
          ? "Correo o contraseña incorrectos."
          : /already registered/i.test(m)
            ? "Ese correo ya tiene cuenta. Entra con tu contraseña."
            : m,
      );
    } finally {
      setEnviando(false);
    }
  };

  const entrarDemo = () => {
    usarModo("demo");
    location.href = "/panel";
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <TemaToggle />
        </div>
        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">{modo === "entrar" ? "Hola de nuevo" : "Crea tu cuenta"}</h1>
            <p className="mt-1 text-sm text-muted">
              {modo === "entrar" ? "Entra para administrar tus pantallas." : "14 días gratis con todo incluido. Sin tarjeta."}
            </p>

            {nube ? (
              <>
                <div className="mt-6 flex rounded-xl border border-line p-1 gap-1 bg-surface-2">
                  {(["entrar", "registro"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModo(m)}
                      className={cx("flex-1 rounded-lg h-9 text-sm font-semibold", modo === m ? "bg-surface shadow-card" : "text-muted")}
                    >
                      {m === "entrar" ? "Entrar" : "Crear cuenta"}
                    </button>
                  ))}
                </div>
                {mensaje ? (
                  <p className="mt-6 rounded-xl bg-accent-soft text-accent p-4 text-sm font-semibold">{mensaje}</p>
                ) : (
                  <form onSubmit={enviar} className="mt-5 flex flex-col gap-3">
                    <div>
                      <label className="etiqueta" htmlFor="email">
                        Correo
                      </label>
                      <input id="email" type="email" className="campo" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                    <div>
                      <label className="etiqueta" htmlFor="clave">
                        Contraseña
                      </label>
                      <input
                        id="clave"
                        type="password"
                        className="campo"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        required
                        minLength={8}
                        autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                      />
                    </div>
                    {error && <p className="text-sm text-danger font-semibold">{error}</p>}
                    <button className="btn-primario mt-2" disabled={enviando}>
                      {enviando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <p className="mt-6 rounded-xl bg-surface-2 p-4 text-sm text-muted">
                Las cuentas se habilitan pronto. Mientras tanto, prueba todo el sistema en la demo.
              </p>
            )}

            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" /> o <span className="h-px flex-1 bg-line" />
            </div>
            <button className="btn-secundario w-full" onClick={entrarDemo}>
              <Icono nombre="rayo" /> Probar la demo sin registrarme
            </button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-[#0a0c11]">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(50% 50% at 30% 30%, #6366f166, transparent 70%), radial-gradient(40% 40% at 80% 75%, #14b8a644, transparent 70%)" }}
        />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <p className="font-display text-4xl font-extrabold leading-tight max-w-md">Tu TV, trabajando por ti todo el día.</p>
          <p className="mt-3 text-white/70 max-w-md">Menús, salas de espera, turnos y avisos. Lo cambias desde el celular y la pantalla se actualiza sola.</p>
        </div>
      </div>
    </div>
  );
}
