import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { RegistrarSW } from "@/components/ui/RegistrarSW";
import "./globals.css";

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "TV Interactiva · Pantallas que trabajan por ti", template: "%s · TV Interactiva" },
  description:
    "Menús digitales, salas de espera, llamador de turnos y avisos en cualquier TV. Se administra desde el celular y funciona aunque se caiga internet.",
  applicationName: "TV Interactiva",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/iconos/icono.svg", apple: "/iconos/icono-192.png" },
  appleWebApp: { capable: true, title: "TV Interactiva", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c11" },
  ],
};

// Aplica el tema antes de pintar para que no parpadee.
const scriptTema = `try{var t=localStorage.getItem('tvi-tema');if(t!=='claro'&&t!=='oscuro'){t=matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro'}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
