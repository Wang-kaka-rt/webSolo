export type ReservationStatus =
  | "submitted"
  | "notified"
  | "contacted"
  | "confirmed"
  | "fulfilled"
  | "cancelled"
  | "expired"
  | "declined";

export interface ReservationItemInput {
  productId: string;
  finish?: string;
  quantity: number;
}

export interface ReservationContactInput {
  name: string;
  email?: string;
  phone?: string;
  wechat?: string;
  kakaoTalk?: string;
  whatsapp?: string;
  note?: string;
}

export interface CreateReservationInput {
  items: ReservationItemInput[];
  contact: ReservationContactInput;
}

export interface ReservationConfirmation {
  referenceNo: string;
  status: "submitted";
  expiresAt: string;
}

export interface AdminReservationItem {
  id: string;
  referenceNo: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  wechat: string | null;
  kakaoTalk: string | null;
  whatsapp: string | null;
  customerNote: string | null;
  adminNote: string | null;
  items: Array<{
    productTitle: string;
    finish: string | null;
    quantity: number;
  }>;
}

export interface AdminInventoryItem {
  productId: string;
  slug: string;
  title: string;
  isActive: boolean;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}
