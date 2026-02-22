import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface BillFormData {
  id?: string;
  billNo: string;
  purchaseOrderId: string;
  poReference: string;
  supplierName: string;
  amount: number;
  paidAmount: number;
  date: Date;
  dueDate: Date;
  status: "Unpaid" | "Partially Paid" | "Paid";
  notes: string;
}

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillFormData | null;
  purchaseOrders: any[]; // Using any for demo simplicity, should match PurchaseOrderFormData
  suppliers: any[];
  onSave: (data: BillFormData) => void;
}

export function BillFormModal({
  isOpen,
  onClose,
  bill,
  purchaseOrders,
  suppliers,
  onSave,
}: BillFormModalProps) {
  const defaultFormData: BillFormData = {
    billNo: "",
    purchaseOrderId: "",
    poReference: "",
    supplierName: "",
    amount: 0,
    paidAmount: 0,
    date: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 30), // 30 days default
    status: "Unpaid",
    notes: "",
  };

  const [formData, setFormData] = useState<BillFormData>(defaultFormData);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);

  useEffect(() => {
    if (bill) {
      setFormData({ ...defaultFormData, ...bill });
      setNewPaymentAmount(0); // Reset new payment on bill change
    } else {
      // Auto-generate bill number for new bills
      const dateStr = format(new Date(), "yyyyMMdd");
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        ...defaultFormData,
        billNo: `BILL-${dateStr}-${randomStr}`,
      });
      setNewPaymentAmount(0);
    }
  }, [bill, isOpen]);

  const handlePurchaseOrderChange = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const supplier = suppliers.find((s) => s.id === po.supplierId);
      setFormData((prev) => ({
        ...prev,
        purchaseOrderId: po.id,
        poReference: po.referenceNo,
        supplierName: supplier?.shopName || "Unknown Supplier",
        amount: po.grandTotal || 0,
        paidAmount: 0, // Reset paid amount on PO change
      }));
    }
  };

  const handleStatusChange = (status: BillFormData["status"]) => {
    setFormData((prev) => ({ ...prev, status }));

    if (status === "Paid") {
      // Auto-fill Pay Now with the remaining due
      const due = Math.max(0, formData.amount - formData.paidAmount);
      setNewPaymentAmount(due);
    } else if (status === "Unpaid") {
      setNewPaymentAmount(0);
      setFormData((prev) => ({ ...prev, paidAmount: 0 }));
    }
  };

  const handleChange = (field: keyof BillFormData, value: any) => {
    setFormData((prev) => {
      let updatedValue = value;

      // Prevent negative values for amount fields
      if (
        (field === "amount" || field === "paidAmount") &&
        typeof value === "number"
      ) {
        updatedValue = Math.max(0, value);
      }

      const updated = { ...prev, [field]: updatedValue };

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for Purchase Order
    if (!formData.purchaseOrderId) {
      toast.error("Selection Required", {
        description:
          "Please select a related Purchase Order to record this bill.",
      });
      return;
    }

    // Validation/Auto-transition for Partial Payment
    let finalStatus = formData.status;
    const totalPaid = Math.min(
      formData.amount,
      formData.paidAmount + newPaymentAmount,
    );

    if (formData.status === "Partially Paid") {
      if (totalPaid <= 0) {
        toast.error("Invalid Amount", {
          description:
            "Total paid amount must be greater than 0 for partial payments.",
        });
        return;
      }

      // Auto-transition to Paid if fully settled
      if (totalPaid >= formData.amount) {
        finalStatus = "Paid";
        toast.info("Status Updated", {
          description: "Bill has been fully settled and status marked as Paid.",
        });
      }
    }

    if (formData.status === "Paid" && totalPaid < formData.amount) {
      toast.error("Insufficient Payment", {
        description: `Total payment (${formatCurrency(totalPaid)}) is less than bill amount. Use 'Partially Paid' status instead.`,
      });
      return;
    }

    onSave({
      ...formData,
      status: finalStatus,
      paidAmount: totalPaid,
    });
  };

  const formatCurrency = (value: number) => {
    const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(safeValue);
  };

  const handleRegenerateBillNo = () => {
    const dateStr = format(new Date(), "yyyyMMdd");
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    handleChange("billNo", `BILL-${dateStr}-${randomStr}`);
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block minus sign, plus sign, and 'e' (scientific notation)
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bill?.id ? `Edit Bill - ${formData.billNo}` : "Record Bill"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseOrder">Related Purchase Order</Label>
              <Select
                value={formData.purchaseOrderId}
                onValueChange={handlePurchaseOrderChange}
                disabled={!!bill?.id} // Disable if editing an existing bill
              >
                <SelectTrigger id="purchaseOrder">
                  <SelectValue placeholder="Select Purchase Order" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseOrders
                    .filter((po) => po.status === "Completed") // Only allow billing completed orders
                    .map((po) => (
                      <SelectItem key={po.id} value={po.id!}>
                        {po.referenceNo} (
                        {po.grandTotal.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                        )
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billNo">Bill Number</Label>
              <div className="flex gap-2">
                <Input
                  id="billNo"
                  value={formData.billNo}
                  readOnly
                  placeholder="e.g. BILL-2024-001"
                  required
                  className="flex-1 bg-muted cursor-not-allowed"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Regenerate Bill Number"
                  onClick={handleRegenerateBillNo}
                  className="shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Bill Amount
                </Label>
                <div className="text-2xl font-bold text-primary tabular-nums">
                  {formatCurrency(formData.amount)}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="space-y-1 text-right sm:text-left">
                  <Label className="text-muted-foreground text-[10px] uppercase">
                    Related PO
                  </Label>
                  <p className="text-sm font-semibold">
                    {formData.poReference || "N/A"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <Label className="text-muted-foreground text-[10px] uppercase">
                    Supplier
                  </Label>
                  <p className="text-sm font-semibold truncate max-w-[120px]">
                    {formData.supplierName || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bill Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        handleChange("date", date || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? (
                        format(formData.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) =>
                        handleChange("dueDate", date || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Payment Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) => handleStatusChange(val)}
                disabled={!formData.purchaseOrderId}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "Partially Paid" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Already Paid (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">
                        ₹
                      </span>
                      <Input
                        id="paidAmount"
                        type="number"
                        step="0.01"
                        value={formData.paidAmount || 0}
                        readOnly
                        className="pl-7 bg-muted/50 cursor-not-allowed text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newPayment"
                      className="text-primary font-bold"
                    >
                      Pay Now (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-medium text-xs">
                        ₹
                      </span>
                      <Input
                        id="newPayment"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPaymentAmount || ""}
                        autoFocus
                        onKeyDown={handleNumericKeyDown}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNewPaymentAmount(
                            isNaN(val) ? 0 : Math.max(0, val),
                          );
                        }}
                        placeholder="0"
                        className="pl-7 border-primary/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground italic">
                      Update Preview:
                    </p>
                    <p className="font-medium text-muted-foreground line-through">
                      Paid: {formatCurrency(formData.paidAmount)}
                    </p>
                    <p className="font-bold text-primary">
                      New Total Paid:{" "}
                      {formatCurrency(formData.paidAmount + newPaymentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-bold">
                      Remaining Due
                    </p>
                    <p
                      className={cn(
                        "text-lg font-black",
                        formData.amount -
                          (formData.paidAmount + newPaymentAmount) >
                          0
                          ? "text-destructive"
                          : "text-success-foreground",
                      )}
                    >
                      {formatCurrency(
                        Math.max(
                          0,
                          formData.amount -
                            (formData.paidAmount + newPaymentAmount),
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {bill?.id ? "Update Bill" : "Save Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
