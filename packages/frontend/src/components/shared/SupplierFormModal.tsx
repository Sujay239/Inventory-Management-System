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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Dices } from "lucide-react";

export interface SupplierFormData {
  id?: string;
  shopName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  details: string;
  status: string; // "Active" | "Inactive"
}

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierFormData | null;
  existingSuppliers: SupplierFormData[];
  onSave: (data: SupplierFormData) => void;
  onDelete?: (id: string) => void;
}

const generateUniqueId = (existingSuppliers: SupplierFormData[]) => {
  let newId: string = "";
  let isUnique = false;
  while (!isUnique) {
    newId = `SUP-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
    isUnique = !existingSuppliers.find((s) => s.id === newId);
  }
  return newId;
};

const defaultFormData: SupplierFormData = {
  shopName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  details: "",
  status: "Active",
};

export function SupplierFormModal({
  isOpen,
  onClose,
  supplier,
  existingSuppliers,
  onSave,
  onDelete,
}: SupplierFormModalProps) {
  const [formData, setFormData] = useState<SupplierFormData>(defaultFormData);

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        ...defaultFormData,
        id: generateUniqueId(existingSuppliers),
      });
    }
  }, [supplier, isOpen, existingSuppliers]);

  const handleRegenerateId = () => {
    if (!supplier) {
      setFormData((prev) => ({
        ...prev,
        id: generateUniqueId(existingSuppliers),
      }));
    }
  };

  const handleChange = (field: keyof SupplierFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!supplier?.id;
  const isActive = formData.status === "Active";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor ID</Label>
              <div className="flex gap-2">
                <Input
                  id="vendorId"
                  value={formData.id || ""}
                  readOnly
                  className="bg-muted font-mono"
                  placeholder="Auto-generated ID"
                />
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRegenerateId}
                    title="Generate another ID"
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopName">Shop / Company Name</Label>
              <Input
                id="shopName"
                value={formData.shopName}
                onChange={(e) => handleChange("shopName", e.target.value)}
                placeholder="e.g. Acme Supplies Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Person Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contact@acme.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main St, City, ST 12345"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Other Details (Optional)</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => handleChange("details", e.target.value)}
                placeholder="Payment terms, special notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
            <Switch
              id="active-status"
              checked={isActive}
              onCheckedChange={(checked) =>
                handleChange("status", checked ? "Active" : "Inactive")
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="active-status" className="cursor-pointer">
                {isActive ? "Active Supplier" : "Inactive Supplier"}
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn off to hide from selection menus.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center w-full">
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
                  Delete
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
                {isEditing ? "Save Changes" : "Add Supplier"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
