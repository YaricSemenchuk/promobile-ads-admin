/**
 * Which backend this build talks to. Production and staging admins look the
 * same, and a trial granted or an invoice marked paid on the wrong one is real
 * money, so the header names it. The admin builds from `main` for both
 * environments; only VITE_GRAPHQL_URI tells them apart.
 */
export type EnvironmentTone = "error" | "warning" | "neutral";

const host = (() => {
  try {
    return new URL(import.meta.env.VITE_GRAPHQL_URI ?? "").host;
  } catch {
    return "";
  }
})();

const isLocal = host === "" || host.startsWith("localhost") || host.startsWith("127.0.0.1");

export const ENVIRONMENT: { label: string; tone: EnvironmentTone; host: string } = isLocal
  ? { label: "Local", tone: "neutral", host }
  : /(^|[.-])(dev|staging)/.test(host)
    ? { label: "Staging", tone: "warning", host }
    : { label: "Production", tone: "error", host };
