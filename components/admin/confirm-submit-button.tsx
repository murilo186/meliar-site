"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type ConfirmSubmitButtonProps = {
  title?: string;
  confirmMessage: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  "aria-label"?: string;
  children: React.ReactNode;
};

export function ConfirmSubmitButton({
  title = "Confirmar ação",
  confirmMessage,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  pendingLabel = "Salvando...",
  className,
  variant = "default",
  size = "sm",
  disabled = false,
  "aria-label": ariaLabel,
  children,
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleConfirm() {
    const form = triggerRef.current?.closest("form");
    closeModal();
    form?.requestSubmit();
  }

  return (
    <>
      <Button
        aria-label={ariaLabel}
        className={className}
        disabled={disabled || pending}
        onClick={openModal}
        ref={triggerRef}
        size={size}
        type="button"
        variant={variant}
      >
        {pending ? pendingLabel : children}
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm border border-black/10 bg-white p-4 rounded-none">
            <h3 className="text-base font-bold text-black">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{confirmMessage}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button className="rounded-none" onClick={closeModal} type="button" variant="outline">
                {cancelLabel}
              </Button>
              <Button className="rounded-none" onClick={handleConfirm} type="button">
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
