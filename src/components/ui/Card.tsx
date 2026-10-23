import cs from "classnames";
import type { HTMLAttributes } from "react";
import styles from "./Card.module.scss";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Внутренний отступ 24px. Выключают, когда карточка сама себе скроллер
   *  (таблица) и отступы задают ячейки. */
  padded?: boolean;
}

/** Белая карточка-поверхность дизайн-системы (радиус 16px, рамка). */
export function Card({ padded = true, className, ...rest }: CardProps) {
  return <div className={cs(styles.card, { [styles.padded]: padded }, className)} {...rest} />;
}

export default Card;
