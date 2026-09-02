import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_ASA_CONNECTION, GET_ADMIN_CONNECTION_KEYWORDS } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "../WorkspaceDetail/styles.module.scss";

interface ConnKeyword {
  keyword: string;
  matchType: string | null;
  status: string | null;
  bid: string | null;
  country: string | null;
  impressions: number;
  taps: number;
  installs: number;
  spend: string;
}

interface Counts {
  apps: number;
  rules: number;
  rampUps: number;
  tasks: number;
  budgetOrders: number;
  customReports: number;
  activityEntries: number;
}

interface ConnApp {
  id: number;
  adamId: string;
  title: string | null;
  store: string | null;
  country: string | null;
  icon: string | null;
}

interface ConnRampUp {
  id: string;
  appName: string;
  status: string;
  goal: string;
  dailyBudget: number;
  countries: string[];
  createdAt: string;
}

interface ConnTask {
  id: string;
  kind: string;
  state: string;
  description: string;
  done: number;
  total: number;
  createdAt: string;
}

interface ConnectionDetail {
  id: string;
  workspaceId: number;
  workspaceName: string;
  ownerEmail: string | null;
  orgId: string;
  orgName: string | null;
  adAccountId: string | null;
  status: string;
  apiVersion: string;
  currency: string | null;
  timeZone: string | null;
  paymentModel: string | null;
  roleNames: string[];
  basicDetectedAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  dailySyncedThrough: string | null;
  hourlySyncedThrough: string | null;
  lastRunAt: string | null;
  lastKeywordCount: number | null;
  counts: Counts;
  apps: ConnApp[];
  rampUps: ConnRampUp[];
  tasks: ConnTask[];
}

type Panel = "apps" | "rampUps" | "tasks";

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US") : "—";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US");

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const connTone = (status: string) =>
  status === "ACTIVE" ? styles.ok : status === "PENDING" ? styles.warn : styles.bad;

const stateTone = (state: string) =>
  state === "done" ? styles.ok : state === "failed" ? styles.bad : styles.warn;

