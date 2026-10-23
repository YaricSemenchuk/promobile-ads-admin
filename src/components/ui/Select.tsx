import cs from "classnames";
import type { SelectHTMLAttributes } from "react";
import styles from "./Field.module.scss";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  block?: boolean;
}

/**
 * Нативный селект в коробке дизайн-системы. Список раскрывает ОС — он
 * системный (на macOS тёмный) и стилизации не поддаётся; для админки как
 * внутреннего инструмента это осознанный компромисс.
 */
export function Select({ block = false, className, ...rest }: SelectProps) {
  return <select className={cs(styles.control, styles.select, { [styles.block]: block }, className)} {...rest} />;
}

export default Select;
