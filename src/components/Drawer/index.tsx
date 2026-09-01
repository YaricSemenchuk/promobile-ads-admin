import React, { useEffect, useState } from "react";
import cs from "classnames";
import styles from "./styles.module.scss";
import { ArrowDownIcon, CheckIcon, CloseIcon, CopyIcon } from "./icons";
import type {
  DrawerButtonProps,
  DrawerCopyRowProps,
  DrawerFieldProps,
  DrawerInfoCardProps,
  DrawerLinkButtonProps,
  DrawerProps,
  DrawerSelectProps,
  DrawerStepProps,
  DrawerTextProps,
} from "./types";

/**
 * Боковой дровер настроек (Figma 1428:4814, 1488:75619).
 *
 * Каркас и ничего кроме: панель, шапка, прокручиваемое тело, приклеенный
 * подвал. Что настраивают внутри — дело контейнера; он же держит состояние
 * формы. Шаги, поля, плашки и строки «скопировать» лежат рядом отдельными
 * кусками: мастера подключения собраны в макете из одних и тех же деталей.
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  title,
  subtitle,
  badge,
  compactTitle,
  children,
  footer,
  onClose,
  width = 482,
  className,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <aside
        className={cs(styles.drawer, className)}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.body}>
          <div className={styles.head}>
            <div>
              <div className={styles.titleRow}>
                <h2
                  className={cs(styles.title, compactTitle && styles.titleSm)}
                >
                  {title}
                </h2>
                {badge}
              </div>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          </div>

          {children}
        </div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </div>
  );
};

export const DrawerStep: React.FC<DrawerStepProps> = ({
  index,
  title,
  children,
}) => (
  <div className={styles.step}>
    <span className={styles.stepMark}>{index}</span>
    <div className={styles.stepBody}>
      <h3 className={styles.stepTitle}>{title}</h3>
      {children}
    </div>
  </div>
);

export const DrawerField: React.FC<DrawerFieldProps> = ({
  label,
  value,
  placeholder,
  type,
  caption,
  disabled,
  multiline,
  mono,
  onChange,
}) => {
  const shared = {
    className: cs(
      styles.input,
      multiline && styles.textarea,
      mono && styles.mono,
    ),
    value,
    placeholder,
    disabled,
    // Иначе браузер подставляет в «Endpoint URL» почту, а в «Secret» —
    // сохранённый пароль: поля панели к учётной записи отношения не имеют.
    autoComplete: type === "password" ? "new-password" : "off",
    readOnly: !onChange,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange?.(e.target.value),
  };

  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      {multiline ? (
        <textarea {...shared} />
      ) : (
        <input type={type ?? "text"} {...shared} />
      )}
      {caption && <span className={styles.caption}>{caption}</span>}
    </label>
  );
};

export const DrawerText: React.FC<DrawerTextProps> = ({ children, muted }) => (
  <p className={cs(styles.text, muted && styles.textMuted)}>{children}</p>
);

/**
 * Комбо: рамка, шеврон и нативный select поверх — раскрывающийся список
 * остаётся системным, а выглядит как поле рядом.
 */
export const DrawerSelect: React.FC<DrawerSelectProps> = ({
  label,
  value,
  options,
  ariaLabel,
  caption,
  disabled,
  onChange,
}) => (
  <div className={styles.field}>
    {label && <span className={styles.label}>{label}</span>}
    <div className={cs(styles.select, disabled && styles.selectOff)}>
      <span className={styles.selectText}>
        {options.find((option) => option.value === value)?.label ?? value}
      </span>
      <ArrowDownIcon className={styles.selectArrow} />
      <select
        className={styles.selectNative}
        value={value}
        aria-label={ariaLabel}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    {caption && <span className={styles.caption}>{caption}</span>}
  </div>
);

export const DrawerInfoCard: React.FC<DrawerInfoCardProps> = ({
  icon,
  title,
  children,
}) => (
  <div className={styles.infoCard}>
    {icon && <span className={styles.infoCardIcon}>{icon}</span>}
    <div className={styles.infoCardBody}>
      <h4 className={styles.infoCardTitle}>{title}</h4>
      {children}
    </div>
  </div>
);

/**
 * Значение, которое панель выдаёт наружу: URL приёмника, ключ, тело запроса.
 * Кнопка на пару секунд подтверждает, что скопировала, — иначе по клику не
 * видно ничего и его повторяют.
 */
export const DrawerCopyRow: React.FC<DrawerCopyRowProps> = ({
  label,
  value,
  display,
  caption,
  ariaLabel,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={cs(styles.copyRow, code && styles.copyRowCode)}>
        <span className={cs(styles.copyValue, code && styles.copyValueCode)}>
          {display ?? value}
        </span>
        <button
          type="button"
          className={cs(styles.copyBtn, copied && styles.copyBtnDone)}
          aria-label={ariaLabel ?? `Copy ${label ?? "value"}`}
          onClick={() => {
            void navigator.clipboard?.writeText(value);
            setCopied(true);
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {caption && <span className={styles.caption}>{caption}</span>}
    </div>
  );
};

export const DrawerLinkButton: React.FC<DrawerLinkButtonProps> = ({
  children,
  variant = "brand",
  disabled,
  onClick,
}) => (
  <button
    type="button"
    className={cs(styles.linkBtn, variant === "danger" && styles.linkBtnDanger)}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

export const DrawerButton: React.FC<DrawerButtonProps> = ({
  children,
  variant = "primary",
  disabled,
  type = "button",
  onClick,
  className,
}) => (
  <button
    // eslint-disable-next-line react/button-has-type
    type={type}
    className={cs(
      styles.button,
      variant === "primary" ? styles.buttonPrimary : styles.buttonGhost,
      className,
    )}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
