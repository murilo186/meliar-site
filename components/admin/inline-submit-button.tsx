"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type InlineSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
};

export function InlineSubmitButton({
  label,
  pendingLabel = "Salvando...",
  className,
  size = "sm",
  variant = "default",
}: InlineSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending} size={size} type="submit" variant={variant}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
