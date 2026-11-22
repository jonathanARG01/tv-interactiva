"use client";
import { useRef, useState } from "react";
import { usePanel } from "./Contexto";
import { Icono } from "../ui/Icono";

export function SubirArchivo({
  acepta,
  alSubir,
  texto = "Subir archivo",
}: {
  acepta: string;
  alSubir: (url: string) => void;
  texto?: string;
}) {
  const { almacen, avisar } = usePanel();
  const ref = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={acepta}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setSubiendo(true);
          try {
            alSubir(await almacen.subirArchivo(f, f.name));
          } catch (err) {
            avisar((err as Error).message, "error");
          } finally {
            setSubiendo(false);
          }
        }}
      />
      <button type="button" className="btn-secundario" onClick={() => ref.current?.click()} disabled={subiendo}>
        <Icono nombre="descarga" className="size-4 rotate-180" /> {subiendo ? "Subiendo…" : texto}
      </button>
    </>
  );
}
