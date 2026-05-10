import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Meliar",
};

export default function TermsPage() {
  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Informações
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">
          Termos de uso
        </h1>

        <div className="mt-6 grid gap-4 text-sm leading-6 text-muted-foreground">
          <p>
            A Meliar funciona como vitrine digital com finalização de pedido via WhatsApp.
          </p>
          <p>
            A confirmação de compra acontece após alinhamento de disponibilidade, entrega e pagamento com o atendimento.
          </p>
          <p>
            Preços, disponibilidade e condições podem ser atualizados sem aviso prévio, respeitando pedidos já confirmados.
          </p>
          <p>
            Ao usar a loja, você concorda com estes termos e com as políticas de privacidade e trocas.
          </p>
        </div>
      </div>
    </section>
  );
}
