import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Trash2,
  FileBadge,
  CreditCard,
} from "lucide-react";

import { mockPurchaseOrders, mockSuppliers } from "@/lib/mock-data";
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
import { BillFormModal, BillFormData } from "@/components/shared/BillFormModal";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Initial dummy bills
const initialBills: BillFormData[] = [
  {
    id: "bill-1",
    billNo: "BILL-2024-0001",
    purchaseOrderId: "po-init-1",
    poReference: "PO-00100",
    supplierName: "ElectroTech Traders",
    amount: 1425.0,
    paidAmount: 1425.0,
    date: new Date(Date.now() - 86400000 * 5),
    dueDate: new Date(Date.now() + 86400000 * 25),
    status: "Paid",
    notes: "Full payment done via Bank Transfer",
  },
  {
    id: "bill-2",
    billNo: "BILL-2024-0002",
    purchaseOrderId: "po-init-2",
    poReference: "PO-00101",
    supplierName: "Global Garments Inc.",
    amount: 450.75,
    paidAmount: 0,
    date: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 30),
    status: "Unpaid",
    notes: "",
  },
];

export function Bills() {
  const [bills, setBills] = useState<BillFormData[]>(initialBills);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillFormData | null>(null);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  // Filter Logic
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.poReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || bill.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, filterStatus]);

  // Helpers
  const formatCurrency = (value: number) => {
    const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(safeValue);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid":
        return "default";
      case "Partially Paid":
        return "secondary";
      case "Unpaid":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleAddBill = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };

  const handleEditBill = (bill: BillFormData) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleSaveBill = (data: BillFormData) => {
    if (data.id) {
      setBills((prev) => prev.map((b) => (b.id === data.id ? data : b)));
      toast.success("Bill updated successfully");
    } else {
      const newBill = { ...data, id: `bill-${Date.now()}` };
      setBills((prev) => [newBill, ...prev]);
      toast.success("Bill recorded successfully");
    }
    setIsModalOpen(false);
  };

  const handleDeleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    setBillToDelete(null);
    toast.success("Bill deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bills & Payments
          </h2>
          <p className="text-muted-foreground">
            Manage your payables and supplier invoices.
          </p>
        </div>
        <Button onClick={handleAddBill} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Bill
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bill, PO or supplier..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Unpaid", "Partially Paid", "Paid"].map((status) => (
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
      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No.</TableHead>
                <TableHead>PO Ref</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No bills found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {bill.billNo}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileBadge className="h-4 w-4" />
                        {bill.poReference}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {bill.supplierName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(bill.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bill.amount || 0)}
                    </TableCell>
                    <TableCell className="text-right text-success-foreground">
                      {formatCurrency(bill.paidAmount || 0)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-bold",
                        (bill.amount || 0) - (bill.paidAmount || 0) > 0
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatCurrency(
                        (bill.amount || 0) - (bill.paidAmount || 0),
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(bill.status)}
                        className="whitespace-nowrap"
                      >
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBill(bill)}
                        >
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Process payment</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setBillToDelete(bill.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete bill</span>
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

      <BillFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
        purchaseOrders={mockPurchaseOrders}
        suppliers={mockSuppliers}
        onSave={handleSaveBill}
      />

      <AlertDialog
        open={!!billToDelete}
        onOpenChange={(open) => !open && setBillToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill record? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (billToDelete) handleDeleteBill(billToDelete);
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
