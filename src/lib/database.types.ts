export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          wholesale_price: number;
          weight: number;
          weight_unit: "KG" | "GM";
          description: string | null;
          status: "Active" | "Inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      shops: {
        Row: {
          id: string;
          user_id: string;
          shop_name: string;
          owner_name: string;
          phone: string;
          alternate_phone: string | null;
          address: string;
          city: string | null;
          state: string | null;
          pincode: string | null;
          google_maps_link: string | null;
          gst_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["shops"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shops"]["Insert"]>;
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: ExpenseCategory;
          amount: number;
          expense_date: string;
          notes: string | null;
          payment_method: PaymentMethod;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["expenses"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
      };
      production: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          production_date: string;
          quantity: number;
          unit: "KG" | "GM";
          quantity_kg: number;
          notes: string | null;
          shift: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["production"]["Row"], "id" | "created_at" | "updated_at" | "quantity_kg"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["production"]["Insert"]>;
      };
    };
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Shop = Database["public"]["Tables"]["shops"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Production = Database["public"]["Tables"]["production"]["Row"];
export type ExpenseCategory =
  | "Oil"
  | "Gas"
  | "Flour"
  | "Salary"
  | "Electricity"
  | "Transport"
  | "Maintenance"
  | "Packaging"
  | "Other"
  | "Household";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Card" | "Credit" | "Other";
