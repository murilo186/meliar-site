export interface Subcategory {
  slug: string;
  name: string;
  href: string;
  image?: string;
}

export interface Category {
  slug: string;
  name: string;
  href: string;
  image?: string;
  featuredHref?: string;
  children?: Subcategory[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
