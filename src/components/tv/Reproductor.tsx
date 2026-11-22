"use client";
// Reproductor de TV. Funciona en el navegador de cualquier Smart TV, Android TV, Fire TV o PC.
// 1. Si no está vinculada, muestra un código y un QR para vincularla desde el panel.
// 2. Al vincularse, baja un "paquete" con todo su contenido y lo guarda: si se cae internet sigue mostrando lo último.
//    Nunca se bloquea por falta de conexión.
// 3. Escucha cambios en vivo (y además revisa cada minuto por si se perdió algún aviso).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Llamado, PaqueteTv } from "@/lib/tipos";
import { obtenerFuenteTv } from "@/lib/datos";
import { horarioActivo, nuevoId } from "@/lib/util";
import { CapaLlamado, Escena, type Contexto } from "./Escena";
import { anunciar, desbloquearAudio, timbre } from "./sonido";
import { Icono } from "../ui/Icono";

const CLAVE_SECRETO = "tvi-tv-secreto";
const CLAVE_PAQUETE = "tvi-tv-paquete";
const DURACION_LLAMADO = 9000;

const leerLocal = <T,>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};

function secretoDelAparato() {
  let s: string | null = null;
  try {
    s = localStorage.getItem(CLAVE_SECRETO);
    if (!s) {
      s = (nuevoId() + nuevoId()).replace(/-/g, "");
      localStorage.setItem(CLAVE_SECRETO, s);
    }
  } catch {
    s = (nuevoId() + nuevoId()).replace(/-/g, "");
  }
  return s;
}

