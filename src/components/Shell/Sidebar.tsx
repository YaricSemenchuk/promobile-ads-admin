import { Fragment } from "react";
import type { ComponentType, SVGProps } from "react";
import { NavLink } from "react-router-dom";
import cs from "classnames";
import { Tooltip } from "./Tooltip";
import { ArrowLeftIcon, LogoIcon } from "./platformIcons";
import styles from "./Sidebar.module.scss";

/** Icon tile colours, named as on the platform: each follows the design's status palette. */
export type SidebarTone = "overview" | "apps" | "appInsights" | "balance" | "subscription" | "orders" | "appleAds";

export interface SidebarItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: SidebarTone;
  /** Consecutive items with the same section share one caption under a divider. */
  section: string;
}

interface SidebarProps {
  items: SidebarItem[];
  opened: boolean;
  onToggle: () => void;
}

/**
 * The platform's sidebar (promobile-ads src/sandbox/components/Sidebar) with the
 * admin's own sections. Items are real links, not buttons: middle click and
 * "open in new tab" work without extra code.
 */
export function Sidebar({ items, opened, onToggle }: SidebarProps) {
  return (
    <nav className={cs(styles.sidebar, { [styles.collapsed]: !opened })} aria-label="Admin">
      <div className={styles.inner}>
        <div className={styles.logoRow}>
          <LogoIcon className={styles.logo} aria-label="Promobile" />
        </div>

        <div className={styles.list}>
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Fragment key={item.to}>
                {item.section !== items[index - 1]?.section && (
                  <div className={styles.section}>
                    <span className={styles.sectionLine} aria-hidden />
                    {opened && <span className={styles.sectionLabel}>{item.section}</span>}
                  </div>
                )}
                {/* Collapsed, the label lives in a tooltip, not a native title: that one waits about a second. */}
                <Tooltip title={opened ? undefined : item.label} placement="right">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => cs(styles.item, { [styles.active]: isActive })}
                    aria-label={opened ? undefined : item.label}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className={styles.indicator} aria-hidden />}
                        <span className={cs(styles.iconBox, styles[`tone-${item.tone}`])}>
                          <Icon />
                        </span>
                        {opened && <span className={styles.label}>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </Tooltip>
              </Fragment>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className={styles.toggle}
        onClick={onToggle}
        aria-label={opened ? "Collapse menu" : "Expand menu"}
      >
        <ArrowLeftIcon />
      </button>
    </nav>
  );
}

export default Sidebar;
