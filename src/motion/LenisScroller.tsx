import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { prefersReducedMotion } from "./prefersReducedMotion";
import { LenisContext } from "./lenisContext";

interface LenisScrollerProps {
  className?: string;
  children: ReactNode;
}

/**
 * Плавный скролл Lenis на главной области. Прокрутка в админке живёт не в окне,
 * а в этом `<main>` (сайдбар липкий и скроллится сам), поэтому Lenis получает
 * `wrapper`/`content` явно, а не вешается на window.
 *
 * Один RAF-цикл на весь экран — через тикер GSAP, чтобы reveal и count-up шли
 * в том же кадре, что и скролл. Reduced motion → Lenis не создаём, остаётся
 * нативная прокрутка.
 */
export function LenisScroller({ className, children }: LenisScrollerProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const instance = new Lenis({
      wrapper,
      content,
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic — мягкая остановка
    });

    const update = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(update);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <main ref={wrapperRef} className={className}>
        <div ref={contentRef}>{children}</div>
      </main>
    </LenisContext.Provider>
  );
}

export default LenisScroller;
