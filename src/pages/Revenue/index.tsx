import { useLayoutEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import gsap from "gsap";
import { GET_ADMIN_REVENUE_OVERVIEW } from "../../api/queries";
import { PageHeader } from "../../components/ui";
import { CountUp, prefersReducedMotion, useReveal } from "../../motion";
import styles from "./styles.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const monthLabel = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

interface MonthlyRow {
  month: string;
  total: number;
  chargeCount: number;
}

interface Overview {
  activeAccounts: number;
  trialAccounts: number;
  pastDueAccounts: number;
  monthlyRevenue: MonthlyRow[];
}

export function RevenuePage() {
  const { data, loading, error } = useQuery(GET_ADMIN_REVENUE_OVERVIEW);
  const overview: Overview | undefined = data?.adminRevenueOverview;

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error || !overview) return <div className={styles.state}>Failed to load revenue overview.</div>;

  // Контент выделен в отдельный компонент: его reveal и рост баров должны
  // срабатывать на появлении данных, а не на первом (загрузочном) рендере
  // страницы — на монтировании с уже готовыми данными это так и есть.
  return <RevenueContent overview={overview} />;
}

function RevenueContent({ overview }: { overview: Overview }) {
  const tilesRef = useReveal<HTMLDivElement>({ stagger: true });
  const chartRef = useRef<HTMLDivElement>(null);

  const maxTotal = Math.max(1, ...overview.monthlyRevenue.map((r) => r.total));

  // Бары вырастают снизу: scaleY от 0 с origin по нижней кромке. Высоту задаёт
  // inline-style (как и было), GSAP трогает только transform — конфликта с
  // height-переходом нет.
  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!el || prefersReducedMotion() || overview.monthlyRevenue.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-bar]"), {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.03,
      });
    }, el);
    return () => ctx.revert();
  }, [overview.monthlyRevenue.length]);

  return (
    <div>
      <PageHeader title="Revenue" />

      <div ref={tilesRef} className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Active accounts</div>
          <div className={styles.tileValue}>
            <CountUp to={overview.activeAccounts} />
          </div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Trial accounts</div>
          <div className={styles.tileValue}>
            <CountUp to={overview.trialAccounts} />
          </div>
        </div>
        <div className={`${styles.tile} ${overview.pastDueAccounts > 0 ? styles.tileWarn : ""}`}>
          <div className={styles.tileLabel}>Past due</div>
          <div className={styles.tileValue}>
            <CountUp to={overview.pastDueAccounts} />
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Monthly revenue (last 13 months)</h2>
      <div ref={chartRef} className={styles.chart}>
        {overview.monthlyRevenue.map((row) => (
          <div key={row.month} className={styles.bar} title={`${money(row.total)} · ${row.chargeCount} charges`}>
            <div data-bar className={styles.barFill} style={{ height: `${(row.total / maxTotal) * 100}%` }} />
            <div className={styles.barLabel}>{monthLabel(row.month)}</div>
          </div>
        ))}
        {!overview.monthlyRevenue.length && <div className={styles.state}>No successful charges yet.</div>}
      </div>
    </div>
  );
}
