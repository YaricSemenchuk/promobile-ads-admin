import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_TASKS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface TaskRow {
  id: string;
  workspaceId: number;
  workspaceName: string;
  kind: string;
  state: string;
  changeSource: string;
  description: string;
  done: number;
  total: number;
  error: string | null;
  failureCount: number | null;
  cancelRequested: boolean;
  heartbeatAt: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

type Column = "workspace" | "task" | "state" | "progress" | "started" | "age";

const PAGE_SIZE = 50;

// Экран, которым ловят зависшие задачи, обязан обновляться сам: снимок на
// момент открытия здесь бесполезен.
const POLL_MS = 15_000;

/**
 * Через сколько молчания воркера задача считается зависшей.
 *
 * Число выбрано на глаз и не измерено против реального тика воркера — если
 * живые задачи начнут краснеть, поднимать надо здесь.
 */
const STALE_MS = 5 * 60 * 1000;

const STATES = ["", "queued", "running", "done", "failed", "cancelled"];

const ago = (iso: string | null) => {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const isStale = (row: TaskRow) =>
  row.state === "running" &&
  row.heartbeatAt != null &&
  Date.now() - new Date(row.heartbeatAt).getTime() > STALE_MS;

const toneOf = (row: TaskRow) => {
  if (row.state === "failed") return styles.bad;
  if (isStale(row)) return styles.bad;
  if (row.state === "done") return styles.ok;
  if (row.state === "running") return styles.warn;
  return styles.neutral;
};

export function TasksPage() {
  const [state, setState] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_TASKS, {
    variables: {
      state: state || undefined,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset,
    },
    pollInterval: POLL_MS,
  });

  const rows: TaskRow[] = data?.adminTasks?.rows ?? [];
  const total: number = data?.adminTasks?.total ?? 0;
  const stuck = rows.filter(isStale).length;

  return (
    <div>
      <h1 className={styles.pageTitle}>Task queue</h1>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setOffset(0);
          }}
          aria-label="Filter by state"
        >
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s || "All states"}
            </option>
          ))}
        </select>

        <input
          className={styles.search}
          placeholder="Search by workspace, kind or description…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
        />

        <span className={styles.live}>
          refreshes every {POLL_MS / 1000}s
          {stuck > 0 && (
            <>
              {" · "}
              <span className={styles.bad}>
                {stuck} stalled on this page
              </span>
            </>
          )}
        </span>
      </div>

      {/* Ошибку показываем, но таблицу не прячем: при опросе одна неудачная
          выборка не повод стирать с экрана то, что уже видно. */}
      {error && <div className={styles.state}>Failed to load tasks.</div>}
      {loading && !rows.length && <div className={styles.state}>Loading…</div>}

      <SettingsTable<Column, TaskRow>
        columns={[
          { key: "workspace", label: "Workspace", width: "18%" },
          { key: "task", label: "Task", width: "30%" },
          { key: "state", label: "State", width: "16%" },
          { key: "progress", label: "Progress", width: "12%" },
          { key: "started", label: "Started", width: "12%" },
          { key: "age", label: "Heartbeat", width: "12%" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyText="No tasks match."
        renderCell={(row, key) => {
          switch (key) {
            case "workspace":
              return (
                <Link className={styles.rowLink} to={`/workspaces/${row.workspaceId}`}>
                  {row.workspaceName}
                </Link>
              );
            case "task":
              return (
                <div className={styles.cell}>
                  <span className={styles.cellMain}>{row.description}</span>
                  <span className={styles.cellSub}>
                    {row.kind} · {row.changeSource}
                  </span>
                </div>
              );
            case "state": {
              // Уточнения — на вторую строку: одной inline-строкой «running ·
              // cancelling · <error>» они не помещались и наезжали на соседнюю
              // колонку.
              const notes: ReactNode[] = [];
              if (row.cancelRequested) notes.push(<span className={styles.bad}>cancelling</span>);
              if (row.error) notes.push(row.error);
              else if (row.failureCount) notes.push(`${row.failureCount} failed`);
              return (
                <div className={styles.cell}>
                  <span className={cs(styles.badge, toneOf(row))}>
                    {isStale(row) ? "stalled" : row.state}
                  </span>
                  {notes.length > 0 && (
                    <span className={styles.cellSub}>
                      {notes.map((note, i) => (
                        <span key={i}>
                          {i > 0 && " · "}
                          {note}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              );
            }
            case "progress":
              return (
                <>
                  {row.done} / {row.total}
                  <span className={styles.progress}>
                    <span
                      className={styles.progressFill}
                      style={{ width: `${row.total ? (row.done / row.total) * 100 : 0}%` }}
                    />
                  </span>
                </>
              );
            case "started":
              return ago(row.startedAt ?? row.createdAt);
            case "age":
              // Для завершённой задачи heartbeat уже ничего не значит — там
              // важно, когда она закончилась.
              return row.finishedAt ? (
                <span className={styles.note}>done {ago(row.finishedAt)}</span>
              ) : (
                <span className={isStale(row) ? styles.bad : undefined}>{ago(row.heartbeatAt)}</span>
              );
          }
        }}
      />

      <Pager
        offset={offset}
        count={rows.length}
        total={total}
        pageSize={PAGE_SIZE}
        onChange={setOffset}
      />
    </div>
  );
}
