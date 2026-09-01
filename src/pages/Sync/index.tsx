import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_SYNC_STATES } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "../../styles/list.module.scss";

interface SyncRow {
  connectionId: string;
  workspaceId: number;
  workspaceName: string;
  orgName: string | null;
  connectionStatus: string;
  dailySyncedThrough: string | null;
  hourlySyncedThrough: string | null;
  lastRunAt: string | null;
  lastError: string | null;
  lastKeywordCount: number | null;
}

type Column = "workspace" | "org" | "status" | "lastRun" | "through" | "keywords";

// Синк суточный, поэтому сутки без запуска — ещё не авария, а двое — уже да.
const STALE_H = 24;
const DEAD_H = 48;

const hoursSince = (iso: string | null) =>
  iso == null ? null : (Date.now() - new Date(iso).getTime()) / 3_600_000;

const ago = (iso: string | null) => {
  const h = hoursSince(iso);
  if (h == null) return "never";
  if (h < 1) return `${Math.max(1, Math.floor(h * 60))}m ago`;
  if (h < 48) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const runTone = (iso: string | null) => {
  const h = hoursSince(iso);
  // Ни разу не синкалось — худший случай, а не отсутствие данных.
  if (h == null || h > DEAD_H) return styles.bad;
  if (h > STALE_H) return styles.warn;
  return styles.ok;
};

export function SyncPage() {
  const { data, loading, error } = useQuery(GET_ADMIN_SYNC_STATES);
  const rows: SyncRow[] = data?.adminSyncStates ?? [];

  // Резолвер уже отдаёт самые давние сверху, так что здесь только счёт.
  const broken = rows.filter((r) => r.lastError || runTone(r.lastRunAt) === styles.bad).length;

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load sync states.</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Sync health</h1>

      <div className={styles.controls}>
        <span className={styles.live}>
          {rows.length} connections
          {broken > 0 && (
            <>
              {" · "}
              <span className={styles.bad}>{broken} need attention</span>
            </>
          )}
        </span>
      </div>

      <SettingsTable<Column, SyncRow>
        columns={[
          { key: "workspace", label: "Workspace", width: "18%" },
          { key: "org", label: "Organization", width: "22%" },
          { key: "status", label: "Connection", width: "16%" },
          { key: "lastRun", label: "Last run", width: "14%" },
          { key: "through", label: "Synced through", width: "18%" },
          { key: "keywords", label: "Keywords", width: "12%" },
        ]}
        rows={rows}
        rowKey={(row) => row.connectionId}
        emptyText="No connections have a sync state yet."
        renderCell={(row, key) => {
          switch (key) {
            case "workspace":
              return (
                <Link className={styles.rowLink} to={`/workspaces/${row.workspaceId}`}>
                  {row.workspaceName}
                </Link>
              );
            case "org":
              return row.orgName ?? "—";
            case "status":
              return (
                <span className={row.connectionStatus === "ACTIVE" ? styles.ok : styles.bad}>
                  {row.connectionStatus}
                  {row.lastError && <span className={styles.note}> · {row.lastError}</span>}
                </span>
              );
            case "lastRun":
              return <span className={runTone(row.lastRunAt)}>{ago(row.lastRunAt)}</span>;
            case "through":
              // Два горизонта: суточный отчёт и почасовой. Расхождение между
              // ними само по себе диагноз, поэтому показаны оба.
              return (
                <>
                  {row.dailySyncedThrough ?? "—"}
                  <span className={styles.note}> · h {row.hourlySyncedThrough ?? "—"}</span>
                </>
              );
            case "keywords":
              return row.lastKeywordCount ?? "—";
          }
        }}
      />
    </div>
  );
}
