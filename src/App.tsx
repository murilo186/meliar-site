import { CategoryChips } from "@/components/store/category-chips";
import { CartProvider } from "@/components/store/cart-provider";
import { FeaturedProducts } from "@/components/store/featured-products";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { Hero } from "@/components/store/hero";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Hero />
          <CategoryChips />
          <FeaturedProducts />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
