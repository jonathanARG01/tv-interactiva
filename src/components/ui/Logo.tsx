import { cx } from "@/lib/util";

// Marca provisoria. El nombre definitivo se cambia aquí y en los manifest.
export const NOMBRE_PRODUCTO = "TV Interactiva";

export function Logo({ className, conTexto = true }: { className?: string; conTexto?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2 font-display font-extrabold tracking-tight", className)}>
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
        <rect x="2" y="5" width="28" height="19" rx="5" fill="var(--accent)" />
        <path d="M12 10.5v8l7-4-7-4Z" fill="var(--accent-ink)" />
        <path d="M11 28h10" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {conTexto && <span className="text-[17px]">{NOMBRE_PRODUCTO}</span>}
    </span>
  );
}
