import type React from "react";

/**
 * Глифы дровера.
 *
 * В исходном приложении это были реэкспорты: крестик из дровера правила, копия
 * из панели App Insights, галка из таблицы приложений, стрелка из журнала
 * активности. Сюда те компоненты не переезжали, а CRA-шный
 * `import { ReactComponent } from "*.svg"` в Vite и не работает, поэтому
 * иконки нарисованы здесь — так же, как в SettingsTable/icons.tsx.
 *
 * Все четыре рисуются `currentColor` и наследуют цвет от места вставки: у
 * дровера один и тот же глиф встречается и на кнопке, и в подписи.
 */

type IconProps = { className?: string };

/** Закрыть панель. 16x16, штрих 1.5. */
export const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 4L12 12M12 4L4 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/** Скопировать значение: два прямоугольника со смещением. */
export const CopyIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5.75" y="5.75" width="8.5" height="8.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10.5 3.75A1.75 1.75 0 0 0 8.75 2h-5A1.75 1.75 0 0 0 2 3.75v5c0 .966.784 1.75 1.75 1.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/** Подтверждение после копирования. */
export const CheckIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.5 8.5L6.5 11.5L12.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Стрелка селекта. Разворачивается поворотом контейнера, не вторым глифом. */
export const ArrowDownIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
