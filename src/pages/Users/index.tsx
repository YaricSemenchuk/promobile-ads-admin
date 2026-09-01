import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_USERS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface UserRow {
  id: number;
  email: string | null;
  name: string | null;
  platformRole: string | null;
  createdAt: string;
  ownedWorkspaceCount: number;
  memberWorkspaceCount: number;
}

type Column = "email" | "name" | "role" | "workspaces" | "created";

const PAGE_SIZE = 50;

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_USERS, {
    variables: { search: search || undefined, limit: PAGE_SIZE, offset },
  });

  const rows: UserRow[] = data?.adminUsers?.rows ?? [];
  const total: number = data?.adminUsers?.total ?? 0;
  const staff = rows.filter((r) => r.platformRole).length;

  return (
    <div>
      <h1 className={styles.pageTitle}>Users</h1>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
        />
        <span className={styles.live}>
          {total} users{staff > 0 && ` · ${staff} staff on this page`}
        </span>
      </div>

      {loading && !rows.length && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load users.</div>}

      <SettingsTable<Column, UserRow>
        columns={[
          { key: "email", label: "Email", width: "30%" },
          { key: "name", label: "Name", width: "22%" },
          { key: "role", label: "Platform role", width: "16%" },
          { key: "workspaces", label: "Workspaces", width: "18%" },
          { key: "created", label: "Registered", width: "14%" },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
        emptyText="No users found."
        renderCell={(row, key) => {
          switch (key) {
            case "email":
              return row.email ?? <span className={styles.note}>no email</span>;
            case "name":
              return row.name ?? "—";
            case "role":
              // Роль есть только у сотрудников, и это её цветовой смысл:
              // выделен не «важный человек», а доступ ко всей платформе.
              return row.platformRole ? (
                <span className={styles.warn}>{row.platformRole}</span>
              ) : (
                <span className={styles.note}>customer</span>
              );
            case "workspaces":
              return (
                <>
                  {row.ownedWorkspaceCount} owned
                  <span className={styles.note}> · {row.memberWorkspaceCount} member</span>
                </>
              );
            case "created":
              return date(row.createdAt);
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
