import { readFile } from "node:fs/promises";
import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";

config({ path: ".env.local" });

async function main() {
  const schema = await readFile(
    new URL("../src/backend/db/schema.sql", import.meta.url),
    "utf8"
  );
  const pool = getMySqlPool();
  const connection = await pool.getConnection();
  try {
    const statements = schema
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await connection.query(statement);
    }
    await connection.query(`INSERT INTO product_categories (slug, name)
      SELECT category, MAX(category_label) FROM products GROUP BY category
      ON DUPLICATE KEY UPDATE name = VALUES(name)`);
    const [adminNoteColumn] = await connection.query(
      "SHOW COLUMNS FROM reservations LIKE 'admin_note'"
    );
    if (Array.isArray(adminNoteColumn) && adminNoteColumn.length === 0) {
      await connection.query("ALTER TABLE reservations ADD COLUMN admin_note TEXT NULL AFTER status");
    }
    const contactColumns = [["kakao_talk", "VARCHAR(80) NULL"], ["whatsapp", "VARCHAR(80) NULL"]] as const;
    for (const [name, definition] of contactColumns) {
      const [column] = await connection.query(`SHOW COLUMNS FROM reservation_contacts LIKE '${name}'`);
      if (Array.isArray(column) && column.length === 0) await connection.query(`ALTER TABLE reservation_contacts ADD COLUMN ${name} ${definition}`);
    }
    const productColumns = [
      ["product_code", "INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE"],
      ["title_zh", "VARCHAR(255) NULL"],
      ["title_ko", "VARCHAR(255) NULL"],
      ["category", "VARCHAR(80) NOT NULL DEFAULT 'daily-moments'"],
      ["category_label", "VARCHAR(120) NOT NULL DEFAULT 'Daily Moments'"],
      ["category_label_zh", "VARCHAR(120) NULL"],
      ["category_label_ko", "VARCHAR(120) NULL"],
      ["price", "DECIMAL(10,2) NOT NULL DEFAULT 0"],
      ["tag", "VARCHAR(20) NULL"],
      ["image_url", "VARCHAR(500) NOT NULL DEFAULT ''"],
      ["images_json", "JSON NULL"],
      ["description", "TEXT NOT NULL"],
      ["description_zh", "TEXT NULL"],
      ["description_ko", "TEXT NULL"],
      ["sheet_count", "VARCHAR(120) NOT NULL DEFAULT ''"],
      ["dimensions", "VARCHAR(120) NOT NULL DEFAULT ''"],
      ["finishes_json", "JSON NULL"],
      ["section", "VARCHAR(30) NOT NULL DEFAULT 'new-arrival'"],
    ] as const;
    for (const [name, definition] of productColumns) {
      const [column] = await connection.query(`SHOW COLUMNS FROM products LIKE '${name}'`);
      if (Array.isArray(column) && column.length === 0) {
        await connection.query(`ALTER TABLE products ADD COLUMN ${name} ${definition}`);
      }
    }
    const categoryColumns = [["name_zh", "VARCHAR(120) NULL"], ["name_ko", "VARCHAR(120) NULL"], ["image_url", "VARCHAR(500) NOT NULL DEFAULT ''"]] as const;
    for (const [name, definition] of categoryColumns) { const [column] = await connection.query(`SHOW COLUMNS FROM product_categories LIKE '${name}'`); if (Array.isArray(column) && column.length === 0) await connection.query(`ALTER TABLE product_categories ADD COLUMN ${name} ${definition}`); }
    await connection.query("UPDATE products SET title_zh = COALESCE(title_zh, title), title_ko = COALESCE(title_ko, title), category_label_zh = COALESCE(category_label_zh, category_label), category_label_ko = COALESCE(category_label_ko, category_label), description_zh = COALESCE(description_zh, description), description_ko = COALESCE(description_ko, description)");
    await connection.query("UPDATE products SET images_json = JSON_ARRAY(image_url) WHERE images_json IS NULL AND image_url <> ''");
    await connection.query("UPDATE product_categories SET name_zh = COALESCE(name_zh, name), name_ko = COALESCE(name_ko, name)");
    await connection.query(`UPDATE product_categories SET image_url = CASE slug
      WHEN 'flower-garden' THEN '/images/stickers_flower_garden_1795164162716.jpg'
      WHEN 'little-animals' THEN '/images/stickers_little_animals_1795164162625.jpg'
      WHEN 'sweet-days' THEN '/images/stickers_sweet_days_1795164162689.jpg'
      WHEN 'dreamy-world' THEN '/images/stickers_dreamy_world_1795164162404.jpg'
      WHEN 'vintage-diary' THEN '/images/stickers_vintage_diary_1795164162616.jpg'
      WHEN 'daily-moments' THEN '/images/stickers_daily_moments_1795164162424.jpg'
      ELSE image_url END WHERE image_url IS NULL OR image_url = ''`);
    const [heroLayoutColumn] = await connection.query("SHOW COLUMNS FROM homepage_hero_ads LIKE 'layout_json'");
    if (Array.isArray(heroLayoutColumn) && heroLayoutColumn.length === 0) await connection.query("ALTER TABLE homepage_hero_ads ADD COLUMN layout_json TEXT NULL AFTER bubble_ko");
    await connection.query("UPDATE homepage_hero_ads SET layout_json = COALESCE(layout_json, '{\\\"title\\\":{\\\"x\\\":8,\\\"y\\\":35},\\\"subtitle\\\":{\\\"x\\\":8,\\\"y\\\":60},\\\"cta\\\":{\\\"x\\\":8,\\\"y\\\":72},\\\"bubble\\\":{\\\"x\\\":80,\\\"y\\\":8}}')");
    await connection.query(`INSERT IGNORE INTO homepage_hero_ads (id, image_url, link_url, is_active, title, title_zh, title_ko, subtitle, subtitle_zh, subtitle_ko, cta, cta_zh, cta_ko, bubble, bubble_zh, bubble_ko, layout_json) VALUES ('home-hero', '/images/hero_bunny_journal_1795164162888.jpg', '/#best-sellers', TRUE, 'Little Stickers, Big Happiness.', '小小贴纸，大大快乐。', '작은 스티커, 큰 행복.', 'Make every page a little more special.', '让每一页都变得更加特别。', '매일의 페이지를 더 특별하게 꾸며보세요.', 'Shop Now', '立即选购', '쇼핑하기', 'Let''s create something cute!', '一起创作可爱的作品吧！', '함께 귀여운 작품을 만들어요!', '{"title":{"x":8,"y":35},"subtitle":{"x":8,"y":60},"cta":{"x":8,"y":72},"bubble":{"x":80,"y":8}}')`);
    console.log("MySQL schema migration completed.");
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
