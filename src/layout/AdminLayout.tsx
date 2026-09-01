import { NavLink, Outlet } from "react-router-dom";
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
    items: [{ to: "/asa-connections", label: "ASA Connections" }],
  },
];

export function AdminLayout() {
  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>Promobile Admin</div>

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
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
