import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getNewArrivalsProductsFromDb(limit = 12) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("new_arrivals_products")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
