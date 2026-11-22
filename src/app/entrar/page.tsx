import type { Metadata } from "next";
import { FormEntrar } from "./FormEntrar";

export const metadata: Metadata = { title: "Entrar", manifest: "/panel.webmanifest" };

export default function Page() {
  return <FormEntrar />;
}
