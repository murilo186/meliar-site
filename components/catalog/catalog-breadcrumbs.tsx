import Link from "next/link";
import type { BreadcrumbItem } from "@/types/catalog";

interface CatalogBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function CatalogBreadcrumbs({ items }: CatalogBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium lowercase text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {item.href ? (
              <Link className="transition hover:text-melier-rose" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="text-melier-ink">{item.label}</span>
            )}
            {index < items.length - 1 ? <span>{">"}</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
