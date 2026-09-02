import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_TASK } from "../../api/queries";
import styles from "../WorkspaceDetail/styles.module.scss";

interface TaskDetail {
  id: string;
  workspaceId: number;
  workspaceName: string;
  connectionId: string | null;
  orgName: string | null;
  kind: string;
  changeSource: string;
  description: string;
  state: string;
  done: number;
  total: number;
  error: string | null;
  cancelRequested: boolean;
  actorEmail: string | null;
  heartbeatAt: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US") : "—";

const stateTone = (state: string) =>
  state === "done" ? styles.ok : state === "failed" ? styles.bad : styles.warn;

function Defs({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className={styles.defs}>
      {rows.map(([key, value]) => (
        <div key={key} className={styles.defRow}>
          <span className={styles.defKey}>{key}</span>
          <span className={styles.defVal}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function TaskDetailPage() {
  const { id = "" } = useParams();
  const { data, loading, error } = useQuery(GET_ADMIN_TASK, { variables: { id } });

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the task.</div>;

  const t: TaskDetail | null = data?.adminTask ?? null;
  if (!t) return <div className={styles.state}>Task not found.</div>;

  return (
    <div>
      <Link className={styles.back} to="/tasks">
        ← Task queue
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{t.description}</h1>
          <div className={styles.subtitle}>
            {t.kind} · {t.changeSource} ·{" "}
            <Link className={styles.rowLink} to={`/workspaces/${t.workspaceId}`}>
              {t.workspaceName}
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>State</div>
          <div className={styles.tileValue}>
            <span className={cs(styles.badge, stateTone(t.state))}>
              {t.cancelRequested ? "cancelling" : t.state}
            </span>
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Progress</div>
          <div className={styles.tileValue}>
            {t.done} / {t.total}
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Source</div>
          <div className={styles.tileValue}>{t.changeSource}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Kind</div>
          <div className={styles.tileValue}>{t.kind}</div>
        </div>
      </div>

      {t.error && (
        <>
          <h2 className={styles.sectionTitle}>Error</h2>
          <div className={styles.error}>{t.error}</div>
        </>
      )}

      <h2 className={styles.sectionTitle}>Task</h2>
      <Defs
        rows={[
          ["Actor", t.actorEmail ?? "—"],
          [
            "Organization",
            t.connectionId && t.orgName ? (
              <Link key="org" className={styles.rowLink} to={`/asa-connections/${t.connectionId}`}>
                {t.orgName}
              </Link>
            ) : (
              t.orgName ?? "—"
            ),
          ],
          [
            "Workspace",
            <Link key="ws" className={styles.rowLink} to={`/workspaces/${t.workspaceId}`}>
              {t.workspaceName}
            </Link>,
          ],
          ["Cancel requested", t.cancelRequested ? "yes" : "no"],
        ]}
      />

      <h2 className={styles.sectionTitle}>Timing</h2>
      <Defs
        rows={[
          ["Created", dateTime(t.createdAt)],
          ["Started", dateTime(t.startedAt)],
          ["Finished", dateTime(t.finishedAt)],
          ["Heartbeat", dateTime(t.heartbeatAt)],
        ]}
      />
    </div>
  );
}
