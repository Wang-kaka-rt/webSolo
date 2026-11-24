"use client";

import { ArrowRight, Heart } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";

const STORE_PROMO_IMAGE_URL = "/images/promo_bunny_camera_1795164162559.jpg";

export function InspirationBanner() {
  const { openInfoModal } = useStore();

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-8">
      <div className="relative overflow-hidden rounded-xl border border-[#F6E2E9] bg-[#FFF6F9] shadow-[0_10px_30px_-16px_rgba(196,138,156,0.35)]">
        <img
          src={STORE_PROMO_IMAGE_URL}
          alt="Polaroid snapshots and cute bunny holding a pastel camera"
          referrerPolicy="no-referrer"
          className="h-[240px] w-full object-cover sm:h-[260px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#FFF6F9]/85 to-transparent"
        />

        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div className="max-w-md rounded-lg bg-[#FFF8FA]/80 px-6 py-4 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none">
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E] text-balance sm:text-[32px]">
              Create Your Own Little World
            </h2>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-xs font-medium text-[#6B4C4C] sm:text-sm">
              <span>
                Turn everyday moments into something special with our stickers
              </span>
              <Heart className="h-3 w-3 shrink-0 fill-[#F291AC] text-[#F291AC]" />
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => openInfoModal("inspiration")}
                className="inline-flex items-center gap-2 rounded-full bg-[#8B635C] px-6 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#75514B]"
              >
                <span>Get Inspired</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
