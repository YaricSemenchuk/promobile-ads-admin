import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_ASA_CONNECTIONS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface ConnectionRow {
  id: string;
  workspaceId: number;
  workspaceName: string;
  ownerEmail: string | null;
  orgId: string;
  orgName: string | null;
  status: string;
  apiVersion: string;
  currency: string | null;
  timeZone: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
}

type Column = "workspace" | "org" | "status" | "api" | "currency" | "synced";

const PAGE_SIZE = 50;
const STATUSES = ["", "ACTIVE", "PENDING", "ERROR", "REVOKED"];

const ago = (iso: string | null) => {
  if (!iso) return "never";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const statusTone = (status: string) =>
  status === "ACTIVE" ? styles.ok : status === "PENDING" ? styles.warn : styles.bad;

export function AsaConnectionsPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_ASA_CONNECTIONS, {
    variables: {
      status: status || undefined,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset,
    },
  });

  const rows: ConnectionRow[] = data?.adminAsaConnections?.rows ?? [];
  const total: number = data?.adminAsaConnections?.total ?? 0;
  const broken = rows.filter((r) => r.status === "ERROR" || r.status === "REVOKED").length;

  return (
    <div>
      <h1 className={styles.pageTitle}>ASA Connections</h1>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          aria-label="Filter by connection status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>

        <input
          className={styles.search}
          placeholder="Organization, org id or workspace…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
        />

        <span className={styles.live}>
          {total} connections
          {broken > 0 && (
            <>
              {" · "}
              <span className={styles.bad}>{broken} need attention</span>
            </>
          )}
        </span>
      </div>

      {loading && !rows.length && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load ASA connections.</div>}

      <SettingsTable<Column, ConnectionRow>
        columns={[
          { key: "workspace", label: "Workspace", width: "22%" },
          { key: "org", label: "Organization", width: "24%" },
          { key: "status", label: "Status", width: "20%" },
          { key: "api", label: "API", width: "8%" },
          { key: "currency", label: "Currency", width: "10%" },
          { key: "synced", label: "Last synced", width: "16%" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyText="No ASA connections match."
        renderCell={(row, key) => {
          switch (key) {
            case "workspace":
              return (
                <div className={styles.cell}>
                  <Link className={styles.rowLink} to={`/workspaces/${row.workspaceId}`}>
                    {row.workspaceName}
                  </Link>
                  {row.ownerEmail && <span className={styles.cellSub}>{row.ownerEmail}</span>}
                </div>
              );
            case "org":
              return (
                <div className={styles.cell}>
                  <Link className={cs(styles.rowLink, styles.cellMain)} to={`/asa-connections/${row.id}`}>
                    {row.orgName ?? "—"}
                  </Link>
                  <span className={styles.cellSub}>{row.orgId}</span>
                </div>
              );
            case "status":
              return (
                <div className={styles.cell}>
                  <span className={cs(styles.badge, statusTone(row.status))}>{row.status}</span>
                  {row.lastError && <span className={styles.cellSub}>{row.lastError}</span>}
                </div>
              );
            case "api":
              return row.apiVersion;
            case "currency":
              return row.currency ?? "—";
            case "synced":
              return ago(row.lastSyncedAt);
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
