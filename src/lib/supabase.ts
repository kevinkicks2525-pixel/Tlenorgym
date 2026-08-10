import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stcehnakpycchfliianc.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Y2VobmFreXBjY2hmbGlpYW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQwMDYsImV4cCI6MjA5ODkyMDAwNn0.zKEUctWgCbs_uON0w19rsW5EVN0R0ZqCQk2dwfNuS-c";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project.supabase.co"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to fetch products from Supabase
export async function getSupabaseProducts() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase fetch error:", err);
    return null;
  }
}

// Helper to add a product to Supabase
export async function addSupabaseProduct(product: {
  name: string;
  category: string;
  price: string;
  desc?: string;
  stock?: boolean;
  stock_quantity?: number;
  image?: string;
}) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([{
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.desc,
        stock: product.stock ?? true,
        stock_quantity: product.stock_quantity ?? 10,
        image_url: product.image,
      }])
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("Supabase insert error:", err);
    return null;
  }
}

// Helper to update product stock or info
export async function updateSupabaseProduct(id: number | string, updates: Record<string, unknown>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("Supabase update error:", err);
    return null;
  }
}

// Helper to delete product
export async function deleteSupabaseProduct(id: number | string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase delete error:", err);
    return false;
  }
}

// ── ORDERS HELPERS ─────────────────────────────────────────

export interface OrderItemData {
  id?: number | string;
  customer_name: string;
  phone: string;
  wilaya_code: string;
  wilaya_name: string;
  commune_name: string;
  address?: string;
  delivery_type: "home" | "office";
  product_name: string;
  product_price: string;
  delivery_cost: number;
  total_amount: number;
  status?: string;
  created_at?: string;
}

export async function createSupabaseOrder(order: OrderItemData) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert([{
        customer_name: order.customer_name,
        phone: order.phone,
        wilaya_code: order.wilaya_code,
        wilaya_name: order.wilaya_name,
        commune_name: order.commune_name,
        address: order.address || "Stopdesk / Bureau",
        delivery_type: order.delivery_type,
        product_name: order.product_name,
        product_price: order.product_price,
        delivery_cost: order.delivery_cost,
        total_amount: order.total_amount,
        status: order.status || "Nouvelle",
      }])
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("Supabase order insert error:", err);
    return null;
  }
}

export async function getSupabaseOrders() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase orders fetch error:", err);
    return null;
  }
}

export async function updateSupabaseOrderStatus(id: number | string, status: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("Supabase order status update error:", err);
    return null;
  }
}

export async function deleteSupabaseOrder(id: number | string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase order delete error:", err);
    return false;
  }
}

// ── CATEGORIES HELPERS ─────────────────────────────────────
export async function getSupabaseCategories() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase categories fetch error:", err);
    return null;
  }
}

export async function addSupabaseCategory(name: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("categories").insert([{ name }]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("Supabase category insert error:", err);
    return null;
  }
}

export async function deleteSupabaseCategory(id: number | string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase category delete error:", err);
    return false;
  }
}


