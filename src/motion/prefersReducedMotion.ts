import { useSyncExternalStore } from "react";

// Единственный источник правды про «убрать анимацию»: и Lenis, и reveal, и
// count-up спрашивают это перед тем, как что-то двигать. Пользователь,
// выставивший системную настройку, получает статику, а не урезанный эффект.
const QUERY = "(prefers-reduced-motion: reduce)";

/** Императивная проверка — для эффектов вне рендера (useLayoutEffect, GSAP). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

/** Реактивная версия для рендера: учитывает смену настройки на лету. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
