# Application Architecture

SnackWorks is a Supabase-first Next.js application. The browser talks directly to Supabase using the anon key, and all authorization is enforced by Supabase Auth plus Row Level Security. There is no custom backend server.

## Folder Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components/app-shell.tsx`: authenticated shell, navigation, dark mode, and sign out.
- `src/components/auth`: Supabase Auth provider and sign-in/sign-up UI.
- `src/components/modules`: feature screens for dashboard, products, shops, expenses, and production.
- `src/components/ui`: shadcn-style primitives used across the app.
- `src/components/data`: reusable TanStack Table implementation with search, sorting, pagination, and CSV export.
- `src/lib`: typed Supabase client, validation schemas, constants, utilities, and database types.
- `supabase/migrations`: SQL schema, indexes, constraints, generated columns, triggers, and RLS policies.

## Database Schema

The database is normalized around four core tables:

- `products`: product catalog, wholesale price, pack weight, unit, status, and audit dates.
- `shops`: customers, owners, contact numbers, addresses, maps, GST, and notes.
- `expenses`: categorized expenses with amount, date, payment method, notes, and audit dates.
- `production`: daily production entries linked to products. The entered unit is preserved while `quantity_kg` is generated for consistent reporting.

Every table contains `user_id` linked to `auth.users(id)` with `on delete cascade`. Production references products with `on delete restrict` to protect historical records from accidental product deletion.

## Supabase API Interactions

The app uses `@supabase/ssr` browser clients in client components:

- `select("*")` for module lists.
- `insert({ ...values, user_id })` after Supabase Auth identifies the current user.
- `update(values).eq("id", id)` for edits.
- `delete().eq("id", id)` after confirmation dialogs.
- `production.select("*, products(name, wholesale_price)")` for reporting and readable tables.

RLS ensures users only read and mutate their own rows, even though the browser calls Supabase directly.

## UI Wireframes

Dashboard:

- Top header: page title, date preset selector, from/to date inputs.
- KPI grid: production, expenses, product count, shop count, production value.
- Chart grid: daily production trend, expense trend, expense breakdown, top products.
- Activity grid: latest production, latest expenses, newly added shops.

Module pages:

- Header: title, short description, primary add button.
- Toolbar: search input, module filters, CSV export.
- Table: sortable columns, pagination controls, responsive horizontal scroll.
- Slide-over form: required indicators, validation messages, save action.
- Delete dialog: irreversible action warning and explicit confirmation.

## Component Hierarchy

- `RootLayout`
- `ThemeProvider`
- `AppShell`
- `AuthProvider`
- `SignIn` or protected page
- `PageHeader`
- `Card`
- `DataTable`
- `FormPanel`
- `ConfirmDialog`
- module-specific React Hook Form controls

## UX Practices

- Primary actions are visible at the top right on desktop and remain reachable on mobile.
- Destructive actions always require confirmation.
- Every create, update, and delete action shows a toast.
- Empty states explain what to do next.
- Date fields use browser-native pickers for mobile friendliness.
- Tables support search, sort, pagination, and export without extra training.
- Dark mode uses semantic Tailwind tokens rather than one-off colors.

## Future Scalability

Recommended next modules:

- Sales billing linked to shops and products.
- Inventory and raw material stock with purchase records.
- Customer ledger, payment tracking, and outstanding dues.
- Profit and loss reports using production value, sales, and expenses.
- PDF invoices and WhatsApp order sharing.
- Barcode support for packaged products.
- Role-based access with profiles and policies for Admin, Manager, and Staff.
- Scheduled Supabase backups and storage exports.
