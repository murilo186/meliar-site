import type { Metadata } from "next";
import { storeConfig } from "@/config/store";

export const metadata: Metadata = {
  title: "Política de Privacidade | Meliar",
};

const LAST_UPDATED = "11/05/2026";

export default function PrivacyPolicyPage() {
  const whatsappHref = `https://wa.me/${storeConfig.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Políticas da loja
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">Política de privacidade</h1>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="mt-6 grid gap-6 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              1. Dados que podemos coletar
            </h2>
            <p className="mt-2">
              Podemos coletar dados fornecidos pelo cliente, como nome completo, telefone/WhatsApp,
              e-mail, endereço de entrega, dados do pedido, mensagens enviadas no atendimento,
              comprovantes de pagamento e informações necessárias para cumprimento de obrigações
              legais.
            </p>
            <p className="mt-2">
              Também podemos tratar dados de cadastro e autenticação, como nome, e-mail, telefone,
              senha criptografada, dados técnicos de login e data de criação da conta.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              2. Como usamos seus dados
            </h2>
            <p className="mt-2">
              Utilizamos dados pessoais para atendimento, cadastro, autenticação, confirmação de
              pedidos, entrega, trocas, devoluções, reembolsos, prevenção a fraudes e cumprimento de
              obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              3. Tecnologias de autenticação e sessão
            </h2>
            <p className="mt-2">
              Nosso site utiliza Supabase Auth para cadastro, login, recuperação de senha e manutenção
              da sessão do usuário. Para isso, podem ser armazenados dados técnicos no navegador,
              como cookies e tokens de autenticação.
            </p>
            <p className="mt-2">
              Essas tecnologias são usadas para funcionamento do login, segurança da conta e prevenção
              de acessos não autorizados. Neste momento, não são usadas para publicidade
              comportamental.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              4. Atendimento pelo WhatsApp
            </h2>
            <p className="mt-2">
              O atendimento da Meliar é realizado principalmente pelo WhatsApp. Ao entrar em contato,
              o cliente está ciente de que mensagens e dados também podem ser tratados pela plataforma
              WhatsApp/Meta, conforme as regras dessa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              5. Compartilhamento de dados
            </h2>
            <p className="mt-2">
              A Meliar poderá compartilhar dados quando necessário para operação da loja, como com
              serviços de entrega, meios de pagamento, provedores de infraestrutura e autenticação,
              atendimento e cumprimento de obrigações legais. Não vendemos dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              6. Armazenamento e segurança
            </h2>
            <p className="mt-2">
              Os dados são armazenados pelo tempo necessário para atendimento, autenticação,
              processamento de pedidos, cumprimento de obrigações legais e proteção da segurança da
              loja e dos clientes.
            </p>
            <p className="mt-2">
              A Meliar adota medidas razoáveis para proteção contra acesso não autorizado, perda, uso
              indevido ou divulgação indevida de dados.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold uppercase tracking-[0.1em] text-melier-ink">
              7. Direitos do titular
            </h2>
            <p className="mt-2">
              O cliente pode solicitar confirmação de tratamento, acesso, correção, exclusão quando
              aplicável e informações de compartilhamento, conforme legislação vigente.
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-black/10 pt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-melier-ink">
            Canal oficial para privacidade
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
