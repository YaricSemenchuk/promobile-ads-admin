import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_BILLING_ACCOUNTS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface BillingRow {
  id: number;
  workspaceId: number;
  workspaceName: string;
  ownerEmail: string;
  plan: string;
  status: string;
  pendingPlan: string | null;
  dodoStatus: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  lifetimeRevenue: number;
  failedChargeCount: number;
}

type Column = "workspace" | "plan" | "status" | "card" | "period" | "revenue";

const PAGE_SIZE = 50;
const STATUSES = ["", "ACTIVE", "TRIAL", "PAST_DUE", "INACTIVE", "CANCELLED"];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const daysUntil = (iso: string | null) =>
  iso == null ? null : Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

/**
 * Карта истекает в последний день своего месяца, поэтому «истекла» — это
 * строго раньше текущего месяца, а не раньше сегодняшнего дня.
 */
const cardExpiry = (month: number | null, year: number | null) => {
  if (month == null || year == null) return { label: null, expiring: false, expired: false };
  const now = new Date();
  const monthsLeft = (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
  return {
    label: `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`,
    expiring: monthsLeft >= 0 && monthsLeft <= 2,
    expired: monthsLeft < 0,
  };
};

export function BillingPage() {
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_BILLING_ACCOUNTS, {
    variables: { status: status || undefined, limit: PAGE_SIZE, offset },
  });

  const rows: BillingRow[] = data?.adminBillingAccounts?.rows ?? [];
  const total: number = data?.adminBillingAccounts?.total ?? 0;

  // То, что случится, а не то, что случилось: экран Revenue уже показывает
  // выручку задним числом, здесь смысл в предупреждении.
  const cancelling = rows.filter((r) => r.cancelAtPeriodEnd).length;
  const trialsEnding = rows.filter((r) => {
    const d = daysUntil(r.trialEndsAt);
    return d != null && d >= 0 && d <= 7;
  }).length;

  return (
    <div>
      <h1 className={styles.pageTitle}>Billing</h1>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          aria-label="Filter by billing status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>

        <span className={styles.live}>
          {total} accounts
          {trialsEnding > 0 && (
            <>
              {" · "}
              <span className={styles.warn}>{trialsEnding} trials ending in 7d</span>
            </>
          )}
          {cancelling > 0 && (
            <>
              {" · "}
              <span className={styles.bad}>{cancelling} cancelling</span>
            </>
          )}
        </span>
      </div>

      {loading && !rows.length && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load billing accounts.</div>}

      <SettingsTable<Column, BillingRow>
        columns={[
          { key: "workspace", label: "Workspace", width: "24%" },
          { key: "plan", label: "Plan", width: "14%" },
          { key: "status", label: "Status", width: "18%" },
          { key: "card", label: "Card", width: "14%" },
          { key: "period", label: "Period / trial", width: "16%" },
          { key: "revenue", label: "Lifetime", width: "14%" },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
        emptyText="No billing accounts match."
        renderCell={(row, key) => {
          switch (key) {
            case "workspace":
              return (
                <>
                  <Link className={styles.rowLink} to={`/workspaces/${row.workspaceId}`}>
                    {row.workspaceName}
                  </Link>
                  <span className={styles.note}> · {row.ownerEmail}</span>
                </>
              );
            case "plan":
              return (
                <>
                  {row.plan}
                  {row.pendingPlan && <span className={styles.note}> → {row.pendingPlan}</span>}
                </>
              );
            case "status":
              return (
                <span
                  className={
                    row.status === "ACTIVE"
                      ? styles.ok
                      : row.status === "PAST_DUE"
                        ? styles.bad
                        : styles.warn
                  }
                >
                  {row.status}
                  {row.cancelAtPeriodEnd && <span className={styles.bad}> · cancelling</span>}
                  {row.failedChargeCount > 0 && (
                    <span className={styles.note}> · {row.failedChargeCount} failed charges</span>
                  )}
                  {row.dodoStatus && row.dodoStatus !== row.status.toLowerCase() && (
                    <span className={styles.note}> · dodo: {row.dodoStatus}</span>
                  )}
                </span>
              );
            case "card": {
              const exp = cardExpiry(row.cardExpMonth, row.cardExpYear);
              if (!row.cardLast4) return <span className={styles.note}>none</span>;
              return (
                <>
                  {row.cardBrand ?? "card"} ····{row.cardLast4}
                  {exp.label && (
                    <span className={exp.expired ? styles.bad : exp.expiring ? styles.warn : styles.note}>
                      {" "}
                      · {exp.label}
                    </span>
                  )}
                </>
              );
            }
            case "period": {
              const trialDays = daysUntil(row.trialEndsAt);
              if (trialDays != null && trialDays >= 0) {
                return (
                  <span className={trialDays <= 7 ? styles.warn : undefined}>
                    trial {trialDays}d left
                  </span>
                );
              }
              return date(row.currentPeriodEnd);
            }
            case "revenue":
              return money(row.lifetimeRevenue);
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
