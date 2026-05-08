const requiredPublicEnv = ["NEXT_PUBLIC_SUPABASE_URL"] as const;
const fallbackSupabaseUrl = "https://neulwoixeulilnolebqj.supabase.co";

const requiredServerEnv = ["SUPABASE_SERVICE_ROLE_KEY"] as const;

function getMissingEnv(keys: readonly string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function hasSupabasePublicEnv() {
  const hasUrl = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl,
  );
  const hasPublicKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return hasUrl && hasPublicKey;
}

export function getSupabasePublicEnv() {
  const missing: string[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!publicKey) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)",
    );
  }

  if (missing.length > 0) {
    throw new Error(`Missing Supabase public env: ${missing.join(", ")}`);
  }

  return {
    url,
    anonKey: publicKey as string,
  };
}

export function getSupabaseServerEnv() {
  const missing = getMissingEnv([...requiredPublicEnv, ...requiredServerEnv]);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase server env: ${missing.join(", ")}`);
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  };
}

export function getSupabaseProductsBucket() {
  return process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "product-images";
}
