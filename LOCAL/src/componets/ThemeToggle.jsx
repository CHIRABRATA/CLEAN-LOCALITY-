import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch { void 0; }
  }, [dark]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "theme") {
        setDark(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-4 py-2 bg-gray-800 text-white rounded dark:bg-white dark:text-black"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

export default ThemeToggle;
