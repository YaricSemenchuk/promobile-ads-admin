import cs from "classnames";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Select.module.scss";

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Доступное имя — у поля нет видимого <label>. */
  ariaLabel?: string;
  /** Текст, когда value не совпал ни с одним пунктом. */
  placeholder?: string;
  /** md (40px) — фильтры и строки; lg (48px) — поля дровера. */
  size?: "md" | "lg";
  block?: boolean;
  disabled?: boolean;
  className?: string;
}

type PanelBox = { left: number; top: number; width: number; drop: "down" | "up" };

const GAP = 4;
const PANEL_MAX_HEIGHT = 280;

/**
 * Выпадающий список дизайн-системы. Список рисуем сами и выносим порталом в
 * body, поэтому он стилизуется токенами и одинаков в любой ОС — в отличие от
 * нативного <select>, чей popup на macOS системный и тёмный. Клавиатура,
 * активный пункт по mousemove, закрытие по клику вне и по Escape.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder,
  size = "md",
  block = false,
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [box, setBox] = useState<PanelBox | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const drop = below < PANEL_MAX_HEIGHT + GAP && rect.top > below ? "up" : "down";
    setBox({
      left: rect.left,
      top: drop === "down" ? rect.bottom + GAP : rect.top - GAP,
      width: rect.width,
      drop,
    });
  }, []);

  // Позиционируем перед покраской, чтобы панель не мигнула в углу.
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  // Пока открыто — следим за скроллом/ресайзом и держим панель у поля.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, place]);

  // При открытии активным становится выбранный пункт — с него ведёт клавиатура.
  const openPanel = useCallback(() => {
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [selectedIndex]);

  // Активный пункт держим в поле зрения при навигации клавишами.
  useEffect(() => {
    if (!open || active < 0) return;
    panelRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const commit = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (active >= 0) commit(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cs(
          styles.trigger,
          { [styles.block]: block, [styles.open]: open, [styles.lg]: size === "lg" },
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) setOpen(false);
          else openPanel();
        }}
        onKeyDown={onKeyDown}
      >
        <span className={cs(styles.value, { [styles.placeholder]: !selected })}>
          {selected ? selected.label : placeholder ?? ""}
        </span>
        <ChevronIcon className={cs(styles.arrow, { [styles.arrowOpen]: open })} />
      </button>

      {open &&
        box &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className={styles.panel}
            style={{
              left: box.left,
              width: box.width,
              ...(box.drop === "down"
                ? { top: box.top }
                : { top: box.top, transform: "translateY(-100%)" }),
            }}
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                data-index={index}
                role="option"
                aria-selected={option.value === value}
                className={cs(styles.option, {
                  [styles.optionActive]: index === active,
                  [styles.optionSelected]: option.value === value,
                })}
                onMouseMove={() => setActive(index)}
                onClick={() => commit(index)}
              >
                <span className={styles.value}>{option.label}</span>
                {option.value === value && <CheckIcon className={styles.check} />}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default Select;
