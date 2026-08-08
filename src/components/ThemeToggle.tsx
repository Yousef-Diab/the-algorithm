import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const OPTIONS: { id: Theme; label: string; icon: string }[] = [
  { icon: "☀", id: "light", label: "Light" },
  { icon: "☾", id: "dark", label: "Dark" },
  { icon: "◐", id: "system", label: "System" },
];

function readTheme(): Theme {
  try {
    const t = localStorage.getItem("ict-theme");
    if (t === "light" || t === "dark" || t === "system") {
      return t;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

function applyTheme(t: Theme) {
  try {
    localStorage.setItem("ict-theme", t);
  } catch {
    /* ignore */
  }
  const dark =
    t === "dark" ||
    (t === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute(
    "data-theme",
    dark ? "trading" : "trading-light"
  );
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [open, setOpen] = useState(false);
  // Start at 'system' so the initial client render matches the server HTML;
  // apply the saved preference right after hydration.
  const [theme, setTheme] = useState<Theme>("system");
  // The theme effect must not run with the initial 'system' state, which
  // would transiently apply the OS theme (and overwrite the saved
  // preference) before the init effect below has applied the saved theme.
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = readTheme();
    setTheme(saved);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    applyTheme(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [initialized, theme]);

  const current = OPTIONS.find((o) => o.id === theme) ?? OPTIONS[2];

  return (
    <div className="theme-toggle">
      {open && (
        <button
          aria-label="Close theme menu"
          className="theme-scrim"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Theme: ${current.label}. Change theme.`}
        className="theme-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span aria-hidden="true" className="tb-ico">
          {current.icon}
        </span>
        <span>{current.label}</span>
      </button>
      {open && (
        <div aria-label="Theme" className="theme-menu" role="menu">
          {OPTIONS.map((o) => (
            <button
              aria-checked={theme === o.id}
              className={theme === o.id ? "sel" : ""}
              key={o.id}
              onClick={() => {
                applyTheme(o.id);
                setTheme(o.id);
                setOpen(false);
              }}
              role="menuitemradio"
              type="button"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
