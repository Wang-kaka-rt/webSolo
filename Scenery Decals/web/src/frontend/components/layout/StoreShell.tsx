"use client";

import { Header } from "@/frontend/components/layout/Header";
import { Footer } from "@/frontend/components/layout/Footer";
import { CartDrawer } from "@/frontend/components/cart/CartDrawer";
import { ProductQuickViewModal } from "@/frontend/components/modals/ProductQuickViewModal";
import { InfoModal } from "@/frontend/components/modals/InfoModal";
import { StoreToast } from "@/frontend/components/layout/StoreToast";

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-[#FFFDFB]">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />

      <CartDrawer />
      <ProductQuickViewModal />
      <InfoModal />
      <StoreToast />
    </div>
  );
}
