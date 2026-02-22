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
import {
  Dialog as NestedDialog,
  DialogContent as NestedDialogContent,
  DialogHeader as NestedDialogHeader,
  DialogTitle as NestedDialogTitle,
  DialogFooter as NestedDialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Plus, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export interface ProductFormData {
  id?: string;
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  image?: string;
  unitType: string;
  minStock: number;
  status: string; // "Active" | "Low Stock" | "Out of Stock" (derived from active switch and stock)
  isActive: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductFormData | null;
  onSave: (data: ProductFormData) => void;
  onDelete?: (id: string) => void;
}

const defaultFormData: ProductFormData = {
  name: "",
  category: "",
  sku: "",
  costPrice: 0,
  sellingPrice: 0,
  stock: 0,
  unitType: "pcs",
  minStock: 10,
  status: "Active",
  isActive: true,
};

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
  ]);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        isActive: product.status !== "Inactive",
      });
      if (product.category && !availableCategories.includes(product.category)) {
        setAvailableCategories((prev) => [...prev, product.category]);
      }
    } else {
      setFormData(defaultFormData);
    }
  }, [product, isOpen]);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block minus sign, plus sign, and 'e' (scientific notation)
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => {
      let updatedValue = value;

      // Prevent negative values for amount fields
      if (
        (field === "costPrice" ||
          field === "sellingPrice" ||
          field === "stock" ||
          field === "minStock") &&
        typeof value === "number"
      ) {
        updatedValue = Math.max(0, value);
      }

      return { ...prev, [field]: updatedValue };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-calculate status based on logic
    let calculatedStatus = formData.isActive ? "Active" : "Inactive";
    if (formData.isActive && formData.stock === 0)
      calculatedStatus = "Out of Stock";
    else if (formData.isActive && formData.stock <= formData.minStock)
      calculatedStatus = "Low Stock";

    onSave({
      ...formData,
      status: calculatedStatus,
    });
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCategory.trim()) {
      const newCat = customCategory.trim();
      setAvailableCategories((prev) => [...prev, newCat]);
      handleChange("category", newCat);
      toast.success("New category added", {
        description: `"${newCat}" is now added to the dropdown and selected.`,
      });
    }
    setCustomCategory("");
    setIsCategoryModalOpen(false);
  };

  const isEditing = !!product?.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Wireless Headphones"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sku">SKU / Barcode</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="e.g. WH-1000XM5"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category">Category</Label>

              <div className="flex gap-2">
                <Select
                  value={formData.category}
                  onValueChange={(val) => handleChange("category", val)}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setIsCategoryModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add new category</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new category</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₹)</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice || ""}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  handleChange("costPrice", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.sellingPrice || ""}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  handleChange("sellingPrice", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock || ""}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  handleChange("stock", parseInt(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock Level</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock || ""}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  handleChange("minStock", parseInt(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type</Label>
              <Select
                value={formData.unitType}
                onValueChange={(val) => handleChange("unitType", val)}
              >
                <SelectTrigger id="unitType">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="ltr">Liters (ltr)</SelectItem>
                  <SelectItem value="ml">Milliliters (ml)</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  <SelectItem value="m">Meters (m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t">
            <h3 className="text-sm font-medium">Product Image</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <Label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
                >
                  <span className="flex items-center space-x-2 text-muted-foreground">
                    <UploadCloud className="w-6 h-6" />
                    <span className="font-medium text-sm">
                      Click to browse or drop an image
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground mt-2">
                    SVG, PNG, JPG or GIF (max. 2MB)
                  </span>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleChange("image", URL.createObjectURL(file));
                      }
                    }}
                  />
                </Label>
              </div>

              <div className="h-32 w-32 shrink-0 rounded-md border border-border overflow-hidden bg-muted/30 flex items-center justify-center shadow-sm">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <span className="text-xs font-medium">No image</span>
                    <span className="text-[10px]">Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active Product
            </Label>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto self-start sm:self-auto"
                onClick={() => onDelete(formData.id!)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            ) : (
              <div /> // Placeholder for spacing
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Nested custom category modal */}
      <NestedDialog
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
      >
        <NestedDialogContent className="sm:max-w-[400px]">
          <NestedDialogHeader>
            <NestedDialogTitle>Add New Category</NestedDialogTitle>
          </NestedDialogHeader>
          <form onSubmit={handleAddCustomCategory} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newCategory">Category Name</Label>
              <Input
                id="newCategory"
                placeholder="e.g. Home Appliances"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                autoFocus
              />
            </div>
            <NestedDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </NestedDialogFooter>
          </form>
        </NestedDialogContent>
      </NestedDialog>
    </Dialog>
  );
}
