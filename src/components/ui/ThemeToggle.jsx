import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="btn-icon" title={isDark ? "Light mode" : "Dark mode"}>
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
