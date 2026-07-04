"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DataTable } from "@/components/data/data-table";
import { FormPanel } from "@/components/form-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import type { Product } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { productSchema, type ProductValues } from "@/lib/validation";

export function ProductsClient() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", wholesale_price: 0, weight: 0, weight_unit: "GM", description: null, status: "Active" }
  });

  async function load() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProducts(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setEditing(null);
    form.reset({ name: "", wholesale_price: 0, weight: 0, weight_unit: "GM", description: null, status: "Active" });
    setOpen(true);
  }

  function startEdit(product: Product) {
    setEditing(product);
    form.reset({
      name: product.name,
      wholesale_price: product.wholesale_price,
      weight: product.weight,
      weight_unit: product.weight_unit,
      description: product.description,
      status: product.status
    });
    setOpen(true);
  }

  async function submit(values: ProductValues) {
    const result = editing
      ? await supabase.from("products").update(values).eq("id", editing.id)
      : await supabase.from("products").insert(values);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(editing ? "Successfully Updated" : "Successfully Added");
    setOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const { error } = await supabase.from("products").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Successfully Deleted");
      setDeleting(null);
      await load();
    }
  }

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Product" },
    { accessorKey: "wholesale_price", header: "Wholesale Price", cell: ({ row }) => formatCurrency(row.original.wholesale_price) },
    { accessorKey: "weight", header: "Weight", cell: ({ row }) => `${row.original.weight} ${row.original.weight_unit}` },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{row.original.status}</span>
      )
    },
    { accessorKey: "created_at", header: "Created", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => startEdit(row.original)} aria-label="Edit product">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleting(row.original)} aria-label="Delete product">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage product pricing, pack weight, descriptions, and active status."
        action={
          <Button onClick={startAdd}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />
      <Card className="p-4">
        <DataTable
          data={products}
          columns={columns}
          searchPlaceholder="Search products..."
          emptyTitle="No products yet"
          emptyMessage="Add your first product to start recording production."
          exportName="products.csv"
          exportColumns={[
            { key: "name", label: "Product Name" },
            { key: "wholesale_price", label: "Wholesale Price" },
            { key: "weight", label: "Weight" },
            { key: "weight_unit", label: "Weight Unit" },
            { key: "status", label: "Status" },
            { key: "created_at", label: "Created Date" }
          ]}
        />
      </Card>

      <FormPanel title={editing ? "Edit Product" : "Add Product"} open={open} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <Field label="Product Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Wholesale Price" required error={form.formState.errors.wholesale_price?.message}>
            <Input type="number" step="0.01" {...form.register("wholesale_price")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight" required error={form.formState.errors.weight?.message}>
              <Input type="number" step="0.001" {...form.register("weight")} />
            </Field>
            <Field label="Unit" required error={form.formState.errors.weight_unit?.message}>
              <Select {...form.register("weight_unit")}>
                <option value="KG">KG</option>
                <option value="GM">GM</option>
              </Select>
            </Field>
          </div>
          <Field label="Status" required error={form.formState.errors.status?.message}>
            <Select {...form.register("status")}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} />
          </Field>
          <Button type="submit">{editing ? "Update Product" : "Add Product"}</Button>
        </form>
      </FormPanel>

      <ConfirmDialog open={!!deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}
