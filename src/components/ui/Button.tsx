import cs from "classnames";
import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Растянуть на всю ширину контейнера (подвал дровера, узкие формы). */
  block?: boolean;
}

/**
 * Одна кнопка на всю админку. Вид — через variant, размер — через size;
 * радиус и типографика берутся из дизайн-системы, а не задаются на месте.
 * type по умолчанию "button": кнопка внутри формы не должна случайно её
 * отправлять, submit указывают явно.
 */
export function Button({
  variant = "secondary",
  size = "md",
  block = false,
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cs(styles.btn, styles[variant], styles[size], { [styles.block]: block }, className)}
      {...rest}
    />
  );
}

export default Button;