export function Reproductor({ modo }: { modo: "demo" | "nube" }) {
  const fuente = useMemo(() => obtenerFuenteTv(modo), [modo]);
  const [secreto, setSecreto] = useState<string | null>(null);
  const [paquete, setPaquete] = useState<PaqueteTv | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [sinConexion, setSinConexion] = useState(false);
  const [listo, setListo] = useState(false);
  const [indice, setIndice] = useState(0);
  const [llamado, setLlamado] = useState<Llamado | null>(null);
  const [sonido, setSonido] = useState(false);
  const [controles, setControles] = useState(false);
  const [reloj, setReloj] = useState(0); // re-evalúa horarios cada minuto
  const vistos = useRef(new Set<string>());
  const sonidoRef = useRef(false);

  // ── Carga ────────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    if (!secreto) return;
    try {
      const p = await fuente.paquete(secreto);
      setSinConexion(false);
      if (p) {
        setPaquete(p);
        setCodigo(null);
        try {
          localStorage.setItem(CLAVE_PAQUETE, JSON.stringify(p));
        } catch {}
        p.llamados.forEach((l) => vistos.current.add(l.id));
      } else {
        // La pantalla no existe (nunca se vinculó o la borraron del panel).
        setPaquete(null);
        try {
          localStorage.removeItem(CLAVE_PAQUETE);
        } catch {}
        setCodigo(await fuente.solicitarCodigo(secreto));
      }
    } catch {
      setSinConexion(true); // Sigue con lo guardado.
    } finally {
      setListo(true);
    }
  }, [fuente, secreto]);

  useEffect(() => {
    setSecreto(secretoDelAparato());
    const guardado = leerLocal<PaqueteTv>(CLAVE_PAQUETE);
    if (guardado) {
      setPaquete(guardado);
      guardado.llamados.forEach((l) => vistos.current.add(l.id));
      setListo(true);
    }
  }, []);

  useEffect(() => {
    if (!secreto) return;
    cargar();
    const t = setInterval(cargar, codigo ? 4000 : 60_000);
    const enLinea = () => cargar();
    window.addEventListener("online", enLinea);
    return () => {
      clearInterval(t);
      window.removeEventListener("online", enLinea);
    };
  }, [secreto, cargar, codigo]);

  // ── Tiempo real ──────────────────────────────────────────────────────
  const canal = paquete?.org.canal;
  const llamadorActivo = paquete?.pantalla.llamador ?? true;
  useEffect(() => {
    if (!canal) return;
    return fuente.escuchar(canal, (e) => {
      if (e.tipo === "actualizar") cargar();
      if (e.tipo === "llamado" && !vistos.current.has(e.llamado.id)) {
        vistos.current.add(e.llamado.id);
        setPaquete((p) => (p ? { ...p, llamados: [e.llamado, ...p.llamados].slice(0, 8) } : p));
        if (llamadorActivo) {
          setLlamado(e.llamado);
          if (sonidoRef.current) {
            timbre();
            setTimeout(() => anunciar(e.llamado.texto, e.llamado.destino), 900);
          }
        }
      }
    });
  }, [canal, fuente, cargar, llamadorActivo]);

  // Mientras muestra el código, escucha su canal: al vincularla desde el panel, la TV cambia al instante.
  useEffect(() => {
    if (!codigo || paquete) return;
    return fuente.escuchar("vincular-" + codigo, () => cargar());
  }, [codigo, paquete, fuente, cargar]);

  useEffect(() => {
    if (!llamado) return;
    const t = setTimeout(() => setLlamado(null), DURACION_LLAMADO);
    return () => clearTimeout(t);
  }, [llamado]);

  // ── QR de vinculación ────────────────────────────────────────────────
  useEffect(() => {
    if (!codigo) return setQr(null);
    const url = `${location.origin}/panel/pantallas?codigo=${codigo}${modo === "demo" ? "&demo=1" : ""}`;
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#0a0c11", light: "#ffffff" } }).then(setQr, () => setQr(null));
  }, [codigo, modo]);

  // ── Pantalla siempre encendida ───────────────────────────────────────
  useEffect(() => {
    let bloqueo: { release: () => Promise<void> } | null = null;
    const pedir = async () => {
      try {
        bloqueo = await (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<typeof bloqueo> } }).wakeLock?.request("screen") ?? null;
      } catch {}
    };
    pedir();
    const vis = () => document.visibilityState === "visible" && pedir();
    document.addEventListener("visibilitychange", vis);
    const t = setInterval(() => setReloj((r) => r + 1), 60_000);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      clearInterval(t);
      bloqueo?.release().catch(() => {});
    };
  }, []);

  // ── Diapositivas activas según horario ───────────────────────────────
  const activas = useMemo(() => {
    if (!paquete) return [];
    void reloj;
    return paquete.diapositivas.filter((d) => d.activa && horarioActivo(d.horario, paquete.org.zona_horaria));
  }, [paquete, reloj]);

  const actual = activas.length ? activas[indice % activas.length] : null;
  const siguiente = useCallback(() => setIndice((i) => i + 1), []);
  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1 + (activas.length || 1))), [activas.length]);

  useEffect(() => {
    if (!actual || actual.tipo === "video" || activas.length < 2) return;
    const t = setTimeout(siguiente, Math.max(3, actual.duracion) * 1000);
    return () => clearTimeout(t);
  }, [actual, activas.length, siguiente, indice]);

  // ── Control remoto / teclado ─────────────────────────────────────────
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") siguiente();
      else if (e.key === "ArrowLeft") anterior();
      else if (e.key === "Enter" || e.key === " ") activarSonido();
      else if (e.key.toLowerCase() === "f") pantallaCompleta();
      setControles(true);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [siguiente, anterior]);

  useEffect(() => {
    if (!controles) return;
    const t = setTimeout(() => setControles(false), 4000);
    return () => clearTimeout(t);
  }, [controles]);

  function activarSonido() {
    if (desbloquearAudio()) {
      sonidoRef.current = true;
      setSonido(true);
    }
  }

  function pantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  // ── Render ───────────────────────────────────────────────────────────
  const vertical = paquete?.pantalla.orientacion === "vertical";
  const ctx: Contexto | null = paquete
    ? { org: paquete.org, categorias: paquete.categorias, productos: paquete.productos, llamados: paquete.llamados, tema: paquete.pantalla.tema, vertical }
    : null;

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-black select-none"
      style={{ cursor: controles ? "default" : "none" }}
      onMouseMove={() => setControles(true)}
      onClick={() => {
        setControles(true);
        if (!sonido) activarSonido();
      }}
    >
      {!listo && <Cargando />}

      {listo && !paquete && <Vincular codigo={codigo} qr={qr} sinConexion={sinConexion} modo={modo} />}

      {paquete && ctx && (
        <Girar vertical={vertical}>
          {actual ? (
            <Escena key={actual.id + ":" + indice} d={actual} ctx={ctx} alTerminarVideo={siguiente} />
          ) : (
            <SinContenido nombre={paquete.pantalla.nombre} />
          )}
          {llamado && <CapaLlamado l={llamado} ctx={ctx} />}
        </Girar>
      )}

      {paquete && (
        <div
          className="fixed right-4 top-4 z-30 flex items-center gap-2 transition-opacity duration-300"
          style={{ opacity: controles || sinConexion || !sonido ? 1 : 0 }}
        >
          {sinConexion && (
            <span className="chip bg-black/70 text-amber-300 backdrop-blur" title="Mostrando lo último guardado">
              <Icono nombre="wifiNo" className="size-3.5" /> Sin conexión
            </span>
          )}
          {!sonido && paquete.pantalla.llamador && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                activarSonido();
              }}
              className="chip h-8 bg-white text-black px-3"
            >
              <Icono nombre="volumen" className="size-4" /> Activar sonido
            </button>
          )}
          {controles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                pantallaCompleta();
              }}
              className="chip h-8 bg-black/70 text-white px-3 backdrop-blur"
            >
              <Icono nombre="pantallaCompleta" className="size-4" /> Pantalla completa
            </button>
          )}
        </div>
      )}
    </main>
  );
}

