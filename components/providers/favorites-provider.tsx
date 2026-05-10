"use client";

import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuthAction } from "@/components/providers/auth-action-provider";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

interface FavoritesContextValue {
  isReady: boolean;
  isFavorite: (productSlug: string) => boolean;
  toggleFavorite: (productSlug: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

type FavoriteRow = {
  product_slug: string;
};

export function FavoritesProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isResolved, requireAuth } = useAuthAction();
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClientOrNull(), []);

  const loadFavorites = useCallback(async () => {
    if (!supabase || !isAuthenticated) {
      setFavoriteSlugs([]);
      setIsReady(true);
      return;
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("product_slug")
      .order("created_at", { ascending: false });

    if (error) {
      setFavoriteSlugs([]);
      setIsReady(true);
      return;
    }

    const rows = (data ?? []) as FavoriteRow[];
    setFavoriteSlugs(rows.map((row) => row.product_slug));
    setIsReady(true);
  }, [isAuthenticated, supabase]);

  useEffect(() => {
    if (!isResolved) {
      return;
    }

    void loadFavorites();
  }, [isResolved, loadFavorites]);

  const isFavorite = useCallback(
    (productSlug: string) => favoriteSlugs.includes(productSlug),
    [favoriteSlugs],
  );

  const toggleFavorite = useCallback(
    async (productSlug: string) => {
      if (!requireAuth("favoritar peças")) {
        return;
      }

      if (!supabase) {
        return;
      }

      const currentlyFavorite = favoriteSlugs.includes(productSlug);

      if (currentlyFavorite) {
        setFavoriteSlugs((current) => current.filter((slug) => slug !== productSlug));

        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("product_slug", productSlug);

        if (error) {
          setFavoriteSlugs((current) => [productSlug, ...current.filter((slug) => slug !== productSlug)]);
        }

        return;
      }

      setFavoriteSlugs((current) => [productSlug, ...current.filter((slug) => slug !== productSlug)]);

      const { error } = await supabase
        .from("user_favorites")
        .insert({ product_slug: productSlug });

      if (error && error.code !== "23505") {
        setFavoriteSlugs((current) => current.filter((slug) => slug !== productSlug));
      }
    },
    [favoriteSlugs, requireAuth, supabase],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      isReady,
      isFavorite,
      toggleFavorite,
    }),
    [isFavorite, isReady, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
