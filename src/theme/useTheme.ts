import { useEffect, useState } from "react";

/**
 * Light, dark or follow the system, as on the platform. Stored under the same
 * `theme` key with the platform's values (`light` / `dark` / `auto`); index.html
 * applies it before the first paint, this hook keeps it in sync afterwards.
 */
export type ThemeMode = "light" | "system" | "dark";

const KEY = "theme";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const readMode = (): ThemeMode => {
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

const applyMode = (mode: ThemeMode) => {
  const effective = mode === "system" ? (darkQuery().matches ? "dark" : "light") : mode;
  document.documentElement.setAttribute("data-theme", effective);
};

export function useTheme(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(readMode);

  useEffect(() => {
    applyMode(mode);
    if (mode !== "system") return;
    // Following the system means following it live, not only at load.
    const query = darkQuery();
    const onChange = () => applyMode("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const choose = (next: ThemeMode) => {
    try {
      window.localStorage.setItem(KEY, next === "system" ? "auto" : next);
    } catch {
      // Private mode: the choice lasts until reload.
    }
    setMode(next);
  };

  return [mode, choose];
}
