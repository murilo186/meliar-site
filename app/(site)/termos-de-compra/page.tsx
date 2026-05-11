import type { Metadata } from "next";
import { storeConfig } from "@/config/store";

export const metadata: Metadata = {
  title: "Termos de Compra | Meliar",
};

const LAST_UPDATED = "11/05/2026";

export default function TermsOfPurchasePage() {
  const whatsappHref = `https://wa.me/${storeConfig.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Políticas da loja
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">Termos de compra</h1>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="mt-6 grid gap-4 text-sm leading-6 text-muted-foreground">
          <p>
            Estes Termos de Compra regulam as compras realizadas na Meliar por meio do nosso site e
            atendimento via WhatsApp.
          </p>
          <p>
            A Meliar atua por meio de catálogo online. A compra é iniciada pelo cliente no site e
            finalizada pelo WhatsApp oficial da loja. A confirmação final do pedido, forma de
            pagamento, disponibilidade do produto, frete e prazo de entrega serão informados durante
            o atendimento.
          </p>
          <p>
            A disponibilidade dos produtos está sujeita ao estoque no momento da confirmação do
            pedido. A inclusão de um produto no catálogo, a visualização de uma peça no site ou o
            envio de mensagem pelo WhatsApp não garantem reserva automática do produto.
          </p>
          <p>
            Os preços, promoções e condições de pagamento podem ser alterados sem aviso prévio,
            respeitando sempre as condições já confirmadas em pedidos finalizados.
          </p>
          <p>
            As imagens dos produtos são ilustrativas e podem apresentar pequenas variações de cor,
            tonalidade, textura ou proporção devido à iluminação, tela do aparelho, edição da imagem
            ou características do tecido.
          </p>
          <p>
            O pedido será considerado confirmado somente após a confirmação do pagamento e validação
            das informações necessárias para entrega ou retirada.
          </p>
          <p>
            A Meliar poderá entrar em contato com o cliente pelo WhatsApp para confirmar dados do
            pedido, endereço, pagamento, disponibilidade de estoque e informações de entrega.
          </p>
          <p>
            Caso algum produto escolhido não esteja mais disponível, a loja poderá oferecer
            substituição por outro produto, crédito na loja, reembolso ou cancelamento do pedido,
            conforme preferência do cliente e disponibilidade da loja.
          </p>
          <p>
            O cliente é responsável por conferir as informações do produto antes da confirmação da
            compra, incluindo tamanho, cor, modelo, valor, forma de entrega e forma de pagamento.
          </p>
          <p>
            Ao finalizar a compra pelo WhatsApp oficial, o cliente declara estar ciente e de acordo
            com estes Termos de Compra, com a Política de Entrega e Frete, com a Política de Trocas,
            Devoluções e Reembolsos e com a Política de Privacidade da Meliar.
          </p>
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
