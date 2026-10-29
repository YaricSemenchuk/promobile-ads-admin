import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_USER, SET_USER_ROLE } from "../../api/queries";
import { useStaff } from "../../components/guards/staffContext";
import { Button } from "../../components/ui";
// Деталь пользователя живёт в той же рамке, что и деталь воркспейса: back-ссылка,
// шапка, список фактов (.defs) и секции. Отдельный модуль ради одного экрана не
// нужен — переиспользуем стили WorkspaceDetail, как это уже делает AsaConnectionDetail.
import styles from "../WorkspaceDetail/styles.module.scss";

interface UserDetail {
  id: number;
  email: string | null;
  name: string | null;
  platformRole: string | null;
  isTester: boolean;
  createdAt: string;
  ownedWorkspaceCount: number;
  memberWorkspaceCount: number;
}

// null — обычный клиент; STAFF — админ (вход в админку); SUPERADMIN — плюс право менять роли.
type RoleValue = "STAFF" | "SUPERADMIN" | null;

const roleLabel = (role: RoleValue): string =>
  role === "STAFF" ? "Admin" : role === "SUPERADMIN" ? "Super admin" : "Customer";

// Что можно назначить. Текущая роль в списке становится неактивной кнопкой.
const ROLE_OPTIONS: RoleValue[] = [null, "STAFF", "SUPERADMIN"];

const toRole = (raw: string | null): RoleValue =>
  raw === "STAFF" ? "STAFF" : raw === "SUPERADMIN" ? "SUPERADMIN" : null;

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const viewer = useStaff();

  const { data, loading, error } = useQuery(GET_ADMIN_USER, {
    variables: { id: userId },
    skip: !Number.isFinite(userId),
  });

  const [setRole, { loading: saving, error: saveError }] = useMutation(SET_USER_ROLE);
  // undefined — подтверждения нет; значение (в т.ч. null) — ждём подтверждения смены на него.
  const [pending, setPending] = useState<RoleValue | undefined>(undefined);

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the user.</div>;

  const u: UserDetail | null = data?.adminUser ?? null;
  if (!u) return <div className={styles.state}>User not found.</div>;

  const current = toRole(u.platformRole);
  // Менять роли может только суперадмин (жёстко проверяется на бэке) и не самому себе.
  const isSuperAdmin = viewer?.platformRole === "SUPERADMIN";
  const isSelf = viewer?.id === u.id;

  const apply = async (role: RoleValue) => {
    try {
      await setRole({ variables: { userId: u.id, role } });
      setPending(undefined);
    } catch {
      // Ошибку показывает saveError под секцией.
    }
  };

  return (
    <div>
      <Link className={styles.back} to="/users">
        ← Users
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{u.name ?? u.email ?? `User #${u.id}`}</h1>
          <div className={styles.subtitle}>
            {u.email ?? "no email"} · id {u.id}
          </div>
        </div>
      </div>

      <div className={styles.defs}>
        <div className={styles.defRow}>
          <span className={styles.defKey}>Platform role</span>
          <span className={styles.defVal}>
            {current ? (
              <span className={cs(styles.badge, styles.warn)}>{roleLabel(current)}</span>
            ) : (
              <span className={styles.note}>Customer</span>
            )}
          </span>
        </div>
        <div className={styles.defRow}>
          <span className={styles.defKey}>Tester</span>
          <span className={styles.defVal}>{u.isTester ? "Yes — no paywall" : "No"}</span>
        </div>
        <div className={styles.defRow}>
          <span className={styles.defKey}>Workspaces</span>
          <span className={styles.defVal}>
            {u.ownedWorkspaceCount} owned · {u.memberWorkspaceCount} member
          </span>
        </div>
        <div className={styles.defRow}>
          <span className={styles.defKey}>Registered</span>
          <span className={styles.defVal}>{date(u.createdAt)}</span>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Platform access</h2>

      {!isSuperAdmin ? (
        <p className={styles.note}>Only a super admin can change platform roles.</p>
      ) : isSelf ? (
        <p className={styles.note}>You cannot change your own platform role.</p>
      ) : pending !== undefined ? (
        <div className={styles.trialCard}>
          <p>
            Change {u.email ?? `user #${u.id}`} to <strong>{roleLabel(pending)}</strong>?
          </p>
          <div className={styles.inlineRow}>
            <Button
              variant={pending === "SUPERADMIN" ? "danger" : "primary"}
              disabled={saving}
              onClick={() => void apply(pending)}
            >
              {saving ? "Saving…" : "Confirm"}
            </Button>
            <button type="button" className={styles.asLink} onClick={() => setPending(undefined)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.inlineRow}>
          {ROLE_OPTIONS.map((role) => (
            <Button
              key={String(role)}
              variant={role === "SUPERADMIN" ? "danger" : role === null ? "secondary" : "primary"}
              disabled={role === current}
              onClick={() => setPending(role)}
            >
              {role === current ? `${roleLabel(role)} (current)` : roleLabel(role)}
            </Button>
          ))}
        </div>
      )}

      {saveError && <div className={styles.error}>Failed to change role: {saveError.message}</div>}
    </div>
  );
}

export default UserDetailPage;
