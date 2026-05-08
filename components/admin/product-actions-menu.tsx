"use client";

import Link from "next/link";
import { useRef } from "react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";

type ServerAction = (formData: FormData) => void | Promise<void>;

type ProductActionsMenuProps = {
  productId: string;
  isVisible: boolean;
  onToggleVisibility: ServerAction;
  onDelete: ServerAction;
};

export function ProductActionsMenu({
  productId,
  isVisible,
  onToggleVisibility,
  onDelete,
}: ProductActionsMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <div className="relative">
      <details ref={detailsRef}>
        <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center border border-black/20 text-lg leading-none">
          ⋮
        </summary>
        <div className="absolute right-0 z-10 mt-1 min-w-40 border border-black/20 bg-white p-2">
          <div className="flex flex-col gap-2">
            <Button
              asChild
              onClick={closeMenu}
              size="sm"
              variant="outline"
              className="justify-start rounded-none"
            >
              <Link href={`/admin/produtos/${productId}`}>Editar</Link>
            </Button>
            <form action={onToggleVisibility}>
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="nextVisible" value={isVisible ? "false" : "true"} />
              <ConfirmSubmitButton
                className="w-full justify-start rounded-none"
                confirmMessage={
                  isVisible
                    ? "Tem certeza que deseja ocultar este produto no site?"
                    : "Tem certeza que deseja ativar este produto no site?"
                }
                size="sm"
                variant="outline"
              >
                <span onClick={closeMenu}>{isVisible ? "Ocultar" : "Ativar"}</span>
              </ConfirmSubmitButton>
            </form>
            <form action={onDelete}>
              <input type="hidden" name="productId" value={productId} />
              <ConfirmSubmitButton
                className="w-full justify-start rounded-none"
                confirmMessage="Tem certeza que deseja remover/deletar este item?"
                size="sm"
                variant="outline"
              >
                <span onClick={closeMenu}>Apagar</span>
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      </details>
    </div>
  );
}
