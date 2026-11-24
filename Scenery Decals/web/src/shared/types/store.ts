export type CategorySlug = string;

export type StickerFinish = string;

export interface FinishOption {
  id: StickerFinish;
  label: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  price: number;
  rating: number;
  reviewCount: string;
  rawReviewCount: number;
  image: string;
  images?: string[];
  description: string;
  sheetCount: string;
  dimensions: string;
  finishes: StickerFinish[];
  finishLabels?: Record<StickerFinish, string>;
  section: "best-seller" | "new-arrival" | "both";
  availableQuantity?: number;
  reviews: Review[];
}

export interface CategoryTile {
  slug: string;
  name: string;
  image: string;
  bgColor: string;
  accentColor: string;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  finish: StickerFinish;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  freeShippingThreshold: number;
  qualifiesFreeShipping: boolean;
  totalCount: number;
}

export interface OrderConfirmation {
  orderId: string;
  customerName: string;
  email: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  estimatedDelivery: string;
  createdAt: string;
}

export type InfoModalTopic =
  | "about"
  | "contact"
  | "shipping"
  | "returns"
  | "privacy"
  | "terms"
  | "inspiration"
  | null;
