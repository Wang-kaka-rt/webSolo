"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message } from "@/frontend/i18n/messages";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const { locale } = useLocale();

  if (dismissed) return null;

  return (
    <div className="relative flex h-9 items-center justify-center bg-[#FFE5EE] px-10 text-xs font-medium text-[#6B4C4C]">
      <p className="truncate text-center tracking-wide">
        {message(locale).shipping}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss shipping announcement"
        className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-[#8B6D6D] transition-colors hover:bg-[#FAD2E0] hover:text-[#5B3E3E]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
