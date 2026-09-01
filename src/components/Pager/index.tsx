import styles from "./styles.module.scss";

/**
 * Пагинация списков админки.
 *
 * Смещением управляет контейнер: он же держит фильтры, а любой из них должен
 * сбрасывать страницу на первую. Спрятать offset внутрь пагинатора значило бы
 * оставить его рассинхронизированным с поиском — запрос уходил бы со
 * смещением от прошлой выдачи и находил пустоту при живых совпадениях.
 */
export type PagerProps = {
  offset: number;
  /** Сколько строк реально пришло: последняя страница почти всегда короче. */
  count: number;
  total: number;
  pageSize: number;
  onChange: (nextOffset: number) => void;
};

export function Pager({ offset, count, total, pageSize, onChange }: PagerProps) {
  const from = total === 0 ? 0 : offset + 1;
  const to = offset + count;

  return (
    <div className={styles.pager}>
      <span className={styles.count}>
        {from}–{to} of {total}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(Math.max(0, offset - pageSize))}
        disabled={offset === 0}
      >
        Previous
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(offset + pageSize)}
        disabled={to >= total}
      >
        Next
      </button>
    </div>
  );
}

export default Pager;
