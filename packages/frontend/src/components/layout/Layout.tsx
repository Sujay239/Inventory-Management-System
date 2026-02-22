import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Dynamic page title based on current route
    const path = location.pathname;
    let pageName = "Dashboard";

    if (path.includes("/products")) {
      pageName = "Products";
    } else if (path.includes("/suppliers")) {
      pageName = "Suppliers";
    } else if (path.includes("/purchase-orders")) {
      pageName = "Purchase Orders";
    } else if (path.includes("/sales-orders")) {
      pageName = "Sales Orders";
    } else if (path.includes("/bills")) {
      pageName = "Bills & Payments";
    }

    document.title = `${pageName} - Inventory System`;
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
