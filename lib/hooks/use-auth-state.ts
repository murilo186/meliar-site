"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  firstName: string;
}

const anonymousState: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
  firstName: "",
};

let cachedAuthState: AuthState | null = null;
let pendingAuthState: Promise<AuthState> | null = null;

async function readAuthState(): Promise<AuthState> {
  const supabase = createSupabaseBrowserClientOrNull();
  if (!supabase) return anonymousState;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return anonymousState;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isAuthenticated: true,
    isAdmin: profile?.role === "admin",
    firstName: profile?.first_name?.trim() || "Cliente",
  };
}

function loadAuthState() {
  if (cachedAuthState) {
    return Promise.resolve(cachedAuthState);
  }

  pendingAuthState ??= readAuthState().then((state) => {
    cachedAuthState = state;
    pendingAuthState = null;
    return state;
  });

  return pendingAuthState;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>(cachedAuthState ?? anonymousState);

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClientOrNull();

    void loadAuthState().then((nextState) => {
      if (isMounted) setState(nextState);
    });

    const subscription = supabase
      ? supabase.auth.onAuthStateChange(() => {
          cachedAuthState = null;
          pendingAuthState = null;
          void loadAuthState().then((nextState) => {
            if (isMounted) setState(nextState);
          });
        }).data.subscription
      : null;

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOutCurrentUser() {
  const supabase = createSupabaseBrowserClientOrNull();
  if (supabase) {
    await supabase.auth.signOut();
  }

  cachedAuthState = anonymousState;
  pendingAuthState = null;
}
