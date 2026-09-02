import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_RAMP_UPS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import { Pager } from "../../components/Pager";
import styles from "../../styles/list.module.scss";

interface RampUpRow {
  id: string;
  workspaceId: number;
  workspaceName: string;
  appName: string;
  adamId: string;
  status: string;
  goal: string;
  targetCpi: number;
  targetRoas: number | null;
  dailyBudget: number;
  countries: string[];
  campaignCount: number;
  lastHarvestAt: string | null;
  lastOptimizeAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
}

type Column = "workspace" | "app" | "status" | "goal" | "budget" | "harvest";

const PAGE_SIZE = 50;
const STATUSES = ["", "ACTIVE", "PAUSED", "STOPPED"];

// Сбор суточный: сутки молчания у активного контура — уже подозрительно.
const HARVEST_STALE_H = 26;

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

const ago = (iso: string | null, now: number) => {
  if (!iso) return "never";
  const h = (now - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.floor(h * 60))}m ago`;
  if (h < 48) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/**
 * Молчащий сбор имеет значение только у активного контура: остановленный
 * молчит по определению, и красить его было бы шумом.
 */
const isStale = (row: RampUpRow, now: number) =>
  row.status === "ACTIVE" &&
  (row.lastHarvestAt == null ||
    (now - new Date(row.lastHarvestAt).getTime()) / 3_600_000 > HARVEST_STALE_H);

export function RampUpsPage() {
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useQuery(GET_ADMIN_RAMP_UPS, {
    variables: { status: status || undefined, limit: PAGE_SIZE, offset },
  });

  const rows: RampUpRow[] = data?.adminRampUps?.rows ?? [];
  const total: number = data?.adminRampUps?.total ?? 0;

  // Отсчёт берётся один раз при монтировании и дальше не меняется. Прямой
  // Date.now() в теле компонента — вызов во время рендера: он давал бы разный
  // ответ разным строкам одной таблицы и пересчитывался бы на каждом рендере
  // без всякой причины. Экран без опроса и так показывает снимок, поэтому
  // замороженный отсчёт честнее плавающего.
  const [now] = useState(() => Date.now());
  const stalled = rows.filter((row) => isStale(row, now)).length;

  return (
    <div>
      <h1 className={styles.pageTitle}>Ramp-Up</h1>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>

        <span className={styles.live}>
          {total} loops
          {stalled > 0 && (
            <>
              {" · "}
              <span className={styles.bad}>{stalled} not harvesting</span>
            </>
          )}
        </span>
      </div>

      {loading && !rows.length && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.state}>Failed to load ramp-ups.</div>}

      <SettingsTable<Column, RampUpRow>
        columns={[
          { key: "workspace", label: "Workspace", width: "16%" },
          { key: "app", label: "App", width: "24%" },
          { key: "status", label: "Status", width: "14%" },
          { key: "goal", label: "Goal", width: "16%" },
          { key: "budget", label: "Daily budget", width: "14%" },
          { key: "harvest", label: "Last harvest", width: "16%" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyText="No ramp-ups match."
        renderCell={(row, key) => {
          switch (key) {
            case "workspace":
              return (
                <Link className={styles.rowLink} to={`/workspaces/${row.workspaceId}`}>
                  {row.workspaceName}
                </Link>
              );
            case "app":
              return (
                <div className={styles.cell}>
                  <span className={styles.cellMain}>{row.appName}</span>
                  <span className={styles.cellSub}>
                    {row.countries.join(", ") || "no countries"}
                  </span>
                </div>
              );
            case "status":
              return (
                <div className={styles.cell}>
                  <span className={cs(styles.badge, row.status === "ACTIVE" ? styles.ok : styles.neutral)}>
                    {row.status}
                  </span>
                  {row.stoppedAt && <span className={styles.cellSub}>{ago(row.stoppedAt, now)}</span>}
                </div>
              );
            case "goal":
              // Цель читается только вместе со своим числом: TCPA с целевым
              // CPI и TROAS с целевым ROAS — разные режимы, не подпись.
              return (
                <div className={styles.cell}>
                  <span>{row.goal}</span>
                  <span className={styles.cellSub}>
                    {row.goal === "TROAS" && row.targetRoas != null
                      ? `${row.targetRoas}x`
                      : money(row.targetCpi)}
                  </span>
                </div>
              );
            case "budget":
              return (
                <div className={styles.cell}>
                  <span>{money(row.dailyBudget)}</span>
                  <span className={styles.cellSub}>{row.campaignCount} campaigns</span>
                </div>
              );
            case "harvest":
              return (
                <div className={styles.cell}>
                  <span className={isStale(row, now) ? styles.bad : undefined}>
                    {ago(row.lastHarvestAt, now)}
                  </span>
                  {row.lastOptimizeAt && (
                    <span className={styles.cellSub}>opt {ago(row.lastOptimizeAt, now)}</span>
                  )}
                </div>
              );
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
