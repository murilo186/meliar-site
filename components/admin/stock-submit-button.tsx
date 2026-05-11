"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function StockSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-none" disabled={pending} size="sm" type="submit" variant="outline">
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

