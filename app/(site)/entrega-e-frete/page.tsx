import type { Metadata } from "next";
import { storeConfig } from "@/config/store";

export const metadata: Metadata = {
  title: "Entrega e Frete | Meliar",
};

const LAST_UPDATED = "11/05/2026";

export default function ShippingPolicyPage() {
  const whatsappHref = `https://wa.me/${storeConfig.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Políticas da loja
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">Entrega e frete</h1>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="mt-6 grid gap-4 text-sm leading-6 text-muted-foreground">
          <p>
            As entregas da Meliar são combinadas pelo WhatsApp oficial no momento da finalização do
            pedido.
          </p>
          <p>
            O prazo de envio ou entrega será informado ao cliente antes da confirmação da compra. O
            prazo pode variar conforme a localidade, modalidade de entrega, disponibilidade do produto
            e confirmação do pagamento.
          </p>
          <p>
            O cliente é responsável por informar corretamente os dados de entrega, incluindo nome
            completo, endereço, número, complemento, bairro, cidade, estado, CEP e telefone para
            contato.
          </p>
          <p>
            Caso o endereço informado esteja incorreto ou incompleto, poderá haver atraso, nova
            cobrança de frete ou devolução do pedido.
          </p>
          <p>
            Quando houver cobrança de frete, o valor será informado antes da confirmação da compra. A
            compra só será finalizada após o cliente aceitar as condições de envio e pagamento.
          </p>
          <p>
            Em caso de retirada presencial, o local, data e horário serão combinados previamente pelo
            WhatsApp oficial da loja.
          </p>
          <p>
            A Meliar não se responsabiliza por atrasos causados por dados incorretos fornecidos pelo
            cliente, ausência no local de entrega, situações externas de transporte, eventos
            climáticos, greves, restrições de circulação, problemas operacionais de terceiros ou casos
            de força maior.
          </p>
          <p>
            Caso o pedido retorne por erro no endereço informado, ausência do destinatário ou
            impossibilidade de entrega causada por informação incorreta do cliente, a Meliar poderá
            cobrar novo valor de frete para reenvio.
          </p>
          <p>
            O cliente deve acompanhar as informações enviadas pelo WhatsApp oficial e manter seus dados
            de contato atualizados durante o processo de entrega.
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
