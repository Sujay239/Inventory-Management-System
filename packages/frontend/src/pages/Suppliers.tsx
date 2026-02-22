import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Edit,
  Mail,
  Phone,
  MapPin,
  Trash2,
} from "lucide-react";
import { mockSuppliers } from "@/lib/mock-data";
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
  SupplierFormModal,
  SupplierFormData,
} from "@/components/shared/SupplierFormModal";
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

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<SupplierFormData[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierFormData | null>(null);

  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  // Filter suppliers based on search and status
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      // Search matching (shop name, contact name, or email)
      const matchesSearch =
        supplier.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Status matching
      const matchesStatus =
        statusFilter === "all" || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: SupplierFormData) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (data: SupplierFormData) => {
    try {
      if (data.id) {
        // Edit existing
        setSuppliers((prev) => prev.map((s) => (s.id === data.id ? data : s)));
        toast.success("Supplier updated successfully", {
          description: `${data.shopName} has been updated.`,
        });
      } else {
        // Add new
        const newSupplier = {
          ...data,
          // ID is now generated inside the Modal form state directly
        };
        setSuppliers((prev) => [newSupplier, ...prev]);
        toast.success("Supplier added successfully", {
          description: `${data.shopName} is now a registered supplier.`,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save supplier", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleDeleteSupplier = (id: string) => {
    try {
      const supplier = suppliers.find((s) => s.id === id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setIsModalOpen(false);
      setSupplierToDelete(null);
      toast.success("Supplier removed", {
        description: `${supplier?.shopName || "Vendor"} has been deleted.`,
      });
    } catch (error) {
      toast.error("Failed to delete supplier", {
        description: "Could not remove the vendor. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-muted-foreground">
            Manage your vendors and order fulfillment contacts.
          </p>
        </div>
        <Button className="shrink-0 gap-2" onClick={handleAddSupplier}>
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by shop or contact..."
            className="pl-9 w-full bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 sm:ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary (Optional Extra Polish) */}
      {(searchTerm || statusFilter !== "all") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Found {filteredSuppliers.length} result
            {filteredSuppliers.length === 1 ? "" : "s"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-primary hover:bg-transparent hover:underline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[100px]">Vendor ID</TableHead>
                <TableHead className="min-w-[200px]">Shop Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No suppliers found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="group cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {supplier.id}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{supplier.shopName}</span>
                      {supplier.details && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {supplier.details}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{supplier.contactName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${supplier.email}`}>
                            {supplier.email}
                          </a>
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                          <Phone className="h-3 w-3 shrink-0" />
                          <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
                        </span>
                        {supplier.address && (
                          <span className="flex items-start gap-1.5 mt-1">
                            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {supplier.address}
                            </span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(supplier.status)}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSupplier(supplier);
                          }}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Edit supplier</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSupplierToDelete(supplier.id!);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete supplier</span>
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

      {/* Add / Edit Supplier Modal */}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={selectedSupplier}
        existingSuppliers={suppliers}
        onSave={handleSaveSupplier}
        onDelete={(id) => setSupplierToDelete(id)}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!supplierToDelete}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolute sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the supplier from your records. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (supplierToDelete) handleDeleteSupplier(supplierToDelete);
              }}
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
