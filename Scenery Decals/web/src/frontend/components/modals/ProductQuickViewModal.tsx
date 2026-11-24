"use client";

import { useEffect, useState } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Star, X } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { StickerFinish } from "@/shared/types/store";

export function ProductQuickViewModal() {
  const {
    quickViewProduct,
    closeQuickView,
    addToCartAsync,
    submitReviewAsync,
  } = useStore();

  const [selectedFinish, setSelectedFinish] =
    useState<StickerFinish>("Matte Vinyl");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedFinish(quickViewProduct.finishes[0]);
      setQuantity(1);
      setReviewError(null);
      setReviewComment("");
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleAdd = async () => {
    setIsAdding(true);
    await addToCartAsync(quickViewProduct.id, selectedFinish, quantity);
    setIsAdding(false);
    closeQuickView();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setIsSubmittingReview(true);
    try {
      await submitReviewAsync(quickViewProduct.id, {
        author: reviewAuthor,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewAuthor("");
      setReviewComment("");
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not submit review"
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={quickViewProduct.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3C262B]/40 p-4 backdrop-blur-[2px]"
      onClick={closeQuickView}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#F5DCE5] bg-[#FFFDFB] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="Close product modal"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0F5] text-[#6B4C4C] transition-colors hover:bg-[#FADCE7]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-[#F3E3E8] bg-white">
            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.title}
              referrerPolicy="no-referrer"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8B6D6D]">
              <span>{quickViewProduct.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{quickViewProduct.sheetCount}</span>
            </div>

            <h2 className="mt-1.5 font-display text-2xl font-bold text-[#5B3E3E]">
              {quickViewProduct.title}
            </h2>

            <div className="mt-2 flex items-center gap-3">
              <span className="font-display text-xl font-bold text-[#5B3E3E] tabular-nums">
                ${quickViewProduct.price.toFixed(2)}
              </span>
              <span className="hidden">
                <Star className="h-3.5 w-3.5 fill-[#F6C445] text-[#F6C445]" />
                {quickViewProduct.rating.toFixed(1)} (
                {quickViewProduct.reviewCount} reviews)
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              {quickViewProduct.description}
            </p>

            <p className="mt-2 text-xs text-[#9C7D7D]">
              Sheet size: {quickViewProduct.dimensions}
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold text-[#5B3E3E]">
                Paper Finish
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickViewProduct.finishes.map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedFinish === finish
                        ? "border-[#F291AC] bg-[#FFF0F5] text-[#5B3E3E]"
                        : "border-[#EED6DF] bg-white text-[#8B6D6D] hover:border-[#F291AC]"
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-[#EED6DF] bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B4C4C] hover:bg-[#FFF0F5]"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#5B3E3E] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B4C4C] hover:bg-[#FFF0F5]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={isAdding}
                onClick={handleAdd}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F291AC] px-5 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E67B99] disabled:opacity-70"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                <span>
                  Add to Bag · $
                  {(quickViewProduct.price * quantity).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Async Submission */}
        <div className="hidden">
          <h3 className="font-display text-base font-bold text-[#5B3E3E]">
            Customer Reviews ({quickViewProduct.reviews.length})
          </h3>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
              {quickViewProduct.reviews.length === 0 ? (
                <p className="rounded-lg bg-[#FFF6F9] p-4 text-xs text-[#8B6D6D]">
                  Be the first to share how you decorated your pages with this
                  pack!
                </p>
              ) : (
                quickViewProduct.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-lg border border-[#F5E7EC] bg-white p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#5B3E3E]">
                        {rev.author}
                      </span>
                      <span className="text-[#9C7D7D] tabular-nums">
                        {rev.createdAt}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-[#F6C445] text-[#F6C445]"
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6B4C4C]">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleReviewSubmit}
              className="rounded-lg border border-[#F5E7EC] bg-[#FFF8FA] p-4"
            >
              <p className="text-xs font-semibold text-[#5B3E3E]">
                Write a review
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-1/2 rounded-xl border border-[#EED6DF] bg-white px-3 py-1.5 text-xs text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  aria-label="Rating"
                  className="w-1/2 rounded-xl border border-[#EED6DF] bg-white px-3 py-1.5 text-xs text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                </select>
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How do these stickers look in your journal?"
                className="mt-2 w-full rounded-xl border border-[#EED6DF] bg-white px-3 py-2 text-xs text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
              />
              {reviewError && (
                <p className="mt-1 text-xs text-[#C94A6A]">{reviewError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#8B635C] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#75514B] disabled:opacity-60"
              >
                {isSubmittingReview && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <span>Post Review</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
