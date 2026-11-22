import type { Categoria, Diapositiva, Lista, Producto, Rubro } from "./tipos";
import { nuevoId } from "./util";

export interface InfoRubro {
  id: Rubro;
  nombre: string;
  descripcion: string;
  catalogo: string; // cómo se llama el catálogo en este rubro
  item: string; // un elemento del catálogo
}

export const RUBROS: InfoRubro[] = [
  { id: "restaurante", nombre: "Restaurante", descripcion: "Menú en pantalla, promos y pedido listo", catalogo: "Menú", item: "plato" },
  { id: "cafeteria", nombre: "Cafetería y comida rápida", descripcion: "Carta del mostrador y combos", catalogo: "Carta", item: "producto" },
  { id: "clinica", nombre: "Clínica o consulta", descripcion: "Sala de espera, llamado de pacientes y avisos", catalogo: "Servicios", item: "servicio" },
  { id: "turnos", nombre: "Atención con turnos", descripcion: "Llamador de números para bancos, notarías y oficinas públicas", catalogo: "Trámites", item: "trámite" },
  { id: "retail", nombre: "Tienda", descripcion: "Vitrina, ofertas y precios destacados", catalogo: "Productos", item: "producto" },
  { id: "oficina", nombre: "Empresa u oficina", descripcion: "Comunicación interna, avisos y bienvenida", catalogo: "Avisos", item: "aviso" },
  { id: "otro", nombre: "Otro", descripcion: "Cualquier pantalla con contenido propio", catalogo: "Catálogo", item: "elemento" },
];

export const infoRubro = (r: Rubro) => RUBROS.find((x) => x.id === r) ?? RUBROS[RUBROS.length - 1];

type Semilla = { categorias: Categoria[]; productos: Producto[]; lista: Lista; diapositivas: Diapositiva[] };

