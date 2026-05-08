"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ClearNoticeQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const hasStatus = searchParams.has("status");
    const hasMessage = searchParams.has("message");
    if (!hasStatus && !hasMessage) return;

    const next = new URLSearchParams(searchParams.toString());
    next.delete("status");
    next.delete("message");

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
