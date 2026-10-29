import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LenisScroller, PageTransition } from "../motion";
import { Header } from "../components/Shell/Header";
import { Sidebar } from "../components/Shell/Sidebar";
import type { SidebarItem } from "../components/Shell/Sidebar";
import {
  ActivityIcon,
  AppleAdsIcon,
  AppsIcon,
  AutomationsIcon,
  BalanceIcon,
  BillingIcon,
  CampaignsIcon,
  RunAdsIcon,
  StatisticsIcon,
} from "../components/Shell/platformIcons";
import { UsersIcon } from "../components/Shell/adminIcons";
import styles from "./AdminLayout.module.scss";

/**
 * Навигация сгруппирована, потому что плоский список из десяти пунктов не
 * читается: разделы отвечают на разные вопросы и открываются в разных
 * ситуациях. Деньги смотрят по расписанию, операции — когда что-то сломалось.
 * Иконки и тона — из набора платформы; одна иконка в обоих продуктах значит
 * одно и то же цветом.
 */
const NAV: SidebarItem[] = [
  { section: "Money", to: "/revenue", label: "Revenue", icon: BalanceIcon, tone: "balance" },
  { section: "Money", to: "/billing", label: "Billing", icon: BillingIcon, tone: "appInsights" },
  { section: "Operations", to: "/tasks", label: "Task queue", icon: AutomationsIcon, tone: "orders" },
  { section: "Operations", to: "/sync", label: "Sync health", icon: ActivityIcon, tone: "apps" },
  { section: "Operations", to: "/ramp-ups", label: "Ramp-Up", icon: RunAdsIcon, tone: "balance" },
  { section: "Operations", to: "/activity", label: "Activity log", icon: CampaignsIcon, tone: "appInsights" },
  { section: "People", to: "/workspaces", label: "Workspaces", icon: AppsIcon, tone: "apps" },
  { section: "People", to: "/users", label: "Users", icon: UsersIcon, tone: "subscription" },
  { section: "Apple", to: "/asa-connections", label: "ASA Connections", icon: AppleAdsIcon, tone: "appleAds" },
  { section: "Apple", to: "/keyword-market", label: "Keyword market", icon: StatisticsIcon, tone: "balance" },
];

const COLLAPSED_KEY = "promobile.admin.sidebar.collapsed";

const readCollapsed = (): boolean => {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Каркас платформы (promobile-ads src/layouts/MainLayout): сайдбар-карточка во
 * всю высоту, справа колонка из шапки и карточки страницы. Прокручивается
 * только карточка страницы, меню и шапка стоят на месте.
 */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () =>
    setCollapsed((was) => {
      const next = !was;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // Private mode: the menu just opens expanded next time.
      }
      return next;
    });

  return (
    <div className={styles.shell}>
      <Sidebar items={NAV} opened={!collapsed} onToggle={toggle} />
      <div className={styles.column}>
        <Header />
        <LenisScroller className={styles.page}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </LenisScroller>
      </div>
    </div>
  );
}
