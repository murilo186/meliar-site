import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cart/product-card";
import { ProductDetailView } from "@/components/product/product-detail-view";
import {
  getProductBySlugFromDb,
  getRelatedProductsFromDb,
} from "@/lib/catalog/get-products-db";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugFromDb(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProductsFromDb(product);

  return (
    <>
      <ProductDetailView product={product} />

      {relatedProducts.length > 0 ? (
        <section className="bg-[#fcfbf9] py-8">
          <div className="container">
            <div className="mb-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
                Continue vendo
              </p>
              <h2 className="mt-2 text-2xl font-black text-melier-ink">
                Peças relacionadas
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
