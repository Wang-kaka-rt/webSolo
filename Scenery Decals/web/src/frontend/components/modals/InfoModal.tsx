"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message as localizedMessage } from "@/frontend/i18n/messages";

const STORE_LOGO_URL = "/assets/aistudio/Pangpangshop________32585569.png";

export function InfoModal() {
  const { infoTopic, categories, closeInfoModal } = useStore();
  const { locale } = useLocale();
  const copy = localizedMessage(locale);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentReply, setSentReply] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  if (!infoTopic) return null;

  const handleClose = () => {
    setSentReply(null);
    setSendError(null);
    closeInfoModal();
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Could not send message");
      }
      setSentReply(data.reply);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Could not send message"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3C262B]/40 p-4 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#F5DCE5] bg-[#FFFDFB] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label={copy.closeDialog}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0F5] text-[#6B4C4C] hover:bg-[#FADCE7]"
        >
          <X className="h-4 w-4" />
        </button>

        {infoTopic === "about" && (
          <div>
            <img
              src={STORE_LOGO_URL}
              alt="Pangpangshop"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain"
            />
            <h2 className="mt-3 font-display text-2xl font-bold text-[#5B3E3E]">
              {copy.aboutModalTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              {copy.aboutModalParagraphOne}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              {copy.aboutModalParagraphTwo}
            </p>
          </div>
        )}

        {infoTopic === "inspiration" && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E]">
              Sticker Journaling Ideas
            </h2>
            <p className="mt-2 text-sm text-[#6B4C4C]">
              Pick a palette mood to explore matching sticker sheets:
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={handleClose}
                  style={{ backgroundColor: cat.bgColor }}
                  className="flex items-center gap-3 rounded-lg border border-[#F2E0E6] p-2.5 text-left transition-transform hover:-translate-y-0.5"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-[#5B3E3E]">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-[#8B6D6D]">
                      View {cat.itemCount} packs
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {infoTopic === "contact" && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E]">
              Contact Our Studio
            </h2>
            <p className="mt-1 text-xs text-[#8B6D6D]">
              Questions about custom sticker bundles or wholesale orders? Send us
              a note.
            </p>

            {sentReply ? (
              <div className="mt-4 rounded-lg border border-[#DCEAD5] bg-[#F5FBF2] p-5 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-[#6FA856]" />
                <p className="mt-2 text-sm font-medium text-[#4B6B3D]">
                  {sentReply}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-[#EED6DF] bg-white px-3.5 py-2 text-sm text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
                />
                {sendError && (
                  <p className="text-xs text-[#C94A6A]">{sendError}</p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F291AC] py-2.5 font-display text-sm font-semibold text-white hover:bg-[#E67B99] disabled:opacity-60"
                >
                  {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        )}

        {infoTopic === "shipping" && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E]">
              Shipping & Delivery
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              All orders over $50 ship free with tracked rigid-mailer protection
              so your sticker sheets arrive completely flat. Orders under $50
              ship for a flat $4.99 rate and dispatch within 1–2 business days.
            </p>
          </div>
        )}

        {infoTopic === "returns" && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E]">
              Returns & Refunds
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              Unopened sticker packs can be returned or exchanged within 30 days
              of delivery. If any sheet arrives bent or damaged in transit, we
              replace it free of charge.
            </p>
          </div>
        )}

        {infoTopic === "privacy" && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E]">
              Privacy Policy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              Pangpangshop only collects shipping details needed to fulfill your
              order and never sells or shares customer information with third
              parties.
            </p>
          </div>
        )}

        {infoTopic === "terms" && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E]">
              Terms of Service
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B4C4C]">
              All Pangpangshop character artwork and sticker illustrations are
              for personal journaling, gifting, and creative craft use.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
