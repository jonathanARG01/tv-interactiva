import type { Metadata } from "next";
import { PaginaTv } from "./PaginaTv";

export const metadata: Metadata = {
  title: "Reproductor",
  manifest: "/tv.webmanifest",
};

export default function Page() {
  return <PaginaTv />;
}
