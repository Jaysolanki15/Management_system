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
          weight_unit: Database["public"]["Enums"]["weight_unit"];
          description: string | null;
          status: Database["public"]["Enums"]["product_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          wholesale_price: number;
          weight: number;
          weight_unit?: Database["public"]["Enums"]["weight_unit"];
          description?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          wholesale_price?: number;
          weight?: number;
          weight_unit?: Database["public"]["Enums"]["weight_unit"];
          description?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          shop_name: string;
          owner_name: string;
          phone: string;
          alternate_phone?: string | null;
          address: string;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          google_maps_link?: string | null;
          gst_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          shop_name?: string;
          owner_name?: string;
          phone?: string;
          alternate_phone?: string | null;
          address?: string;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          google_maps_link?: string | null;
          gst_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: Database["public"]["Enums"]["expense_category"];
          amount: number;
          expense_date: string;
          notes: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: Database["public"]["Enums"]["expense_category"];
          amount: number;
          expense_date?: string;
          notes?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: Database["public"]["Enums"]["expense_category"];
          amount?: number;
          expense_date?: string;
          notes?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      production: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          production_date: string;
          quantity: number;
          unit: Database["public"]["Enums"]["weight_unit"];
          quantity_kg: number;
          notes: string | null;
          shift: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          production_date?: string;
          quantity: number;
          unit?: Database["public"]["Enums"]["weight_unit"];
          notes?: string | null;
          shift?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          production_date?: string;
          quantity?: number;
          unit?: Database["public"]["Enums"]["weight_unit"];
          notes?: string | null;
          shift?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "production_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      weight_unit: "KG" | "GM";
      product_status: "Active" | "Inactive";
      expense_category:
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
      payment_method: "Cash" | "UPI" | "Bank Transfer" | "Card" | "Credit" | "Other";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Shop = Database["public"]["Tables"]["shops"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Production = Database["public"]["Tables"]["production"]["Row"];
export type ExpenseCategory = Database["public"]["Enums"]["expense_category"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
