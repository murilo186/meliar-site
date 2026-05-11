import { getFeaturedHotProducts } from "@/lib/catalog/get-featured-hot-products";
import { Hero } from "@/components/sections/hero";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { InstagramSection } from "@/components/sections/instagram-section";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { HIGHLIGHT_PRODUCTS_LIMIT } from "@/lib/catalog/highlight-limits";

export default async function HomePage() {
  const [arrivals, featuredHotProducts] = await Promise.all([
    getProductsFromDb("featured").then((items) =>
      [...items]
        .filter((item) => item.showInNewArrivalsManual)
        .sort((left, right) => {
          const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
          const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
          return rightTime - leftTime;
        })
        .slice(0, HIGHLIGHT_PRODUCTS_LIMIT),
    ),
    getFeaturedHotProducts(HIGHLIGHT_PRODUCTS_LIMIT),
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
