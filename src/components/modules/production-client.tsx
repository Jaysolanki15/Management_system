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
import type { Product, Production } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { formatDate, todayISO } from "@/lib/utils";
import { productionSchema, type ProductionValues } from "@/lib/validation";

type ProductionRow = Production & {
  products: Pick<Product, "name" | "wholesale_price"> | null;
};

export function ProductionClient() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ProductionRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionRow | null>(null);
  const [deleting, setDeleting] = useState<ProductionRow | null>(null);
  const form = useForm<ProductionValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: { production_date: todayISO(), product_id: "", quantity: 0, unit: "KG", notes: null, shift: null }
  });

  async function load() {
    const [productionResult, productResult] = await Promise.all([
      supabase.from("production").select("*, products(name, wholesale_price)").order("production_date", { ascending: false }),
      supabase.from("products").select("*").order("name")
    ]);
    if (productionResult.error) toast.error(productionResult.error.message);
    else setRows((productionResult.data ?? []) as unknown as ProductionRow[]);
    if (productResult.error) toast.error(productResult.error.message);
    else setProducts(productResult.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((row) => {
    const byMonth = !month || row.production_date.startsWith(month);
    const byDate = !date || row.production_date === date;
    return byMonth && byDate;
  });

  function startAdd() {
    setEditing(null);
    form.reset({
      production_date: todayISO(),
      product_id: products[0]?.id ?? "",
      quantity: 0,
      unit: "KG",
      notes: null,
      shift: null
    });
    setOpen(true);
  }

  function startEdit(row: ProductionRow) {
    setEditing(row);
    form.reset({
      production_date: row.production_date,
      product_id: row.product_id,
      quantity: row.quantity,
      unit: row.unit,
      notes: row.notes,
      shift: row.shift
    });
    setOpen(true);
  }

  async function submit(values: ProductionValues) {
    const result = editing
      ? await supabase.from("production").update(values).eq("id", editing.id)
      : await supabase.from("production").insert(values);

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
    const { error } = await supabase.from("production").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Successfully Deleted");
      setDeleting(null);
      await load();
    }
  }

  const columns: ColumnDef<ProductionRow>[] = [
    { accessorKey: "production_date", header: "Date", cell: ({ row }) => formatDate(row.original.production_date) },
    { accessorKey: "products.name", header: "Product", cell: ({ row }) => row.original.products?.name ?? "Deleted product" },
    { accessorKey: "quantity", header: "Entered Quantity", cell: ({ row }) => `${row.original.quantity} ${row.original.unit}` },
    { accessorKey: "quantity_kg", header: "Stored KG", cell: ({ row }) => `${Number(row.original.quantity_kg).toFixed(3)} KG` },
    { accessorKey: "shift", header: "Shift", cell: ({ row }) => row.original.shift ?? "Not set" },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => startEdit(row.original)} aria-label="Edit production">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleting(row.original)} aria-label="Delete production">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Production"
        description="Record daily batches quickly from mobile or desktop while preserving KG and GM entries."
        action={
          <Button onClick={startAdd} disabled={products.length === 0}>
            <Plus className="h-4 w-4" />
            Add Production
          </Button>
        }
      />
      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Search production..."
          emptyTitle={products.length === 0 ? "Add products first" : "No production found"}
          emptyMessage={
            products.length === 0
              ? "Production entries need a product. Add active products before recording daily batches."
              : "Record today's manufacturing output to keep analytics current."
          }
          exportName="production.csv"
          exportColumns={[
            { key: "production_date", label: "Production Date" },
            { key: "product_id", label: "Product ID" },
            { key: "quantity", label: "Quantity" },
            { key: "unit", label: "Unit" },
            { key: "quantity_kg", label: "Quantity KG" },
            { key: "shift", label: "Shift" },
            { key: "created_at", label: "Created Time" }
          ]}
          filter={
            <>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-40" />
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-40" />
            </>
          }
        />
      </Card>

      <FormPanel title={editing ? "Edit Production" : "Add Production"} open={open} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <Field label="Production Date" required error={form.formState.errors.production_date?.message}>
            <Input type="date" {...form.register("production_date")} />
          </Field>
          <Field label="Product" required error={form.formState.errors.product_id?.message}>
            <Select {...form.register("product_id")}>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" required error={form.formState.errors.quantity?.message}>
              <Input type="number" step="0.001" inputMode="decimal" {...form.register("quantity")} />
            </Field>
            <Field label="Unit" required error={form.formState.errors.unit?.message}>
              <Select {...form.register("unit")}>
                <option value="KG">KG</option>
                <option value="GM">GM</option>
              </Select>
            </Field>
          </div>
          <Field label="Shift" error={form.formState.errors.shift?.message}>
            <Input placeholder="Morning, Evening, Night" {...form.register("shift")} />
          </Field>
          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea {...form.register("notes")} />
          </Field>
          <Button type="submit">{editing ? "Update Production" : "Add Production"}</Button>
        </form>
      </FormPanel>

      <ConfirmDialog open={!!deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}
