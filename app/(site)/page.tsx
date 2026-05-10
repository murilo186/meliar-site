import { getFeaturedHotProducts } from "@/lib/catalog/get-featured-hot-products";
import { Hero } from "@/components/sections/hero";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { InstagramSection } from "@/components/sections/instagram-section";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { hasNewLabel } from "@/lib/catalog/new-arrivals-rule";

export default async function HomePage() {
  const [arrivals, featuredHotProducts] = await Promise.all([
    getProductsFromDb("featured").then((items) => {
      const prioritized = [...items].sort((left, right) => {
        const leftIsNew = hasNewLabel(left.label) ? 1 : 0;
        const rightIsNew = hasNewLabel(right.label) ? 1 : 0;
        return rightIsNew - leftIsNew;
      });
      return prioritized.slice(0, 6);
    }),
    getFeaturedHotProducts(8),
  ]);

  return (
    <>
      <Hero />
      <NewArrivalsSection products={arrivals} />
      <FeaturedProductsSection products={featuredHotProducts} />
      <InstagramSection />
    </>
  );
}
