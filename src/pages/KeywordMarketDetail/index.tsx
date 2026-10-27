import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import cs from "classnames";
import { GET_ADMIN_KEYWORD_MARKET } from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import listStyles from "../../styles/list.module.scss";
import styles from "../KeywordMarket/styles.module.scss";
import { NOTE, periodOf, range } from "../KeywordMarket/format";

interface DayRow {
  date: string;
  advertisers: number;
  topSlotKnownLow: number;
  topSlotKnownHigh: number;
  allSlotsKnownLow: number;
  allSlotsKnownHigh: number | null;
  inconsistent: boolean;
}

type Column = "date" | "apps" | "top" | "all";

export function KeywordMarketDetailPage() {
  const [params] = useSearchParams();
  const country = (params.get("country") ?? "").toUpperCase();
  const term = params.get("q") ?? "";
  const days = Math.min(366, Math.max(1, Number(params.get("days")) || 30));
  const period = periodOf(days);

  const { data, loading, error } = useQuery(GET_ADMIN_KEYWORD_MARKET, {
    variables: { country, searchTerm: term, ...period },
    skip: !country || !term,
  });

  const market = data?.adminKeywordMarket;
  // Свежие дни сверху: на экране нужен сегодняшний рынок, а не его начало.
  const rows: DayRow[] = market ? [...market.days].reverse() : [];

  return (
    <div>
      <Link className={cs(listStyles.rowLink, styles.back)} to="/keyword-market">
        ← Keyword market
      </Link>
      <h1 className={listStyles.pageTitle}>
        {term || "Keyword"} <span className={listStyles.note}>· {country}</span>
      </h1>
      <p className={styles.explain}>{NOTE}</p>

      {(!country || !term) && <div className={listStyles.state}>Open a keyword from the list.</div>}
      {loading && <div className={listStyles.state}>Loading…</div>}
      {error && <div className={listStyles.state}>Failed to load this keyword.</div>}

      {market && (
        <>
          <div className={listStyles.controls}>
            <span className={listStyles.live}>
              {market.connections} organisation{market.connections === 1 ? "" : "s"} · {period.from} to {period.to}
            </span>
          </div>
          <SettingsTable<Column, DayRow>
            columns={[
              { key: "date", label: "Day", width: "20%", sortable: false },
              { key: "apps", label: "Visible apps", width: "20%", sortable: false },
              { key: "top", label: "Top slot", width: "30%", sortable: false },
              { key: "all", label: "All slots", width: "30%", sortable: false },
            ]}
            rows={rows}
            minWidth={640}
            rowKey={(row) => row.date}
            emptyText="No impression share data for this keyword in the period."
            renderCell={(row, key) => {
              switch (key) {
                case "date":
                  return (
                    <div className={listStyles.cell}>
                      <span>{row.date}</span>
                      {row.inconsistent && <span className={cs(listStyles.cellSub, listStyles.warn)}>check data</span>}
                    </div>
                  );
                case "apps":
                  return row.advertisers;
                case "top":
                  return range(row.topSlotKnownLow, row.topSlotKnownHigh);
                case "all":
                  return range(row.allSlotsKnownLow, row.allSlotsKnownHigh);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
