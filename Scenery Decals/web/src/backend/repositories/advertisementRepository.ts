import "server-only";

import type { RowDataPacket } from "mysql2";
import { getMySqlPool } from "@/backend/db/mysql";
import type { HeroAdvertisement } from "@/shared/types/advertisement";

interface HeroRow extends RowDataPacket, HeroAdvertisement {
  image_url: string; link_url: string; is_active: number;
  title_zh: string; title_ko: string; subtitle_zh: string; subtitle_ko: string;
  cta_zh: string; cta_ko: string; bubble_zh: string; bubble_ko: string; layout_json: string;
}

function toHero(row: HeroRow): HeroAdvertisement {
  return { id: row.id, imageUrl: row.image_url, linkUrl: row.link_url, isActive: Boolean(row.is_active), title: row.title, titleZh: row.title_zh, titleKo: row.title_ko, subtitle: row.subtitle, subtitleZh: row.subtitle_zh, subtitleKo: row.subtitle_ko, cta: row.cta, ctaZh: row.cta_zh, ctaKo: row.cta_ko, bubble: row.bubble, bubbleZh: row.bubble_zh, bubbleKo: row.bubble_ko, layoutJson: row.layout_json };
}

export async function getHeroAdvertisement() {
  const [rows] = await getMySqlPool().query<HeroRow[]>("SELECT * FROM homepage_hero_ads WHERE id = 'home-hero' LIMIT 1");
  return rows[0] ? toHero(rows[0]) : null;
}

export async function saveHeroAdvertisement(input: HeroAdvertisement) {
  await getMySqlPool().execute(`UPDATE homepage_hero_ads SET image_url=?, link_url=?, is_active=?, title=?, title_zh=?, title_ko=?, subtitle=?, subtitle_zh=?, subtitle_ko=?, cta=?, cta_zh=?, cta_ko=?, bubble=?, bubble_zh=?, bubble_ko=?, layout_json=? WHERE id='home-hero'`, [input.imageUrl, input.linkUrl, input.isActive, input.title, input.titleZh, input.titleKo, input.subtitle, input.subtitleZh, input.subtitleKo, input.cta, input.ctaZh, input.ctaKo, input.bubble, input.bubbleZh, input.bubbleKo, input.layoutJson]);
  return getHeroAdvertisement();
}
