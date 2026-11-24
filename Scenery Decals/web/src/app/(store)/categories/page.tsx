import type { Metadata } from "next";
import { getRequestLocale } from "@/backend/i18n/requestLocale";
import { listProducts } from "@/backend/services/storeService";
import { CategoryCatalogView } from "@/frontend/components/catalog/CategoryCatalogView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Collections — Pangpangshop",
  description:
    "Browse all kawaii sticker collections including Flower Garden, Little Animals, Sweet Days, Dreamy World, Vintage Diary, and Daily Moments.",
};

export default async function AllCategoriesPage() {
  const products = await listProducts({ category: "all", sort: "popular", locale: await getRequestLocale() });

  return <CategoryCatalogView initialSlug="all" initialProducts={products} />;
}
