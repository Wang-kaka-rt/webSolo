"use client";

import { Camera, Heart, Share2 } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";

const STORE_LOGO_URL = "/assets/aistudio/Pangpangshop________32585569.png";

export function Footer() {
  const { openInfoModal, showToast } = useStore();

  const handleCopyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Store link copied to clipboard");
    } catch {
      showToast("Share Pangpangshop with your stationery friends!");
    }
  };

  return (
    <footer className="mt-4">
      <div className="scallop-top h-5 w-full" aria-hidden="true" />
      <div className="bg-[#FDEAF0] px-4 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 md:flex-row">
          <a
            href="#top"
            aria-label="Back to top of Pangpangshop"
            className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          >
            <img
              src={STORE_LOGO_URL}
              alt="Pangpangshop"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain"
            />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openInfoModal("inspiration")}
              aria-label="Sticker Journal Gallery"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B5546B] text-white transition-transform hover:-translate-y-0.5 hover:bg-[#9E4359]"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openInfoModal("about")}
              aria-label="Our Studio Story"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B5546B] text-white transition-transform hover:-translate-y-0.5 hover:bg-[#9E4359]"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCopyStoreLink}
              aria-label="Share Pangpangshop link"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B5546B] text-white transition-transform hover:-translate-y-0.5 hover:bg-[#9E4359]"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
