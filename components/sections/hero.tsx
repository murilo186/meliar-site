"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { brandAssets } from "@/lib/assets/storage-public-url";

const spotlightCategories = [
  {
    title: "Vestidos",
    image: brandAssets.categoryVestidos,
    href: "/vestidos",
  },
  {
    title: "Calcas",
    image: brandAssets.categoryCalcas,
    href: "/partes-de-baixo/calcas",
  },
  {
    title: "Saias",
    image: brandAssets.categorySaias,
    href: "/partes-de-baixo/saias",
  },
  {
    title: "Croppeds",
    image: brandAssets.categoryCroppeds,
    href: "/partes-de-cima/croppeds",
  },
  {
    title: "Conjuntos",
    image: brandAssets.categoryConjuntos,
    href: "/conjuntos",
  },
];

export function Hero() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const element = carouselRef.current;

    if (!element) {
      return;
    }

    const updateScrollState = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 8);
      setCanScrollRight(element.scrollLeft < maxScrollLeft - 8);
    };

    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    const element = carouselRef.current;

    if (!element) {
      return;
    }

    const amount = element.clientWidth * 0.72;
    element.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white">
      <div className="pb-4 sm:pb-5">
        <Link
          className="group block overflow-hidden rounded-none border border-black/10 bg-[#f7f1eb]"
          href="/produtos"
        >
          <div className="relative block aspect-[4/5] sm:aspect-[1284/494]">
            <Image
              alt="Colecao em destaque"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.01] sm:hidden"
              fill
              priority
              sizes="100vw"
              src={brandAssets.heroMobile}
            />
            <Image
              alt="Colecao em destaque"
              className="hidden object-cover transition-transform duration-500 group-hover:scale-[1.01] sm:block"
              fill
              priority
              sizes="100vw"
              src={brandAssets.heroDesktop}
            />
          </div>
        </Link>
      </div>

      <div className="container pb-8 sm:pb-10">
        <div className="mt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Shop The Collections
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-melier-ink sm:text-3xl">
              Categorias em destaque
            </h1>
          </div>
        </div>

        <div className="relative mt-5">
          {canScrollLeft ? (
            <button
              aria-label="Ver categorias anteriores"
              className="absolute -left-1 top-[38%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-melier-ink shadow-[0_4px_14px_rgba(17,17,17,0.12)] sm:hidden"
              onClick={() => scrollCategories("left")}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}

          {canScrollRight ? (
            <button
              aria-label="Ver mais categorias"
              className="absolute -right-1 top-[38%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-melier-ink shadow-[0_4px_14px_rgba(17,17,17,0.12)] sm:hidden"
              onClick={() => scrollCategories("right")}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}

          <div
            className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0"
            ref={carouselRef}
          >
            <div className="flex gap-5 sm:grid sm:grid-cols-5 sm:gap-x-4 sm:gap-y-5">
              {spotlightCategories.map((category) => (
                <Link
                  className="group block w-[calc((100vw-4.5rem)/3)] shrink-0 text-center sm:w-auto"
                  href={category.href}
                  key={category.title}
                >
                  <div className="relative mx-auto aspect-square w-full max-w-[108px] overflow-hidden rounded-full border border-black/10 bg-[#faf7f3] sm:max-w-[132px]">
                    <Image
                      alt={category.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      fill
                      sizes="(min-width: 640px) 132px, calc((100vw - 4.5rem) / 3)"
                      src={category.image}
                    />
                  </div>
                  <div className="px-1 pt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-melier-ink sm:text-[11px] sm:font-extrabold sm:tracking-[0.18em]">
                      {category.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
