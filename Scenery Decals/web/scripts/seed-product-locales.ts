import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";
import { CATEGORIES, INITIAL_PRODUCTS } from "../src/shared/catalog/catalog";
import { localizeCategory, localizeProduct } from "../src/shared/catalog/localize";

config({ path: ".env.local", quiet: true });

async function main() {
  const pool = getMySqlPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

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
          category_label_zh = ?, category_label_ko = ?
         WHERE id = ?`,
        [
          chinese.title,
          korean.title,
          chinese.description,
          korean.description,
          chinese.categoryLabel,
          korean.categoryLabel,
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
