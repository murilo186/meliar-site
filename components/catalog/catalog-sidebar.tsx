import Link from "next/link";
import { getCategories } from "@/lib/catalog/get-categories";

interface CatalogSidebarProps {
  currentCategorySlug?: string;
  currentSubcategorySlug?: string;
}

export function CatalogSidebar({
  currentCategorySlug,
  currentSubcategorySlug,
}: CatalogSidebarProps) {
  const categories = getCategories();

  return (
    <aside className="hidden w-full max-w-[250px] shrink-0 lg:block">
      <div className="sticky top-28 rounded-2xl border bg-white p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
          Categorias
        </p>
        <div className="mt-4 grid gap-4">
          <Link
            className={`text-sm font-bold transition ${
              !currentCategorySlug ? "text-melier-rose" : "text-melier-ink hover:text-melier-rose"
            }`}
            href="/produtos"
          >
            Ver todos os produtos
          </Link>

          {categories.map((category) => (
            <div className="grid gap-2" key={category.slug}>
              <Link
                className={`text-sm font-bold transition ${
                  currentCategorySlug === category.slug && !currentSubcategorySlug
                    ? "text-melier-rose"
                    : "text-melier-ink hover:text-melier-rose"
                }`}
                href={category.href}
              >
                {category.name}
              </Link>

              {category.children?.length ? (
                <div className="grid gap-2 pl-3">
                  {category.children.map((subcategory) => (
                    <Link
                      className={`text-sm transition ${
                        currentSubcategorySlug === subcategory.slug
                          ? "font-bold text-melier-rose"
                          : "text-muted-foreground hover:text-melier-rose"
                      }`}
                      href={subcategory.href}
                      key={subcategory.slug}
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
