"use client";

/** Fire a confetti burst from a normalized origin (0..1 of viewport). */
export function fireConfetti(originX = 0.5, originY = 0.4) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let cv = document.getElementById("wr-confetti") as HTMLCanvasElement | null;
  if (!cv) {
    cv = document.createElement("canvas");
    cv.id = "wr-confetti";
    Object.assign(cv.style, {
      position: "fixed",
      inset: "0",
      zIndex: "9999",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    document.body.appendChild(cv);
  }
  const ctx = cv.getContext("2d")!;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;

  const cols = ["#C8FF3D", "#FF3D8B", "#7A5BFF", "#34C8FF", "#FF6A1F", "#16130d"];
  const P = Array.from({ length: 170 }, () => ({
    x: cv!.width * originX,
    y: cv!.height * originY,
    vx: (Math.random() - 0.5) * 17,
    vy: -Math.random() * 15 - 4,
    s: Math.random() * 9 + 4,
    r: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.35,
    c: cols[(Math.random() * cols.length) | 0],
    life: 170,
  }));

  function tick() {
    ctx.clearRect(0, 0, cv!.width, cv!.height);
    let alive = false;
    for (const p of P) {
      if (--p.life <= 0) continue;
      alive = true;
      p.vy += 0.3;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.min(1, p.life / 55);
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, cv!.width, cv!.height);
  }
  requestAnimationFrame(tick);
}
