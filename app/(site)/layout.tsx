import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AuthActionProvider } from "@/components/providers/auth-action-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { FavoritesProvider } from "@/components/providers/favorites-provider";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <AuthActionProvider>
        <FavoritesProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </FavoritesProvider>
      </AuthActionProvider>
    </CartProvider>
  );
}
