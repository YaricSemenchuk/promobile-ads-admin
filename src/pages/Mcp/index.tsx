import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_MCP_CONNECTIONS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface McpRow {
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

type Column = "who" | "client" | "scope" | "used" | "requests" | "changes" | "status";

const PAGE_SIZE = 50;

const ago = (iso: string | null) => {
  if (!iso) return "never";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// asa:write — токен умеет править, а не только читать: это стоит выделить.
const canWrite = (scope: string) => scope.split(/\s+/).includes("asa:write");

export function McpPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_MCP_CONNECTIONS, {
    variables: { search: search || undefined, limit: PAGE_SIZE, offset },
  });

  const rows: McpRow[] = data?.adminMcpConnections?.rows ?? [];
  const total: number = data?.adminMcpConnections?.total ?? 0;
  const writers = rows.filter((r) => !r.revokedAt && canWrite(r.scope)).length;

  return (
    <div>
      <h1 className={styles.pageTitle}>MCP access</h1>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="User email, name or workspace…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
        />

        <span className={styles.live}>
          {total} connections
          {writers > 0 && (
            <>
              {" · "}
              <span className={styles.warn}>{writers} can write</span>
            </>
          )}
        </span>
      </div>

      {loading && !rows.length && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load MCP connections.</div>}

      <SettingsTable<Column, McpRow>
        columns={[
          { key: "who", label: "Who", width: "26%" },
          { key: "client", label: "Client", width: "20%" },
          { key: "scope", label: "Scope", width: "14%" },
          { key: "used", label: "Last used", width: "12%" },
          { key: "requests", label: "Requests", width: "9%" },
          { key: "changes", label: "Changes", width: "9%" },
          { key: "status", label: "Status", width: "10%" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyText="No MCP connections match."
        renderCell={(row, key) => {
          switch (key) {
            case "who":
              return (
                <div className={styles.cell}>
                  <Link className={cs(styles.rowLink, styles.cellMain)} to={`/mcp/${row.id}`}>
                    {row.userEmail ?? row.userName ?? `user #${row.userId}`}
                  </Link>
                  <span className={styles.cellSub}>
                    {row.allWorkspaces ? "all workspaces" : row.workspaceName}
                  </span>
                </div>
              );
            case "client":
              return (
                <div className={styles.cell}>
                  <span className={styles.cellMain}>{row.clientName ?? "manual key"}</span>
                  <span className={styles.cellSub}>{row.label}</span>
                </div>
              );
            case "scope":
              return (
                <span className={cs(styles.badge, canWrite(row.scope) ? styles.warn : styles.ok)}>
                  {canWrite(row.scope) ? "read · write" : "read"}
                </span>
              );
            case "used":
              return ago(row.lastUsedAt);
            case "requests":
              return row.requestCount.toLocaleString("en-US");
            case "changes":
              return row.changeCount.toLocaleString("en-US");
            case "status":
              return (
                <span className={cs(styles.badge, row.revokedAt ? styles.bad : styles.ok)}>
                  {row.revokedAt ? "revoked" : "active"}
                </span>
              );
          }
        }}
      />

      <Pager offset={offset} count={rows.length} total={total} pageSize={PAGE_SIZE} onChange={setOffset} />
    </div>
  );
}
