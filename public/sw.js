// Service worker de TV Interactiva.
// - Permite instalar la landing, el panel y el reproductor como apps de escritorio.
// - Guarda las páginas y los archivos (imágenes y videos) para que la TV funcione sin internet.
// El contenido (textos, precios, horarios) lo guarda el propio reproductor; aquí solo van páginas y archivos.
const VERSION = "v1";
const PAGINAS = `tvi-paginas-${VERSION}`;
const ESTATICOS = `tvi-estaticos-${VERSION}`;
const MEDIOS = "tvi-medios"; // sin versión: no se borra al actualizar la app

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(PAGINAS)
      .then((c) => c.addAll(["/", "/tv", "/panel", "/entrar"]).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("tvi-") && ![PAGINAS, ESTATICOS, MEDIOS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const esMedio = (req, url) =>
  req.destination === "image" ||
  req.destination === "video" ||
  url.pathname.includes("/storage/v1/object/public/") ||
  /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm)$/i.test(url.pathname);

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Páginas: primero la red (para tener lo último), si no hay conexión, la copia guardada.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r.ok) caches.open(PAGINAS).then((c) => c.put(url.pathname, r.clone()));
          return r;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match(url.pathname.startsWith("/tv") ? "/tv" : "/")) || Response.error()),
    );
    return;
  }

  // Archivos de la app (JS, CSS, fuentes): no cambian nunca de nombre, se guardan para siempre.
  if (url.origin === location.origin && url.pathname.startsWith("/_next/static/")) {
    e.respondWith(primeroCache(req, ESTATICOS));
    return;
  }

  // Imágenes y videos del contenido.
  if (esMedio(req, url)) {
    if (req.headers.has("range")) e.respondWith(rangoDesdeCache(req));
    else e.respondWith(primeroCache(req, MEDIOS));
  }
});

async function primeroCache(req, nombre) {
  const cache = await caches.open(nombre);
  const guardado = await cache.match(req, { ignoreVary: true });
  if (guardado) return guardado;
  try {
    const r = await fetch(req);
    if (r.ok || r.type === "opaque") cache.put(req, r.clone()).catch(() => {});
    return r;
  } catch {
    return guardado || Response.error();
  }
}

// Los videos se piden por partes (Range). Se guarda el archivo completo una vez y se responden las partes desde ahí.
async function rangoDesdeCache(req) {
  const cache = await caches.open(MEDIOS);
  const url = req.url;
  let completo = await cache.match(url);
  if (!completo) {
    try {
      // Descarga completa en segundo plano para la próxima vez; esta vez responde la red.
      fetch(url, { mode: "cors" })
        .then((r) => r.ok && cache.put(url, r))
        .catch(() => {});
      return await fetch(req);
    } catch {
      return Response.error();
    }
  }
  const blob = await completo.blob();
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  const inicio = m && m[1] ? Number(m[1]) : 0;
  const fin = m && m[2] ? Math.min(Number(m[2]), blob.size - 1) : blob.size - 1;
  return new Response(blob.slice(inicio, fin + 1), {
    status: 206,
    headers: {
      "Content-Type": completo.headers.get("Content-Type") || "video/mp4",
      "Content-Range": `bytes ${inicio}-${fin}/${blob.size}`,
      "Content-Length": String(fin - inicio + 1),
      "Accept-Ranges": "bytes",
    },
  });
}
