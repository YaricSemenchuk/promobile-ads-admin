import { useQuery } from "@apollo/client";
import { GET_ADMIN_REVENUE_OVERVIEW } from "../../api/queries";
import styles from "./styles.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const monthLabel = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

export function RevenuePage() {
  const { data, loading, error } = useQuery(GET_ADMIN_REVENUE_OVERVIEW);
  const overview = data?.adminRevenueOverview;

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error || !overview) return <div className={styles.state}>Failed to load revenue overview.</div>;

  const maxTotal = Math.max(1, ...overview.monthlyRevenue.map((r: { total: number }) => r.total));

  return (
    <div>
      <h1 className={styles.pageTitle}>Revenue</h1>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Active accounts</div>
          <div className={styles.tileValue}>{overview.activeAccounts}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Trial accounts</div>
          <div className={styles.tileValue}>{overview.trialAccounts}</div>
        </div>
        <div className={`${styles.tile} ${overview.pastDueAccounts > 0 ? styles.tileWarn : ""}`}>
          <div className={styles.tileLabel}>Past due</div>
          <div className={styles.tileValue}>{overview.pastDueAccounts}</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Monthly revenue (last 12 months)</h2>
      <div className={styles.chart}>
        {overview.monthlyRevenue.map((row: { month: string; total: number; chargeCount: number }) => (
          <div key={row.month} className={styles.bar} title={`${money(row.total)} · ${row.chargeCount} charges`}>
            <div className={styles.barFill} style={{ height: `${(row.total / maxTotal) * 100}%` }} />
            <div className={styles.barLabel}>{monthLabel(row.month)}</div>
          </div>
        ))}
        {!overview.monthlyRevenue.length && <div className={styles.state}>No successful charges yet.</div>}
      </div>
    </div>
  );
}
