// Движение админки: GSAP + Lenis, собранные в несколько сдержанных примитивов.
// Всё уважает prefers-reduced-motion — при системной настройке «меньше
// движения» анимация не запускается, остаётся статика.
export { LenisScroller } from "./LenisScroller";
export { useLenis } from "./lenisContext";
export { PageTransition } from "./PageTransition";
export { Reveal } from "./Reveal";
export type { RevealProps } from "./Reveal";
export { useReveal } from "./useReveal";
export { CountUp } from "./CountUp";
export type { CountUpProps } from "./CountUp";
export { prefersReducedMotion, useReducedMotion } from "./prefersReducedMotion";
