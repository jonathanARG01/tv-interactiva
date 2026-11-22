"use client";
import { useEffect } from "react";
import { usarModo } from "@/lib/datos";

export default function Demo() {
  useEffect(() => {
    usarModo("demo");
    location.replace("/panel");
  }, []);
  return null;
}
