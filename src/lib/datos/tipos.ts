import type { FilaDe, Llamado, Organizacion, PaqueteTv, Pantalla, Rubro, Tabla } from "../tipos";

export type EventoTv = { tipo: "actualizar" } | { tipo: "llamado"; llamado: Llamado };

export interface Usuario {
  id: string;
  email: string;
}

// Lo que usa el panel. Hay dos implementaciones: demo (todo en el navegador) y nube (Supabase).
export interface Almacen {
  modo: "demo" | "nube";
  usuario(): Promise<Usuario | null>;
  entrar(email: string, clave: string): Promise<void>;
  registrar(email: string, clave: string): Promise<{ confirmar: boolean }>;
  salir(): Promise<void>;
  miOrg(): Promise<Organizacion | null>;
  crearOrg(nombre: string, rubro: Rubro): Promise<Organizacion>;
  actualizarOrg(cambios: Partial<Pick<Organizacion, "nombre" | "rubro" | "marca" | "moneda" | "zona_horaria">>): Promise<void>;
  listar<T extends Tabla>(tabla: T): Promise<FilaDe[T][]>;
  guardar<T extends Tabla>(tabla: T, filas: FilaDe[T] | FilaDe[T][]): Promise<void>;
  borrar(tabla: Tabla, id: string): Promise<void>;
  vincularPantalla(codigo: string, nombre: string, lista_id: string | null): Promise<Pantalla>;
  llamar(entrada: { texto?: string; destino: string }): Promise<Llamado>;
  subirArchivo(archivo: File | Blob, nombre: string): Promise<string>;
  avisarTvs(): Promise<void>;
}

// Lo que usa la TV. No tiene sesión: se identifica con un secreto guardado en el aparato.
export interface FuenteTv {
  modo: "demo" | "nube";
  solicitarCodigo(secreto: string): Promise<string | null>; // null = ya está vinculada
  paquete(secreto: string): Promise<PaqueteTv | null>; // null = la pantalla se borró o no está vinculada
  escuchar(canal: string, alRecibir: (e: EventoTv) => void): () => void;
}
