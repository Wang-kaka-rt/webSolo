import "server-only";

import { z } from "zod";
import { getHeroAdvertisement, saveHeroAdvertisement } from "@/backend/repositories/advertisementRepository";

const heroSchema = z.object({ id: z.literal("home-hero"), imageUrl: z.string().trim().min(1).max(500), linkUrl: z.string().trim().max(500), isActive: z.boolean(), title: z.string().trim().min(1).max(255), titleZh: z.string().trim().min(1).max(255), titleKo: z.string().trim().min(1).max(255), subtitle: z.string().trim().min(1).max(500), subtitleZh: z.string().trim().min(1).max(500), subtitleKo: z.string().trim().min(1).max(500), cta: z.string().trim().min(1).max(80), ctaZh: z.string().trim().min(1).max(80), ctaKo: z.string().trim().min(1).max(80), bubble: z.string().trim().min(1).max(160), bubbleZh: z.string().trim().min(1).max(160), bubbleKo: z.string().trim().min(1).max(160), layoutJson: z.string().max(2000) });
export class AdvertisementInputError extends Error {}
export async function getAdminHeroAdvertisement() { return getHeroAdvertisement(); }
export async function updateHeroAdvertisement(raw: unknown) { const parsed = heroSchema.safeParse(raw); if (!parsed.success) throw new AdvertisementInputError(parsed.error.issues[0]?.message ?? "广告内容不正确。"); return saveHeroAdvertisement(parsed.data); }