function Defs({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className={styles.defs}>
      {rows.map(([key, value]) => (
        <div key={key} className={styles.defRow}>
          <span className={styles.defKey}>{key}</span>
          <span className={styles.defVal}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function AppsTable({ rows }: { rows: ConnApp[] }) {
  return (
    <SettingsTable<"app" | "store" | "country", ConnApp>
      columns={[
        { key: "app", label: "App", width: "56%" },
        { key: "store", label: "Store", width: "24%" },
        { key: "country", label: "Country", width: "20%" },
      ]}
      rows={rows}
      rowKey={(r) => r.adamId}
      emptyText="No linked apps."
      renderCell={(r, key) => {
        switch (key) {
          case "app":
            return (
              <div className={styles.cell}>
                <Link className={cs(styles.rowLink, styles.cellMain)} to={`/apps/${r.id}`}>
                  {r.title ?? "—"}
                </Link>
                <span className={styles.cellSub}>{r.adamId}</span>
              </div>
            );
          case "store":
            return r.store ?? "—";
          case "country":
            return r.country ? r.country.toUpperCase() : "—";
        }
      }}
    />
  );
}

function RampUpsTable({ rows }: { rows: ConnRampUp[] }) {
  return (
    <SettingsTable<"app" | "status" | "goal" | "budget" | "created", ConnRampUp>
      columns={[
        { key: "app", label: "App", width: "34%" },
        { key: "status", label: "Status", width: "16%" },
        { key: "goal", label: "Goal", width: "14%" },
        { key: "budget", label: "Daily budget", width: "18%" },
        { key: "created", label: "Created", width: "18%" },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyText="No ramp-ups."
      renderCell={(r, key) => {
        switch (key) {
          case "app":
            return <span className={styles.cellMain}>{r.appName}</span>;
          case "status":
            return <span className={cs(styles.badge, connTone(r.status))}>{r.status}</span>;
          case "goal":
            return r.goal;
          case "budget":
            return money(r.dailyBudget);
          case "created":
            return date(r.createdAt);
        }
      }}
    />
  );
}

const usd = (value: string) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
};

const kwTone = (status: string | null) =>
  status === "ACTIVE" || status === "RUNNING" ? styles.ok : styles.warn;

function KeywordsPanel({ connectionId }: { connectionId: string }) {
  const { data, loading, error } = useQuery(GET_ADMIN_CONNECTION_KEYWORDS, {
    variables: { id: connectionId },
  });

  if (loading) return <div className={styles.state}>Loading keywords…</div>;
  if (error) return <div className={styles.state}>Failed to load keywords.</div>;

  const rows: ConnKeyword[] = data?.adminConnectionKeywords ?? [];

  return (
    <SettingsTable<"keyword" | "status" | "bid" | "impressions" | "taps" | "installs" | "spend", ConnKeyword>
      columns={[
        { key: "keyword", label: "Keyword", width: "30%" },
        { key: "status", label: "Status", width: "14%" },
        { key: "bid", label: "Bid", width: "10%" },
        { key: "impressions", label: "Impressions", width: "12%" },
        { key: "taps", label: "Taps", width: "10%" },
        { key: "installs", label: "Installs", width: "10%" },
        { key: "spend", label: "Spend", width: "14%" },
      ]}
      rows={rows}
      rowKey={(r) => `${r.keyword}·${r.matchType}·${r.country}`}
      emptyText="No keywords synced."
      renderCell={(r, key) => {
        switch (key) {
          case "keyword":
            return (
              <div className={styles.cell}>
                <span className={styles.cellMain}>{r.keyword}</span>
                <span className={styles.cellSub}>
                  {[r.matchType, r.country].filter(Boolean).join(" · ") || "—"}
                </span>
              </div>
            );
          case "status":
            return r.status ? (
              <span className={cs(styles.badge, kwTone(r.status))}>{r.status}</span>
            ) : (
              "—"
            );
          case "bid":
            return r.bid ? usd(r.bid) : "—";
          case "impressions":
            return r.impressions.toLocaleString("en-US");
          case "taps":
            return r.taps.toLocaleString("en-US");
          case "installs":
            return r.installs.toLocaleString("en-US");
          case "spend":
            return usd(r.spend);
        }
      }}
    />
  );
}

function TasksTable({ rows }: { rows: ConnTask[] }) {
  return (
    <SettingsTable<"task" | "state" | "progress" | "created", ConnTask>
      columns={[
        { key: "task", label: "Task", width: "44%" },
        { key: "state", label: "State", width: "18%" },
        { key: "progress", label: "Progress", width: "18%" },
        { key: "created", label: "Created", width: "20%" },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyText="No tasks."
      renderCell={(r, key) => {
        switch (key) {
          case "task":
            return (
              <div className={styles.cell}>
                <Link className={cs(styles.rowLink, styles.cellMain)} to={`/tasks/${r.id}`}>
                  {r.description}
                </Link>
                <span className={styles.cellSub}>{r.kind}</span>
              </div>
            );
          case "state":
            return <span className={cs(styles.badge, stateTone(r.state))}>{r.state}</span>;
          case "progress":
            return `${r.done} / ${r.total}`;
          case "created":
            return date(r.createdAt);
        }
      }}
    />
  );
}

export function AsaConnectionDetailPage() {
  const { id = "" } = useParams();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [showKeywords, setShowKeywords] = useState(false);
  const { data, loading, error } = useQuery(GET_ADMIN_ASA_CONNECTION, {
    variables: { id },
  });

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the connection.</div>;

  const c: ConnectionDetail | null = data?.adminAsaConnection ?? null;
  if (!c) return <div className={styles.state}>Connection not found.</div>;

  const toggle = (next: Panel) => setPanel((cur) => (cur === next ? null : next));

  const countTiles: { key: Panel; label: string; value: number }[] = [
    { key: "apps", label: "Apps", value: c.counts.apps },
    { key: "rampUps", label: "Ramp-ups", value: c.counts.rampUps },
    { key: "tasks", label: "Tasks", value: c.counts.tasks },
  ];

  return (
    <div>
      <Link className={styles.back} to="/asa-connections">
        ← ASA Connections
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{c.orgName ?? "—"}</h1>
          <div className={styles.subtitle}>
            org {c.orgId} ·{" "}
            <Link className={styles.rowLink} to={`/workspaces/${c.workspaceId}`}>
              {c.workspaceName}
            </Link>
            {c.ownerEmail ? ` · ${c.ownerEmail}` : ""}
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Status</div>
          <div className={styles.tileValue}>
            <span className={cs(styles.badge, connTone(c.status))}>{c.status}</span>
          </div>
        </div>
        {countTiles.map((t) => (
          <button
            key={t.key}
            type="button"
            className={cs(styles.tile, styles.tileButton, { [styles.tileActive]: panel === t.key })}
            onClick={() => toggle(t.key)}
            aria-expanded={panel === t.key}
          >
            <div className={styles.tileLabel}>{t.label}</div>
            <div className={styles.tileValue}>{t.value}</div>
          </button>
        ))}
      </div>

      {panel === "apps" && <AppsTable rows={c.apps} />}
      {panel === "rampUps" && <RampUpsTable rows={c.rampUps} />}
      {panel === "tasks" && <TasksTable rows={c.tasks} />}

      <h2 className={styles.sectionTitle}>Connection</h2>
      <Defs
        rows={[
          ["Ad account id", c.adAccountId ?? "—"],
          ["API version", c.apiVersion],
          ["Currency", c.currency ?? "—"],
          ["Timezone", c.timeZone ?? "—"],
          ["Payment model", c.paymentModel ?? "—"],
          ["Roles", c.roleNames.length ? c.roleNames.join(", ") : "—"],
          ["Basic org", c.basicDetectedAt ? `since ${dateTime(c.basicDetectedAt)}` : "no"],
          ["Created", dateTime(c.createdAt)],
          ["Updated", dateTime(c.updatedAt)],
        ]}
      />

      <h2 className={styles.sectionTitle}>Sync</h2>
      <Defs
        rows={[
          ["Last synced", dateTime(c.lastSyncedAt)],
          ["Last run", dateTime(c.lastRunAt)],
          ["Daily synced through", c.dailySyncedThrough ?? "—"],
          ["Hourly synced through", c.hourlySyncedThrough ?? "—"],
          [
            "Keywords",
            c.lastKeywordCount != null ? (
              <button
                key="kw"
                type="button"
                className={styles.asLink}
                onClick={() => setShowKeywords((v) => !v)}
                aria-expanded={showKeywords}
              >
                {c.lastKeywordCount} {showKeywords ? "▲" : "▾"}
              </button>
            ) : (
              "—"
            ),
          ],
          ["Last error", c.lastError ? <span key="err" className={styles.bad}>{c.lastError}</span> : "none"],
        ]}
      />

      {showKeywords && <KeywordsPanel connectionId={c.id} />}

      <h2 className={styles.sectionTitle}>Manages</h2>
      <Defs
        rows={[
          ["Rules", c.counts.rules],
          ["Budget orders", c.counts.budgetOrders],
          ["Custom reports", c.counts.customReports],
          ["Activity entries", c.counts.activityEntries],
        ]}
      />
    </div>
  );
}
