import type { HTMLAttributes } from "react";
import { useReveal } from "./useReveal";

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Анимировать прямых детей по очереди (сетка плиток, список карточек). */
  stagger?: boolean;
  y?: number;
  duration?: number;
  delay?: number;
}

/**
 * Контейнер с reveal-on-mount. Оборачивает блок (или сетку с `stagger`),
 * не меняя его раскладку: это обычный `div`, вся анимация — в `useReveal`.
 */
export function Reveal({ stagger, y, duration, delay, children, ...rest }: RevealProps) {
  const ref = useReveal<HTMLDivElement>({ stagger, y, duration, delay });
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}

export default Reveal;
