import { Sun, Moon } from "lucide-react";
import { useEffect } from "react";

export const ThemeToggle = ({ theme, setTheme }) => {
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, [setTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="fixed top-3 right-3 z-50 p-2 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none md:absolute md:top-4 md:right-4"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};