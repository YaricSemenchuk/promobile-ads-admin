import cs from "classnames";
import styles from "./styles.module.scss";
import { SortArrowsIcon } from "./icons";
import type { SettingsTableColumn, SettingsTableProps } from "./types";

/**
 * Таблица экранов настроек (Figma: Settings → Team, Apple Account,
 * Notifications). Одна и та же во всех трёх: заголовки со стрелками
 * сортировки, строки в 64px, разделители между строками и пустое состояние.
 *
 * Компонент отвечает только за раскладку и сортировку-по-щелчку. Что стоит в
 * ячейке — чекбокс, дропдаун, бейдж или кнопка — решает контейнер через
 * renderCell: у трёх таблиц общая рамка, но не содержимое.
 *
 * Сортировка контролируемая и без клиентского упорядочивания: строки приходят
 * уже в нужном порядке. Так контейнер волен сортировать по своим правилам —
 * например ставить включённые каналы выше выключенных, — а не по тексту
 * ячейки, до которого таблице не добраться.
 */
export function SettingsTable<K extends string, R>({
  columns,
  rows,
  rowKey,
  renderCell,
  sort,
  onSortChange,
  minWidth = 720,
  rowHeight = 64,
  emptyText = "Nothing here yet.",
  className,
}: SettingsTableProps<K, R>) {
  const sortable = (c: SettingsTableColumn<K>) =>
    Boolean(c.label) &&
    !c.header &&
    c.sortable !== false &&
    Boolean(onSortChange);

  const toggle = (key: K) =>
    onSortChange?.({ key, asc: sort?.key === key ? !sort.asc : true });

  return (
    <div className={cs(styles.wrap, className)}>
      <table className={styles.table} style={{ minWidth }}>
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>

        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} aria-label={c.label ? undefined : "Actions"}>
                {sortable(c) ? (
                  <button
                    type="button"
                    className={cs(styles.headBtn, {
                      [styles.headBtnActive]: sort?.key === c.key,
                    })}
                    onClick={() => toggle(c.key)}
                  >
                    {c.label}
                    <SortArrowsIcon />
                  </button>
                ) : (
                  (c.header ?? c.label)
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} style={{ height: rowHeight }}>
              {columns.map((c) => (
                <td key={c.key}>{renderCell(row, c.key)}</td>
              ))}
            </tr>
          ))}

          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SettingsTable;
