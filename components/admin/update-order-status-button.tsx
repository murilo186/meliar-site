"use client";

import { useState } from "react";
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
import type { OrderStatus } from "@/types/order";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  paid: "Pago",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

interface UpdateOrderStatusButtonProps {
  orderId: string;
  nextStatus: OrderStatus;
}

export function UpdateOrderStatusButton({
  orderId,
  nextStatus,
}: UpdateOrderStatusButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="rounded-none" size="sm" type="button" variant="outline">
          Marcar como {statusLabel[nextStatus].toLowerCase()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar alteração de status</DialogTitle>
          <DialogDescription>
            Deseja mudar este pedido para "{statusLabel[nextStatus]}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="rounded-none" type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <form
            action={async (formData) => {
              await updateOrderStatusAction(formData);
              setOpen(false);
            }}
          >
            <input name="orderId" type="hidden" value={orderId} />
            <input name="nextStatus" type="hidden" value={nextStatus} />
            <Button className="rounded-none" type="submit">
              Confirmar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
