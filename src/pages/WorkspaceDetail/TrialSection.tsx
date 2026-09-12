import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import cs from "classnames";
import {
  END_TRIAL,
  EXTEND_TRIAL,
  GET_ADMIN_TRIAL_END_PREVIEW,
  GET_ADMIN_TRIAL_ORG_WARNING,
  GRANT_TRIAL,
} from "../../api/queries";
import { SettingsTable } from "../../components/SettingsTable";
import styles from "./styles.module.scss";

export interface Trial {
  id: number;
  reason: string;
  comment: string | null;
  grantedByEmail: string;
  startsAt: string;
  expiresAt: string;
  status: string;
  endedAt: string | null;
  createdAt: string;
}

interface OrgWarning {
  workspaceId: number;
  workspaceName: string;
  orgId: string;
  grantedAt: string;
  status: string;
}

const REASONS: { value: string; label: string }[] = [
  { value: "MARKETING", label: "Marketing" },
  { value: "ONBOARDING_SETUP", label: "Onboarding setup" },
  { value: "REACTIVATION", label: "Reactivation" },
  { value: "OTHER", label: "Other" },
];
const PRESETS = [7, 14, 30];
// Комментарий обязателен только для этих причин — как на бэке (grantTrial).
const NEEDS_COMMENT = new Set(["REACTIVATION", "OTHER"]);

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  EXTENDED: "Extended",
  ENDED_EARLY: "Ended early",
  EXPIRED: "Expired",
  CONVERTED: "Converted",
};
const reasonLabel = (value: string) => REASONS.find((r) => r.value === value)?.label ?? value;

type HistoryColumn = "reason" | "granted" | "period" | "status";

