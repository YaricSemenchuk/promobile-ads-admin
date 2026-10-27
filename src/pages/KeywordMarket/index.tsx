import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_KEYWORD_MARKET_TOP } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import listStyles from "../../styles/list.module.scss";
import styles from "./styles.module.scss";
import { NOTE, detailHref, periodOf, range } from "./format";

interface TermRow {
  searchTerm: string;
  date: string;
  advertisers: number;
  popularity: number | null;
  topSlotKnownLow: number;
  topSlotKnownHigh: number;
  allSlotsKnownLow: number;
  allSlotsKnownHigh: number | null;
  inconsistent: boolean;
}

type Column = "term" | "popularity" | "apps" | "top" | "all" | "day";

const PERIODS = [7, 14, 30] as const;

export function KeywordMarketPage() {
  const [country, setCountry] = useState("DE");
  const [days, setDays] = useState<number>(30);
  const [minApps, setMinApps] = useState(1);

  const validCountry = /^[A-Za-z]{2}$/.test(country);
  // Период пересчитывается только когда меняются сутки: иначе каждый рендер даёт новые переменные и новый запрос.
  const period = useMemo(() => periodOf(days), [days]);

  const { data, loading, error } = useQuery(GET_ADMIN_KEYWORD_MARKET_TOP, {
    variables: { country: country.toUpperCase(), ...period, limit: 100, minAdvertisers: minApps },
    skip: !validCountry,
  });

  const rows: TermRow[] = data?.adminKeywordMarketTop?.terms ?? [];
  const total: number = data?.adminKeywordMarketTop?.termsTotal ?? 0;

  return (
    <div>
      <h1 className={listStyles.pageTitle}>Keyword market</h1>
      <p className={styles.explain}>{NOTE}</p>

      <div className={listStyles.controls}>
        <input
          className={styles.country}
          aria-label="Country code"
          maxLength={2}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <select className={listStyles.select} aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {PERIODS.map((d) => (
            <option key={d} value={d}>
              Last {d} days
            </option>
          ))}
        </select>
        <select className={listStyles.select} aria-label="Minimum apps" value={minApps} onChange={(e) => setMinApps(Number(e.target.value))}>
          <option value={1}>Any number of apps</option>
          <option value={2}>2+ apps</option>
          <option value={3}>3+ apps</option>
        </select>
        {validCountry && !loading && !error && (
          <span className={listStyles.live}>
            top {rows.length} of {total} keywords
          </span>
        )}
      </div>

      {!validCountry && <div className={listStyles.state}>Enter a two-letter country code, for example DE.</div>}
      {validCountry && loading && <div className={listStyles.state}>Loading…</div>}
      {validCountry && error && <div className={listStyles.state}>Failed to load the keyword market.</div>}

      {validCountry && !loading && !error && (
        <SettingsTable<Column, TermRow>
          columns={[
            { key: "term", label: "Keyword", width: "24%", sortable: false },
            { key: "popularity", label: "Popularity", width: "12%", sortable: false },
            { key: "apps", label: "Visible apps", width: "12%", sortable: false },
            { key: "top", label: "Top slot", width: "16%", sortable: false },
            { key: "all", label: "All slots", width: "20%", sortable: false },
            { key: "day", label: "Day", width: "16%", sortable: false },
          ]}
          rows={rows}
          minWidth={860}
          rowKey={(row) => row.searchTerm}
          emptyText="No impression share data for this country in the period."
          renderCell={(row, key) => {
            switch (key) {
              case "term":
                return (
                  <div className={listStyles.cell}>
                    <Link className={cs(listStyles.rowLink, listStyles.cellMain)} to={detailHref(country.toUpperCase(), row.searchTerm, days)}>
                      {row.searchTerm}
                    </Link>
                    {row.inconsistent && (
                      <span className={cs(listStyles.cellSub, listStyles.warn)} title="A sum went past its ceiling: the one-ad-per-app assumption or the merge of organisations is off for this day.">
                        check data
                      </span>
                    )}
                  </div>
                );
              case "popularity":
                return row.popularity ?? "—";
              case "apps":
                return row.advertisers;
              case "top":
                return range(row.topSlotKnownLow, row.topSlotKnownHigh);
              case "all":
                return (
                  <div className={listStyles.cell}>
                    <span>{range(row.allSlotsKnownLow, row.allSlotsKnownHigh)}</span>
                    <span className={listStyles.progress} aria-hidden="true">
                      <span className={listStyles.progressFill} style={{ width: `${Math.min(100, row.allSlotsKnownLow)}%` }} />
                    </span>
                  </div>
                );
              case "day":
                return <span className={listStyles.neutral}>{row.date}</span>;
            }
          }}
        />
      )}
    </div>
  );
}
