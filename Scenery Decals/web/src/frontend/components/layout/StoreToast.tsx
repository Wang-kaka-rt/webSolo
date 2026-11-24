"use client";

import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";

export function StoreToast() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-[#F3DCE4] bg-white px-4 py-2.5 text-xs font-semibold text-[#5B3E3E] shadow-lg"
    >
      <CheckCircle2 className="h-4 w-4 text-[#F291AC]" />
      <span>{toastMessage}</span>
    </div>
  );
}
