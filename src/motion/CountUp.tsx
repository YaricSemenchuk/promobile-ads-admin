import cs from "classnames";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "./prefersReducedMotion";

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  /** Форматирование числа в строку (деньги, проценты). По умолчанию — целое. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * Число, доезжающее от `from` до `to` при появлении. По мотивам React Bits
 * «Count Up», но на GSAP (framer-motion в проекте нет) и с `tabular-nums`,
 * чтобы разряды не прыгали по ширине во время счёта. Reduced motion → сразу
 * финальное значение, без твина.
 */
export function CountUp({ to, from = 0, duration = 1.1, delay = 0, format, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // format читаем через ref: он может быть новой функцией на каждый рендер, но
  // перезапускать твин из-за этого не нужно. Обновляем ref в эффекте, а не в
  // рендере (react/refs).
  const formatRef = useRef(format);
  useLayoutEffect(() => {
    formatRef.current = format;
  }, [format]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (value: number) => (formatRef.current ?? ((n: number) => String(Math.round(n))))(value);

    if (prefersReducedMotion()) {
      el.textContent = fmt(to);
      return;
    }

    const state = { value: from };
    el.textContent = fmt(from);
    const tween = gsap.to(state, {
      value: to,
      duration,
      delay,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = fmt(state.value);
      },
    });

    return () => {
      tween.kill();
    };
  }, [to, from, duration, delay]);

  return <span ref={ref} className={cs("tabularNums", className)} />;
}

export default CountUp;
