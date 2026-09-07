"use client";

import { useRouter } from "next/navigation";

/** Secondary escape hatch on error pages — returns to wherever the reader came from. */
export function BackButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button type="button" className={className} onClick={() => router.back()}>
      {children}
    </button>
  );
}
