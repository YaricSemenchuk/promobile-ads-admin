import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_ACTIVITY_ENTRY } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "../WorkspaceDetail/styles.module.scss";

interface Change {
  subject: string;
  detail: string;
}

interface Failure {
  subject: string;
  reason: string;
}

interface ActivityDetail {
  id: string;
  createdAt: string;
  workspaceId: number;
  workspaceName: string;
  actor: string;
  userEmail: string | null;
  connectionId: string | null;
  orgName: string | null;
  entityType: string;
  action: string;
  changeSource: string;
  status: string;
  okCount: number | null;
  failedCount: number | null;
  changes: Change[];
  failures: Failure[];
}

const dateTime = (iso: string) => new Date(iso).toLocaleString("en-US");

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

export function ActivityDetailPage() {
  const { id = "" } = useParams();
  const { data, loading, error } = useQuery(GET_ADMIN_ACTIVITY_ENTRY, {
    variables: { id },
  });

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the entry.</div>;

  const a: ActivityDetail | null = data?.adminActivityEntry ?? null;
  if (!a) return <div className={styles.state}>Entry not found.</div>;

  const failed = a.status !== "ok";

  return (
    <div>
      <Link className={styles.back} to="/activity">
        ← Activity log
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{a.action}</h1>
          <div className={styles.subtitle}>
            {dateTime(a.createdAt)} ·{" "}
            <Link className={styles.rowLink} to={`/workspaces/${a.workspaceId}`}>
              {a.workspaceName}
            </Link>{" "}
            · {a.changeSource}
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Result</div>
          <div className={styles.tileValue}>
            <span className={cs(styles.badge, failed ? styles.bad : styles.ok)}>{a.status}</span>
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Done</div>
          <div className={styles.tileValue}>{a.okCount ?? a.changes.length}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Failed</div>
          <div className={styles.tileValue}>{a.failedCount ?? a.failures.length}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Entity</div>
          <div className={styles.tileValue}>{a.entityType}</div>
        </div>
      </div>

      {a.failures.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Failed</h2>
          <SettingsTable<"subject" | "reason", Failure>
            columns={[
              { key: "subject", label: "Subject", width: "34%" },
              { key: "reason", label: "Reason", width: "66%" },
            ]}
            rows={a.failures}
            rowKey={(r) => `${r.subject}·${r.reason}`}
            emptyText="Nothing failed."
            renderCell={(r, key) =>
              key === "subject" ? (
                <span className={styles.cellMain}>{r.subject || "—"}</span>
              ) : (
                <span className={styles.bad}>{r.reason}</span>
              )
            }
          />
        </>
      )}

      {a.changes.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Done</h2>
          <SettingsTable<"subject" | "detail", Change>
            columns={[
              { key: "subject", label: "Subject", width: "34%" },
              { key: "detail", label: "What changed", width: "66%" },
            ]}
            rows={a.changes}
            rowKey={(r) => `${r.subject}·${r.detail}`}
            emptyText="No changes."
            renderCell={(r, key) =>
              key === "subject" ? <span className={styles.cellMain}>{r.subject || "—"}</span> : r.detail
            }
          />
        </>
      )}

      <h2 className={styles.sectionTitle}>Details</h2>
      <Defs
        rows={[
          ["Actor", a.userEmail ?? a.actor],
          [
            "Organization",
            a.connectionId && a.orgName ? (
              <Link key="org" className={styles.rowLink} to={`/asa-connections/${a.connectionId}`}>
                {a.orgName}
              </Link>
            ) : (
              a.orgName ?? "—"
            ),
          ],
          ["Source", a.changeSource],
          ["When", dateTime(a.createdAt)],
        ]}
      />
    </div>
  );
}
