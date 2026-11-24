import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";
import { CATEGORIES, INITIAL_PRODUCTS } from "../src/shared/catalog/catalog";

config({ path: ".env.local" });

async function main() {
  const pool = getMySqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const category of CATEGORIES) {
      await connection.execute(
        `INSERT INTO product_categories (slug, name, image_url) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), image_url = VALUES(image_url)`,
        [category.slug, category.name, category.image]
      );
    }
    for (const product of INITIAL_PRODUCTS) {
      await connection.execute(
        `INSERT INTO products (id, slug, title, category, category_label, price, tag, image_url, description, sheet_count, dimensions, finishes_json, section, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE slug = VALUES(slug), title = VALUES(title), category = VALUES(category), category_label = VALUES(category_label), price = VALUES(price), tag = VALUES(tag), image_url = VALUES(image_url), description = VALUES(description), sheet_count = VALUES(sheet_count), dimensions = VALUES(dimensions), finishes_json = VALUES(finishes_json), section = VALUES(section), is_active = TRUE`,
        [product.id, product.slug, product.title, product.category, product.categoryLabel, product.price, product.tag, product.image, product.description, product.sheetCount, product.dimensions, JSON.stringify(product.finishes), product.section]
      );
      await connection.execute(
        `INSERT INTO inventory (product_id, on_hand_quantity, reserved_quantity)
         VALUES (?, 10, 0)
         ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)`,
        [product.id]
      );
    }
    await connection.commit();
    console.log(`Seeded ${INITIAL_PRODUCTS.length} products with an initial stock of 10.`);
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
