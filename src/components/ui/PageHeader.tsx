import type { ReactNode } from "react";
import styles from "./PageHeader.module.scss";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Кнопки/контролы справа от заголовка. */
  actions?: ReactNode;
}

/** Единая шапка экрана админки: заголовок (+подзаголовок) и действия справа. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleWrap}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions != null && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export default PageHeader;
