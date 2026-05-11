import Link from "next/link";
import { storeConfig } from "@/config/store";

export function Footer() {
  const whatsappHref = `https://wa.me/${storeConfig.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <footer className="border-t border-white/10 bg-[#1d1f23] text-white" id="contato">
      <div className="border-b border-white/10">
        <div className="container grid gap-4 py-4 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
              Formas de pagamento
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="border border-white/25 px-2 py-1 text-[11px] font-bold uppercase text-white/85">
                Pix
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
              Envio e atendimento
            </p>
            <p className="mt-2 text-xs font-semibold text-white/80">
              Entrega nacional com condições combinadas no WhatsApp oficial.
            </p>
            <p className="mt-1 text-xs font-semibold text-white/70">
              Horário de atendimento: {storeConfig.supportHours}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
              Ajuda e informações
            </p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-white/85 hover:text-melier-blush" href="/termos-de-compra">
                Termos de compra
              </Link>
              <Link className="text-white/85 hover:text-melier-blush" href="/entrega-e-frete">
                Entrega e frete
              </Link>
              <Link className="text-white/85 hover:text-melier-blush" href="/trocas-e-devolucoes">
                Trocas e devoluções
              </Link>
              <Link className="text-white/85 hover:text-melier-blush" href="/politica-de-privacidade">
                Política de privacidade
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
              Loja
            </p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-white/85 hover:text-melier-blush" href="/">
                Home
              </Link>
              <Link className="text-white/85 hover:text-melier-blush" href="/produtos">
                Produtos
              </Link>
              <Link className="text-white/85 hover:text-melier-blush" href="/carrinho">
                Carrinho
              </Link>
              <Link className="text-white/85 hover:text-melier-blush" href="/perfil">
                Minha conta
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
              Atendimento oficial
            </p>
            <p className="mt-3 text-sm text-white/80">
              As compras são iniciadas pelo site e finalizadas no WhatsApp oficial da loja.
            </p>
            <a
              className="mt-3 inline-block text-sm font-semibold text-melier-blush hover:underline"
              href={whatsappHref}
              rel="noreferrer"
              target="_blank"
            >
              Fale conosco
            </a>
          </div>

        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/55">
          <p>{storeConfig.name} • Atendimento via WhatsApp • Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