export function TrialSection({
  workspaceId,
  billingStatus,
  trials,
  onChange,
}: {
  workspaceId: number;
  billingStatus: string | null;
  trials: Trial[];
  onChange: () => void;
}) {
  const onTrial = billingStatus === "TRIAL";
  const active = useMemo(
    () => trials.find((t) => t.status === "ACTIVE" || t.status === "EXTENDED") ?? null,
    [trials],
  );

  // Форма выдачи
  const [days, setDays] = useState("14");
  const [reason, setReason] = useState("MARKETING");
  const [comment, setComment] = useState("");
  // Продление
  const [extendDays, setExtendDays] = useState("7");
  // Завершение
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [endComment, setEndComment] = useState("");

  const grantable = !onTrial && billingStatus !== "ACTIVE" && billingStatus !== "PAST_DUE";

  const { data: warnData } = useQuery<{ adminTrialOrgWarning: OrgWarning[] }>(GET_ADMIN_TRIAL_ORG_WARNING, {
    variables: { workspaceId },
    skip: !grantable,
    fetchPolicy: "cache-and-network",
  });
  const warnings = warnData?.adminTrialOrgWarning ?? [];

  const { data: previewData } = useQuery<{
    adminTrialEndPreview: { hasSubscription: boolean; amount: number };
  }>(GET_ADMIN_TRIAL_END_PREVIEW, {
    variables: { workspaceId },
    skip: !onTrial,
    fetchPolicy: "cache-and-network",
  });
  const preview = previewData?.adminTrialEndPreview;

  const done = () => onChange();
  const [grant, { loading: granting, error: grantError }] = useMutation(GRANT_TRIAL, {
    onCompleted: () => {
      setComment("");
      done();
    },
  });
  const [extend, { loading: extending, error: extendError }] = useMutation(EXTEND_TRIAL, { onCompleted: done });
  const [end, { loading: ending, error: endError }] = useMutation(END_TRIAL, {
    onCompleted: () => {
      setConfirmEnd(false);
      setEndComment("");
      done();
    },
  });

  const daysNum = Number(days);
  const commentRequired = NEEDS_COMMENT.has(reason);
  const grantDisabled =
    granting || !Number.isInteger(daysNum) || daysNum <= 0 || daysNum > 365 || (commentRequired && !comment.trim());

  const extendNum = Number(extendDays);
  const extendDisabled = extending || !Number.isInteger(extendNum) || extendNum <= 0 || extendNum > 365;

  return (
    <>
      <h2 className={styles.sectionTitle}>Trial</h2>

      {onTrial && active ? (
        <div className={styles.trialCard}>
          <div className={styles.defs}>
            <div className={styles.defRow}>
              <span className={styles.defKey}>Status</span>
              <span className={styles.defVal}>
                On trial · {daysLeft(active.expiresAt)} days left
              </span>
            </div>
            <div className={styles.defRow}>
              <span className={styles.defKey}>Ends</span>
              <span className={styles.defVal}>{date(active.expiresAt)}</span>
            </div>
            <div className={styles.defRow}>
              <span className={styles.defKey}>Reason</span>
              <span className={styles.defVal}>{reasonLabel(active.reason)}</span>
            </div>
            <div className={styles.defRow}>
              <span className={styles.defKey}>Granted by</span>
              <span className={styles.defVal}>{active.grantedByEmail}</span>
            </div>
          </div>

          <div className={styles.trialActions}>
            <div className={styles.field}>
              <span className={styles.label}>Extend by</span>
              <div className={styles.inlineRow}>
                <input
                  className={styles.inputNarrow}
                  type="number"
                  min={1}
                  max={365}
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                />
                <span className={styles.note}>days</span>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={extendDisabled}
                  onClick={() => void extend({ variables: { workspaceId, days: extendNum } })}
                >
                  {extending ? "Extending…" : "Extend"}
                </button>
              </div>
              {extendError && <div className={styles.error}>{extendError.message}</div>}
            </div>

            <div className={styles.field}>
              {confirmEnd ? (
                <>
                  <div className={styles.warn}>
                    {preview?.hasSubscription
                      ? preview.amount > 0
                        ? `A subscription is on file — the first payment of ${money(
                            preview.amount,
                          )} will be charged today.`
                        : "A subscription is on file — the first invoice will be issued today; access opens once it is paid."
                      : "No payment method — the workspace goes behind the paywall."}
                  </div>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Comment (required when revoking a trial)"
                    value={endComment}
                    onChange={(e) => setEndComment(e.target.value)}
                  />
                  <div className={styles.inlineRow}>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      disabled={ending}
                      onClick={() =>
                        void end({ variables: { workspaceId, comment: endComment.trim() || null } })
                      }
                    >
                      {ending ? "Ending…" : "End trial now"}
                    </button>
                    <button type="button" className={styles.asLink} onClick={() => setConfirmEnd(false)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" className={styles.secondaryButton} onClick={() => setConfirmEnd(true)}>
                  End trial now
                </button>
              )}
              {endError && <div className={styles.error}>{endError.message}</div>}
            </div>
          </div>
        </div>
      ) : grantable ? (
        <div className={styles.trialCard}>
          {warnings.length > 0 && (
            <div className={styles.warnBanner}>
              This Apple account already had a trial in{" "}
              {warnings.map((w, i) => (
                <span key={w.workspaceId}>
                  {i > 0 && ", "}
                  <a className={styles.rowLink} href={`/workspaces/${w.workspaceId}`}>
                    {w.workspaceName}
                  </a>{" "}
                  (org {w.orgId})
                </span>
              ))}
              . Granting anyway is logged to the audit trail.
            </div>
          )}
          <div className={styles.trialForm}>
            <div className={styles.field}>
              <span className={styles.label}>Length</span>
              <div className={styles.inlineRow}>
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={cs(styles.preset, Number(days) === p && styles.presetActive)}
                    onClick={() => setDays(String(p))}
                  >
                    {p}d
                  </button>
                ))}
                <input
                  className={styles.inputNarrow}
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
                <span className={styles.note}>days</span>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Reason</span>
              <select className={styles.select} value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>
                Comment{commentRequired ? " (required)" : " (optional)"}
              </span>
              <input
                className={styles.input}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={commentRequired ? "Why is this trial being granted?" : ""}
              />
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              disabled={grantDisabled}
              onClick={() =>
                void grant({
                  variables: { workspaceId, days: daysNum, reason, comment: comment.trim() || null },
                })
              }
            >
              {granting ? "Granting…" : "Grant trial"}
            </button>
          </div>
          {grantError && <div className={styles.error}>{grantError.message}</div>}
        </div>
      ) : (
        <div className={styles.note}>
          {billingStatus === "ACTIVE"
            ? "This workspace already has an active subscription."
            : billingStatus === "PAST_DUE"
              ? "Settle the outstanding balance before granting a trial."
              : "A trial cannot be granted in this state."}
        </div>
      )}

      {trials.length > 0 && (
        <SettingsTable<HistoryColumn, Trial>
          columns={[
            { key: "reason", label: "Reason", width: "28%" },
            { key: "granted", label: "Granted by", width: "26%" },
            { key: "period", label: "Period", width: "28%" },
            { key: "status", label: "Outcome", width: "18%" },
          ]}
          rows={trials}
          rowKey={(row) => String(row.id)}
          emptyText="No trials yet."
          renderCell={(row, key) => {
            switch (key) {
              case "reason":
                return (
                  <div className={styles.cell}>
                    <span className={styles.cellMain}>{reasonLabel(row.reason)}</span>
                    {row.comment && <span className={styles.cellSub}>{row.comment}</span>}
                  </div>
                );
              case "granted":
                return (
                  <div className={styles.cell}>
                    <span className={styles.cellMain}>{row.grantedByEmail}</span>
                    <span className={styles.cellSub}>granted {date(row.createdAt)}</span>
                  </div>
                );
              case "period":
                return `${date(row.startsAt)} — ${date(row.endedAt ?? row.expiresAt)}`;
              case "status":
                return <span className={styles.cellSub}>{STATUS_LABEL[row.status] ?? row.status}</span>;
            }
          }}
        />
      )}
    </>
  );
}
