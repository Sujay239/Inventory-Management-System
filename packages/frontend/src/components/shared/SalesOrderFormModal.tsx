import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2, Dices } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormData } from "./ProductFormModal";

// --- Types ---

export interface CustomerFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

export interface SalesOrderItem {
  id: string; // unique literal id for the row
  productId: string;
  quantity: number;
  sellingPrice: number;
  total: number;
}

export interface SalesOrderFormData {
  id?: string;
  referenceNo: string;
  date: Date;
  customerName: string; // Optional free-text name
  items: SalesOrderItem[];
  notes: string;
  status: "Pending" | "Shipped" | "Completed" | "Cancelled";
  subTotal: number;
  gstPercentage?: number;
  gstAmount: number;
  grandTotal: number;
}

interface SalesOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrderFormData | null;
  existingOrders: SalesOrderFormData[];
  products: ProductFormData[];
  onSave: (data: SalesOrderFormData) => void;
  onDelete?: (id: string) => void;
}

// --- Utils ---

const generateUniqueRef = (existingOrders: SalesOrderFormData[]) => {
  let newRef = "";
  let isUnique = false;
  while (!isUnique) {
    newRef = `SO-${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0")}`;
    isUnique = !existingOrders.find((o) => o.referenceNo === newRef);
  }
  return newRef;
};

const generateRowId = () => Math.random().toString(36).substr(2, 9);

