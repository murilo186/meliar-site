"use client";

import Link from "next/link";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

interface AuthActionContextValue {
  isAuthenticated: boolean;
  isResolved: boolean;
  requireAuth: (actionLabel?: string) => boolean;
}

const AuthActionContext = createContext<AuthActionContextValue | null>(null);

export function AuthActionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestedAction, setRequestedAction] = useState("continuar");

  useEffect(() => {
    const supabase = createSupabaseBrowserClientOrNull();

    if (!supabase) {
      setIsAuthenticated(false);
      setIsResolved(true);
      return;
    }

    const browserClient = supabase;

    let isMounted = true;

    async function loadAuthState() {
      const {
        data: { user },
      } = await browserClient.auth.getUser();

      if (!isMounted) return;
      setIsAuthenticated(Boolean(user));
      setIsResolved(true);
    }

    void loadAuthState();

    const {
      data: { subscription },
    } = browserClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setIsResolved(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const requireAuth = useCallback(
    (actionLabel?: string) => {
      if (isAuthenticated) {
        return true;
      }

      setRequestedAction(actionLabel?.trim() || "continuar");
      setIsDialogOpen(true);
      return false;
    },
    [isAuthenticated],
  );

  const value = useMemo<AuthActionContextValue>(
    () => ({
      isAuthenticated,
      isResolved,
      requireAuth,
    }),
    [isAuthenticated, isResolved, requireAuth],
  );

  return (
    <AuthActionContext.Provider value={value}>
      {children}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entre na sua conta</DialogTitle>
            <DialogDescription>
              Para {requestedAction}, você precisa estar cadastrada. Faça login ou crie sua conta para continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild className="rounded-none" onClick={() => setIsDialogOpen(false)}>
              <Link href="/login">Fazer login</Link>
            </Button>
            <Button asChild className="rounded-none" onClick={() => setIsDialogOpen(false)} variant="outline">
              <Link href="/create-account">Cadastre-se</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthActionContext.Provider>
  );
}

export function useAuthAction() {
  const context = useContext(AuthActionContext);

  if (!context) {
    throw new Error("useAuthAction must be used inside AuthActionProvider");
  }

  return context;
}
