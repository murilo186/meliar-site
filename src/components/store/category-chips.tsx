import { categories } from "@/data/products";

export function CategoryChips() {
  return (
    <section className="border-b bg-white">
      <div className="container py-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {categories.map((category, index) => (
            <a
              className={
                index === 0
                  ? "shrink-0 rounded-full bg-melier-ink px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white"
                  : "shrink-0 rounded-full border bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-melier-ink hover:border-melier-rose hover:text-melier-rose"
              }
              href="#produtos"
              key={category}
            >
              {category}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
