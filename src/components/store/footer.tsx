export function Footer() {
  return (
    <footer className="border-t bg-melier-ink text-white">
      <div className="container grid gap-5 py-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-display text-xl font-bold">Melier</p>
          <p className="mt-1 max-w-md text-sm font-semibold leading-5 text-white/72">
            Moda feminina com curadoria compacta, envio nacional e compra simples.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white/80">
          <a className="hover:text-melier-blush" href="#">
            Trocas
          </a>
          <a className="hover:text-melier-blush" href="#">
            Envio
          </a>
          <a className="hover:text-melier-blush" href="#">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
