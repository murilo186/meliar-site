import Link from "next/link";
import Image from "next/image";
import { brandAssets } from "@/lib/assets/storage-public-url";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header>
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-center px-6 sm:h-28">
          <Link aria-label="Meliar" href="/" className="inline-flex items-center justify-center">
            <Image
              alt="Meliar"
              className="mt-2 h-auto w-[210px] object-contain sm:w-[260px]"
              height={90}
              priority
              src={brandAssets.logoComplete}
              width={260}
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:py-14">
        <section className="w-full">
          <h1 className="text-[42px] font-bold leading-tight tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </section>
      </main>
    </div>
  );
}
