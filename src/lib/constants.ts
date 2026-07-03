export const expenseCategories = [
  "Oil",
  "Gas",
  "Flour",
  "Salary",
  "Electricity",
  "Transport",
  "Maintenance",
  "Packaging",
  "Other",
  "Household"
] as const;

export const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Credit", "Other"] as const;
export const weightUnits = ["KG", "GM"] as const;
export const productStatuses = ["Active", "Inactive"] as const;

export type DatePreset = "today" | "week" | "month" | "lastMonth" | "custom";
