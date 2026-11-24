import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";
import { CATEGORIES, INITIAL_PRODUCTS } from "../src/shared/catalog/catalog";
import { localizeCategory, localizeProduct } from "../src/shared/catalog/localize";

const finishTranslations = [
  ["Matte Vinyl", "Matte Vinyl", "哑光乙烯基", "무광 비닐"],
  ["Glossy Washi", "Glossy Washi", "亮面和纸", "글로시 와시"],
  ["Holographic Sparkle", "Holographic Sparkle", "镭射闪光", "홀로그램 스파클"],
] as const;

function localizedTag(tag: string | null, locale: "zh" | "ko") {
  if (!tag) return null;
  if (tag === "Hot") return locale === "zh" ? "热销" : "인기";
  if (tag === "New") return locale === "zh" ? "新品" : "신상품";
  return tag;
}

config({ path: ".env.local", quiet: true });

async function main() {
  const pool = getMySqlPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const [code, name, chinese, korean] of finishTranslations) {
      await connection.execute(
        `INSERT INTO product_finishes (code, name, name_zh, name_ko) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), name_zh = VALUES(name_zh), name_ko = VALUES(name_ko)`,
        [code, name, chinese, korean]
      );
    }

    for (const category of CATEGORIES) {
      const chinese = localizeCategory(category, "zh").name;
      const korean = localizeCategory(category, "ko").name;
      await connection.execute(
        "UPDATE product_categories SET name_zh = ?, name_ko = ? WHERE slug = ?",
        [chinese, korean, category.slug]
      );
    }

    for (const product of INITIAL_PRODUCTS) {
      const chinese = localizeProduct(product, "zh");
      const korean = localizeProduct(product, "ko");
      await connection.execute(
        `UPDATE products SET
          title_zh = ?, title_ko = ?,
          description_zh = ?, description_ko = ?,
          category_label_zh = ?, category_label_ko = ?,
          tag_zh = ?, tag_ko = ?
         WHERE id = ?`,
        [
          chinese.title,
          korean.title,
          chinese.description,
          korean.description,
          chinese.categoryLabel,
          korean.categoryLabel,
          localizedTag(product.tag, "zh"),
          localizedTag(product.tag, "ko"),
          product.id,
        ]
      );
    }

    await connection.commit();
    console.log(`Seeded Chinese and Korean translations for ${INITIAL_PRODUCTS.length} products and ${CATEGORIES.length} categories.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
