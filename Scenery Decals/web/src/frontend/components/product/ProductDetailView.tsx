"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { useLocale } from "@/frontend/context/LocaleContext";
import { ProductCard } from "@/frontend/components/catalog/ProductCard";
import { message } from "@/frontend/i18n/messages";
import { Product, StickerFinish } from "@/shared/types/store";

interface ProductDetailViewProps {
  initialProduct: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({
  initialProduct,
  relatedProducts,
}: ProductDetailViewProps) {
  const { locale } = useLocale();
  const copy = message(locale);
  const {
    toggleWishlist,
    wishlistIds,
    submitReviewAsync,
  } = useStore();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedFinish, setSelectedFinish] = useState<StickerFinish>(
    initialProduct.finishes[0]
  );
  const [quantity, setQuantity] = useState(() => initialProduct.availableQuantity === undefined ? 1 : Math.min(1, Math.max(0, initialProduct.availableQuantity)));
  const [activeImage, setActiveImage] = useState(initialProduct.image);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationName, setReservationName] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "kakaoTalk" | "whatsapp">("email");
  const [contactValue, setContactValue] = useState("");
  const [reservationNote, setReservationNote] = useState("");
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationReference, setReservationReference] = useState<string | null>(null);

  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isWishlisted = wishlistIds.includes(product.id);
  const displayedProduct = product;
  const galleryImages = product.images?.length ? product.images : [product.image];
  const availableQuantity = Math.max(0, product.availableQuantity ?? 0);
  const reservationCopy = locale === "zh" ? { action: "立即预约", title: "提交预约", intro: "留下联系方式，我们的客服会尽快与您联系确认。", name: "您的姓名", contact: "联系方式", email: "邮箱", kakaoTalk: "KakaoTalk", whatsapp: "WhatsApp", placeholder: "请输入联系方式", note: "备注（可选）", notePlaceholder: "例如：方便联系的时间、其他需求", submit: "提交预约", submitting: "提交中…", success: "预约已提交，我们的客服将通过您选择的联系方式与您联系。", close: "关闭" } : locale === "ko" ? { action: "지금 예약", title: "예약 제출", intro: "연락처를 남겨 주시면 고객센터에서 확인 후 연락드립니다.", name: "이름", contact: "연락 방법", email: "이메일", kakaoTalk: "KakaoTalk", whatsapp: "WhatsApp", placeholder: "연락처를 입력하세요", note: "메모 (선택)", notePlaceholder: "연락 가능한 시간 또는 요청 사항", submit: "예약 제출", submitting: "제출 중…", success: "예약이 접수되었습니다. 선택하신 연락처로 안내해 드리겠습니다.", close: "닫기" } : { action: "Reserve now", title: "Submit reservation", intro: "Leave one contact method and our customer service team will contact you to confirm.", name: "Your name", contact: "Contact method", email: "Email", kakaoTalk: "KakaoTalk", whatsapp: "WhatsApp", placeholder: "Enter your contact", note: "Note (optional)", notePlaceholder: "Preferred contact time or any request", submit: "Submit reservation", submitting: "Submitting…", success: "Your reservation was received. Our customer service team will contact you using your selected method.", close: "Close" };

  useEffect(() => {
    fetch(`/api/products/${initialProduct.id}?locale=${locale}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { product?: Product } | null) => { const nextProduct = data?.product; if (nextProduct) { setProduct(nextProduct); setActiveImage(nextProduct.images?.[0] ?? nextProduct.image); setQuantity((current) => Math.min(current, Math.max(0, nextProduct.availableQuantity ?? 0))); } })
      .catch(() => {});
  }, [initialProduct.id, locale]);

  function openReservation() { setReservationError(null); setReservationReference(null); setIsReservationOpen(true); }
  async function submitReservation(event: React.FormEvent) {
    event.preventDefault();
    setReservationError(null);
    setIsSubmittingReservation(true);
    try {
      const contact = contactMethod === "email" ? { email: contactValue } : contactMethod === "kakaoTalk" ? { kakaoTalk: contactValue } : { whatsapp: contactValue };
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ productId: product.id, finish: selectedFinish, quantity }], contact: { name: reservationName, note: reservationNote, ...contact } }) });
      const data = await response.json() as { reservation?: { referenceNo: string }; error?: string };
      if (!response.ok || !data.reservation) throw new Error(data.error ?? "Unable to submit reservation.");
      setReservationReference(data.reservation.referenceNo);
      setProduct((current) => ({ ...current, availableQuantity: Math.max(0, (current.availableQuantity ?? 0) - quantity) }));
    } catch (error) { setReservationError(error instanceof Error ? error.message : "Unable to submit reservation."); }
    finally { setIsSubmittingReservation(false); }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setIsSubmittingReview(true);
    try {
      const updated = await submitReviewAsync(product.id, {
        author: reviewAuthor,
        rating: reviewRating,
        comment: reviewComment,
      });
      setProduct(updated);
      setReviewAuthor("");
      setReviewComment("");
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not post review"
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#8B6D6D]"
      >
        <Link href="/" className="transition-colors hover:text-[#5B3E3E]">
          {copy.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/categories/${product.category}`}
          className="transition-colors hover:text-[#5B3E3E]"
        >
          {displayedProduct.categoryLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#5B3E3E]">{displayedProduct.title}</span>
      </nav>

      {/* Main PDP Split */}
      <div className="mt-5 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Gallery */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-xl border border-[#F3E3E8] bg-white p-3 shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#FDF7F9]">
              <img
                src={activeImage}
                alt={displayedProduct.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Save to wishlist"
                }
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#8B6D6D] shadow-sm transition-colors hover:text-[#E67B99]"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? "fill-[#F291AC] text-[#F291AC]" : ""
                  }`}
                />
              </button>
            </div>
            {galleryImages.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{galleryImages.map((image, index) => <button aria-label={`查看图片 ${index + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${activeImage === image ? "border-[#F291AC]" : "border-transparent"}`} key={image} onClick={() => setActiveImage(image)} type="button"><img alt="" className="h-full w-full object-cover" src={image}/></button>)}</div>}
          </div>
        </div>

        {/* Right Contiguous Purchase Module */}
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="rounded-xl border border-[#F3E3E8] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8B6D6D]">
              <Link
                href={`/categories/${product.category}`}
                className="hover:text-[#E67B99]"
              >
                {displayedProduct.categoryLabel}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{copy.inStock}</span>
            </div>

            <h1 className="mt-2 font-display text-2xl font-bold text-[#5B3E3E] sm:text-3xl">
              {displayedProduct.title}
            </h1>

            <div className="mt-3 flex items-center gap-4">
              <span className="font-display text-2xl font-bold text-[#5B3E3E] tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              <a
                href="#reviews"
                className="hidden"
              >
                <Star className="h-4 w-4 fill-[#F6C445] text-[#F6C445]" />
                <span className="font-semibold text-[#5B3E3E]">
                  {product.rating.toFixed(1)}
                </span>
                <span>({product.reviewCount} reviews)</span>
              </a>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#6B4C4C]">
              {displayedProduct.description}
            </p>

            {/* Finish Selector */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-[#5B3E3E]">
                {copy.paperFinish}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.finishes.map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedFinish === finish
                        ? "border-[#F291AC] bg-[#FFF0F5] font-semibold text-[#5B3E3E]"
                        : "border-[#EED6DF] bg-white text-[#8B6D6D] hover:border-[#F291AC]"
                    }`}
                  >
                    {product.finishLabels?.[finish] ?? finish}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-[#EED6DF] bg-[#FFFDFB] px-2 py-1.5">
                <button
                  type="button"
                  disabled={availableQuantity === 0}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label={copy.decreaseQuantity}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B4C4C] hover:bg-[#FFF0F5] disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#5B3E3E] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={availableQuantity === 0 || quantity >= availableQuantity}
                  onClick={() => setQuantity((q) => Math.min(availableQuantity, q + 1))}
                  aria-label={copy.increaseQuantity}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B4C4C] hover:bg-[#FFF0F5] disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xs text-[#8B6D6D]">库存：<span className="font-semibold text-[#5B3E3E]">{availableQuantity}</span> · 当前选择：<span className="font-semibold text-[#5B3E3E]">{quantity}</span></div>

            </div>

            <button
              type="button"
              disabled={availableQuantity === 0}
              onClick={openReservation}
              className="mt-3 w-full rounded-full border border-[#8B635C] bg-[#8B635C] py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-[#75514B] disabled:opacity-70"
            >
              {reservationCopy.action}
            </button>

          </div>
        </div>
      </div>

      {isReservationOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3C262B]/45 p-4 backdrop-blur-[2px]" onClick={() => !isSubmittingReservation && setIsReservationOpen(false)} role="dialog" aria-modal="true" aria-label={reservationCopy.title}>
        <div className="w-full max-w-md rounded-xl border border-[#F5DCE5] bg-[#FFFDFB] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl font-bold text-[#5B3E3E]">{reservationCopy.title}</h2><p className="mt-1 text-sm text-[#8B6D6D]">{reservationCopy.intro}</p></div><button className="text-2xl leading-none text-[#8B6D6D] hover:text-[#5B3E3E]" onClick={() => setIsReservationOpen(false)} type="button" aria-label={reservationCopy.close}>×</button></div>
          {reservationReference ? <div className="mt-6 rounded-lg bg-[#FFF0F5] p-4 text-sm text-[#6B4C4C]"><p className="font-semibold">{reservationCopy.success}</p><p className="mt-2 font-mono text-xs text-[#8B6D6D]">{reservationReference}</p></div> : <form className="mt-6 space-y-4" onSubmit={submitReservation}><label className="block text-sm font-semibold text-[#5B3E3E]">{reservationCopy.name}<input autoComplete="name" className="mt-1.5 w-full rounded-md border border-[#EED6DF] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#F291AC]" minLength={2} onChange={(event) => setReservationName(event.target.value)} required value={reservationName} /></label><fieldset><legend className="text-sm font-semibold text-[#5B3E3E]">{reservationCopy.contact}</legend><div className="mt-2 grid grid-cols-3 gap-2">{(["email", "kakaoTalk", "whatsapp"] as const).map((method) => <button className={`rounded-md border px-2 py-2 text-xs font-semibold ${contactMethod === method ? "border-[#F291AC] bg-[#FFF0F5] text-[#8B565F]" : "border-[#EED6DF] bg-white text-[#8B6D6D]"}`} key={method} onClick={() => setContactMethod(method)} type="button">{reservationCopy[method]}</button>)}</div></fieldset><label className="block text-sm font-semibold text-[#5B3E3E]"><span className="sr-only">{reservationCopy.contact}</span><input autoComplete={contactMethod === "email" ? "email" : "off"} className="mt-1.5 w-full rounded-md border border-[#EED6DF] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#F291AC]" onChange={(event) => setContactValue(event.target.value)} placeholder={contactMethod === "email" ? "name@example.com" : reservationCopy.placeholder} required value={contactValue} /></label><label className="block text-sm font-semibold text-[#5B3E3E]">{reservationCopy.note}<textarea className="mt-1.5 min-h-20 w-full rounded-md border border-[#EED6DF] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#F291AC]" maxLength={1000} onChange={(event) => setReservationNote(event.target.value)} placeholder={reservationCopy.notePlaceholder} value={reservationNote} /></label>{reservationError && <p className="text-sm text-[#C94A6A]">{reservationError}</p>}<button className="w-full rounded-full bg-[#8B635C] py-3 font-display text-sm font-semibold text-white hover:bg-[#75514B] disabled:opacity-60" disabled={isSubmittingReservation} type="submit">{isSubmittingReservation ? reservationCopy.submitting : reservationCopy.submit}</button></form>}
        </div>
      </div>}

      {/* Reviews Section */}
      <section
        id="reviews"
        className="hidden"
      >
        <h2 className="font-display text-xl font-bold text-[#5B3E3E]">
          Customer Reviews ({product.reviews.length})
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            {product.reviews.length === 0 ? (
              <p className="rounded-lg bg-[#FFF6F9] p-4 text-xs text-[#8B6D6D]">
                No written reviews yet—share your thoughts after decorating your
                pages!
              </p>
            ) : (
              product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-lg border border-[#F5E7EC] bg-[#FFFDFB] p-4"
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
                        className="h-3.5 w-3.5 fill-[#F6C445] text-[#F6C445]"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#6B4C4C]">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleReviewSubmit}
            className="rounded-lg border border-[#F5E7EC] bg-[#FFF8FA] p-5"
          >
            <h3 className="font-display text-sm font-bold text-[#5B3E3E]">
              Leave a Review
            </h3>
            <div className="mt-3 flex gap-2.5">
              <input
                type="text"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Your name"
                className="w-1/2 rounded-lg border border-[#EED6DF] bg-white px-3 py-2 text-xs text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
              />
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                aria-label="Rating"
                className="w-1/2 rounded-lg border border-[#EED6DF] bg-white px-3 py-2 text-xs text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
              </select>
            </div>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell fellow journalers how you used these stickers..."
              className="mt-2.5 w-full rounded-lg border border-[#EED6DF] bg-white px-3 py-2 text-xs text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
            />
            {reviewError && (
              <p className="mt-1.5 text-xs text-[#C94A6A]">{reviewError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#8B635C] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#75514B] disabled:opacity-60"
            >
              {isSubmittingReview && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Post Review</span>
            </button>
          </form>
        </div>
      </section>

      {/* Related Products */}
      <section className="hidden">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-[#5B3E3E] sm:text-2xl">
            You May Also Love
          </h2>
          <Link
            href={`/categories/${product.category}`}
            className="text-xs font-semibold text-[#E67B99] hover:underline"
          >
            More in {displayedProduct.categoryLabel}
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} />
          ))}
        </div>
      </section>
    </div>
  );
}
