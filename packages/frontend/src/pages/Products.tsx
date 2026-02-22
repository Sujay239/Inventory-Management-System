import { useState, useMemo } from "react";
import { Search, Plus, SlidersHorizontal, Edit, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductFormModal,
  ProductFormData,
} from "@/components/shared/ProductFormModal";
import { toast } from "sonner";
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

// Normalize mock data to match formData structure for the example
const initialProducts: ProductFormData[] = mockProducts.map((p) => ({
  ...p,
  isActive: p.isActive,
}));

export function Products() {
  const [products, setProducts] = useState<ProductFormData[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductFormData | null>(null);

  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return Array.from(list);
  }, [products]);

  // Filter products based on search and dropdowns
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search matching (name or sku)
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Category matching
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      // Status matching
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Low Stock":
        return "secondary";
      case "Out of Stock":
      case "Inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductFormData) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (data: ProductFormData) => {
    try {
      if (data.id) {
        // Edit existing
        setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        toast.success("Product updated successfully", {
          description: `${data.name} has been updated.`,
        });
      } else {
        // Add new
        const newProduct = {
          ...data,
          id: `P-${Math.floor(Math.random() * 10000)}`, // Dummy ID gen
        };
        setProducts((prev) => [newProduct, ...prev]);
        toast.success("Product added successfully", {
          description: `${data.name} has been added to inventory.`,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save product", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setIsModalOpen(false);
      setProductToDelete(null);
      toast.success("Product deleted", {
        description: `${product?.name || "Item"} has been removed.`,
      });
    } catch (error) {
      toast.error("Failed to delete product", {
        description: "Could not remove the item. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your inventory, prices, and stock levels.
          </p>
        </div>
        <Button className="shrink-0 gap-2" onClick={handleAddProduct}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-9 w-full bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto flex-1 sm:flex-none items-center gap-4 sm:ml-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden lg:block" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px] whitespace-nowrap">
                  SKU
                </TableHead>
                <TableHead className="min-w-[200px]">Product Name</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Price
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Stock
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          product.stock === 0
                            ? "text-destructive font-bold"
                            : product.stock <= product.minStock
                              ? "text-amber-500 font-bold"
                              : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Product</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setProductToDelete(product.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete Product</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No products found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
          <span>Showing {filteredProducts.length} results</span>
          {searchTerm || categoryFilter !== "all" || statusFilter !== "all" ? (
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear all filters
            </Button>
          ) : null}
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
        onDelete={(id) => {
          setIsModalOpen(false);
          setProductToDelete(id);
        }}
      />

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                productToDelete && handleDeleteProduct(productToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
