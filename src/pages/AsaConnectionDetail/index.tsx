import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_ASA_CONNECTION } from "../../api/queries";
import styles from "../WorkspaceDetail/styles.module.scss";

interface Counts {
  apps: number;
  rules: number;
  rampUps: number;
  tasks: number;
  budgetOrders: number;
  customReports: number;
  activityEntries: number;
}

interface ConnectionDetail {
  id: string;
  workspaceId: number;
  workspaceName: string;
  ownerEmail: string | null;
  orgId: string;
  orgName: string | null;
  adAccountId: string | null;
  status: string;
  apiVersion: string;
  currency: string | null;
  timeZone: string | null;
  paymentModel: string | null;
  roleNames: string[];
  basicDetectedAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  dailySyncedThrough: string | null;
  hourlySyncedThrough: string | null;
  lastRunAt: string | null;
  lastKeywordCount: number | null;
  counts: Counts;
}

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US") : "—";

const statusTone = (status: string) =>
  status === "ACTIVE" ? styles.ok : status === "PENDING" ? styles.warn : styles.bad;

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

export function AsaConnectionDetailPage() {
  const { id = "" } = useParams();
  const { data, loading, error } = useQuery(GET_ADMIN_ASA_CONNECTION, {
    variables: { id },
  });

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the connection.</div>;

  const c: ConnectionDetail | null = data?.adminAsaConnection ?? null;
  if (!c) return <div className={styles.state}>Connection not found.</div>;

  return (
    <div>
      <Link className={styles.back} to="/asa-connections">
        ← ASA Connections
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{c.orgName ?? "—"}</h1>
          <div className={styles.subtitle}>
            org {c.orgId} ·{" "}
            <Link className={styles.rowLink} to={`/workspaces/${c.workspaceId}`}>
              {c.workspaceName}
            </Link>
            {c.ownerEmail ? ` · ${c.ownerEmail}` : ""}
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Status</div>
          <div className={styles.tileValue}>
            <span className={cs(styles.badge, statusTone(c.status))}>{c.status}</span>
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Apps</div>
          <div className={styles.tileValue}>{c.counts.apps}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Ramp-ups</div>
          <div className={styles.tileValue}>{c.counts.rampUps}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Tasks</div>
          <div className={styles.tileValue}>{c.counts.tasks}</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Connection</h2>
      <Defs
        rows={[
          ["Ad account id", c.adAccountId ?? "—"],
          ["API version", c.apiVersion],
          ["Currency", c.currency ?? "—"],
          ["Timezone", c.timeZone ?? "—"],
          ["Payment model", c.paymentModel ?? "—"],
          ["Roles", c.roleNames.length ? c.roleNames.join(", ") : "—"],
          ["Basic org", c.basicDetectedAt ? `since ${dateTime(c.basicDetectedAt)}` : "no"],
          ["Created", dateTime(c.createdAt)],
          ["Updated", dateTime(c.updatedAt)],
        ]}
      />

      <h2 className={styles.sectionTitle}>Sync</h2>
      <Defs
        rows={[
          ["Last synced", dateTime(c.lastSyncedAt)],
          ["Last run", dateTime(c.lastRunAt)],
          ["Daily synced through", c.dailySyncedThrough ?? "—"],
          ["Hourly synced through", c.hourlySyncedThrough ?? "—"],
          ["Keywords", c.lastKeywordCount ?? "—"],
          ["Last error", c.lastError ? <span key="err" className={styles.bad}>{c.lastError}</span> : "none"],
        ]}
      />

      <h2 className={styles.sectionTitle}>Manages</h2>
      <Defs
        rows={[
          ["Rules", c.counts.rules],
          ["Budget orders", c.counts.budgetOrders],
          ["Custom reports", c.counts.customReports],
          ["Activity entries", c.counts.activityEntries],
        ]}
      />
    </div>
  );
}
