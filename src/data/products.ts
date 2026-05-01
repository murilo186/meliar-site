export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  label?: string;
  color: string;
}

export const categories = [
  "Novidades",
  "Vestidos",
  "Blusas",
  "Calças",
  "Conjuntos",
  "Acessórios",
];

export const products: Product[] = [
  {
    id: 1,
    name: "Vestido midi acetinado",
    category: "Vestidos",
    price: 289.9,
    image: "/mock/product-dress.svg",
    label: "Novo",
    color: "Rosa seco",
  },
  {
    id: 2,
    name: "Camisa cropped alfaiataria",
    category: "Blusas",
    price: 179.9,
    oldPrice: 219.9,
    image: "/mock/product-shirt.svg",
    color: "Off white",
  },
  {
    id: 3,
    name: "Calça reta cintura alta",
    category: "Calças",
    price: 239.9,
    image: "/mock/product-pants.svg",
    label: "Mais vendido",
    color: "Preto",
  },
  {
    id: 4,
    name: "Conjunto malha canelada",
    category: "Conjuntos",
    price: 319.9,
    image: "/mock/product-set.svg",
    color: "Blush",
  },
];
