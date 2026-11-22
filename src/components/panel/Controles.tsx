"use client";
import { cx } from "@/lib/util";

export function Interruptor({
  etiqueta,
  valor,
  alCambiar,
  deshabilitado,
}: {
  etiqueta: string;
  valor: boolean;
  alCambiar: (v: boolean) => void;
  deshabilitado?: boolean;
}) {
  return (
    <label className={cx("flex items-center gap-3 text-sm font-semibold", deshabilitado ? "opacity-50" : "cursor-pointer")}>
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        disabled={deshabilitado}
        onClick={() => alCambiar(!valor)}
        className={cx("relative h-6 w-10 shrink-0 rounded-full transition", valor ? "bg-accent" : "bg-line")}
      >
        <span className={cx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", valor ? "left-[18px]" : "left-0.5")} />
      </button>
      {etiqueta}
    </label>
  );
}

export function Segmentos({ valor, opciones, alCambiar }: { valor: string; opciones: [string, string][]; alCambiar: (v: string) => void }) {
  return (
    <div className="flex rounded-xl border border-line p-1 gap-1 bg-surface-2">
      {opciones.map(([v, t]) => (
        <button
          key={v}
          type="button"
          onClick={() => alCambiar(v)}
          className={cx("flex-1 rounded-lg h-8 px-2 text-xs font-semibold transition", valor === v ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink")}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