// Las TVs suelen estar en horizontal; si la pantalla es vertical se gira el contenido 90°.
function Girar({ vertical, children }: { vertical: boolean; children: React.ReactNode }) {
  const [girar, setGirar] = useState(false);
  useEffect(() => {
    const medir = () => setGirar(vertical && window.innerWidth > window.innerHeight);
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [vertical]);
  return (
    <div
      className="absolute"
      style={
        girar
          ? { width: "100vh", height: "100vw", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)", containerType: "size" }
          : { inset: 0, containerType: "size" }
      }
    >
      {children}
    </div>
  );
}

function Cargando() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#07080c]">
      <div className="text-white/80 font-bold tvi-pulso" style={{ fontSize: "2.4vw", fontFamily: "var(--font-display)" }}>
        TV Interactiva
      </div>
    </div>
  );
}

function SinContenido({ nombre }: { nombre: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07080c] text-white text-center" style={{ padding: "6cqw" }}>
      <div style={{ fontSize: "3.6cqw", fontFamily: "var(--font-display)" }} className="font-extrabold">
        {nombre} está lista
      </div>
      <div style={{ fontSize: "1.8cqw", marginTop: "2cqh" }} className="text-white/60">
        Asígnale una lista con contenido desde el panel, o revisa los horarios de tus diapositivas.
      </div>
    </div>
  );
}

function Vincular({ codigo, qr, sinConexion, modo }: { codigo: string | null; qr: string | null; sinConexion: boolean; modo: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#07080c] text-white" style={{ containerType: "size" }}>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(50% 60% at 30% 30%, #6366f155, transparent 70%), radial-gradient(40% 50% at 80% 80%, #14b8a633, transparent 70%)" }}
      />
      <div className="relative flex items-center" style={{ gap: "6cqw", padding: "6cqw" }}>
        <div style={{ maxWidth: "44cqw" }}>
          <div className="font-bold uppercase text-white/60" style={{ fontSize: "1.3cqw", letterSpacing: "0.2em" }}>
            TV Interactiva {modo === "demo" && "· Demo"}
          </div>
          <h1 className="font-extrabold leading-tight" style={{ fontSize: "4cqw", fontFamily: "var(--font-display)", marginTop: "1.5cqh" }}>
            Vincula esta pantalla
          </h1>
          <ol className="text-white/75" style={{ fontSize: "1.6cqw", marginTop: "3cqh", lineHeight: 1.6 }}>
            <li>1. Escanea el código QR con tu celular, o</li>
            <li>2. Entra al panel → Pantallas → Vincular, y escribe este código:</li>
          </ol>
          <div
            className="font-extrabold tabular-nums rounded-2xl inline-block"
            style={{ fontSize: "6.2cqw", letterSpacing: "0.12em", marginTop: "3cqh", padding: "1cqh 2.2cqw", background: "#ffffff12", border: "1px solid #ffffff22" }}
          >
            {codigo ?? (sinConexion ? "······" : "······")}
          </div>
          {sinConexion && (
            <p className="text-amber-300" style={{ fontSize: "1.4cqw", marginTop: "2cqh" }}>
              Esta TV no tiene internet. Conéctala para vincularla por primera vez.
            </p>
          )}
        </div>
        <div className="rounded-3xl bg-white shrink-0" style={{ padding: "1.2cqw" }}>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Código QR para vincular" style={{ width: "22cqw", height: "22cqw" }} />
          ) : (
            <div style={{ width: "22cqw", height: "22cqw" }} />
          )}
        </div>
      </div>
    </div>
  );
}
