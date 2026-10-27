import { NavLink, Outlet } from "react-router-dom";
import { LenisScroller, PageTransition, useReveal } from "../motion";
import styles from "./AdminLayout.module.scss";

/**
 * Навигация сгруппирована, потому что плоский список из девяти пунктов не
 * читается: разделы отвечают на разные вопросы и открываются в разных
 * ситуациях. Деньги смотрят по расписанию, операции — когда что-то сломалось.
 */
const SECTIONS: { title: string; items: { to: string; label: string }[] }[] = [
  {
    title: "Money",
    items: [
      { to: "/revenue", label: "Revenue" },
      { to: "/billing", label: "Billing" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/tasks", label: "Task queue" },
      { to: "/sync", label: "Sync health" },
      { to: "/ramp-ups", label: "Ramp-Up" },
      { to: "/activity", label: "Activity log" },
    ],
  },
  {
    title: "People",
    items: [
      { to: "/workspaces", label: "Workspaces" },
      { to: "/users", label: "Users" },
    ],
  },
  {
    title: "Apple",
    items: [
      { to: "/asa-connections", label: "ASA Connections" },
      { to: "/keyword-market", label: "Keyword market" },
    ],
  },
];

export function AdminLayout() {
  // Сайдбар живёт сквозь все маршруты, поэтому reveal срабатывает один раз — на
  // входе в админку: логотип и разделы мягко проступают по очереди.
  const sidebarRef = useReveal<HTMLElement>({ stagger: true, y: 8, duration: 0.4 });

  return (
    <div className={styles.shell}>
      <nav ref={sidebarRef} className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoMark} aria-hidden />
          Promobile Admin
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title} className={styles.section}>
            <div className={styles.sectionTitle}>{section.title}</div>
            <ul className={styles.nav}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <LenisScroller className={styles.content}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </LenisScroller>
    </div>
  );
}
