import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}

export function createSupabaseBrowserClientOrNull() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  return createSupabaseBrowserClient();
}
