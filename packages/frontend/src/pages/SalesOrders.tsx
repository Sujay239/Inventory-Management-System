import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Edit,
  Trash2,
  PackageSearch,
} from "lucide-react";

import { mockProducts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SalesOrderFormModal,
  SalesOrderFormData,
} from "@/components/shared/SalesOrderFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Initialize with some dummy sales orders
const initialOrders: SalesOrderFormData[] = [
  {
    id: "so-init-1",
    referenceNo: "SO-10025",
    date: new Date(Date.now() - 86400000 * 1), // 1 day ago
    customerName: "Alice Smith",
    status: "Completed",
    notes: "Direct walk-in customer",
    items: [
      {
        id: "item-1",
        productId: "P-001",
        quantity: 2,
        sellingPrice: 349.99,
        total: 699.98,
      },
    ],
    subTotal: 699.98,
    gstPercentage: 18,
    gstAmount: 126.0,
    grandTotal: 825.98,
  },
  {
    id: "so-init-2",
    referenceNo: "SO-10026",
    date: new Date(),
    customerName: "Bob Jones",
    status: "Pending",
    notes: "Courier requested",
    items: [
      {
        id: "item-2",
        productId: "P-003",
        quantity: 10,
        sellingPrice: 19.99,
        total: 199.9,
      },
      {
        id: "item-3",
        productId: "P-005",
        quantity: 5,
        sellingPrice: 12.5,
        total: 62.5,
      },
    ],
    subTotal: 262.4,
    gstPercentage: 0,
    gstAmount: 0,
    grandTotal: 262.4,
  },
];

export function SalesOrders() {
  const [orders, setOrders] = useState<SalesOrderFormData[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderFormData | null>(
    null,
  );
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Shipped":
        return "secondary";
      case "Pending":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Actions
  const handleAddOrder = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: SalesOrderFormData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSaveOrder = (data: SalesOrderFormData) => {
    try {
      if (data.id) {
        // Edit Existing
        const originalOrder = orders.find((o) => o.id === data.id);
        setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));

        // Stock Deduction Logic (Simulation)
        // If it was Pending/Cancelled and now it is Shipped/Completed -> Subtract Stock
        const wasDeducted =
          originalOrder?.status === "Shipped" ||
          originalOrder?.status === "Completed";
        const nowDeducted =
          data.status === "Shipped" || data.status === "Completed";

        if (!wasDeducted && nowDeducted) {
          data.items.forEach((item) => {
            const product = mockProducts.find((p) => p.id === item.productId);
            if (product) {
              product.stock -= item.quantity;
            }
          });
          toast.success("Inventory Updated", {
            description: `Stock was deducted for ${data.referenceNo}.`,
          });
        }
        // If it was Shipped/Completed and now it is Cancelled -> Revert Stock
        else if (wasDeducted && data.status === "Cancelled") {
          data.items.forEach((item) => {
            const product = mockProducts.find((p) => p.id === item.productId);
            if (product) {
              product.stock += item.quantity;
            }
          });
          toast.info("Stock Reverted", {
            description: `Quantity returned to inventory.`,
          });
        }

        toast.success("Sales Order updated");
      } else {
        // Add New
        const newOrder = {
          ...data,
          id: `so-${Date.now()}`,
        };
        setOrders((prev) => [newOrder, ...prev]);

        // Deduct stock if created as Shipped or Completed
        if (newOrder.status === "Shipped" || newOrder.status === "Completed") {
          newOrder.items.forEach((item) => {
            const product = mockProducts.find((p) => p.id === item.productId);
            if (product) {
              product.stock -= item.quantity;
            }
          });
          toast.success("Inventory Updated", {
            description: `Stock deducted for new order.`,
          });
        }

        toast.success("Sales Order created");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Error saving order");
    }
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setIsModalOpen(false);
    setOrderToDelete(null);
    toast.success("Sales Order deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
          <p className="text-muted-foreground">
            Track customer shipments, stock outs, and revenue.
          </p>
        </div>
        <Button onClick={handleAddOrder} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice or customer..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Shipped", "Completed", "Cancelled"].map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="text-xs"
              >
                {status}
              </Button>
            ),
          )}
          <Button variant="outline" size="icon" className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No sales orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {order.referenceNo}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(order.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {order.customerName || "Walk-in Customer"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <PackageSearch className="h-4 w-4" />
                        <span>
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          units
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.grandTotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order);
                          }}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Edit order</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order.id!);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete order</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Forms & Modals */}
      <SalesOrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        existingOrders={orders}
        products={mockProducts as any}
        onSave={handleSaveOrder}
        onDelete={(id) => setOrderToDelete(id)}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sales Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sales order? This will remove
              the record from the system. Stock levels will NOT be auto-reverted
              by deleting the record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (orderToDelete) handleDeleteOrder(orderToDelete);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
