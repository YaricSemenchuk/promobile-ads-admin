import type { ReactNode } from "react";

/**
 * Боковая панель настроек (Figma 1428:4814, 1488:75619). Каркас: 482px справа,
 * содержимое прокручивается, подвал приклеен к низу.
 *
 * Дровер ничего не знает про то, что в нём настраивают: заголовок, шаги и
 * подвал приходят снаружи. Состояние формы держит контейнер — панель его не
 * трогает и не хранит.
 */
export type DrawerProps = {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  /** Плашка рядом с заголовком: статус коннектора, состояние синка. */
  badge?: ReactNode;
  /** Заголовок 18/24 вместо 28/36 — так подписаны дроверы управления. */
  compactTitle?: boolean;
  children: ReactNode;
  /** Подвал целиком. Без него панель заканчивается содержимым. */
  footer?: ReactNode;
  onClose: () => void;
  /** Ширина панели, px. По умолчанию 482 — размер из макета. */
  width?: number;
  className?: string;
};

/** Шаг подключения: синий кружок с номером, заголовок 16/500 и текст. */
export type DrawerStepProps = {
  index: number;
  title: string;
  children: ReactNode;
};

export type DrawerFieldProps = {
  label?: string;
  value: string;
  placeholder?: string;
  type?: string;
  /** Пояснение под полем 12/16. */
  caption?: ReactNode;
  disabled?: boolean;
  /** Многострочное поле: .p8, тело запроса. */
  multiline?: boolean;
  /** Моноширинный текст: ключи, идентификаторы, JSON. */
  mono?: boolean;
  onChange?: (next: string) => void;
};

/** Абзац внутри панели: пояснение шага или текст плашки. */
export type DrawerTextProps = {
  children: ReactNode;
  /** Второстепенный цвет — так подписаны пояснения под заголовком шага. */
  muted?: boolean;
};

/** Серая плашка внутри шага: знак сервиса слева, заголовок и текст. */
export type DrawerInfoCardProps = {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
};

/**
 * Строка «прочитать и скопировать»: подпись, моноширинное значение и кнопка,
 * которая на пару секунд подтверждает, что скопировала. Значение только
 * читается — это то, что панель выдаёт наружу, а не спрашивает.
 */
export type DrawerCopyRowProps = {
  label?: string;
  value: string;
  /** Что показать вместо значения; копируется всё равно `value`. */
  display?: string;
  caption?: ReactNode;
  ariaLabel?: string;
  /**
   * Значение — готовый файл, а не строка. Строки тогда не переносятся, а
   * уезжают вбок, и высокий файл прокручивается внутри рамки: перенос по
   * символу ломает отступы и рвёт имена посередине.
   */
  code?: boolean;
};

/**
 * Второе действие внутри панели: сменить секрет, отключить приёмник. Не
 * кнопка подвала — там место у главного действия и отмены.
 */
export type DrawerLinkButtonProps = {
  children: ReactNode;
  /** danger — действие, которое что-то ломает: отключение, удаление. */
  variant?: "brand" | "danger";
  disabled?: boolean;
  onClick: () => void;
};

export type DrawerButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
};

export type DrawerSelectOption = { value: string; label: string };

/** Выбор из списка: приложение, аккаунт, окружение. */
export type DrawerSelectProps = {
  label?: string;
  value: string;
  options: DrawerSelectOption[];
  ariaLabel: string;
  caption?: ReactNode;
  disabled?: boolean;
  onChange: (next: string) => void;
};
