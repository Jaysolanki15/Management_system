"use client";

import { addDays, endOfMonth, format, isAfter, isBefore, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarDays, Factory, IndianRupee, PackageCheck, ReceiptText, Store } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { expenseCategories } from "@/lib/constants";
import type { Expense, Product, Production, Shop } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";

type ProductionRow = Production & {
  products: Pick<Product, "name" | "wholesale_price"> | null;
};

const colors = ["#147d64", "#f39c36", "#2879c8", "#d44b4b", "#7161ef", "#16a085", "#c27c0e", "#5d6d7e"];

export function DashboardClient() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [production, setProduction] = useState<ProductionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("month");
  const [from, setFrom] = useState(startOfMonth(new Date()).toISOString().slice(0, 10));
  const [to, setTo] = useState(todayISO());

  useEffect(() => {
    async function load() {
      const [productResult, shopResult, expenseResult, productionResult] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("shops").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
        supabase.from("production").select("*, products(name, wholesale_price)").order("production_date", { ascending: false })
      ]);
      for (const result of [productResult, shopResult, expenseResult, productionResult]) {
        if (result.error) toast.error(result.error.message);
      }
      setProducts(productResult.data ?? []);
      setShops(shopResult.data ?? []);
      setExpenses(expenseResult.data ?? []);
      setProduction((productionResult.data ?? []) as unknown as ProductionRow[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function setRange(value: string) {
    setPreset(value);
    const now = new Date();
    if (value === "today") {
      setFrom(todayISO());
      setTo(todayISO());
    }
    if (value === "week") {
      setFrom(format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"));
      setTo(todayISO());
    }
    if (value === "month") {
      setFrom(format(startOfMonth(now), "yyyy-MM-dd"));
      setTo(todayISO());
    }
    if (value === "lastMonth") {
      const lastMonth = subMonths(now, 1);
      setFrom(format(startOfMonth(lastMonth), "yyyy-MM-dd"));
      setTo(format(endOfMonth(lastMonth), "yyyy-MM-dd"));
    }
  }

  const rangeProduction = production.filter((row) => inRange(row.production_date, from, to));
  const rangeExpenses = expenses.filter((expense) => inRange(expense.expense_date, from, to));
  const todayProduction = production.filter((row) => row.production_date === todayISO()).reduce((sum, row) => sum + row.quantity_kg, 0);
  const totalProduction = rangeProduction.reduce((sum, row) => sum + row.quantity_kg, 0);
  const totalExpenses = rangeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses
    .filter((expense) => expense.expense_date.startsWith(format(new Date(), "yyyy-MM")))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const productionValue = rangeProduction.reduce(
    (sum, row) => sum + row.quantity_kg * Number(row.products?.wholesale_price ?? 0),
    0
  );

  const dailyProduction = groupByDate(rangeProduction, "production_date", "quantity_kg");
  const expenseTrend = groupByDate(rangeExpenses, "expense_date", "amount");
  const expenseBreakdown = expenseCategories
    .map((category) => ({
      name: category,
      value: rangeExpenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)
    }))
    .filter((item) => item.value > 0);
  const topProducts = Array.from(
    rangeProduction.reduce((map, row) => {
      const key = row.products?.name ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + row.quantity_kg);
      return map;
    }, new Map<string, number>())
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const recentProduction = production.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const recentShops = shops.slice(0, 5);

  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Daily production, expenses, customers, and business health in one view." />
      <div className="mb-5 flex flex-wrap gap-2">
        <Select value={preset} onChange={(event) => setRange(event.target.value)} className="w-44">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
        </Select>
        <Input type="date" value={from} onChange={(event) => { setPreset("custom"); setFrom(event.target.value); }} className="w-40" />
        <Input type="date" value={to} onChange={(event) => { setPreset("custom"); setTo(event.target.value); }} className="w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Today's Production" value={`${todayProduction.toFixed(2)} KG`} icon={<Factory />} />
        <Kpi title="Total Production" value={`${totalProduction.toFixed(2)} KG`} icon={<PackageCheck />} />
        <Kpi title="Total Expenses" value={formatCurrency(totalExpenses)} icon={<ReceiptText />} />
        <Kpi title="Monthly Expenses" value={formatCurrency(monthlyExpenses)} icon={<CalendarDays />} />
        <Kpi title="Number of Products" value={String(products.length)} icon={<PackageCheck />} />
        <Kpi title="Number of Shops" value={String(shops.length)} icon={<Store />} />
        <Kpi title="Production Value" value={formatCurrency(productionValue)} icon={<IndianRupee />} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Daily Production Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#147d64" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Expense Trend">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f39c36" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Expense Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={expenseBreakdown} dataKey="value" nameKey="name" outerRadius={100} label>
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top Produced Products">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2879c8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Activity title="Latest Productions" items={recentProduction.map((row) => `${row.products?.name ?? "Product"} - ${row.quantity} ${row.unit}`)} />
        <Activity title="Latest Expenses" items={recentExpenses.map((expense) => `${expense.name} - ${formatCurrency(expense.amount)}`)} />
        <Activity title="Newly Added Shops" items={recentShops.map((shop) => `${shop.shop_name} - ${shop.owner_name}`)} />
      </div>
    </>
  );
}

function Kpi({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Activity({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="grid gap-3">
            {items.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-md bg-muted px-3 py-2 text-sm">
                {item}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function inRange(value: string, from: string, to: string) {
  const date = new Date(value);
  return !isBefore(date, new Date(from)) && !isAfter(date, addDays(new Date(to), 1));
}

function groupByDate<T extends Record<string, unknown>>(rows: T[], dateKey: keyof T, valueKey: keyof T) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const label = formatDate(String(row[dateKey]));
    map.set(label, (map.get(label) ?? 0) + Number(row[valueKey] ?? 0));
  });
  return Array.from(map).map(([name, value]) => ({ name, value }));
}
