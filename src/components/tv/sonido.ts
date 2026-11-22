"use client";
// Timbre (generado, sin archivos) y voz del llamador.
let ctx: AudioContext | null = null;

export function desbloquearAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    // Algunos navegadores de TV necesitan una frase vacía tras un toque para habilitar la voz.
    if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    return true;
  } catch {
    return false;
  }
}

export function timbre() {
  if (!ctx) return;
  const ahora = ctx.currentTime;
  [
    [880, 0],
    [660, 0.32],
  ].forEach(([f, t]) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, ahora + t);
    g.gain.exponentialRampToValueAtTime(0.35, ahora + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ahora + t + 0.9);
    o.connect(g).connect(ctx!.destination);
    o.start(ahora + t);
    o.stop(ahora + t + 1);
  });
}

export function anunciar(texto: string, destino: string) {
  if (!("speechSynthesis" in window)) return;
  const quien = /^\d+$/.test(texto) ? `Número ${texto}` : /^[A-Za-z]-?\d+$/.test(texto) ? `Turno ${texto.replace("-", " ")}` : texto;
  const frase = destino ? `${quien}, ${destino}` : quien;
  const u = new SpeechSynthesisUtterance(frase);
  u.lang = "es-CL";
  const voces = speechSynthesis.getVoices();
  u.voice = voces.find((v) => v.lang === "es-CL") ?? voces.find((v) => v.lang.startsWith("es")) ?? null;
  u.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
