import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let user: User | null = null;

  if (!hasSupabasePublicEnv()) {
    const response = NextResponse.next({
      request: { headers: request.headers },
    });
    return { response, user };
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    // Required by Supabase SSR: this call refreshes auth session cookies when needed.
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    const fallbackResponse = NextResponse.next({
      request: { headers: request.headers },
    });
    return { response: fallbackResponse, user: null };
  }

  return { response, user };
}
