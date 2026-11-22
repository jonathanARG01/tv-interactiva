import Link from "next/link";
import { DemoTv } from "@/components/landing/DemoTv";
import { Precios } from "@/components/landing/Precios";
import { Icono } from "@/components/ui/Icono";
import { Logo, NOMBRE_PRODUCTO } from "@/components/ui/Logo";
import { TemaToggle } from "@/components/ui/TemaToggle";
import { BotonInstalar } from "@/components/ui/BotonInstalar";

const RUBROS = [
  { icono: "menu", titulo: "Restaurantes y cafeterías", texto: "Menú en pantalla con precios al día, agotados al instante, happy hour que aparece solo a la hora." },
  { icono: "usuario", titulo: "Clínicas y consultas", texto: "Sala de espera con bienvenida, llamado de pacientes por nombre y box, e información útil." },
  { icono: "turnos", titulo: "Atención con números", texto: "Llamador de turnos con voz para notarías, bancos, farmacias y oficinas públicas." },
  { icono: "estrella", titulo: "Tiendas", texto: "Vitrina con ofertas, nuevos productos y precios destacados que cambias desde el celular." },
  { icono: "campana", titulo: "Empresas y colegios", texto: "Avisos internos, bienvenida a visitas, cumpleaños y comunicados en cada piso." },
  { icono: "mundo", titulo: "Y mucho más", texto: "Gimnasios, hoteles, peluquerías, veterinarias. Si tiene una TV, puede trabajar por ti." },
];

const FUNCIONES = [
  { icono: "rayo", titulo: "Cambios en segundos", texto: "Editas en el celular y la TV se actualiza sola, sin tocarla." },
  { icono: "wifiNo", titulo: "Nunca queda en negro", texto: "Si se cae internet, la TV sigue mostrando lo último. No se bloquea a las pocas horas como otros sistemas." },
  { icono: "volumen", titulo: "Llamador con voz", texto: "Llama números o nombres con timbre y voz en español. Funciona desde cualquier computador o celular." },
  { icono: "calendario", titulo: "Programación por horario", texto: "Desayunos en la mañana, almuerzos al mediodía, promociones solo los viernes. Todo automático." },
  { icono: "tv", titulo: "Cualquier pantalla", texto: "Smart TV, Android TV, Fire TV, un PC o un tablet. Horizontal o vertical. Sin aparatos especiales." },
  { icono: "lista", titulo: "Precios conectados", texto: "Cargas tus productos una vez y aparecen en todas tus diapositivas. Cambias un precio y cambia en todas." },
  { icono: "descarga", titulo: "Se instala como app", texto: "El panel y el reproductor se instalan en Windows, Mac, Android y Chromebook con un clic." },
  { icono: "escudo", titulo: "Hecho en Chile", texto: "Precios en pesos, soporte en español por WhatsApp y horarios con la zona horaria de tu local." },
];

const PREGUNTAS = [
  ["¿Necesito comprar algún aparato?", "No. Sirve cualquier Smart TV con navegador, un Android TV o Fire TV Stick, o un computador conectado a la TV."],
  ["¿Qué pasa si se corta internet?", "La TV sigue mostrando el último contenido que recibió, sin límite de tiempo. Cuando vuelve la conexión, se pone al día sola."],
  ["¿Puedo tener pantallas distintas en cada lugar?", "Sí. Cada pantalla muestra la lista que tú elijas: el menú en el mostrador, las promos en la entrada y el llamador en la sala de espera."],
  ["¿Cómo funciona el llamador?", "Abres la sección Llamador en el computador o celular de quien atiende y tocas “Llamar siguiente”. El número aparece en grande en la TV, con timbre y voz."],
  ["¿Funciona con Platovi?", "Estamos preparando la conexión: tus platos y precios de Platovi aparecerán solos en la TV, sin cargarlos dos veces."],
  ["¿Hay permanencia?", "No. Pagas mes a mes y puedes cancelar cuando quieras. Los primeros 14 días son gratis y sin tarjeta."],
];

