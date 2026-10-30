import cs from "classnames";
import type { InputHTMLAttributes } from "react";
import styles from "./Field.module.scss";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  block?: boolean;
}

/** Текстовое поле дизайн-системы (радиус 12px, высота 40px). */
export function TextInput({ block = false, className, ...rest }: TextInputProps) {
  return <input className={cs(styles.control, { [styles.block]: block }, className)} {...rest} />;
}

export default TextInput;
