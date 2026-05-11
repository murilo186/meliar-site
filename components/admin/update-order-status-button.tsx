"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useFormStatus } from "react-dom";
import { updateOrderStatusAction } from "@/app/admin/vendas/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Novo",
  approved: "Em atendimento",
  paid: "Confirmado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

interface UpdateOrderStatusButtonProps {
  orderId: string;
  currentStatus: OrderStatus;
  fixedNextStatus?: OrderStatus;
  triggerLabel?: string;
  triggerVariant?: "outline" | "default";
  confirmLabel?: string;
  triggerClassName?: string;
  confirmClassName?: string;
}

function SubmitStatusButton({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className={cn("rounded-none", className)} disabled={pending} type="submit">
      {pending ? "Salvando..." : label}
    </Button>
  );
}

export function UpdateOrderStatusButton({
  orderId,
  currentStatus,
  fixedNextStatus,
  triggerLabel,
  triggerVariant = "outline",
  confirmLabel = "Confirmar",
  triggerClassName,
  confirmClassName,
}: UpdateOrderStatusButtonProps) {
  const [open, setOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus>(
    fixedNextStatus ?? currentStatus,
  );
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setNextStatus(fixedNextStatus ?? currentStatus);
      setFeedback(null);
    }
  }, [currentStatus, fixedNextStatus, open]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className={cn("rounded-none", triggerClassName)}
          size="sm"
          type="button"
          variant={triggerVariant}
        >
          {triggerLabel ? (
            triggerLabel
          ) : (
            <>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Editar status
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar status do pedido</DialogTitle>
          <DialogDescription>
            {fixedNextStatus
              ? `Deseja alterar o pedido para "${statusLabel[fixedNextStatus]}"?`
              : "Selecione o status desejado e confirme."}
          </DialogDescription>
        </DialogHeader>
        {!fixedNextStatus ? (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Status
            </label>
            <select
              className="h-10 w-full border border-black/20 px-3 text-sm"
              onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
              value={nextStatus}
            >
              <option value="pending">Novo</option>
              <option value="approved">Em atendimento</option>
              <option value="paid">Confirmado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        ) : null}
        {feedback ? (
          <p
            className={`mt-2 text-sm ${
              feedback.kind === "success" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
        <DialogFooter className="flex-row justify-end">
          <DialogClose asChild>
            <Button className="rounded-none" type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <form
            action={async (formData) => {
              const result = await updateOrderStatusAction(formData);

              if (result?.ok) {
                setFeedback({ kind: "success", message: result.message });
                setOpen(false);
                return;
              }

              setFeedback({
                kind: "error",
                message: result?.message ?? "Não foi possível atualizar o status agora.",
              });
            }}
          >
            <input name="orderId" type="hidden" value={orderId} />
            <input name="nextStatus" type="hidden" value={nextStatus} />
            <SubmitStatusButton className={confirmClassName} label={confirmLabel} />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
