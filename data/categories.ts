import type { Category } from "@/types/catalog";

export const catalogCategories: Category[] = [
  {
    slug: "vestidos",
    name: "Vestidos",
    href: "/vestidos",
    image: "/images/roupas/categories/category_vestidos.jpeg",
    featuredHref: "/vestidos",
  },
  {
    slug: "partes-de-cima",
    name: "Partes de cima",
    href: "/partes-de-cima",
    children: [
      {
        slug: "croppeds",
        name: "Croppeds",
        href: "/partes-de-cima/croppeds",
        image: "/images/roupas/categories/category_croppeds.jpeg",
      },
    ],
  },
  {
    slug: "partes-de-baixo",
    name: "Partes de baixo",
    href: "/partes-de-baixo",
    children: [
      {
        slug: "calcas",
        name: "Calças",
        href: "/partes-de-baixo/calcas",
        image: "/images/roupas/categories/category_calcas.jpeg",
      },
      {
        slug: "saias",
        name: "Saias",
        href: "/partes-de-baixo/saias",
        image: "/images/roupas/categories/category_saias.jpeg",
      },
    ],
  },
  {
    slug: "conjuntos",
    name: "Conjuntos",
    href: "/conjuntos",
    image: "/images/roupas/categories/category_conjuntos.jpeg",
    featuredHref: "/conjuntos",
  },
];
