import type { CategoryTile, Product, StickerFinish } from "@/shared/types/store";

export type StoreLocale = "zh" | "en" | "ko";

type ProductCopy = Pick<Product, "title" | "description" | "sheetCount" | "dimensions">;

const categoryCopy: Record<Exclude<CategoryTile["slug"], never>, Record<StoreLocale, string>> = {
  "flower-garden": { zh: "花园花语", en: "Flower Garden", ko: "꽃의 정원" },
  "little-animals": { zh: "小动物乐园", en: "Little Animals", ko: "작은 동물들" },
  "sweet-days": { zh: "甜蜜日常", en: "Sweet Days", ko: "달콤한 하루" },
  "dreamy-world": { zh: "梦幻世界", en: "Dreamy World", ko: "꿈꾸는 세계" },
  "vintage-diary": { zh: "复古手帐", en: "Vintage Diary", ko: "빈티지 다이어리" },
  "daily-moments": { zh: "日常片刻", en: "Daily Moments", ko: "일상의 순간" },
};

const productCopy: Record<string, Partial<Record<Exclude<StoreLocale, "en">, ProductCopy>>> = {
  "prod-blooming-flowers": {
    zh: { title: "繁花小兔贴纸套装", description: "柔和的郁金香、樱花、雏菊和害羞探头的小兔，采用防水哑光乙烯基印制，适合手帐、手机壳和信件。", sheetCount: "6 张模切贴纸（42 枚）", dimensions: "120 × 170 毫米" },
    ko: { title: "피어나는 꽃 스티커 팩", description: "파스텔 튤립, 벚꽃, 데이지와 수줍은 토끼가 담긴 방수 무광 비닐 스티커예요. 플래너, 휴대폰 케이스, 편지에 잘 어울립니다.", sheetCount: "다이컷 시트 6장 (스티커 42개)", dimensions: "120 × 170 mm" },
  },
  "prod-dreamy-castle": {
    zh: { title: "梦幻城堡贴纸", description: "薰衣草色城堡尖塔、微笑云朵、弯月和粉彩丝带，让每月手帐页像童话故事一样迷人。", sheetCount: "5 张吻切贴纸（38 枚）", dimensions: "125 × 175 毫米" },
    ko: { title: "꿈꾸는 성 스티커", description: "라벤더 성의 첨탑, 미소 짓는 구름, 초승달과 파스텔 리본으로 월간 플래너를 동화처럼 꾸며보세요.", sheetCount: "키스컷 시트 5장 (스티커 38개)", dimensions: "125 × 175 mm" },
  },
  "prod-cute-animal": {
    zh: { title: "可爱动物贴纸套装", description: "圆滚滚的可可熊、啃胡萝卜的小兔和红脸小鸡，非常适合记录每日心情或包装礼物。", sheetCount: "6 张贴纸（48 枚）", dimensions: "120 × 170 毫米" },
    ko: { title: "귀여운 동물 스티커 팩", description: "통통한 코코아 곰, 당근을 먹는 토끼, 볼 빨간 병아리가 담겨 일상 무드 트래커와 선물 포장에 잘 어울려요.", sheetCount: "시트 6장 (스티커 48개)", dimensions: "120 × 170 mm" },
  },
  "prod-vintage-journal": {
    zh: { title: "复古手帐贴纸", description: "压花野花、传家药房标签、蕾丝边框和水彩花束印在半透明奶油色和纸上。", sheetCount: "8 张贴纸（54 枚）", dimensions: "110 × 165 毫米" },
    ko: { title: "빈티지 저널 스티커", description: "압화 들꽃, 빈티지 약국 라벨, 레이스 프레임과 수채화 부케가 반투명 크림 와시에 담겼어요.", sheetCount: "시트 8장 (스티커 54개)", dimensions: "110 × 165 mm" },
  },
  "prod-tulip-meadow": {
    zh: { title: "樱花小兔贴纸单张", description: "春日樱花枝、飞舞花瓣和戴着花环的小白兔，为相册和手帐角落添上晴朗气息。", sheetCount: "3 张贴纸（24 枚）", dimensions: "105 × 150 毫米" },
    ko: { title: "벚꽃 토끼 스티커 시트", description: "봄 벚꽃 가지와 흩날리는 꽃잎, 꽃 화관을 쓴 작은 흰 토끼가 스크랩북 모서리를 화사하게 만들어 줍니다.", sheetCount: "시트 3장 (스티커 24개)", dimensions: "105 × 150 mm" },
  },
  "prod-strawberry-patisserie": {
    zh: { title: "草莓甜点贴纸套装", description: "微笑草莓蛋糕、粉彩马卡龙、茶壶和缎带，像为手帐烤出的甜蜜小点心。", sheetCount: "4 张贴纸（32 枚）", dimensions: "115 × 165 毫米" },
    ko: { title: "딸기 파티세리 팩", description: "웃는 딸기 케이크, 파스텔 마카롱, 티포트와 새틴 리본이 플래너에 달콤한 디저트 감성을 더해요.", sheetCount: "시트 4장 (스티커 32개)", dimensions: "115 × 165 mm" },
  },
  "prod-satin-ribbons": {
    zh: { title: "粉彩缎带蝴蝶结套装", description: "缎带蝴蝶结、格纹丝带、珍珠爱心吊坠和蕾丝边框，专为拍立得和待办标题设计。", sheetCount: "4 张贴纸（36 枚）", dimensions: "110 × 160 毫米" },
    ko: { title: "파스텔 리본 & 보우 세트", description: "새틴 보우, 깅엄 리본, 진주 하트 참과 레이스 프레임으로 폴라로이드와 할 일 제목을 꾸며보세요.", sheetCount: "시트 4장 (스티커 36개)", dimensions: "110 × 160 mm" },
  },
  "prod-starlight-kingdom": {
    zh: { title: "星光王国和纸套装", description: "睡在粉彩云朵上的小兔、金色弯月、彩虹和梦幻星光，营造温柔夜色。", sheetCount: "5 张贴纸（40 枚）", dimensions: "125 × 175 毫米" },
    ko: { title: "별빛 왕국 와시 세트", description: "파스텔 구름 위에서 잠든 토끼, 금빛 초승달, 무지개와 별빛 포인트가 부드러운 밤을 완성합니다.", sheetCount: "시트 5장 (스티커 40개)", dimensions: "125 × 175 mm" },
  },
  "prod-botanical-herbarium": {
    zh: { title: "植物标本贴纸", description: "压制洋甘菊、干桉树枝、火漆印和古董邮票，为自然手帐带来宁静质感。", sheetCount: "6 张贴纸（44 枚）", dimensions: "110 × 165 毫米" },
    ko: { title: "보태니컬 허바리움 시트", description: "압화 캐모마일, 말린 유칼립투스, 왁스 실과 앤티크 우표로 고요한 자연 저널을 완성해요.", sheetCount: "시트 6장 (스티커 44개)", dimensions: "110 × 165 mm" },
  },
  "prod-cozy-cafe-bear": {
    zh: { title: "治愈咖啡早晨贴纸套装", description: "拉花咖啡、可颂、在毯子里读书的小熊和迷你盆栽，记录安静又温暖的清晨。", sheetCount: "5 张贴纸（36 枚）", dimensions: "120 × 170 毫米" },
    ko: { title: "포근한 카페 모닝 팩", description: "라테 아트, 바삭한 크루아상, 담요 아래 책 읽는 곰과 작은 화분으로 고요한 아침을 기록해 보세요.", sheetCount: "시트 5장 (스티커 36개)", dimensions: "120 × 170 mm" },
  },
};

const finishCopy: Record<StickerFinish, Record<StoreLocale, string>> = {
  "Matte Vinyl": { zh: "哑光乙烯基", en: "Matte Vinyl", ko: "무광 비닐" },
  "Glossy Washi": { zh: "亮面和纸", en: "Glossy Washi", ko: "글로시 와시" },
  "Holographic Sparkle": { zh: "镭射闪光", en: "Holographic Sparkle", ko: "홀로그램 스파클" },
};

export function localizeCategory(category: CategoryTile, locale: StoreLocale): CategoryTile {
  return { ...category, name: categoryCopy[category.slug][locale] };
}

export function categoryName(slug: CategoryTile["slug"], locale: StoreLocale) {
  return categoryCopy[slug][locale];
}

export function localizeProduct(product: Product, locale: StoreLocale): Product {
  const copy = locale === "en" ? undefined : productCopy[product.id]?.[locale];
  return { ...product, ...copy, categoryLabel: categoryName(product.category, locale) };
}

export function localizeFinish(finish: StickerFinish, locale: StoreLocale) {
  return finishCopy[finish][locale];
}

