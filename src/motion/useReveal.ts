import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "./prefersReducedMotion";

interface RevealOptions {
  /** Анимировать прямых детей по очереди, а не контейнер целиком. */
  stagger?: boolean;
  /** На сколько пикселей элемент выезжает снизу. */
  y?: number;
  duration?: number;
  delay?: number;
}

/**
 * Reveal-on-mount: элемент (или его прямые дети при `stagger`) один раз
 * проявляется и выезжает снизу. Это вход экрана, а не скролл-триггер — срабатывает
 * на монтировании. Reduced motion → `gsap.from` не вызываем вовсе, элемент
 * остаётся в своём обычном (финальном) состоянии.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const { stagger = false, y = 12, duration = 0.45, delay = 0 } = opts;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // gsap.context привязывает твины к элементу и чисто откатывает их в
    // revert() — важно в StrictMode, где эффект монтируется дважды.
    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(el.children) : el;
      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: "power2.out",
        stagger: stagger ? 0.06 : 0,
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, y, duration, delay]);

  return ref;
}
