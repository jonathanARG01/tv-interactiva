import type { PlanId } from "./tipos";

// Planes y precios (CLP, + IVA). Los límites se validan también en la base de datos (supabase/migrations),
// no solo en el navegador. Para cambiar precios o límites, edita este archivo y la función `limite_plan` del SQL.
export interface Plan {
  id: PlanId;
  nombre: string;
  precio: number; // mensual
  resumen: string;
  pantallas: number;
  diapositivas: number;
  video: boolean;
  programacion: boolean;
  marca: boolean;
  destacado?: boolean;
  incluye: string[];
}

export const PLANES: Plan[] = [
  {
    id: "gratis",
    nombre: "Inicial",
    precio: 0,
    resumen: "Para probar con tu primera pantalla",
    pantallas: 1,
    diapositivas: 8,
    video: false,
    programacion: false,
    marca: false,
    incluye: ["1 pantalla", "8 diapositivas", "Menú, avisos e imágenes", "Llamador de turnos básico", "Funciona sin internet"],
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 12990,
    resumen: "Para locales, consultas y salas de espera",
    pantallas: 3,
    diapositivas: 100,
    video: true,
    programacion: true,
    marca: true,
    destacado: true,
    incluye: [
      "3 pantallas",
      "100 diapositivas por lista",
      "Videos",
      "Programación por horario y día",
      "Llamador con voz",
      "Tu logo y colores",
    ],
  },
  {
    id: "negocio",
    nombre: "Negocio",
    precio: 29990,
    resumen: "Para cadenas, clínicas y varias sucursales",
    pantallas: 15,
    diapositivas: 300,
    video: true,
    programacion: true,
    marca: true,
    incluye: [
      "15 pantallas",
      "300 diapositivas por lista",
      "Todo lo de Pro",
      "Equipo con varios usuarios",
      "Soporte prioritario por WhatsApp",
    ],
  },
];

export const planPorId = (id: PlanId) => PLANES.find((p) => p.id === id) ?? PLANES[0];

export const DESCUENTO_ANUAL = 0.15;
export const DIAS_PRUEBA = 14;
