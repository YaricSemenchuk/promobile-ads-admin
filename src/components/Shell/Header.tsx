import { useEffect, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import cs from "classnames";
import { logout } from "../../api/auth";
import { useStaff } from "../guards/staffContext";
import { useTheme } from "../../theme/useTheme";
import type { ThemeMode } from "../../theme/useTheme";
import { ENVIRONMENT } from "./environment";
import { MonitorIcon, MoonIcon, SunIcon } from "./platformIcons";
import { LogoutIcon } from "./adminIcons";
import styles from "./Header.module.scss";

const THEMES: { mode: ThemeMode; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { mode: "light", label: "Light theme", Icon: SunIcon },
  { mode: "system", label: "Follow the system", Icon: MonitorIcon },
  { mode: "dark", label: "Dark theme", Icon: MoonIcon },
];

const ROLE_LABEL: Record<string, string> = {
  STAFF: "Staff",
  SUPERADMIN: "Super admin",
};

/**
 * The platform header card (promobile-ads src/sandbox/components/Header) for the
 * admin: where the platform picks an Apple account, the admin names the backend
 * it is working on; on the right the same theme switch and an account menu that
 * finally lets staff see who they are and sign out.
 */
export function Header() {
  const staff = useStaff();
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const signOut = async () => {
    await logout();
    // A full load, so no cached admin data outlives the session.
    window.location.assign("/login");
  };

  const email = staff?.email ?? "";
  const initial = (email.trim()[0] ?? "?").toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={cs(styles.env, styles[`env-${ENVIRONMENT.tone}`])}>
          <span className={styles.envDot} aria-hidden />
          {ENVIRONMENT.label}
        </span>
        {ENVIRONMENT.host && <span className={styles.host}>{ENVIRONMENT.host}</span>}
      </div>

      <div className={styles.right}>
        <div className={styles.themeSwitch} role="group" aria-label="Theme">
          {THEMES.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              className={cs(styles.switchItem, { [styles.switchActive]: theme === mode })}
              onClick={() => setTheme(mode)}
              aria-pressed={theme === mode}
              aria-label={label}
              title={label}
            >
              <Icon />
            </button>
          ))}
        </div>

        <div className={styles.account} ref={menuRef}>
          <button
            type="button"
            className={styles.avatar}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className={styles.menu} role="menu">
              <div className={styles.who}>
                <span className={styles.whoEmail}>{email || "Unknown"}</span>
                <span className={styles.whoRole}>{ROLE_LABEL[staff?.platformRole ?? ""] ?? staff?.platformRole}</span>
              </div>
              <span className={styles.divider} aria-hidden />
              <button type="button" role="menuitem" className={styles.menuItem} onClick={() => void signOut()}>
                <LogoutIcon className={styles.menuIcon} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
