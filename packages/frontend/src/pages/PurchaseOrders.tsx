import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Edit,
  Trash2,
  PackageCheck,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  mockSuppliers,
  mockProducts,
  mockPurchaseOrders,
} from "@/lib/mock-data";
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
  PurchaseOrderFormModal,
  PurchaseOrderFormData,
} from "@/components/shared/PurchaseOrderFormModal";
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

// Initialize with some dummy purchase orders for the UI
const initialOrders: PurchaseOrderFormData[] = mockPurchaseOrders as any;

export function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderFormData[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<PurchaseOrderFormData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      case "Pending":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSupplierName = (id: string) => {
    return (
      mockSuppliers.find((s) => s.id === id)?.shopName || "Unknown Supplier"
    );
  };

  // Actions
  const handleAddOrder = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: PurchaseOrderFormData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSaveOrder = (data: PurchaseOrderFormData) => {
    try {
      if (data.id) {
        // Edit Existing
        const originalOrder = orders.find((o) => o.id === data.id);
        setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));

        // Handle Stock Update Logic (Simulation)
        if (
          originalOrder?.status !== "Completed" &&
          data.status === "Completed"
        ) {
          // It just moved to completed! Time to add to mockProducts stock.
          // In a real app, this would hit a backend `/api/inventory/receive` endpoint
          data.items.forEach((item) => {
            const product = mockProducts.find((p) => p.id === item.productId);
            if (product) {
              product.stock += item.quantity;
            }
          });
          toast.success("Stock Updated", {
            description: `Received quantities have been added to inventory.`,
          });
        }

        toast.success("Purchase Order updated", {
          description: `${data.referenceNo} has been saved.`,
        });
      } else {
        // Add New
        const newOrder = {
          ...data,
          id: `po-${Date.now()}`,
        };
        setOrders((prev) => [newOrder, ...prev]);

        // If created as completed immediately
        if (newOrder.status === "Completed") {
          newOrder.items.forEach((item) => {
            const product = mockProducts.find((p) => p.id === item.productId);
            if (product) {
              product.stock += item.quantity;
            }
          });
          toast.success("Stock Updated", {
            description: `Received quantities have been added to inventory.`,
          });
        }

        toast.success("Purchase Order created", {
          description: `${data.referenceNo} has been created.`,
        });
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
    toast.success("Purchase Order deleted");
  };

  const handleGenerateBill = (order: PurchaseOrderFormData) => {
    if (order.status !== "Completed") {
      toast.error("Error", {
        description: "Bills can only be generated for completed orders.",
      });
      return;
    }

    toast.success("Bill Generated", {
      description: `A new bill has been created for ${order.referenceNo}. You can view it in the Bills section.`,
    });
    // In a real app, this would create a record in the /bills database
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">
            Manage goods received and inbound inventory shipments.
          </p>
        </div>
        <Button onClick={handleAddOrder} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Purchase
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Ref No or notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Completed", "Cancelled"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="text-xs"
            >
              {status}
            </Button>
          ))}
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
                <TableHead>Ref No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
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
                    No purchase orders found.
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
                      <div className="flex items-center gap-2">
                        <span>{getSupplierName(order.supplierId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <PackageCheck className="h-4 w-4" />
                        <span>
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          units ({order.items.length} diff. items)
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
                          title="Generate Bill"
                          className={cn(
                            "text-primary hover:text-primary hover:bg-primary/10",
                            order.status !== "Completed" &&
                              "opacity-30 cursor-not-allowed",
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateBill(order);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Generate Bill</span>
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
      <PurchaseOrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        existingOrders={orders}
        suppliers={mockSuppliers}
        products={mockProducts as any} // Cast to any to bypass strict ProductFormData mismatch in demo
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
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this purchase order? This action
              cannot be undone. Stock quantities affected by this order will NOT
              be automatically reverted.
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
