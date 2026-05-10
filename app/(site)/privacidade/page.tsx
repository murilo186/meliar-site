import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade | Meliar",
};

export default function PrivacyPage() {
  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
          Informações
        </p>
        <h1 className="mt-2 text-3xl font-black text-melier-ink">
          Política de privacidade
        </h1>

        <div className="mt-6 grid gap-4 text-sm leading-6 text-muted-foreground">
          <p>
            Coletamos apenas os dados necessários para atendimento, criação de pedidos e contato com a cliente.
          </p>
          <p>
            Seus dados não são vendidos para terceiros e são usados somente para operação da loja e suporte.
          </p>
          <p>
            Você pode solicitar atualização ou exclusão de dados pessoais pelo canal de atendimento da loja.
          </p>
          <p>
            Ao navegar e comprar na Meliar, você concorda com o uso desses dados para viabilizar a experiência de compra.
          </p>
        </div>
      </div>
    </section>
  );
}
