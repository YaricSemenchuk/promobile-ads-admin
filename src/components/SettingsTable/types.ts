import type React from "react";

/**
 * Колонка таблицы настроек.
 *
 * `width` — доля ширины таблицы в процентах, как в макете: раскладка
 * фиксированная (table-layout: fixed), и ширину диктуют колонки, а не
 * содержимое ячеек. Колонка без width забирает остаток, поэтому оставлять без
 * ширины стоит ровно одну — обычно колонку действий.
 */
export type SettingsTableColumn<K extends string = string> = {
  key: K;
  /** Пусто — заголовка нет (колонка действий). */
  label?: string;
  width?: string;
  /** По умолчанию заголовок с подписью сортируется. */
  sortable?: boolean;
  /**
   * Своя шапка вместо подписи — например чекбокс «выделить всё». Сортировка к
   * такой колонке не применяется: щёлкать по ней будут ради контрола.
   */
  header?: React.ReactNode;
};

/** null — строки идут в том порядке, в каком пришли. */
export type SettingsTableSort<K extends string = string> = {
  key: K;
  asc: boolean;
} | null;

export type SettingsTableProps<K extends string, R> = {
  columns: SettingsTableColumn<K>[];
  rows: R[];
  /** Ключ строки: id записи, а не индекс. */
  rowKey: (row: R) => string;
  renderCell: (row: R, key: K) => React.ReactNode;

  /** Сортировка контролируемая: состояние держит контейнер. */
  sort?: SettingsTableSort<K>;
  onSortChange?: (next: SettingsTableSort<K>) => void;

  /** Ниже этой ширины включается горизонтальный скролл обёртки. */
  minWidth?: number;
  /** Высота строки из макета. */
  rowHeight?: number;
  emptyText?: string;
  className?: string;
  /**
   * Куда ведёт клик по строке. Вернёт undefined — строка некликабельна.
   * Ссылки и кнопки внутри ячеек продолжают работать сами (в т.ч. средний
   * щелчок), навигация по строке их не перехватывает.
   */
  rowHref?: (row: R) => string | undefined;
};
