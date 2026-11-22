// Genera los PNG de los íconos a partir de los SVG (requiere Playwright/Chromium). Uso: node scripts/iconos.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { readFileSync } from "node:fs";

const salidas = [
  ["icono.svg", "icono-192.png", 192],
  ["icono.svg", "icono-512.png", 512],
  ["icono-maskable.svg", "icono-maskable-512.png", 512],
];
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
for (const [svg, png, tam] of salidas) {
  const contenido = readFileSync(`public/iconos/${svg}`, "utf8");
  await pagina.setViewportSize({ width: tam, height: tam });
  await pagina.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${tam}px;height:${tam}px;display:block}</style>${contenido}`);
  await pagina.screenshot({ path: `public/iconos/${png}`, omitBackground: true });
}
await navegador.close();
console.log("Íconos listos");
