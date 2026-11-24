import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/backend/i18n/requestLocale";
import { listProducts, listStoreCategories } from "@/backend/services/storeService";
import { CategoryCatalogView } from "@/frontend/components/catalog/CategoryCatalogView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = (await listStoreCategories(await getRequestLocale())).find((item) => item.slug === slug);
  if (!category) {
    return { title: "Collection Not Found — Pangpangshop" };
  }
  return {
    title: `${category.name} Stickers — Pangpangshop`,
    description: `Shop ${category.name} kawaii sticker packs and journal sheets by Pangpangshop.`,
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const category = (await listStoreCategories(locale)).find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const products = await listProducts({ category: category.slug, sort: "popular", locale });

  return (
    <CategoryCatalogView
      initialSlug={category.slug}
      initialProducts={products}
    />
  );
}
