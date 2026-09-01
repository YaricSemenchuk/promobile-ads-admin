import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_ACTIVITY } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface ActivityRow {
  id: string;
  workspaceId: number;
  workspaceName: string;
  userEmail: string | null;
  actor: string;
  entityType: string;
  action: string;
  changeSource: string;
  status: string;
  okCount: number | null;
  failedCount: number | null;
  createdAt: string;
}

type Column = "when" | "workspace" | "who" | "what" | "result" | "source";

const PAGE_SIZE = 100;

const when = (iso: string) => new Date(iso).toLocaleString("en-US");

export function ActivityPage() {
  // Фильтр по воркспейсу живёт в URL, а не в состоянии: на этот экран приходят
  // ссылкой из разбора инцидента, и такая ссылка должна открывать нужный срез.
  const [params, setParams] = useSearchParams();
  const workspaceParam = params.get("workspaceId");
  const [offset, setOffset] = useState(0);

  const workspaceId = workspaceParam ? Number(workspaceParam) : undefined;

  const { data, loading, error } = useQuery(GET_ADMIN_ACTIVITY, {
    variables: {
      workspaceId: Number.isFinite(workspaceId) ? workspaceId : undefined,
      limit: PAGE_SIZE,
      offset,
    },
  });

  const rows: ActivityRow[] = data?.adminActivity?.rows ?? [];
  const total: number = data?.adminActivity?.total ?? 0;

  return (
    <div>
      <h1 className={styles.pageTitle}>Activity log</h1>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Workspace id, or empty for all…"
          value={workspaceParam ?? ""}
          onChange={(e) => {
            const next = e.target.value.trim();
            setParams(next ? { workspaceId: next } : {});
            setOffset(0);
          }}
        />
        <span className={styles.live}>{total} entries</span>
      </div>

      {loading && !rows.length && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load the activity log.</div>}

      <SettingsTable<Column, ActivityRow>
        columns={[
          { key: "when", label: "When", width: "16%" },
          { key: "workspace", label: "Workspace", width: "16%" },
          { key: "who", label: "Who", width: "20%" },
          { key: "what", label: "What", width: "22%" },
          { key: "result", label: "Result", width: "14%" },
          { key: "source", label: "Source", width: "12%" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyText="Nothing logged for this filter."
        renderCell={(row, key) => {
          switch (key) {
            case "when":
              return when(row.createdAt);
            case "workspace":
              return (
                <Link className={styles.rowLink} to={`/workspaces/${row.workspaceId}`}>
                  {row.workspaceName}
                </Link>
              );
            case "who":
              // actor — то, чем представился источник (человек, правило,
              // джоба); почта есть не всегда, автоматика её не имеет.
              return (
                <>
                  {row.userEmail ?? row.actor}
                  {row.userEmail && <span className={styles.note}> · {row.actor}</span>}
                </>
              );
            case "what":
              return (
                <>
                  {row.action}
                  <span className={styles.note}> · {row.entityType}</span>
                </>
              );
            case "result":
              return (
                <span className={row.status === "ok" ? styles.ok : styles.bad}>
                  {row.status}
                  {(row.okCount != null || row.failedCount != null) && (
                    <span className={styles.note}>
                      {" "}
                      · {row.okCount ?? 0} ok
                      {row.failedCount ? `, ${row.failedCount} failed` : ""}
                    </span>
                  )}
                </span>
              );
            case "source":
              return row.changeSource;
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
