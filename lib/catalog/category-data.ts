import type { Category } from "@/types/catalog";
import { brandAssets } from "@/lib/assets/storage-public-url";

export const catalogCategories: Category[] = [
  {
    slug: "vestidos",
    name: "Vestidos",
    href: "/vestidos",
    image: brandAssets.categoryVestidos,
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
        image: brandAssets.categoryCroppeds,
      },
      {
        slug: "regata",
        name: "Regata",
        href: "/partes-de-cima/regata",
      },
      {
        slug: "blusa",
        name: "Blusa",
        href: "/partes-de-cima/blusa",
      },
      {
        slug: "body",
        name: "Body",
        href: "/partes-de-cima/body",
      },
      {
        slug: "casacos",
        name: "Casacos",
        href: "/partes-de-cima/casacos",
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
        image: brandAssets.categoryCalcas,
      },
      {
        slug: "saias",
        name: "Saias",
        href: "/partes-de-baixo/saias",
        image: brandAssets.categorySaias,
      },
    ],
  },
  {
    slug: "conjuntos",
    name: "Conjuntos",
    href: "/conjuntos",
    image: brandAssets.categoryConjuntos,
    featuredHref: "/conjuntos",
  },
];
