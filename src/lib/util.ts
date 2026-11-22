import type { Horario, Organizacion } from "./tipos";

export const nuevoId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);

export function formatearPrecio(valor: number | null | undefined, moneda = "CLP") {
  if (valor === null || valor === undefined) return "";
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: moneda === "CLP" ? 0 : 2,
    }).format(valor);
  } catch {
    return "$" + valor.toLocaleString("es-CL");
  }
}

const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Hora y día de la semana en la zona horaria del negocio (la TV puede tener la hora mal configurada de zona).
export function ahoraEn(zona: string, fecha = new Date()) {
  try {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: zona,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(fecha);
    const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
    const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return { dia: dias.indexOf(v("weekday")), minutos: Number(v("hour")) * 60 + Number(v("minute")) };
  } catch {
    return { dia: fecha.getDay(), minutos: fecha.getHours() * 60 + fecha.getMinutes() };
  }
}

export function horarioActivo(h: Horario | null, zona: string, fecha = new Date()) {
  if (!h) return true;
  const { dia, minutos } = ahoraEn(zona, fecha);
  const desde = aMinutos(h.desde);
  const hasta = aMinutos(h.hasta);
  if (desde === hasta) return h.dias.includes(dia);
  if (desde < hasta) return h.dias.includes(dia) && minutos >= desde && minutos < hasta;
  // Cruza medianoche: de 20:00 a 02:00. Después de medianoche cuenta como el día anterior.
  if (minutos >= desde) return h.dias.includes(dia);
  if (minutos < hasta) return h.dias.includes((dia + 6) % 7);
  return false;
}

export const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function describirHorario(h: Horario | null) {
  if (!h) return "Siempre";
  const dias =
    h.dias.length === 7
      ? "Todos los días"
      : [1, 2, 3, 4, 5].every((d) => h.dias.includes(d)) && h.dias.length === 5
        ? "Lun a Vie"
        : h.dias
            .slice()
            .sort()
            .map((d) => DIAS_CORTOS[d])
            .join(", ");
  return `${dias} · ${h.desde} a ${h.hasta}`;
}

export function haceCuanto(iso: string | null) {
  if (!iso) return "Nunca";
  const seg = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return "Hace un momento";
  if (seg < 3600) return `Hace ${Math.round(seg / 60)} min`;
  if (seg < 86400) return `Hace ${Math.round(seg / 3600)} h`;
  return `Hace ${Math.round(seg / 86400)} días`;
}

// Una pantalla se considera en línea si reportó en los últimos 2 minutos.
export const enLinea = (iso: string | null) => !!iso && Date.now() - new Date(iso).getTime() < 120_000;

export const textoLlamado = (o: Pick<Organizacion, "turno_actual">) => String(o.turno_actual + 1);

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
