import type { NextConfig } from "next";

// EXPORTAR=1 genera un sitio 100% estático en out/ (sirve para publicar el modo demo en cualquier hosting).
const nextConfig: NextConfig = process.env.EXPORTAR ? { output: "export", images: { unoptimized: true } } : {};

export default nextConfig;
