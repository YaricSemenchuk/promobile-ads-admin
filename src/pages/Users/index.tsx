import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_USERS, SET_USER_TESTER } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import { Button } from "../../components/ui";
import styles from "../../styles/list.module.scss";

interface UserRow {
  id: number;
  email: string | null;
  name: string | null;
  platformRole: string | null;
  isTester: boolean;
  createdAt: string;
  ownedWorkspaceCount: number;
  memberWorkspaceCount: number;
}

type Column = "email" | "name" | "role" | "tester" | "workspaces" | "created";

const PAGE_SIZE = 50;

// Подсказка при наведении: тестер проходит пейволл везде, но чужой закрытый воркспейс от этого не оживает.
const TESTER_HINT =
  "No paywall for this user in any workspace they open, including someone else's. " +
  "Workspaces they own are never stopped by billing. In someone else's closed workspace only this user gets past the paywall: " +
  "its sync, rules and campaigns stay stopped until the owner pays or is made a tester.";

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_USERS, {
    variables: { search: search || undefined, limit: PAGE_SIZE, offset },
  });

  // Ответ мутации несёт id и isTester — Apollo сам обновит строку в кэше.
  const [setTester, { error: testerError }] = useMutation(SET_USER_TESTER);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const toggleTester = async (row: UserRow) => {
    setPendingId(row.id);
    try {
      await setTester({ variables: { userId: row.id, isTester: !row.isTester } });
    } catch {
      // Ошибку показывает testerError над таблицей.
    } finally {
      setPendingId(null);
    }
  };

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
      {testerError && <div className={styles.state}>Failed to change tester status: {testerError.message}</div>}

      <SettingsTable<Column, UserRow>
        columns={[
          { key: "email", label: "Email", width: "26%" },
          { key: "name", label: "Name", width: "18%" },
          { key: "role", label: "Platform role", width: "14%" },
          { key: "tester", label: "Tester", width: "16%" },
          { key: "workspaces", label: "Workspaces", width: "14%" },
          { key: "created", label: "Registered", width: "12%" },
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
                <span className={cs(styles.badge, styles.warn)}>{row.platformRole}</span>
              ) : (
                <span className={styles.note}>customer</span>
              );
            case "tester":
              // Тестер не видит пейволл ни в одном своём или чужом воркспейсе; свои биллинг ещё и не ставит на паузу.
              return (
                <div className={styles.cell}>
                  {row.isTester ? (
                    <span className={cs(styles.badge, styles.ok)} title={TESTER_HINT}>
                      Tester · no paywall
                    </span>
                  ) : (
                    <span className={styles.note}>—</span>
                  )}
                  <span className={styles.cellSub}>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={TESTER_HINT}
                      disabled={pendingId === row.id}
                      onClick={() => void toggleTester(row)}
                    >
                      {row.isTester ? "Remove tester" : "Make tester"}
                    </Button>
                  </span>
                </div>
              );
            case "workspaces":
              return (
                <div className={styles.cell}>
                  <span>{row.ownedWorkspaceCount} owned</span>
                  <span className={styles.cellSub}>{row.memberWorkspaceCount} member</span>
                </div>
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
