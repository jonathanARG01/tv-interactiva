# TV Interactiva

> Nombre provisorio. Se cambia en `src/components/ui/Logo.tsx`, `src/app/layout.tsx` y los `public/*.webmanifest`.

Pantallas digitales para cualquier negocio: menús con precios, salas de espera, llamador de turnos con voz, ofertas y avisos. Se administra desde el celular o el computador y funciona en cualquier TV con navegador. Pensado para Chile (CLP, America/Santiago) y para varios rubros: restaurantes, cafeterías, clínicas, atención con números, tiendas, oficinas y otros.

Incluye:

- **Landing de venta** (`/`): rubros, funciones, precios en CLP, preguntas frecuentes y una TV de muestra animada que usa el mismo reproductor real.
- **Panel** (`/panel`): pantallas, contenido (listas y diapositivas), catálogo (productos o servicios), llamador y ajustes de marca.
- **Reproductor** (`/tv`): lo que se abre en la TV.

Los tres tienen **modo claro y oscuro** y se pueden **instalar como app de escritorio** (PWA: Chrome, Edge, Windows, Mac, Android y Chromebook). Hay tres manifests (`manifest`, `panel` y `tv`), así que la landing, el panel y el reproductor se instalan como apps separadas.

## Probarlo

```bash
npm install
npm run dev          # o: npm run build && npm start
```

- Abre http://localhost:3000 y toca **Probar la demo**. Elige un rubro y se crea contenido de ejemplo.
- En otra pestaña abre http://localhost:3000/tv?demo=1. Aparece un código. Escríbelo en **Panel → Pantallas** (o escanea el QR).
- Desde ahí, todo cambio del panel llega a la TV en vivo. Prueba **Llamador → Llamar siguiente**.

### Modo demo y modo nube

- **Demo** (por defecto mientras no hay base de datos): todo vive en el navegador (`localStorage`). El panel y la TV abiertos en el mismo navegador se sincronizan al instante con `BroadcastChannel`. Sirve para vender (el cliente prueba sin registrarse) y para desarrollar.
- **Nube** (Supabase): se activa solo al definir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`). Mientras no estén, el sistema funciona solo en modo demo y `/entrar` ofrece la demo.

Las dos implementaciones cumplen la misma interfaz (`src/lib/datos/tipos.ts`), así que el panel y la TV no saben cuál están usando. Cambiar de base de datos más adelante implica reescribir solo `src/lib/datos/nube.ts` y la migración.

## Cómo funciona la TV

1. Al abrir `/tv` el aparato genera un **secreto** aleatorio y lo guarda. Con él pide un **código de 6 letras** (`tv_solicitar_codigo`).
2. Desde el panel se escribe el código (`vincular_pantalla`). En la base solo queda el **hash** del secreto. La TV escucha el canal de su código y se vincula al instante.
3. La TV baja un **paquete** con todo lo que necesita (`tv_paquete`: negocio, pantalla, diapositivas, catálogo y últimos llamados) y lo guarda en el aparato.
4. Escucha cambios en vivo (Supabase Realtime Broadcast, canal con clave aleatoria por negocio) y además revisa cada 60 s.
5. **Sin internet nunca se bloquea**: sigue mostrando lo último guardado y marca "Sin conexión". El service worker (`public/sw.js`) guarda las páginas, imágenes y videos (con soporte de `Range` para videos).
6. Mantiene la pantalla encendida (Wake Lock). Se controla con el control remoto (flechas, Enter activa el sonido) y gira el contenido si la pantalla es vertical.

Diapositivas disponibles: **menú o lista de precios**, **aviso**, **imagen**, **video**, **llamador de turnos** y **bienvenida con reloj**. Cada una puede tener **horario** (días y rango de horas, incluso cruzando la medianoche, en la zona horaria del negocio).

El **llamador** muestra el número o nombre a pantalla completa con timbre y voz en español (`speechSynthesis`). Los navegadores exigen un toque o un Enter en la TV para habilitar el sonido la primera vez.

## Base de datos (Supabase)

`supabase/migrations/0001_inicial.sql` deja todo listo:

- Tablas multi-negocio con **RLS** en todas: cada negocio ve y edita solo lo suyo.
- **Límites de plan validados en el servidor** (`limite_plan` y triggers), no solo en el navegador.
- Funciones `tv_*` para la TV sin sesión, `crear_organizacion`, `vincular_pantalla` y `llamar` (numeración atómica).
- Bucket público `medios` (imágenes y videos) con permisos por negocio.

Para activarla:

1. Crea un proyecto en Supabase y ejecuta la migración en el SQL Editor.
2. En *Authentication → URL Configuration* agrega `https://TU-DOMINIO/panel` a las Redirect URLs.
3. Copia `.env.example` a `.env.local` con la URL y la anon key.

La migración se probó con Postgres (PGlite): creación de negocio, vinculación, paquete, llamados correlativos, límites de plan y permisos.

## Preparado para Platovi

El objetivo es que este producto se venda solo **y también** como complemento de Platovi, mostrando los mismos platos y actualizándose en conjunto. Ya quedó preparado:

- `categorias` y `productos` tienen `origen` (`propio` | `platovi`) y `externo_id`, con índice único `(org_id, origen, externo_id)`. Así la sincronización actualiza sin duplicar.
- La tabla `integraciones` guarda la conexión (`proveedor = 'platovi'`, id del restaurante y la última sincronización).
- El panel ya marca los productos que vienen de Platovi y avisa que conviene editarlos allá.

Falta construir el puente (API y webhooks entre ambos servicios). Eso se hará en una fase siguiente, coordinado con el proyecto de Platovi.

## Planes y precios

En `src/lib/planes.ts` (CLP + IVA): **Inicial** gratis (1 pantalla), **Pro** $12.990 (3 pantallas, videos, horarios, marca) y **Negocio** $29.990 (15 pantallas). Son una propuesta editable. Si se cambian los límites, también hay que cambiar `limite_plan` en el SQL.

## Estructura

```
src/app/page.tsx            landing
src/app/panel/              panel (inicio, pantallas, contenido, catálogo, llamador, ajustes)
src/app/tv/                 reproductor
src/app/entrar/             cuenta (modo nube) o entrada a la demo
src/components/tv/          Escena (dibuja cada diapositiva), Reproductor, sonido
src/components/panel/       contexto de datos, marco, editores
src/components/landing/     TV de muestra y precios
src/lib/datos/              almacén demo (navegador) y nube (Supabase)
src/lib/                    tipos, rubros y contenido de ejemplo, planes, utilidades
supabase/migrations/        esquema SQL
public/sw.js                service worker (offline e instalación)
public/*.webmanifest        apps instalables: landing, panel y reproductor
```

## Pendiente para próximas versiones

- Elegir y conectar la base de datos definitiva.
- Pago en línea de planes (por ejemplo Mercado Pago o Webpay).
- Puente con Platovi.
- Equipo con varios usuarios y roles (la tabla `miembros` ya tiene roles).
- App nativa para Android TV / Fire TV con arranque automático (hoy se usa el navegador o la PWA).
