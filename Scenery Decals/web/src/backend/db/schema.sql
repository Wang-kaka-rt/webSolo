CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(80) NOT NULL,
  product_code INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_zh VARCHAR(255) NULL,
  title_ko VARCHAR(255) NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'daily-moments',
  category_label VARCHAR(120) NOT NULL DEFAULT 'Daily Moments',
  category_label_zh VARCHAR(120) NULL,
  category_label_ko VARCHAR(120) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  images_json JSON NULL,
  description TEXT NOT NULL,
  description_zh TEXT NULL,
  description_ko TEXT NULL,
  sheet_count VARCHAR(120) NOT NULL DEFAULT '',
  dimensions VARCHAR(120) NOT NULL DEFAULT '',
  finishes_json JSON NOT NULL,
  section VARCHAR(30) NOT NULL DEFAULT 'new-arrival',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY products_code_unique (product_code),
  UNIQUE KEY products_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_categories (
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  name_zh VARCHAR(120) NULL,
  name_ko VARCHAR(120) NULL,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_finishes (
  code VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  name_zh VARCHAR(120) NOT NULL,
  name_ko VARCHAR(120) NOT NULL,
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS homepage_hero_ads (
  id VARCHAR(80) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500) NOT NULL DEFAULT '/#best-sellers',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  title VARCHAR(255) NOT NULL,
  title_zh VARCHAR(255) NOT NULL,
  title_ko VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500) NOT NULL,
  subtitle_zh VARCHAR(500) NOT NULL,
  subtitle_ko VARCHAR(500) NOT NULL,
  cta VARCHAR(80) NOT NULL,
  cta_zh VARCHAR(80) NOT NULL,
  cta_ko VARCHAR(80) NOT NULL,
  bubble VARCHAR(160) NOT NULL,
  bubble_zh VARCHAR(160) NOT NULL,
  bubble_ko VARCHAR(160) NOT NULL,
  layout_json TEXT NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL,
  email VARCHAR(254) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  password_hash CHAR(128) NOT NULL,
  password_salt CHAR(32) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory (
  product_id VARCHAR(80) NOT NULL,
  on_hand_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  reserved_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (product_id),
  CONSTRAINT inventory_product_fk FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT inventory_reserved_check CHECK (reserved_quantity <= on_hand_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) NOT NULL,
  reference_no VARCHAR(32) NOT NULL,
  status ENUM('submitted','notified','contacted','confirmed','fulfilled','cancelled','expired','declined') NOT NULL DEFAULT 'submitted',
  admin_note TEXT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY reservations_reference_unique (reference_no),
  KEY reservations_status_expires_idx (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservation_contacts (
  reservation_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NULL,
  phone VARCHAR(40) NULL,
  wechat VARCHAR(80) NULL,
  kakao_talk VARCHAR(80) NULL,
  whatsapp VARCHAR(80) NULL,
  note TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (reservation_id),
  KEY reservation_contacts_email_idx (email),
  CONSTRAINT reservation_contacts_reservation_fk FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservation_items (
  id CHAR(36) NOT NULL,
  reservation_id CHAR(36) NOT NULL,
  product_id VARCHAR(80) NOT NULL,
  product_title_snapshot VARCHAR(255) NOT NULL,
  finish VARCHAR(80) NULL,
  quantity INT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY reservation_items_reservation_idx (reservation_id),
  KEY reservation_items_product_idx (product_id),
  CONSTRAINT reservation_items_reservation_fk FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  CONSTRAINT reservation_items_product_fk FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id CHAR(36) NOT NULL,
  product_id VARCHAR(80) NOT NULL,
  previous_on_hand_quantity INT UNSIGNED NOT NULL,
  new_on_hand_quantity INT UNSIGNED NOT NULL,
  reason VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY inventory_adjustments_product_created_idx (product_id, created_at),
  CONSTRAINT inventory_adjustments_product_fk FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
