import { Package, DollarSign, Activity, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import {
  OverviewChart,
  SalesByCategoryChart,
} from "@/components/shared/DashboardCharts";
import {
  dashboardMetrics,
  lowStockItems,
  recentTransactions,
  revenueData,
  salesByCategoryData,
} from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's a snapshot of your inventory and sales today.
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={dashboardMetrics.totalProducts.toLocaleString()}
          icon={Package}
          description="Active products in inventory"
        />
        <StatCard
          title="Current Stock Value"
          value={formatCurrency(dashboardMetrics.currentStockValue)}
          icon={DollarSign}
          description="+2.5% from last month"
          trend="up"
          trendValue="+2.5%"
        />
        <StatCard
          title="Today's Sales"
          value={dashboardMetrics.todaysSales.toString()}
          icon={Activity}
          description="Purchase orders processed today"
          trend="up"
          trendValue="+12"
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(dashboardMetrics.todaysProfit)}
          icon={TrendingUp}
          description="Estimated net profit"
        />
      </div>

      {/* Charts Array */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart data={revenueData} />
        <SalesByCategoryChart data={salesByCategoryData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
            <CardDescription>
              You've generated {dashboardMetrics.todaysSales} purchase orders
              today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 hidden sm:flex">
                          <AvatarFallback>{tx.customerInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-none">
                            {tx.customer}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={
                          tx.status === "Completed" ? "default" : "secondary"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {tx.date}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tx.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              Items that need to be restocked soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium text-sm leading-none">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{item.sku}</span>
                        <Badge
                          variant={
                            item.status === "Critical"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          {item.status}
                        </Badge>
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          item.status === "Critical"
                            ? "text-destructive"
                            : "text-amber-500"
                        }
                      >
                        {item.stock}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">
                        / {item.threshold}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
