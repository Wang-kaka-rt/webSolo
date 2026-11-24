"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CartState,
  CategorySlug,
  InfoModalTopic,
  OrderConfirmation,
  Product,
  StickerFinish,
} from "@/shared/types/store";
import { useLocale } from "@/frontend/context/LocaleContext";
import type { HeroAdvertisement } from "@/shared/types/advertisement";

type SortMode = "popular" | "price-asc" | "rating";

interface StoreContextValue {
  products: Product[];
  newArrivals: Product[];
  categories: Array<{ slug: string; name: string; image: string; itemCount: number; bgColor: string; accentColor: string }>;
  heroAdvertisement: HeroAdvertisement | null;
  activeCategory: CategorySlug;
  sortMode: SortMode;
  showAllCatalog: boolean;
  isLoadingCatalog: boolean;
  catalogError: string | null;
  cart: CartState;
  isCartOpen: boolean;
  addingProductId: string | null;
  recentlyAddedId: string | null;
  wishlistIds: string[];
  quickViewProduct: Product | null;
  infoTopic: InfoModalTopic;
  orders: OrderConfirmation[];
  toastMessage: string | null;
  selectCategory: (category: CategorySlug) => Promise<void>;
  setSortAndFetch: (sort: SortMode) => Promise<void>;
  toggleViewAllCatalog: () => Promise<void>;
  addToCartAsync: (
    productId: string,
    finish?: StickerFinish,
    quantity?: number
  ) => Promise<void>;
  updateCartQuantityAsync: (
    productId: string,
    finish: StickerFinish,
    quantity: number
  ) => Promise<void>;
  submitOrderAsync: (customer: {
    name: string;
    email: string;
    address: string;
  }) => Promise<OrderConfirmation>;
  submitReviewAsync: (
    productId: string,
    payload: { author: string; rating: number; comment: string }
  ) => Promise<Product>;
  toggleWishlist: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  openInfoModal: (topic: InfoModalTopic) => void;
  closeInfoModal: () => void;
  showToast: (msg: string) => void;
  getSessionHeaders: () => Record<string, string>;
}

const EMPTY_CART: CartState = {
  items: [],
  subtotal: 0,
  freeShippingThreshold: 50,
  qualifiesFreeShipping: false,
  totalCount: 0,
};

const StoreContext = createContext<StoreContextValue | null>(null);

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "guest-session";
  const key = "pangpang_session_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = `pg_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}

