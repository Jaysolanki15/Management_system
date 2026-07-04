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
import { expenseCategories, paymentMethods } from "@/lib/constants";
import type { Expense } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";
import { expenseSchema, type ExpenseValues } from "@/lib/validation";

export function ExpensesClient() {
  const supabase = useMemo(() => createClient(), []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState("All");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const form = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { name: "", category: "Other", amount: 0, expense_date: todayISO(), notes: null, payment_method: "Cash" }
  });

  async function load() {
    const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    if (error) toast.error(error.message);
    else setExpenses(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = expenses.filter((expense) => {
    const byCategory = category === "All" || expense.category === category;
    const byMonth = !month || expense.expense_date.startsWith(month);
    const byDate = !date || expense.expense_date === date;
    return byCategory && byMonth && byDate;
  });

  function startAdd() {
    setEditing(null);
    form.reset({ name: "", category: "Other", amount: 0, expense_date: todayISO(), notes: null, payment_method: "Cash" });
    setOpen(true);
  }

  function startEdit(expense: Expense) {
    setEditing(expense);
    form.reset({
      name: expense.name,
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date,
      notes: expense.notes,
      payment_method: expense.payment_method
    });
    setOpen(true);
  }

  async function submit(values: ExpenseValues) {
    const result = editing
      ? await supabase.from("expenses").update(values).eq("id", editing.id)
      : await supabase.from("expenses").insert(values);

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
    const { error } = await supabase.from("expenses").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Successfully Deleted");
      setDeleting(null);
      await load();
    }
  }

  const columns: ColumnDef<Expense>[] = [
    { accessorKey: "name", header: "Expense" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "expense_date", header: "Date", cell: ({ row }) => formatDate(row.original.expense_date) },
    { accessorKey: "payment_method", header: "Payment" },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => startEdit(row.original)} aria-label="Edit expense">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleting(row.original)} aria-label="Delete expense">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track raw materials, utilities, staff, transport, household, and other business costs."
        action={
          <Button onClick={startAdd}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />
      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Search expenses..."
          emptyTitle="No expenses found"
          emptyMessage="Record daily costs to keep dashboard analytics and profit reports accurate."
          exportName="expenses.csv"
          exportColumns={[
            { key: "name", label: "Expense Name" },
            { key: "category", label: "Category" },
            { key: "amount", label: "Amount" },
            { key: "expense_date", label: "Date" },
            { key: "payment_method", label: "Payment Method" },
            { key: "created_at", label: "Created Time" }
          ]}
          filter={
            <>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-40" />
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-40" />
              <Select value={category} onChange={(event) => setCategory(event.target.value)} className="w-44">
                <option value="All">All Categories</option>
                {expenseCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </>
          }
        />
      </Card>

      <FormPanel title={editing ? "Edit Expense" : "Add Expense"} open={open} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <Field label="Expense Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Category" required error={form.formState.errors.category?.message}>
              <Select {...form.register("category")}>
                {expenseCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Amount" required error={form.formState.errors.amount?.message}>
              <Input type="number" step="0.01" {...form.register("amount")} />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Date" required error={form.formState.errors.expense_date?.message}>
              <Input type="date" {...form.register("expense_date")} />
            </Field>
            <Field label="Payment Method" required error={form.formState.errors.payment_method?.message}>
              <Select {...form.register("payment_method")}>
                {paymentMethods.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea {...form.register("notes")} />
          </Field>
          <Button type="submit">{editing ? "Update Expense" : "Add Expense"}</Button>
        </form>
      </FormPanel>

      <ConfirmDialog open={!!deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}
