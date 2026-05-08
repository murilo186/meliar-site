import { Hero } from "@/components/sections/hero";
import { InstagramSection } from "@/components/sections/instagram-section";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";

export default async function HomePage() {
  const arrivals = (await getProductsFromDb("featured")).slice(0, 6);

  return (
    <>
      <Hero />
      <NewArrivalsSection products={arrivals} />
      <InstagramSection />
    </>
  );
}
