import { type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_MCP_CONNECTION } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "../WorkspaceDetail/styles.module.scss";

interface McpConnection {
  id: string;
  userId: number;
  userEmail: string | null;
  userName: string | null;
  workspaceId: number;
  workspaceName: string;
  label: string;
  scope: string;
  clientName: string | null;
  allWorkspaces: boolean;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  requestCount: number;
  changeCount: number;
}

interface McpRequest {
  id: string;
  toolName: string;
  args: string | null;
  ok: boolean;
  errorMessage: string | null;
  durationMs: number | null;
  workspaceId: number | null;
  workspaceName: string | null;
  createdAt: string;
}

interface McpChange {
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

interface Detail {
  connection: McpConnection;
  requests: McpRequest[];
  requestsTotal: number;
  changes: McpChange[];
  changesTotal: number;
}

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US") : "—";

const dur = (ms: number | null) => (ms == null ? "—" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);

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

function RequestsTable({ rows }: { rows: McpRequest[] }) {
  return (
    <SettingsTable<"when" | "tool" | "workspace" | "result", McpRequest>
      columns={[
        { key: "when", label: "When", width: "18%" },
        { key: "tool", label: "Tool", width: "46%" },
        { key: "workspace", label: "Workspace", width: "18%" },
        { key: "result", label: "Result", width: "18%" },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyText="No requests logged yet."
      renderCell={(r, key) => {
        switch (key) {
          case "when":
            return dateTime(r.createdAt);
          case "tool":
            return (
              <div className={styles.cell}>
                <span className={styles.cellMain}>{r.toolName}</span>
                {r.args && r.args !== "{}" && (
                  <span className={styles.cellSub} title={r.args}>
                    {r.args.length > 140 ? `${r.args.slice(0, 140)}…` : r.args}
                  </span>
                )}
              </div>
            );
          case "workspace":
            return r.workspaceName ?? (r.workspaceId != null ? `#${r.workspaceId}` : "—");
          case "result": {
            return (
              <div className={styles.cell}>
                <span className={cs(styles.badge, r.ok ? styles.ok : styles.bad)}>
                  {r.ok ? "ok" : "error"}
                </span>
                <span className={styles.cellSub}>
                  {dur(r.durationMs)}
                  {r.errorMessage ? ` · ${r.errorMessage}` : ""}
                </span>
              </div>
            );
          }
        }
      }}
    />
  );
}

function ChangesTable({ rows }: { rows: McpChange[] }) {
  return (
    <SettingsTable<"when" | "workspace" | "what" | "result", McpChange>
      columns={[
        { key: "when", label: "When", width: "18%" },
        { key: "workspace", label: "Workspace", width: "18%" },
        { key: "what", label: "What", width: "40%" },
        { key: "result", label: "Result", width: "24%" },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyText="This connection has not changed anything."
      renderCell={(r, key) => {
        switch (key) {
          case "when":
            return dateTime(r.createdAt);
          case "workspace":
            return (
              <Link className={styles.rowLink} to={`/workspaces/${r.workspaceId}`}>
                {r.workspaceName}
              </Link>
            );
          case "what":
            return (
              <div className={styles.cell}>
                <span className={styles.cellMain}>{r.action}</span>
                <span className={styles.cellSub}>{r.entityType}</span>
              </div>
            );
          case "result": {
            const counts =
              r.okCount != null || r.failedCount != null
                ? `${r.okCount ?? 0} ok${r.failedCount ? `, ${r.failedCount} failed` : ""}`
                : null;
            return (
              <div className={styles.cell}>
                <span className={cs(styles.badge, r.status === "ok" ? styles.ok : styles.bad)}>
                  {r.status}
                </span>
                {counts && <span className={styles.cellSub}>{counts}</span>}
              </div>
            );
          }
        }
      }}
    />
  );
}

export function McpDetailPage() {
  const { id = "" } = useParams();
  const { data, loading, error } = useQuery(GET_ADMIN_MCP_CONNECTION, {
    variables: { id },
  });

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the MCP connection.</div>;

  const d: Detail | null = data?.adminMcpConnection ?? null;
  if (!d) return <div className={styles.state}>MCP connection not found.</div>;

  const c = d.connection;
  const writes = c.scope.split(/\s+/).includes("asa:write");

  return (
    <div>
      <Link className={styles.back} to="/mcp">
        ← MCP access
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{c.userEmail ?? c.userName ?? `user #${c.userId}`}</h1>
          <div className={styles.subtitle}>
            {c.clientName ?? "manual key"} ·{" "}
            <Link className={styles.rowLink} to={`/workspaces/${c.workspaceId}`}>
              {c.workspaceName}
            </Link>
            {c.allWorkspaces ? " · all workspaces" : ""}
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Status</div>
          <div className={styles.tileValue}>
            <span className={cs(styles.badge, c.revokedAt ? styles.bad : styles.ok)}>
              {c.revokedAt ? "revoked" : "active"}
            </span>
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Requests</div>
          <div className={styles.tileValue}>{c.requestCount.toLocaleString("en-US")}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Changes</div>
          <div className={styles.tileValue}>{c.changeCount.toLocaleString("en-US")}</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Connection</h2>
      <Defs
        rows={[
          ["Label", c.label],
          ["Client", c.clientName ?? "manual key"],
          ["Scope", writes ? "asa:read asa:write" : "asa:read"],
          ["Workspaces", c.allWorkspaces ? "all of the user's" : c.workspaceName],
          ["Last used", dateTime(c.lastUsedAt)],
          ["Created", dateTime(c.createdAt)],
          ["Revoked", c.revokedAt ? <span key="r" className={styles.bad}>{dateTime(c.revokedAt)}</span> : "no"],
        ]}
      />

      <h2 className={styles.sectionTitle}>
        Requests{" "}
        {d.requestsTotal > d.requests.length ? `(latest ${d.requests.length} of ${d.requestsTotal})` : `(${d.requestsTotal})`}
      </h2>
      <RequestsTable rows={d.requests} />

      <h2 className={styles.sectionTitle}>
        Changes{" "}
        {d.changesTotal > d.changes.length ? `(latest ${d.changes.length} of ${d.changesTotal})` : `(${d.changesTotal})`}
      </h2>
      <ChangesTable rows={d.changes} />
    </div>
  );
}
