import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

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