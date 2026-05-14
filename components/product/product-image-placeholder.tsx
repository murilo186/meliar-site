import { cn } from "@/lib/utils";

interface ProductImagePlaceholderProps {
  className?: string;
}

export function ProductImagePlaceholder({ className }: ProductImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[#f7efe8] px-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-melier-ink/45",
        className,
      )}
    >
      Imagem em breve
    </div>
  );
}
