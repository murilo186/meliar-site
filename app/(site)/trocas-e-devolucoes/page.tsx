import type { Metadata } from "next";
import { storeConfig } from "@/config/store";

export const metadata: Metadata = {
  title: "Trocas e Devoluções | Meliar",
};

const LAST_UPDATED = "11/05/2026";

export default function ExchangesAndReturnsPage() {
  const whatsappHref = `https://wa.me/${storeConfig.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Políticas da loja
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">Trocas, devoluções e reembolsos</h1>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="mt-6 grid gap-6 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              1. Direito de arrependimento
            </h2>
            <p className="mt-2">
              Para compras realizadas à distância, o cliente poderá solicitar devolução por
              arrependimento em até 7 dias corridos após o recebimento do produto.
            </p>
            <p className="mt-2">
              A solicitação deve ser feita pelo WhatsApp oficial da loja, informando nome, dados do
              pedido, produto comprado e motivo da solicitação.
            </p>
            <p className="mt-2">
              Para devolução, o produto deverá estar sem sinais de uso, sem lavagem, sem odores, sem
              manchas, sem alterações e com etiqueta afixada.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              2. Troca por defeito
            </h2>
            <p className="mt-2">
              Caso o produto apresente possível defeito de fabricação, o cliente deverá entrar em
              contato pelo WhatsApp oficial da loja com descrição do problema, fotos ou vídeos da peça
              e dados do pedido.
            </p>
            <p className="mt-2">
              Confirmado o defeito de fabricação, a Meliar poderá realizar troca por produto igual,
              troca por outro disponível, crédito na loja ou reembolso, conforme o caso.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              3. Troca por tamanho, cor ou modelo
            </h2>
            <p className="mt-2">
              Trocas por tamanho, cor ou modelo são realizadas conforme disponibilidade de estoque e
              política comercial da loja.
            </p>
            <p className="mt-2">
              Para solicitar, entre em contato pelo WhatsApp oficial em até 7 dias corridos após o
              recebimento do produto. A peça deve estar sem uso, sem lavagem, sem odores, sem manchas
              e com etiqueta afixada.
            </p>
            <p className="mt-2">
              Custos de envio relacionados à troca por tamanho, cor ou modelo poderão ser combinados
              previamente no atendimento, conforme cada situação.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              4. Peças brancas
            </h2>
            <p className="mt-2">
              Por serem peças mais sensíveis a marcas, manchas e sinais de uso, peças brancas não
              possuem troca por tamanho, cor ou modelo.
            </p>
            <p className="mt-2">
              Essa condição não limita os direitos legais do consumidor em caso de defeito de
              fabricação ou exercício do direito de arrependimento dentro do prazo legal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              5. Produtos em promoção
            </h2>
            <p className="mt-2">
              Produtos em promoção podem ter regras específicas de troca, informadas no momento da
              compra, sem prejuízo dos direitos legais do consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              6. Como solicitar troca, devolução ou reembolso
            </h2>
            <p className="mt-2">
              Todas as solicitações devem ser feitas pelo WhatsApp oficial da Meliar. O cliente deve
              informar nome completo, dados do pedido, produto comprado, data de recebimento, motivo da
              solicitação e fotos ou vídeos da peça quando necessário.
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-black/10 pt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-melier-ink">
            Canal oficial de atendimento
          </p>
          <a
            className="mt-2 inline-block text-sm font-semibold text-melier-rose hover:underline"
            href={whatsappHref}
            rel="noreferrer"
            target="_blank"
          >
            Fale conosco pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
