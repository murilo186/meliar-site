import { Hero } from "@/components/sections/hero";
import { InstagramSection } from "@/components/sections/instagram-section";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <NewArrivalsSection />
      <InstagramSection />
    </>
  );
}
