import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_WORKSPACE } from "../../api/queries";
import { loginAsClient } from "../../api/auth";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "./styles.module.scss";

interface WorkspaceSummary {
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

interface Charge {
  id: number;
  kind: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  fixedAmount: number;
  usageFee: number;
  adSpend: number;
  totalAmount: number;
  currency: string;
  description: string;
  failureReason: string | null;
  attempt: number;
  chargedAt: string | null;
}

interface Connection {
  id: string;
  orgId: string;
  orgName: string | null;
  status: string;
  apiVersion: string;
  currency: string | null;
  timeZone: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
}

type ChargeColumn = "period" | "description" | "kind" | "spend" | "total" | "status";
type ConnColumn = "org" | "status" | "api" | "currency" | "synced";

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

// Статусы приходят как есть из Prisma-энамов (SUCCEEDED, PAST_DUE, ...). Здесь
// они только раскрашиваются: перевод в человеческие подписи — дело макета, а
// его для этого экрана ещё нет.
const toneOf = (status: string) => {
  if (["SUCCEEDED", "ACTIVE"].includes(status)) return styles.ok;
  if (["FAILED", "ERROR", "PAST_DUE", "REVOKED"].includes(status)) return styles.bad;
  return styles.neutral;
};

export function WorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_ADMIN_WORKSPACE, {
    variables: { id: workspaceId },
    skip: !Number.isFinite(workspaceId),
  });

  if (!Number.isFinite(workspaceId)) return <div className={styles.state}>Bad workspace id.</div>;
  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the workspace.</div>;

  const detail = data?.adminWorkspace;
  // Резолвер отдаёт null на несуществующий id — это пустая страница, а не сбой.
  if (!detail) {
    return (
      <div>
        <Link className={styles.back} to="/workspaces">
          ← Workspaces
        </Link>
        <div className={styles.state}>No workspace with id {workspaceId}.</div>
      </div>
    );
  }

  const ws: WorkspaceSummary = detail.workspace;
  const charges: Charge[] = detail.charges ?? [];
  const connections: Connection[] = detail.connections ?? [];

  const impersonate = async () => {
    if (ws.ownerId == null) return;
    setImpersonateError(null);
    setImpersonating(true);
    try {
      const ok = await loginAsClient(ws.ownerId);
      if (!ok) throw new Error();
      const appUri = import.meta.env.VITE_APP_URI;
      if (appUri) {
        window.location.href = appUri;
      } else {
        // Кука уже подменена, а идти некуда: честнее сказать это, чем молча
        // оставить админку в состоянии, где каждый следующий запрос упадёт.
        setImpersonateError(
          "Signed in as the owner, but VITE_APP_URI is not set — open the main app manually. This admin session is now the owner's.",
        );
      }
    } catch {
      setImpersonateError("Could not sign in as the owner.");
    } finally {
      setImpersonating(false);
    }
  };

  return (
    <div>
      <Link className={styles.back} to="/workspaces">
        ← Workspaces
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{ws.name}</h1>
          <div className={styles.subtitle}>
            {ws.ownerEmail || "no owner"} · created {date(ws.createdAt)}
          </div>
        </div>

        <button
          type="button"
          className={styles.impersonate}
          onClick={impersonate}
          disabled={impersonating || ws.ownerId == null}
          title={ws.ownerId == null ? "This workspace has no owner account" : undefined}
        >
          {impersonating ? "Signing in…" : "Log in as owner"}
        </button>
      </div>

      {impersonateError && <div className={styles.error}>{impersonateError}</div>}

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Plan</div>
          <div className={styles.tileValue}>{ws.plan ?? "—"}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Billing status</div>
          <div className={styles.tileValue}>
            <span className={toneOf(ws.billingStatus ?? "")}>{ws.billingStatus ?? "—"}</span>
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Members</div>
          <div className={styles.tileValue}>{ws.memberCount}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>ASA connections</div>
          <div className={styles.tileValue}>
            {ws.activeConnectionCount} / {ws.connectionCount} active
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Billing history</h2>
      <SettingsTable<ChargeColumn, Charge>
        columns={[
          { key: "period", label: "Period", width: "18%" },
          { key: "description", label: "Description", width: "30%" },
          { key: "kind", label: "Kind", width: "12%" },
          { key: "spend", label: "Ad spend", width: "12%" },
          { key: "total", label: "Total", width: "12%" },
          { key: "status", label: "Status", width: "16%" },
        ]}
        rows={charges}
        rowKey={(row) => String(row.id)}
        emptyText="No charges yet."
        renderCell={(row, key) => {
          switch (key) {
            case "period":
              return `${date(row.periodStart)} — ${date(row.periodEnd)}`;
            case "description":
              return <span className={styles.cellMain}>{row.description}</span>;
            case "kind":
              return row.kind;
            case "spend":
              return money(row.adSpend, row.currency);
            case "total":
              return money(row.totalAmount, row.currency);
            case "status": {
              // Причина отказа и номер попытки — на вторую строку: рядом со
              // статусом одной строкой они переполняли колонку.
              const notes: string[] = [];
              if (row.failureReason) notes.push(row.failureReason);
              if (row.attempt > 0) notes.push(`retry ${row.attempt}`);
              return (
                <div className={styles.cell}>
                  <span className={cs(styles.badge, toneOf(row.status))}>{row.status}</span>
                  {notes.length > 0 && <span className={styles.cellSub}>{notes.join(" · ")}</span>}
                </div>
              );
            }
          }
        }}
      />

      <h2 className={styles.sectionTitle}>ASA connections</h2>
      <SettingsTable<ConnColumn, Connection>
        columns={[
          { key: "org", label: "Organization", width: "34%" },
          { key: "status", label: "Status", width: "20%" },
          { key: "api", label: "API", width: "10%" },
          { key: "currency", label: "Currency", width: "12%" },
          { key: "synced", label: "Last synced", width: "24%" },
        ]}
        rows={connections}
        rowKey={(row) => row.id}
        emptyText="No ASA connections."
        renderCell={(row, key) => {
          switch (key) {
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
                  <span className={cs(styles.badge, toneOf(row.status))}>{row.status}</span>
                  {row.lastError && <span className={styles.cellSub}>{row.lastError}</span>}
                </div>
              );
            case "api":
              return row.apiVersion;
            case "currency":
              return row.currency ?? "—";
            case "synced":
              return row.lastSyncedAt ? new Date(row.lastSyncedAt).toLocaleString("en-US") : "never";
          }
        }}
      />
    </div>
  );
}
