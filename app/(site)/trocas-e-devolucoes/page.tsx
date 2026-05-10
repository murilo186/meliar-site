import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trocas e Devoluções | Meliar",
};

export default function ExchangesAndReturnsPage() {
  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Atendimento
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">
          Trocas e devoluções
        </h1>

        <div className="mt-6 grid gap-4 text-sm leading-6 text-muted-foreground">
          <p>
            Aceitamos solicitação de troca ou devolução em até 7 dias corridos após o recebimento.
          </p>
          <p>
            A peça deve estar sem uso, com etiqueta e nas mesmas condições de envio.
          </p>
          <p>
            Para iniciar a solicitação, entre em contato pelo WhatsApp informado na loja com o número do pedido e fotos da peça.
          </p>
          <p>
            Após análise, orientamos o envio e as opções disponíveis: troca por outra peça, crédito na loja ou devolução do valor conforme o caso.
          </p>
        </div>
      </div>
    </section>
  );
}