export function StoreProvider({ children, initialProducts, initialNewArrivals, initialCategories, initialHeroAdvertisement }: { children: React.ReactNode; initialProducts: Product[]; initialNewArrivals: Product[]; initialCategories: Array<{ slug: string; name: string; image: string; itemCount: number; bgColor: string; accentColor: string }>; initialHeroAdvertisement: HeroAdvertisement | null }) {
  const { locale } = useLocale();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newArrivals, setNewArrivals] = useState<Product[]>(initialNewArrivals);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string; image: string; itemCount: number; bgColor: string; accentColor: string }>>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("all");
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [infoTopic, setInfoTopic] = useState<InfoModalTopic>(null);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getSessionHeaders = useCallback((): Record<string, string> => {
    return {
      "Content-Type": "application/json",
      "x-session-id": getOrCreateSessionId(),
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Hydrate cart & order history asynchronously on mount
  useEffect(() => {
    const headers = getSessionHeaders();
    fetch("/api/cart", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CartState | null) => {
        if (data) setCart(data);
      })
      .catch(() => {});

    fetch("/api/checkout", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { orders?: OrderConfirmation[] } | null) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, [getSessionHeaders]);

  useEffect(() => {
    fetch(`/api/categories?locale=${locale}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { categories?: Array<{ slug: string; name: string; image: string; itemCount: number; bgColor: string; accentColor: string }> } | null) => setCategories(data?.categories ?? []))
      .catch(() => setCategories([]));
  }, [locale]);

  const fetchCatalog = useCallback(
    async (category: CategorySlug, sort: SortMode, viewAll: boolean) => {
      setIsLoadingCatalog(true);
      setCatalogError(null);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (category === "all" && !viewAll) params.set("section", "best-sellers");
        params.set("sort", sort);

        params.set("locale", locale); const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load stickers");
        const data = (await res.json()) as { products: Product[] };
        setProducts(
          category === "all" && !viewAll
            ? data.products.slice(0, 4)
            : data.products
        );
      } catch {
        setCatalogError("Could not refresh stickers. Please try again.");
      } finally {
        setIsLoadingCatalog(false);
      }
    },
    [locale]
  );

  const selectCategory = useCallback(
    async (category: CategorySlug) => {
      const nextCategory = activeCategory === category ? "all" : category;
      setActiveCategory(nextCategory);
      await fetchCatalog(nextCategory, sortMode, showAllCatalog);
    },
    [activeCategory, fetchCatalog, showAllCatalog, sortMode]
  );

  const setSortAndFetch = useCallback(
    async (sort: SortMode) => {
      setSortMode(sort);
      await fetchCatalog(activeCategory, sort, showAllCatalog);
    },
    [activeCategory, fetchCatalog, showAllCatalog]
  );

  const toggleViewAllCatalog = useCallback(async () => {
    const nextViewAll = !showAllCatalog;
    setShowAllCatalog(nextViewAll);
    setActiveCategory("all");
    await fetchCatalog("all", sortMode, nextViewAll);
  }, [fetchCatalog, showAllCatalog, sortMode]);

  useEffect(() => {
    void fetchCatalog(activeCategory, sortMode, showAllCatalog);
  }, [activeCategory, fetchCatalog, showAllCatalog, sortMode]);

  useEffect(() => {
    fetch(`/api/products?section=new-arrivals&sort=popular&locale=${locale}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { products?: Product[] } | null) => setNewArrivals(data?.products ?? []))
      .catch(() => setNewArrivals([]));
  }, [locale]);

  const addToCartAsync = useCallback(
    async (productId: string, finish?: StickerFinish, quantity = 1) => {
      setAddingProductId(productId);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: getSessionHeaders(),
          body: JSON.stringify({ productId, finish, quantity }),
        });
        if (!res.ok) throw new Error("Failed to add item");
        const updatedCart = (await res.json()) as CartState;
        setCart(updatedCart);
        setRecentlyAddedId(productId);
        showToast("Added sticker pack to your bag");
        setTimeout(() => {
          setRecentlyAddedId((prev) => (prev === productId ? null : prev));
        }, 1200);
      } catch {
        showToast("Could not add item to bag. Please try again.");
      } finally {
        setAddingProductId(null);
      }
    },
    [getSessionHeaders, showToast]
  );

  const updateCartQuantityAsync = useCallback(
    async (productId: string, finish: StickerFinish, quantity: number) => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: getSessionHeaders(),
          body: JSON.stringify({ productId, finish, quantity }),
        });
        if (!res.ok) throw new Error("Failed to update cart");
        const updatedCart = (await res.json()) as CartState;
        setCart(updatedCart);
      } catch {
        showToast("Could not update quantity.");
      }
    },
    [getSessionHeaders, showToast]
  );

  const submitOrderAsync = useCallback(
    async (customer: { name: string; email: string; address: string }) => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: getSessionHeaders(),
        body: JSON.stringify(customer),
      });
      const data = (await res.json()) as {
        order?: OrderConfirmation;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error || "Checkout failed");
      }
      setCart(EMPTY_CART);
      setOrders((prev) => [data.order!, ...prev]);
      showToast(`Order ${data.order.orderId} confirmed!`);
      return data.order;
    },
    [getSessionHeaders, showToast]
  );

  const submitReviewAsync = useCallback(
    async (
      productId: string,
      payload: { author: string; rating: number; comment: string }
    ) => {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { product?: Product; error?: string };
      if (!res.ok || !data.product) {
        throw new Error(data.error || "Could not post review");
      }
      const updatedProduct = data.product;
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setNewArrivals((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setQuickViewProduct((prev) =>
        prev && prev.id === updatedProduct.id ? updatedProduct : prev
      );
      showToast("Thanks for sharing your review!");
      return updatedProduct;
    },
    [showToast]
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        showToast(exists ? "Removed from wishlist" : "Saved to wishlist");
        return exists
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
      });
    },
    [showToast]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      newArrivals,
      categories,
      heroAdvertisement: initialHeroAdvertisement,
      activeCategory,
      sortMode,
      showAllCatalog,
      isLoadingCatalog,
      catalogError,
      cart,
      isCartOpen,
      addingProductId,
      recentlyAddedId,
      wishlistIds,
      quickViewProduct,
      infoTopic,
      orders,
      toastMessage,
      selectCategory,
      setSortAndFetch,
      toggleViewAllCatalog,
      addToCartAsync,
      updateCartQuantityAsync,
      submitOrderAsync,
      submitReviewAsync,
      toggleWishlist,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      openQuickView: (product) => setQuickViewProduct(product),
      closeQuickView: () => setQuickViewProduct(null),
      openInfoModal: (topic) => setInfoTopic(topic),
      closeInfoModal: () => setInfoTopic(null),
      showToast,
      getSessionHeaders,
    }),
    [
      products,
      newArrivals,
      categories,
      initialHeroAdvertisement,
      activeCategory,
      sortMode,
      showAllCatalog,
      isLoadingCatalog,
      catalogError,
      cart,
      isCartOpen,
      addingProductId,
      recentlyAddedId,
      wishlistIds,
      quickViewProduct,
      infoTopic,
      orders,
      toastMessage,
      selectCategory,
      setSortAndFetch,
      toggleViewAllCatalog,
      addToCartAsync,
      updateCartQuantityAsync,
      submitOrderAsync,
      submitReviewAsync,
      toggleWishlist,
      showToast,
      getSessionHeaders,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
