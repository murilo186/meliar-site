"use client";

import { useActionState, useEffect, useState } from "react";
import {
  type ProductHighlightsActionState,
  updateProductHighlightsActionState,
} from "@/app/admin/actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

const EMPTY_STATE: ProductHighlightsActionState = {
  status: "idle",
  message: "",
  isHot: false,
  showInNewArrivalsManual: false,
};

type ProductHighlightsFormProps = {
  productId: string;
  isHot: boolean;
  showInNewArrivalsManual: boolean;
};

export function ProductHighlightsForm({
  productId,
  isHot,
  showInNewArrivalsManual,
}: ProductHighlightsFormProps) {
  const [hotChecked, setHotChecked] = useState(isHot);
  const [newArrivalsChecked, setNewArrivalsChecked] = useState(showInNewArrivalsManual);
  const [state, formAction, isPending] = useActionState(updateProductHighlightsActionState, {
    ...EMPTY_STATE,
    isHot,
    showInNewArrivalsManual,
  });

  useEffect(() => {
    if (state.status === "idle") return;
    setHotChecked(state.isHot);
    setNewArrivalsChecked(state.showInNewArrivalsManual);
  }, [state]);

  const feedbackClassName =
    state.status === "success"
      ? "text-emerald-700"
      : state.status === "error"
        ? "text-red-700"
        : "text-muted-foreground";

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isHot"
          checked={hotChecked}
          onChange={(event) => setHotChecked(event.currentTarget.checked)}
          className="h-4 w-4 border rounded-none"
        />
        Marcar como hot
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="showInNewArrivalsManual"
          checked={newArrivalsChecked}
          onChange={(event) => setNewArrivalsChecked(event.currentTarget.checked)}
          className="h-4 w-4 border rounded-none"
        />
        Incluir em novidades selecionadas
      </label>
      <ConfirmSubmitButton
        className="rounded-none"
        confirmMessage="Salvar alterações de destaque deste produto?"
        size="sm"
        variant="outline"
      >
        {isPending ? "Salvando..." : "Salvar destaque"}
      </ConfirmSubmitButton>
      {state.status !== "idle" ? (
        <p className={`text-xs font-semibold ${feedbackClassName}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
