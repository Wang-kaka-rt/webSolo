import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/backend/i18n/requestLocale";
import { getProductBySlug, getRelatedProducts } from "@/backend/services/storeService";
import { ProductDetailView } from "@/frontend/components/product/ProductDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, await getRequestLocale());
  if (!product) {
    return { title: "Product Not Found — Pangpangshop" };
  }
  return {
    title: `${product.title} — Pangpangshop`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 4, locale);

  return (
    <ProductDetailView
      initialProduct={product}
      relatedProducts={relatedProducts}
    />
  );
}
