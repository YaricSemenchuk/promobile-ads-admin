import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { prefersReducedMotion } from "./prefersReducedMotion";
import { useLenis } from "./lenisContext";

/**
 * Лёгкий переход между экранами: при смене маршрута область контента коротко
 * проявляется снизу вверх, а скролл сбрасывается в начало, чтобы новая страница
 * не открывалась с середины прошлой. Дети не перемонтируются — анимируем
 * обёртку, твин привязан к `pathname`. Reduced motion → без движения.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useLayoutEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [pathname, lenis]);

  return <div ref={ref}>{children}</div>;
}

export default PageTransition;
