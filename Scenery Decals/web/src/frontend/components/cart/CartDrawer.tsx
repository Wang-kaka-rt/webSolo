"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { ReservationConfirmation } from "@/shared/types/reservation";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message } from "@/frontend/i18n/messages";

export function CartDrawer() {
  const { locale } = useLocale(); const copy = message(locale);
  const {
    cart,
    isCartOpen,
    closeCart,
    updateCartQuantityAsync,
  } = useStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wechat, setWechat] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] =
    useState<ReservationConfirmation | null>(null);

  if (!isCartOpen) return null;

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            finish: item.finish,
            quantity: item.quantity,
          })),
          contact: { name, email, phone, wechat, note },
        }),
      });
      const data = (await response.json()) as {
        reservation?: ReservationConfirmation;
        error?: string;
      };
      if (!response.ok || !data.reservation) {
        throw new Error(data.error || "Could not submit your reservation.");
      }
      await Promise.all(
        cart.items.map((item) =>
          updateCartQuantityAsync(item.productId, item.finish, 0)
        )
      );
      setConfirmedReservation(data.reservation);
      setIsCheckingOut(false);
      setName("");
      setEmail("");
      setPhone("");
      setWechat("");
      setNote("");
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Could not submit your reservation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 flex justify-end bg-[#3C262B]/35 backdrop-blur-[2px]"
      onClick={closeCart}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-[#FFFDFB] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#F4E3E9] px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#F291AC]" />
            <h2 className="font-display text-lg font-bold text-[#5B3E3E]">
              {copy.bagTitle} ({cart.totalCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmedReservation(null);
              closeCart();
            }}
            aria-label="Close bag"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0F5] text-[#6B4C4C] hover:bg-[#FADCE7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {confirmedReservation ? (
            <div className="rounded-lg border border-[#DCEAD5] bg-[#F5FBF2] p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#6FA856]" />
              <h3 className="mt-3 font-display text-xl font-bold text-[#4B6B3D]">
                Reservation {confirmedReservation.referenceNo} Received
              </h3>
              <p className="mt-1 text-xs text-[#5E7454]">
                We&apos;ll contact you before your reservation expires on{" "}
                {new Date(confirmedReservation.expiresAt).toLocaleString()}
              </p>

              <div className="mt-4 space-y-2 border-t border-[#DFECDA] pt-3 text-left text-xs text-[#5B3E3E]">
                <p>Inventory is held while we review your reservation.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedReservation(null);
                  closeCart();
                }}
                className="mt-5 w-full rounded-full bg-[#8B635C] py-2.5 text-xs font-semibold text-white hover:bg-[#75514B]"
              >
                {copy.continueShopping}
              </button>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F5] text-[#F291AC]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-[#5B3E3E]">
                {copy.emptyBag}
              </p>
              <p className="mt-1 max-w-xs text-xs text-[#8B6D6D]">
                Browse our flower, animal, and dreamy castle sticker packs to
                fill your journal pages.
              </p>
            </div>
          ) : isCheckingOut ? (
            <form onSubmit={handleReservation} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#5B3E3E]">
                  {copy.reservationDetails}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs font-medium text-[#8B6D6D] hover:text-[#5B3E3E]"
                >
                  {copy.backToBag}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B3E3E]">
                  {copy.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mina Lin"
                  className="mt-1 w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B3E3E]">
                  {copy.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mina@example.com"
                  className="mt-1 w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B3E3E]">
                  {copy.phone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="mt-1 w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B3E3E]">
                  {copy.wechat}
                </label>
                <input
                  type="text"
                  value={wechat}
                  onChange={(e) => setWechat(e.target.value)}
                  placeholder="WeChat ID"
                  className="mt-1 w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B3E3E]">
                  {copy.note}
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Share any details about your reservation"
                  className="mt-1 w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
              </div>

              {checkoutError && (
                <p className="text-xs text-[#C94A6A]">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F291AC] py-3 font-display text-sm font-semibold text-white shadow-sm hover:bg-[#E67B99] disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {copy.submitReservation}
                </span>
              </button>
            </form>
          ) : (
            <ul className="space-y-3">
              {cart.items.map((item) => {
                const itemTitle = item.title;
                return <li
                  key={`${item.productId}-${item.finish}`}
                  className="flex gap-3 rounded-lg border border-[#F3E3E8] bg-white p-3"
                >
                  <img
                    src={item.image}
                    alt={itemTitle}
                    referrerPolicy="no-referrer"
                    className="h-18 w-20 shrink-0 rounded-md object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold text-[#5B3E3E]">
                          {itemTitle}
                        </p>
                        <p className="text-[11px] text-[#8B6D6D]">
                          {item.finish}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantityAsync(
                            item.productId,
                            item.finish,
                            0
                          )
                        }
                        aria-label={`Remove ${itemTitle}`}
                        className="text-[#B89898] hover:text-[#D45F81]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-[#EED6DF] px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantityAsync(
                              item.productId,
                              item.finish,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#6B4C4C] hover:bg-[#FFF0F5]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantityAsync(
                              item.productId,
                              item.finish,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#6B4C4C] hover:bg-[#FFF0F5]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-display text-sm font-bold text-[#5B3E3E] tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>;
              })}
            </ul>
          )}
        </div>

        {!confirmedReservation && cart.items.length > 0 && !isCheckingOut && (
          <div className="border-t border-[#F4E3E9] bg-white px-6 py-4">
            <p className="text-xs leading-5 text-[#8B6D6D]">
              Submit a reservation and we&apos;ll contact you to confirm availability.
            </p>

            <button
              type="button"
              onClick={() => setIsCheckingOut(true)}
              className="mt-4 w-full rounded-full bg-[#F291AC] py-3 font-display text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E67B99]"
            >
              {copy.reserveItems}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
