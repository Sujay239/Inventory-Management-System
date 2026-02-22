import { Link, useLocation } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Box,
  Truck,
  Receipt,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Box },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Sales Orders", href: "/sales-orders", icon: Receipt },
  { name: "Bills", href: "/bills", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-background border-r border-border transition-all duration-300 hidden lg:flex flex-col",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-8 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              InvenTrack
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 absolute -right-4 top-4 rounded-full border border-border bg-background shadow-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Nav Links */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* User Profile Snippet (Bottom) */}
        <div className="p-3 border-t border-border mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer",
                  isCollapsed && "justify-center",
                )}
              >
                <div className="min-w-8 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                  AD
                </div>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">Admin User</p>
                    <p className="text-xs text-muted-foreground truncate">
                      admin@inventrack.com
                    </p>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={10}>
                Admin User
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </TooltipProvider>
    </aside>
  );
}
