import { CartProvider } from "@/components/store/cart-provider";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { Hero } from "@/components/store/hero";
import { InstagramSection } from "@/components/store/instagram-section";
import { NewArrivalsSection } from "@/components/store/new-arrivals-section";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Hero />
          <NewArrivalsSection />
          <InstagramSection />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
