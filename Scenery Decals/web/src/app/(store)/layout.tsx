import { cookies } from "next/headers";
import { getAdminHeroAdvertisement } from "@/backend/services/advertisementService";
import { listProducts, listStoreCategories } from "@/backend/services/storeService";
import { StoreShell } from "@/frontend/components/layout/StoreShell";
import { StoreProvider } from "@/frontend/context/StoreContext";
import { LocaleProvider, type Locale } from "@/frontend/context/LocaleContext";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const savedLocale = (await cookies()).get("pangpang_locale")?.value;
  const locale: Locale = savedLocale === "en" || savedLocale === "ko" ? savedLocale : "zh";
  const [categories, products, newArrivals, advertisement] = await Promise.all([
    listStoreCategories(locale),
    listProducts({ section: "best-sellers", sort: "popular", locale }),
    listProducts({ section: "new-arrivals", sort: "popular", locale }),
    getAdminHeroAdvertisement(),
  ]);

  return (
    <LocaleProvider initialLocale={locale}><StoreProvider initialCategories={categories} initialHeroAdvertisement={advertisement?.isActive ? advertisement : null} initialNewArrivals={newArrivals} initialProducts={products.slice(0, 4)}>
      <StoreShell>{children}</StoreShell>
    </StoreProvider></LocaleProvider>
  );
}
