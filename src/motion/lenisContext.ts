import { createContext, useContext } from "react";
import type Lenis from "lenis";

// Контекст и хук вынесены из LenisScroller.tsx, чтобы тот файл экспортировал
// только компонент (иначе ломается fast refresh — see react/only-export-components).
export const LenisContext = createContext<Lenis | null>(null);

/** Экземпляр Lenis главной области (или null: reduced motion / не смонтирован). */
export const useLenis = () => useContext(LenisContext);
