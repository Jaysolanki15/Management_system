import { z } from "zod";
import { expenseCategories, paymentMethods, productStatuses, weightUnits } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

const optionalText = z.string().trim().optional().transform((value) => value || null);
const positiveNumber = z.coerce.number({ invalid_type_error: "Enter a valid number" }).positive("Must be greater than 0");

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  wholesale_price: z.coerce.number().min(0, "Price cannot be negative"),
  weight: positiveNumber,
  weight_unit: z.enum(weightUnits),
  description: optionalText,
  status: z.enum(productStatuses)
});

export const shopSchema = z.object({
  shop_name: z.string().trim().min(2, "Shop name is required"),
  owner_name: z.string().trim().min(2, "Owner name is required"),
  phone: z.string().trim().regex(/^[0-9+ -]{7,16}$/, "Enter a valid phone number"),
  alternate_phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => !value || /^[0-9+ -]{7,16}$/.test(value), "Enter a valid alternate phone"),
  address: z.string().trim().min(4, "Address is required"),
  city: optionalText,
  state: optionalText,
  pincode: optionalText,
  google_maps_link: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => !value || /^https?:\/\//.test(value), "Use a valid link starting with http"),
  gst_number: optionalText,
  notes: optionalText
});

export const expenseSchema = z.object({
  name: z.string().trim().min(2, "Expense name is required"),
  category: z.enum(expenseCategories),
  amount: positiveNumber,
  expense_date: z.string().default(todayISO()),
  notes: optionalText,
  payment_method: z.enum(paymentMethods)
});

export const productionSchema = z.object({
  production_date: z.string().default(todayISO()),
  product_id: z.string().uuid("Select a product"),
  quantity: positiveNumber,
  unit: z.enum(weightUnits),
  notes: optionalText,
  shift: optionalText
});

export type ProductValues = z.infer<typeof productSchema>;
export type ShopValues = z.infer<typeof shopSchema>;
export type ExpenseValues = z.infer<typeof expenseSchema>;
export type ProductionValues = z.infer<typeof productionSchema>;
