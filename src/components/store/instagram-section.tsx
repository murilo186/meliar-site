import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

const ELFSIGHT_SCRIPT_SRC = "https://elfsightcdn.com/platform.js";
const ELFSIGHT_APP_CLASS = "elfsight-app-8d0e5646-bfc1-4477-bcb9-77c86aca9201";

export function InstagramSection() {
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${ELFSIGHT_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = ELFSIGHT_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="bg-white py-8 sm:py-10" id="instagram">
      <div className="container">
        <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Redes sociais
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-melier-ink sm:text-3xl">
              @use.meliar
            </h2>
          </div>
          <a
            className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-melier-ink"
            href="https://www.instagram.com/use.meliar/"
            rel="noreferrer"
            target="_blank"
          >
            Ver Instagram
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="w-full overflow-hidden">
          <div
            className={ELFSIGHT_APP_CLASS}
            data-elfsight-app-lazy=""
          />
        </div>
      </div>
    </section>
  );
}
