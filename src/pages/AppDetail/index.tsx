import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_APP } from "../../api/queries";
import styles from "../WorkspaceDetail/styles.module.scss";

interface AppCounts {
  keywords: number;
  keywordsOrders: number;
  ratingsOrders: number;
  reviewsOrders: number;
  directOrders: number;
  asaLinks: number;
}

interface AppDetail {
  id: number;
  store: string;
  appId: string;
  adamId: string | null;
  title: string | null;
  icon: string | null;
  ownerEmail: string | null;
  country: string;
  language: string;
  developer: string | null;
  price: number | null;
  score: number | null;
  reviewsCount: number | null;
  averageReviewsScore: number | null;
  version: string | null;
  size: string | null;
  status: string | null;
  availability: string;
  deletionStatus: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  verifiedAt: string | null;
  counts: AppCounts;
}

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US") : "—";

const mb = (bytes: string | null) => {
  if (!bytes) return "—";
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

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

export function AppDetailPage() {
  const { id = "" } = useParams();
  const { data, loading, error } = useQuery(GET_ADMIN_APP, {
    variables: { id: Number(id) },
  });

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.state}>Failed to load the app.</div>;

  const a: AppDetail | null = data?.adminApp ?? null;
  if (!a) return <div className={styles.state}>App not found.</div>;

  const deleted = a.deletionStatus !== "ACTIVE";

  return (
    <div>
      <Link className={styles.back} to="/workspaces">
        ← Workspaces
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{a.title ?? a.appId}</h1>
          <div className={styles.subtitle}>
            {a.appId} · {a.store}
            {a.developer ? ` · ${a.developer}` : ""}
            {a.ownerEmail ? ` · ${a.ownerEmail}` : ""}
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Store</div>
          <div className={styles.tileValue}>{a.store}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Keywords</div>
          <div className={styles.tileValue}>{a.counts.keywords}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Score</div>
          <div className={styles.tileValue}>{a.score != null ? a.score.toFixed(1) : "—"}</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Status</div>
          <div className={styles.tileValue}>
            <span className={cs(styles.badge, deleted ? styles.bad : styles.ok)}>
              {deleted ? "deleted" : a.availability.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>App</h2>
      <Defs
        rows={[
          ["App id", a.appId],
          ["Adam id", a.adamId ?? "—"],
          ["Developer", a.developer ?? "—"],
          ["Country", a.country.toUpperCase()],
          ["Language", a.language.toUpperCase()],
          ["Version", a.version ?? "—"],
          ["Size", mb(a.size)],
          ["Price", a.price != null ? `$${a.price}` : "—"],
          ["Rating", a.averageReviewsScore != null ? a.averageReviewsScore.toFixed(2) : "—"],
          ["Reviews", a.reviewsCount ?? "—"],
          ["Store status", a.status ?? "—"],
          ["Availability", a.availability],
        ]}
      />

      <h2 className={styles.sectionTitle}>Orders &amp; keywords</h2>
      <Defs
        rows={[
          ["Keywords", a.counts.keywords],
          ["Keyword orders", a.counts.keywordsOrders],
          ["Rating orders", a.counts.ratingsOrders],
          ["Review orders", a.counts.reviewsOrders],
          ["Direct orders", a.counts.directOrders],
          ["ASA links", a.counts.asaLinks],
        ]}
      />

      <h2 className={styles.sectionTitle}>Timing</h2>
      <Defs
        rows={[
          ["Added", dateTime(a.createdAt)],
          ["Updated", dateTime(a.updatedAt)],
          ["Last accessed", dateTime(a.lastAccessedAt)],
          ["ASA verified", dateTime(a.verifiedAt)],
        ]}
      />
    </div>
  );
}
