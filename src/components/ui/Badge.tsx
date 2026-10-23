import cs from "classnames";
import type { ReactNode } from "react";
import styles from "./Badge.module.scss";

export type BadgeTone = "success" | "warning" | "error" | "info" | "neutral";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * Пилюля статуса. Тон задаёт цвет текста, подложка выводится из него же —
 * см. Badge.module.scss. Текст статуса всегда виден: цвет усиливает подпись,
 * а не заменяет её (иначе экран нечитаем при дальтонизме и в ч/б).
 */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return <span className={cs(styles.badge, styles[tone], className)}>{children}</span>;
}

export default Badge;