export default function Inicio() {
  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label={NOMBRE_PRODUCTO}>
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-muted">
            <a href="#rubros" className="px-3 py-2 hover:text-ink">Rubros</a>
            <a href="#funciones" className="px-3 py-2 hover:text-ink">Funciones</a>
            <a href="#precios" className="px-3 py-2 hover:text-ink">Precios</a>
            <a href="#preguntas" className="px-3 py-2 hover:text-ink">Preguntas</a>
          </nav>
          <div className="flex items-center gap-1">
            <TemaToggle />
            <Link href="/entrar" className="btn-fantasma hidden sm:inline-flex">Entrar</Link>
            <Link href="/demo" className="btn-primario">Probar gratis</Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[640px] opacity-70 dark:opacity-50"
          style={{ background: "radial-gradient(40% 50% at 25% 30%, color-mix(in oklab, var(--accent) 28%, transparent), transparent 70%), radial-gradient(35% 45% at 80% 20%, color-mix(in oklab, #14b8a6 22%, transparent), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip bg-accent-soft text-accent">Menús · Salas de espera · Turnos · Avisos</span>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.4rem)] font-extrabold leading-[1.02] tracking-tight">
              La TV de tu negocio, trabajando por ti todo el día.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
              Muestra tu menú, llama turnos con voz y comunica tus promociones en cualquier TV. Lo cambias desde el celular, se actualiza en segundos y sigue funcionando aunque se caiga internet.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/demo" className="btn-primario !h-12 !px-6 text-base">
                Probar la demo ahora <Icono nombre="flecha" />
              </Link>
              <Link href="/entrar?registro=1" className="btn-secundario !h-12 !px-6 text-base">
                Crear cuenta gratis
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">Sin tarjeta · 14 días con todo incluido · Sin permanencia</p>
          </div>
          <div className="mx-auto mt-14 max-w-4xl">
            <DemoTv />
          </div>
        </div>
      </section>

      <section id="rubros" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Titulo etiqueta="Para todo tipo de negocio" titulo="Una pantalla, muchos trabajos" texto="Elige tu rubro al registrarte y te armamos la primera pantalla con contenido de ejemplo listo para editar." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RUBROS.map((r) => (
              <div key={r.titulo} className="rounded-2xl border border-line bg-bg p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icono nombre={r.icono} className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{r.titulo}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Titulo etiqueta="Cómo funciona" titulo="Listo en 5 minutos" />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["Abre el reproductor en tu TV", "Entra a la dirección del reproductor desde el navegador de la TV, o instala la app. Aparece un código."],
              ["Vincúlala desde tu celular", "Escanea el QR o escribe el código en el panel. Elige qué lista mostrar en esa pantalla."],
              ["Edita y listo", "Cambia precios, sube imágenes o llama turnos. La TV se actualiza sola en segundos."],
            ].map(([t, x], i) => (
              <li key={t} className="relative rounded-2xl border border-line bg-surface p-6">
                <span className="font-display text-5xl font-extrabold text-accent/25">{i + 1}</span>
                <h3 className="mt-2 font-display text-lg font-bold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{x}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="funciones" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Titulo etiqueta="Funciones" titulo="Todo lo que necesitas, nada que estorbe" />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {FUNCIONES.map((f) => (
              <div key={f.titulo}>
                <Icono nombre={f.icono} className="size-6 text-accent" />
                <h3 className="mt-3 font-bold">{f.titulo}</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precios" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Titulo etiqueta="Precios" titulo="Simple y en pesos chilenos" texto="Empieza gratis con una pantalla. Sube de plan cuando lo necesites." />
          <div className="mt-10">
            <Precios />
          </div>
        </div>
      </section>

      <section id="preguntas" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <Titulo etiqueta="Preguntas" titulo="Lo que más nos preguntan" />
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-bg">
            {PREGUNTAS.map(([p, r]) => (
              <details key={p} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  {p}
                  <Icono nombre="abajo" className="size-5 shrink-0 text-muted transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted leading-relaxed">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a0c11] px-6 py-14 text-center text-white sm:px-12">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(45% 70% at 20% 20%, #6366f166, transparent 70%), radial-gradient(40% 60% at 85% 90%, #14b8a644, transparent 70%)" }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Prende tu TV y pruébalo hoy</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/70">La demo funciona en tu navegador, sin registrarte. Abre el reproductor en otra pestaña o en tu TV y mira cómo cambia en vivo.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/demo" className="btn !h-12 !px-6 bg-white text-black hover:bg-white/90">
                  Abrir la demo
                </Link>
                <BotonInstalar className="btn !h-12 !px-6 border border-white/25 text-white hover:bg-white/10" texto="Instalar en este equipo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
          <Logo className="text-ink" />
          <div className="flex flex-wrap gap-4">
            <Link href="/entrar" className="hover:text-ink">Entrar</Link>
            <Link href="/tv" className="hover:text-ink">Reproductor</Link>
            <a href="#precios" className="hover:text-ink">Precios</a>
          </div>
          <span>© {new Date().getFullYear()} {NOMBRE_PRODUCTO} · Hecho en Chile</span>
        </div>
      </footer>
    </div>
  );
}

function Titulo({ etiqueta, titulo, texto }: { etiqueta: string; titulo: string; texto?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{etiqueta}</div>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">{titulo}</h2>
      {texto && <p className="mt-3 text-muted">{texto}</p>}
    </div>
  );
}
