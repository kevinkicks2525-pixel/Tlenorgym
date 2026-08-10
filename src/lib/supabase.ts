import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
