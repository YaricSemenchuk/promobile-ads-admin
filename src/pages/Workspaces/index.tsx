import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_WORKSPACES } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "./styles.module.scss";

type Column = "name" | "owner" | "plan" | "status" | "members" | "connections" | "created";

interface WorkspaceRow {
  id: number;
  name: string;
  ownerId: number | null;
  ownerEmail: string;
  createdAt: string;
  plan: string | null;
  billingStatus: string | null;
  memberCount: number;
  connectionCount: number;
  activeConnectionCount: number;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Совпадает с дефолтом резолвера. Держать их равными важнее, чем красиво:
// разъехавшись, счётчик страниц начнёт врать про то, что показано.
const PAGE_SIZE = 50;

export function WorkspacesPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_WORKSPACES, {
    variables: { search: search || undefined, limit: PAGE_SIZE, offset },
  });

  const rows: WorkspaceRow[] = data?.adminWorkspaces?.rows ?? [];
  const total: number = data?.adminWorkspaces?.total ?? 0;
  const from = total === 0 ? 0 : offset + 1;
  const to = offset + rows.length;

  // Новый поиск — снова первая страница: иначе запрос уходит со смещением от
  // прошлой выдачи и находит пустоту при живых совпадениях.
  const onSearch = (next: string) => {
    setSearch(next);
    setOffset(0);
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Workspaces</h1>

      <input
        className={styles.search}
        placeholder="Search by workspace name or owner email…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      {loading && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load workspaces.</div>}

      {!loading && !error && (
        <>
          <SettingsTable<Column, WorkspaceRow>
            columns={[
              { key: "name", label: "Workspace", width: "22%" },
              { key: "owner", label: "Owner", width: "20%" },
              { key: "plan", label: "Plan", width: "12%" },
              { key: "status", label: "Billing status", width: "14%" },
              { key: "members", label: "Members", width: "10%" },
              { key: "connections", label: "ASA connections", width: "14%" },
              { key: "created", label: "Created", width: "12%" },
            ]}
            rows={rows}
            rowKey={(row) => String(row.id)}
            emptyText="No workspaces found."
            renderCell={(row, key) => {
              switch (key) {
                case "name":
                  // Ссылка на имени, а не клик по строке: SettingsTable общая
                  // для всех списков и про навигацию ничего не знает, а ссылка
                  // ещё и открывается в новой вкладке средним щелчком.
                  return (
                    <Link className={styles.rowLink} to={`/workspaces/${row.id}`}>
                      {row.name}
                    </Link>
                  );
                case "owner":
                  return row.ownerEmail || "—";
                case "plan":
                  return row.plan ?? "—";
                case "status":
                  return row.billingStatus ?? "—";
                case "members":
                  return row.memberCount;
                case "connections":
                  return `${row.activeConnectionCount} / ${row.connectionCount} active`;
                case "created":
                  return date(row.createdAt);
              }
            }}
          />

          <div className={styles.pager}>
            <span className={styles.pagerCount}>
              {from}–{to} of {total}
            </span>
            <button
              type="button"
              className={styles.pagerBtn}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.pagerBtn}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={to >= total}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
