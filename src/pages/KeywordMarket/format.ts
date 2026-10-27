/** Доля в процентах без хвоста нулей: 27 вместо 27.0, 26.8 как есть. */
const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * Границы известной доли. Нижняя — то, что точно занято видимыми приложениями;
 * верхней может не быть (null), тогда честно пишем «не меньше».
 */
export const range = (low: number, high: number | null): string => {
  if (high == null) return `≥ ${num(low)}%`;
  if (Math.abs(high - low) < 0.05) return `${num(low)}%`;
  return `${num(low)}–${num(high)}%`;
};

const DAY_MS = 86_400_000;

/** Сутки Apple для impression share — UTC, поэтому и период считаем в UTC. */
export const isoDaysAgo = (days: number): string => new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

export const periodOf = (days: number) => ({ from: isoDaysAgo(days - 1), to: isoDaysAgo(0) });

export const NOTE =
  "Known share is what the apps behind connected organisations already hold. Other advertisers are invisible, so the real share is higher. Ranges come from Apple rounding every share to a whole percent.";

export const detailHref = (country: string, term: string, days: number): string => {
  const q = new URLSearchParams({ country, q: term, days: String(days) });
  return `/keyword-market/term?${q}`;
};
