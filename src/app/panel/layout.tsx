import type { Metadata } from "next";
import { PanelProvider } from "@/components/panel/Contexto";
import { MarcoPanel } from "@/components/panel/MarcoPanel";

export const metadata: Metadata = { title: "Panel", manifest: "/panel.webmanifest" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PanelProvider>
      <MarcoPanel>{children}</MarcoPanel>
    </PanelProvider>
  );
}