// Contenido de ejemplo para que la primera pantalla nunca esté vacía. El usuario lo puede borrar.
export function contenidoDeEjemplo(org_id: string, rubro: Rubro, nombreNegocio: string): Semilla {
  const lista: Lista = { id: nuevoId(), org_id, nombre: "Pantalla principal", creado: new Date().toISOString() };
  const categorias: Categoria[] = [];
  const productos: Producto[] = [];
  const diapositivas: Diapositiva[] = [];

  const cat = (nombre: string) => {
    const c: Categoria = { id: nuevoId(), org_id, nombre, orden: categorias.length, visible: true, origen: "propio", externo_id: null };
    categorias.push(c);
    return c;
  };
  const prod = (c: Categoria, nombre: string, precio: number | null, descripcion = "", destacado = false) =>
    productos.push({
      id: nuevoId(),
      org_id,
      categoria_id: c.id,
      nombre,
      descripcion,
      precio,
      foto: null,
      agotado: false,
      destacado,
      orden: productos.length,
      origen: "propio",
      externo_id: null,
    });
  const diapo = (tipo: Diapositiva["tipo"], datos: Diapositiva["datos"], duracion = 12, horario: Diapositiva["horario"] = null) =>
    diapositivas.push({
      id: nuevoId(),
      org_id,
      lista_id: lista.id,
      tipo,
      orden: diapositivas.length,
      duracion,
      activa: true,
      horario,
      datos,
    });

  if (rubro === "restaurante" || rubro === "cafeteria") {
    const a = cat(rubro === "cafeteria" ? "Cafés" : "Entradas");
    const b = cat(rubro === "cafeteria" ? "Dulces" : "Fondos");
    const c = cat("Bebidas");
    if (rubro === "cafeteria") {
      prod(a, "Espresso", 1800, "Doble carga, grano de especialidad");
      prod(a, "Cappuccino", 2900, "Leche texturizada y cacao", true);
      prod(a, "Latte vainilla", 3200, "Con jarabe de vainilla natural");
      prod(b, "Kuchen de nuez", 2800, "Receta de la casa");
      prod(b, "Croissant", 2200, "Mantequilla, horneado del día");
      prod(b, "Brownie", 2500, "Con nueces");
    } else {
      prod(a, "Empanadas de queso", 4500, "Tres unidades, masa crujiente");
      prod(a, "Ceviche", 7900, "Reineta, limón de pica y cilantro", true);
      prod(a, "Tabla para compartir", 12900, "Quesos, embutidos y aceitunas");
      prod(b, "Lomo a lo pobre", 11900, "Papas fritas, cebolla y huevo", true);
      prod(b, "Pastel de choclo", 9500, "Receta tradicional");
      prod(b, "Reineta a la plancha", 10900, "Con ensalada chilena");
    }
    prod(c, "Limonada menta jengibre", 3500, "Jarro de 500 ml");
    prod(c, "Jugo natural", 3200, "Frutilla, mango o piña");
    prod(c, "Bebida en lata", 1900, "");
    diapo("bienvenida", { titulo: nombreNegocio, subtitulo: "Bienvenidos", reloj: true }, 8);
    diapo("menu", { titulo: "Nuestro menú", categoria_ids: [a.id, b.id], fotos: false, columnas: 2 }, 15);
    diapo("aviso", { titulo: "Happy hour", texto: "2x1 en bebidas de 18:00 a 20:00", estilo: "acento" }, 8, {
      dias: [1, 2, 3, 4, 5],
      desde: "17:00",
      hasta: "20:00",
    });
    diapo("menu", { titulo: "Para tomar", categoria_ids: [c.id], fotos: false, columnas: 1 }, 10);
  } else if (rubro === "clinica") {
    const s = cat("Prestaciones");
    prod(s, "Consulta general", 25000, "Bono Fonasa e Isapre");
    prod(s, "Control", 15000, "Hasta 30 días después de la consulta");
    prod(s, "Toma de muestras", null, "Lunes a viernes de 8:00 a 10:30");
    diapo("bienvenida", { titulo: nombreNegocio, subtitulo: "Bienvenido. En breve será atendido.", reloj: true }, 10);
    diapo("turnos", { titulo: "Llamados", mensaje: "Esté atento a su nombre en pantalla" }, 12);
    diapo("aviso", { titulo: "Recuerde", texto: "Traiga su cédula de identidad y su orden médica", estilo: "suave" }, 10);
    diapo("menu", { titulo: "Prestaciones y valores", categoria_ids: [s.id], fotos: false, columnas: 1 }, 12);
  } else if (rubro === "turnos") {
    diapo("turnos", { titulo: "Turnos", mensaje: "Retire su número en el tótem de la entrada" }, 20);
    diapo("aviso", { titulo: "Horario de atención", texto: "Lunes a viernes de 9:00 a 14:00", estilo: "suave" }, 8);
  } else if (rubro === "retail") {
    const o = cat("Ofertas de la semana");
    prod(o, "Zapatillas urbanas", 39990, "Antes $54.990", true);
    prod(o, "Polerón básico", 14990, "Todas las tallas");
    prod(o, "Jockey", 7990, "Varios colores");
    diapo("bienvenida", { titulo: nombreNegocio, subtitulo: "Nueva temporada", reloj: false }, 8);
    diapo("menu", { titulo: "Ofertas de la semana", categoria_ids: [o.id], fotos: false, columnas: 1 }, 12);
    diapo("aviso", { titulo: "Paga en 3 cuotas sin interés", texto: "Con todas las tarjetas de crédito", estilo: "acento" }, 8);
  } else {
    diapo("bienvenida", { titulo: nombreNegocio, subtitulo: "Bienvenidos", reloj: true }, 10);
    diapo("aviso", { titulo: "Aviso importante", texto: "Escribe aquí lo que quieres comunicar", estilo: "acento" }, 10);
  }

  return { categorias, productos, lista, diapositivas };
}
