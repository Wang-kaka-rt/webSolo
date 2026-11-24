import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";

config({ path: ".env.local" });

const translations: Record<string, [string, string, string, string]> = {
  "blooming-flowers-sticker-pack": ["盛放花朵贴纸套装", "피어나는 꽃 스티커 팩", "阳光草地上的郁金香、樱花、雏菊与小兔贴纸，适合手帐、手机壳和信件。", "튤립, 벚꽃, 데이지와 작은 토끼가 담긴 화사한 스티커 팩으로 다이어리와 편지 꾸미기에 좋아요."],
  "dreamy-castle-stickers": ["梦幻城堡贴纸", "꿈의 성 스티커", "薰衣草色城堡、微笑云朵、月亮与丝带，让月度手帐成为童话故事。", "라벤더 성, 미소 짓는 구름, 달과 리본으로 다이어리를 동화처럼 꾸며 보세요."],
  "cute-animal-sticker-pack": ["可爱动物贴纸套装", "귀여운 동물 스티커 팩", "圆滚滚的小熊、兔子和小鸡，适合每日心情记录与礼物包装。", "통통한 곰, 토끼, 병아리 스티커로 기분 기록과 선물 포장을 꾸며 보세요."],
  "vintage-journal-stickers": ["复古手帐贴纸", "빈티지 저널 스티커", "压花野花、药房标签、蕾丝边框和水彩花束，适合复古手帐。", "압화 야생화, 빈티지 라벨과 레이스 프레임으로 저널을 우아하게 꾸며 보세요."],
  "pastel-tulip-meadow-sheet": ["樱花兔子贴纸页", "벚꽃 토끼 스티커 시트", "春日樱花枝、飘落花瓣和花冠小兔，为剪贴角落增添明亮气息。", "봄 벚꽃과 꽃관을 쓴 토끼로 스크랩북 모서리를 산뜻하게 꾸며 보세요."],
  "strawberry-patisserie-pack": ["草莓甜点贴纸套装", "딸기 파티세리 스티커 팩", "草莓蛋糕、马卡龙、茶壶和丝带，为日程本带来甜蜜点缀。", "딸기 케이크와 마카롱, 찻주전자 스티커로 플래너에 달콤함을 더하세요."],
  "pastel-ribbon-bow-collection": ["粉彩蝴蝶结贴纸套装", "파스텔 리본 보우 컬렉션", "缎带蝴蝶结、格纹丝带和蕾丝边框，用于装饰照片和待办标题。", "새틴 리본과 깅엄 리본, 레이스 프레임으로 사진과 할 일 제목을 꾸며 보세요."],
  "starlight-kingdom-washi-set": ["星光王国和纸套装", "별빛 왕국 와시 세트", "云朵上的小兔、金色月亮和彩虹，打造梦幻星光手帐。", "구름 위 토끼, 금빛 달과 무지개로 몽환적인 다이어리를 완성하세요."],
  "botanical-herbarium-sheets": ["植物标本贴纸页", "보태니컬 허바리움 스티커 시트", "压制洋甘菊、桉树枝、火漆印与古董邮票，适合自然手帐。", "압화 캐모마일, 유칼립투스, 밀랍 인장과 빈티지 우표로 자연 저널을 꾸며 보세요."],
  "cozy-cafe-morning-pack": ["温馨咖啡早晨贴纸套装", "포근한 카페 모닝 스티커 팩", "拉花咖啡、可颂、阅读小熊和盆栽，记录安静的早晨时光。", "라테 아트, 크루아상, 책 읽는 곰과 화분으로 포근한 아침을 기록해 보세요."]
};

const categories = [["flower-garden", "花园花语", "플라워 가든"], ["little-animals", "可爱动物", "작은 동물"], ["sweet-days", "甜蜜日常", "달콤한 날들"], ["dreamy-world", "梦幻世界", "꿈의 세계"], ["vintage-diary", "复古手帐", "빈티지 다이어리"], ["daily-moments", "日常时光", "일상의 순간들"]] as const;
async function main() { const pool = getMySqlPool(); try { for (const [slug, [zh, ko, descriptionZh, descriptionKo]] of Object.entries(translations)) await pool.execute("UPDATE products SET title_zh = ?, title_ko = ?, description_zh = ?, description_ko = ? WHERE slug = ?", [zh, ko, descriptionZh, descriptionKo, slug]); for (const [slug, zh, ko] of categories) { await pool.execute("UPDATE product_categories SET name_zh = ?, name_ko = ? WHERE slug = ?", [zh, ko, slug]); await pool.execute("UPDATE products SET category_label_zh = ?, category_label_ko = ? WHERE category = ?", [zh, ko, slug]); } console.log("Translated product and category locales updated."); } finally { await pool.end(); } }
main().catch((error) => { console.error(error); process.exitCode = 1; });