export function SalesOrderFormModal({
  isOpen,
  onClose,
  order,
  existingOrders,
  products,
  onSave,
  onDelete,
}: SalesOrderFormModalProps) {
  const defaultFormData: SalesOrderFormData = {
    referenceNo: "",
    date: new Date(),
    customerName: "",
    items: [],
    notes: "",
    status: "Pending",
    subTotal: 0,
    gstPercentage: 0,
    gstAmount: 0,
    grandTotal: 0,
  };

  const [formData, setFormData] = useState<SalesOrderFormData>(defaultFormData);

  // Initialize form
  useEffect(() => {
    if (order) {
      setFormData(order);
    } else {
      setFormData({
        ...defaultFormData,
        referenceNo: generateUniqueRef(existingOrders),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, isOpen, existingOrders]);

  const isEditing = !!order?.id;

  // --- Handlers ---

  const handleRegenerateRef = () => {
    if (!order) {
      setFormData((prev) => ({
        ...prev,
        referenceNo: generateUniqueRef(existingOrders),
      }));
    }
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block minus sign, plus sign, and 'e' (scientific notation)
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (
    field: keyof SalesOrderFormData,
    value:
      | string
      | Date
      | SalesOrderItem[]
      | number
      | "Pending"
      | "Shipped"
      | "Completed"
      | "Cancelled",
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: generateRowId(),
          productId: "",
          quantity: 1,
          sellingPrice: 0,
          total: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (rowId: string) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((item) => item.id !== rowId);
      const newSubTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const newGstAmount = prev.gstPercentage
        ? (newSubTotal * prev.gstPercentage) / 100
        : 0;
      const newGrandTotal = newSubTotal + newGstAmount;
      return {
        ...prev,
        items: newItems,
        subTotal: newSubTotal,
        gstAmount: newGstAmount,
        grandTotal: newGrandTotal,
      };
    });
  };

  const handleItemChange = (
    rowId: string,
    field: keyof SalesOrderItem,
    value: string | number,
  ) => {
    setFormData((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.id === rowId) {
          let updatedValue = value;
          if (typeof value === "number") {
            updatedValue = Math.max(0, value);
          }
          const updatedItem = { ...item, [field]: updatedValue };

          // If product changes, auto-fill its selling price
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updatedItem.sellingPrice = product.sellingPrice;
            }
          }

          // Recalculate row total
          if (
            field === "quantity" ||
            field === "sellingPrice" ||
            field === "productId"
          ) {
            updatedItem.total = updatedItem.quantity * updatedItem.sellingPrice;
          }

          return updatedItem;
        }
        return item;
      });

      // Recalculate totals
      const newSubTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const newGstAmount = prev.gstPercentage
        ? (newSubTotal * prev.gstPercentage) / 100
        : 0;
      const newGrandTotal = newSubTotal + newGstAmount;

      return {
        ...prev,
        items: newItems,
        subTotal: newSubTotal,
        gstAmount: newGstAmount,
        grandTotal: newGrandTotal,
      };
    });
  };

  const handleGstChange = (valStr: string) => {
    const val = parseFloat(valStr);
    const gstPerc = isNaN(val) ? 0 : Math.max(0, val);
    setFormData((prev) => {
      const gstAmount = (prev.subTotal * gstPerc) / 100;
      return {
        ...prev,
        gstPercentage: gstPerc,
        gstAmount: gstAmount,
        grandTotal: prev.subTotal + gstAmount,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto w-11/12">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Edit Sales Order - ${formData.referenceNo}`
              : "New Sales Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* Top Level Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="Walk-in Customer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Sales Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
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
                    onSelect={(date: Date | undefined) =>
                      date && handleChange("date", date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refNo">Invoice / Ref No.</Label>
              <div className="flex gap-2">
                <Input
                  id="refNo"
                  value={formData.referenceNo}
                  onChange={(e) => handleChange("referenceNo", e.target.value)}
                  className="bg-muted font-mono"
                  placeholder="SO-00000"
                  required
                />
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRegenerateRef}
                    title="Generate another Ref"
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => handleChange("status", val)}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label htmlFor="gst">GST (%) (Optional)</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Leave blank or '0' if GST is already included in the Unit
                  Price.
                </p>
              </div>
              <Input
                id="gst"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 18"
                value={formData.gstPercentage || ""}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) => handleGstChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Shipping details, special requests, etc."
                rows={2}
              />
            </div>
          </div>

          {/* Dynamic Product List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Order Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center p-8 bg-muted/30 border border-dashed rounded-lg text-muted-foreground text-sm">
                No items added yet. Click "Add Item" to start.
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium p-3">Product</th>
                      <th className="text-left font-medium p-3 w-24">Qty</th>
                      <th className="text-left font-medium p-3 w-32">
                        Selling Price
                      </th>
                      <th className="text-right font-medium p-3 w-32">Total</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formData.items.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId,
                      );
                      const isLowStock =
                        product && product.stock < item.quantity;

                      return (
                        <tr key={item.id} className="group hover:bg-muted/10">
                          <td className="p-2 align-top">
                            <div className="space-y-1">
                              <Select
                                value={item.productId}
                                onValueChange={(val) =>
                                  handleItemChange(item.id, "productId", val)
                                }
                              >
                                <SelectTrigger className="h-9 border-none bg-transparent hover:bg-muted/50 focus:ring-0">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((p) => (
                                    <SelectItem
                                      key={p.id}
                                      value={p.id || "unknown"}
                                    >
                                      {p.name}{" "}
                                      <span className="text-muted-foreground ml-2 text-xs">
                                        ({p.sku}) - {p.stock} in stock
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {isLowStock && (
                                <p className="text-[0.7rem] text-destructive px-3 font-medium">
                                  Warning: Only {product.stock} available.
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity || ""}
                              onKeyDown={handleNumericKeyDown}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "quantity",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className={cn(
                                "h-9",
                                isLowStock &&
                                  "border-destructive focus-visible:ring-destructive",
                              )}
                              required
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.sellingPrice || ""}
                              onKeyDown={handleNumericKeyDown}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "sellingPrice",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="h-9"
                              required
                            />
                          </td>
                          <td className="p-3 align-top text-right font-medium tabular-nums px-4">
                            ₹{item.total.toFixed(2)}
                          </td>
                          <td className="p-2 align-top text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr>
                      <td
                        colSpan={3}
                        className="p-3 text-right font-medium text-muted-foreground border-b hidden sm:table-cell"
                      >
                        Subtotal:
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums px-4 border-b">
                        <span className="sm:hidden text-muted-foreground mr-2">
                          Subtotal:
                        </span>
                        ₹{(formData.subTotal || 0).toFixed(2)}
                      </td>
                      <td className="border-b hidden sm:table-cell"></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="p-3 text-right font-medium text-muted-foreground border-b hidden sm:table-cell"
                      >
                        GST ({formData.gstPercentage || 0}%):
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums px-4 border-b text-muted-foreground">
                        <span className="sm:hidden text-muted-foreground mr-2">
                          GST:
                        </span>
                        + ₹{(formData.gstAmount || 0).toFixed(2)}
                      </td>
                      <td className="border-b hidden sm:table-cell"></td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td
                        colSpan={3}
                        className="p-3 text-right font-bold hidden sm:table-cell"
                      >
                        Grand Total:
                      </td>
                      <td className="p-3 text-right font-bold text-lg tabular-nums px-4">
                        <span className="sm:hidden mr-2">Total:</span>₹
                        {(formData.grandTotal || 0).toFixed(2)}
                      </td>
                      <td className="hidden sm:table-cell"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center w-full pt-4 border-t">
            <div>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => formData.id && onDelete(formData.id)}
                  className="w-full sm:w-auto gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Order
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none">
                {isEditing ? "Save Changes" : "Save Entry"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
