import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check local storage or system preference on mount
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Determine page title based on route
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/products":
        return "Products";
      case "/orders":
        return "Orders";
      case "/customers":
        return "Customers";
      case "/settings":
        return "Settings";
      default:
        return "Overview";
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle button (hidden on desktop) */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle dark mode</span>
        </Button>
      </div>
    </header>
  );
}
