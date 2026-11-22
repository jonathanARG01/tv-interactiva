// Modelo de datos de TV Interactiva. Es el mismo para el modo demo (navegador) y para Supabase.
// Las columnas `origen` y `externo_id` existen para el puente futuro con Platovi: un producto importado
// desde Platovi lleva origen "platovi" y el id que tiene allá, y se actualiza sin duplicarse.

export type Rubro = "restaurante" | "cafeteria" | "clinica" | "turnos" | "retail" | "oficina" | "otro";
export type Origen = "propio" | "platovi";
export type PlanId = "gratis" | "pro" | "negocio";

export interface Marca {
  color: string; // color de acento en las pantallas
  logo?: string | null;
  fuente?: "moderna" | "clasica" | "redonda";
}

export interface Organizacion {
  id: string;
  nombre: string;
  rubro: Rubro;
  plan: PlanId;
  marca: Marca;
  moneda: string; // CLP por defecto
  zona_horaria: string; // America/Santiago por defecto
  canal: string; // clave aleatoria del canal en tiempo real (no se muestra)
  turno_actual: number; // último número llamado con "Llamar siguiente"
  creado: string;
}

export interface Categoria {
  id: string;
  org_id: string;
  nombre: string;
  orden: number;
  visible: boolean;
  origen: Origen;
  externo_id: string | null;
}

export interface Producto {
  id: string;
  org_id: string;
  categoria_id: string | null;
  nombre: string;
  descripcion: string;
  precio: number | null; // en la moneda de la organización; null = sin precio (servicios, avisos)
  foto: string | null;
  agotado: boolean;
  destacado: boolean;
  orden: number;
  origen: Origen;
  externo_id: string | null;
}

export interface Lista {
  id: string;
  org_id: string;
  nombre: string;
  creado: string;
}

export type TipoDiapositiva = "menu" | "imagen" | "video" | "aviso" | "turnos" | "bienvenida";

export interface Horario {
  dias: number[]; // 0 = domingo … 6 = sábado
  desde: string; // "HH:MM"
  hasta: string; // "HH:MM" (si es menor que desde, cruza la medianoche)
}

export interface DatosMenu {
  titulo: string;
  categoria_ids: string[]; // vacío = todas las visibles
  fotos: boolean;
  columnas: 1 | 2 | 3;
}
export interface DatosImagen {
  url: string;
  ajuste: "cubrir" | "contener";
  texto?: string;
}
export interface DatosVideo {
  url: string;
  silencio: boolean;
}
export interface DatosAviso {
  titulo: string;
  texto: string;
  estilo: "acento" | "suave" | "alerta";
}
export interface DatosTurnos {
  titulo: string;
  mensaje: string;
}
export interface DatosBienvenida {
  titulo: string;
  subtitulo: string;
  reloj: boolean;
}

export type DatosDiapositiva = DatosMenu | DatosImagen | DatosVideo | DatosAviso | DatosTurnos | DatosBienvenida;

export interface Diapositiva {
  id: string;
  org_id: string;
  lista_id: string;
  tipo: TipoDiapositiva;
  orden: number;
  duracion: number; // segundos (los videos duran lo que dure el video)
  activa: boolean;
  horario: Horario | null;
  datos: DatosDiapositiva;
}

export interface Pantalla {
  id: string;
  org_id: string;
  nombre: string;
  lista_id: string | null;
  orientacion: "horizontal" | "vertical";
  tema: "oscuro" | "claro";
  llamador: boolean; // muestra los llamados encima de lo que esté pasando
  ultimo_contacto: string | null;
  creado: string;
}

export interface Llamado {
  id: string;
  org_id: string;
  texto: string; // "A-23", "Juan Pérez"
  destino: string; // "Box 2", "Caja 1"
  creado: string;
}

// Todo lo que una TV necesita para funcionar, en un solo paquete que se guarda para el modo sin internet.
export interface PaqueteTv {
  org: Pick<Organizacion, "id" | "nombre" | "rubro" | "marca" | "moneda" | "zona_horaria" | "canal" | "plan">;
  pantalla: Pantalla;
  diapositivas: Diapositiva[];
  categorias: Categoria[];
  productos: Producto[];
  llamados: Llamado[];
  generado: string;
}

export type Tabla = "categorias" | "productos" | "listas" | "diapositivas" | "pantallas" | "llamados";

export interface FilaDe {
  categorias: Categoria;
  productos: Producto;
  listas: Lista;
  diapositivas: Diapositiva;
  pantallas: Pantalla;
  llamados: Llamado;
}
