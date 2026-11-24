export type ProductSection = "best-seller" | "new-arrival" | "both";

export interface AdminProductItem {
  id: string;
  productCode: number;
  slug: string;
  title: string;
  titleZh: string;
  titleKo: string;
  category: string;
  categoryLabel: string;
  price: number;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  descriptionZh: string;
  descriptionKo: string;
  sheetCount: string;
  dimensions: string;
  finishes: string[];
  section: ProductSection;
  isActive: boolean;
  onHandQuantity: number;
  reservedQuantity: number;
}

