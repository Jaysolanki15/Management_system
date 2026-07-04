"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, ExternalLink, Phone, Plus, Trash2 } from "lucide-react";
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
import type { Shop } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { shopSchema, type ShopValues } from "@/lib/validation";

export function ShopsClient() {
  const supabase = useMemo(() => createClient(), []);
  const [shops, setShops] = useState<Shop[]>([]);
  const [city, setCity] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);
  const [deleting, setDeleting] = useState<Shop | null>(null);
  const form = useForm<ShopValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shop_name: "",
      owner_name: "",
      phone: "",
      alternate_phone: null,
      address: "",
      city: null,
      state: null,
      pincode: null,
      google_maps_link: null,
      gst_number: null,
      notes: null
    }
  });

  async function load() {
    const { data, error } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setShops(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(shops.map((shop) => shop.city).filter((item): item is string => Boolean(item))))],
    [shops]
  );
  const filtered = city === "All" ? shops : shops.filter((shop) => shop.city === city);

  function blank(): ShopValues {
    return {
      shop_name: "",
      owner_name: "",
      phone: "",
      alternate_phone: null,
      address: "",
      city: null,
      state: null,
      pincode: null,
      google_maps_link: null,
      gst_number: null,
      notes: null
    };
  }

  function startAdd() {
    setEditing(null);
    form.reset(blank());
    setOpen(true);
  }

  function startEdit(shop: Shop) {
    setEditing(shop);
    form.reset({
      shop_name: shop.shop_name,
      owner_name: shop.owner_name,
      phone: shop.phone,
      alternate_phone: shop.alternate_phone,
      address: shop.address,
      city: shop.city,
      state: shop.state,
      pincode: shop.pincode,
      google_maps_link: shop.google_maps_link,
      gst_number: shop.gst_number,
      notes: shop.notes
    });
    setOpen(true);
  }

  async function submit(values: ShopValues) {
    const result = editing
      ? await supabase.from("shops").update(values).eq("id", editing.id)
      : await supabase.from("shops").insert(values);

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
    const { error } = await supabase.from("shops").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Successfully Deleted");
      setDeleting(null);
      await load();
    }
  }

  const columns: ColumnDef<Shop>[] = [
    { accessorKey: "shop_name", header: "Shop" },
    { accessorKey: "owner_name", header: "Owner" },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <a className="inline-flex items-center gap-2 font-medium text-primary" href={`tel:${row.original.phone}`}>
          <Phone className="h-4 w-4" />
          {row.original.phone}
        </a>
      )
    },
    { accessorKey: "city", header: "City", cell: ({ row }) => row.original.city ?? "Not set" },
    {
      accessorKey: "google_maps_link",
      header: "Map",
      cell: ({ row }) =>
        row.original.google_maps_link ? (
          <a
            href={row.original.google_maps_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary"
          >
            Open <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          "Not set"
        )
    },
    { accessorKey: "created_at", header: "Created", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => startEdit(row.original)} aria-label="Edit shop">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleting(row.original)} aria-label="Delete shop">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Shops"
        description="Keep customer contacts, addresses, GST details, and delivery map links ready."
        action={
          <Button onClick={startAdd}>
            <Plus className="h-4 w-4" />
            Add Shop
          </Button>
        }
      />
      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Search shops..."
          emptyTitle="No shops found"
          emptyMessage="Add shop details so family members can call, locate, and manage customers quickly."
          exportName="shops.csv"
          exportColumns={[
            { key: "shop_name", label: "Shop Name" },
            { key: "owner_name", label: "Owner Name" },
            { key: "phone", label: "Phone" },
            { key: "alternate_phone", label: "Alternate Phone" },
            { key: "address", label: "Address" },
            { key: "city", label: "City" },
            { key: "state", label: "State" },
            { key: "pincode", label: "Pincode" },
            { key: "gst_number", label: "GST Number" },
            { key: "created_at", label: "Created Date" }
          ]}
          filter={
            <Select value={city} onChange={(event) => setCity(event.target.value)} className="w-40">
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          }
        />
      </Card>

      <FormPanel title={editing ? "Edit Shop" : "Add Shop"} open={open} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <Field label="Shop Name" required error={form.formState.errors.shop_name?.message}>
            <Input {...form.register("shop_name")} />
          </Field>
          <Field label="Owner Name" required error={form.formState.errors.owner_name?.message}>
            <Input {...form.register("owner_name")} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Phone Number" required error={form.formState.errors.phone?.message}>
              <Input inputMode="tel" {...form.register("phone")} />
            </Field>
            <Field label="Alternate Phone" error={form.formState.errors.alternate_phone?.message}>
              <Input inputMode="tel" {...form.register("alternate_phone")} />
            </Field>
          </div>
          <Field label="Address" required error={form.formState.errors.address?.message}>
            <Textarea {...form.register("address")} />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="City" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
            <Field label="State" error={form.formState.errors.state?.message}>
              <Input {...form.register("state")} />
            </Field>
            <Field label="Pincode" error={form.formState.errors.pincode?.message}>
              <Input {...form.register("pincode")} />
            </Field>
          </div>
          <Field label="Google Maps Link" error={form.formState.errors.google_maps_link?.message}>
            <Input {...form.register("google_maps_link")} />
          </Field>
          <Field label="GST Number" error={form.formState.errors.gst_number?.message}>
            <Input {...form.register("gst_number")} />
          </Field>
          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea {...form.register("notes")} />
          </Field>
          <Button type="submit">{editing ? "Update Shop" : "Add Shop"}</Button>
        </form>
      </FormPanel>

      <ConfirmDialog open={!!deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}
