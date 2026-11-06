
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { MOCK_ADMIN_ORDERS } from "@/data/mockAdminOrders";

import type { ProductCategory } from "@/types/product";
import { CatalogError, productCategories, slugify, validateCatalog } from "@/lib/catalog";

const DB_PATH = path.join(process.cwd(), "data", "laseruv.db");

// Singleton connection across Next.js reloads
declare global {
  // eslint-disable-next-line no-var
  var __laseruv_db: DatabaseSync | undefined;
}

let catalogMigrated = false;

function getDatabase(): DatabaseSync {
  if (!global.__laseruv_db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const db = new DatabaseSync(DB_PATH);
    // Optimize performance and durability
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    initSchema(db);
    seedInitialData(db);
    global.__laseruv_db = db;
  }
  if (!catalogMigrated) {
    migrateCatalog(global.__laseruv_db);
    catalogMigrated = true;
  }
  return global.__laseruv_db;
}

// Additive migration: existing products, accounts, and orders are preserved.
function migrateCatalog(db: DatabaseSync) {
  const columns = db.prepare("PRAGMA table_info(products)").all();
  if (!columns.some(column => column.name === "catalog_json")) db.exec("ALTER TABLE products ADD COLUMN catalog_json TEXT NOT NULL DEFAULT '{}'");
  db.exec(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, data_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS catalog_redirects (kind TEXT NOT NULL, slug TEXT NOT NULL, entity_id TEXT NOT NULL, PRIMARY KEY(kind, slug));`);
  const seed = db.prepare("INSERT OR IGNORE INTO categories (id, slug, data_json) VALUES (?, ?, ?)");
  for (const category of CATEGORIES) seed.run(category.id, category.slug, JSON.stringify(category));
}

function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try { const result = work(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}

function checkSlug(db: DatabaseSync, kind: "product" | "category", slug: string, id: string) {
  const table = kind === "product" ? "products" : "categories";
  const active = db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug);
  const alias = db.prepare("SELECT entity_id FROM catalog_redirects WHERE kind = ? AND slug = ?").get(kind, slug);
  if ((active && active.id !== id) || (alias && alias.entity_id !== id)) throw new CatalogError("This slug is already used by another item or its redirect. Choose a different slug.");
}

function saveRedirect(db: DatabaseSync, kind: string, id: string, oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  db.prepare("DELETE FROM catalog_redirects WHERE kind = ? AND slug = ? AND entity_id = ?").run(kind, newSlug, id);
  db.prepare("INSERT OR REPLACE INTO catalog_redirects (kind, slug, entity_id) VALUES (?, ?, ?)").run(kind, oldSlug, id);
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      is_email_verified INTEGER NOT NULL DEFAULT 0,
      phone TEXT,
      addresses_json TEXT DEFAULT '[]',
      otp_code_hash TEXT,
      otp_expires_at TEXT,
      otp_attempts INTEGER DEFAULT 0,
      otp_cooldown_until TEXT,
      reset_token_hash TEXT,
      reset_token_expires_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      detailed_description TEXT,
      price INTEGER NOT NULL,
      original_price INTEGER,
      category_slug TEXT NOT NULL,
      category_name TEXT NOT NULL,
      images_json TEXT NOT NULL DEFAULT '[]',
      in_stock INTEGER NOT NULL DEFAULT 1,
      rating REAL NOT NULL DEFAULT 5.0,
      reviews_count INTEGER NOT NULL DEFAULT 1,
      badge TEXT,
      customization_json TEXT NOT NULL,
      specs_json TEXT,
      included_items_json TEXT DEFAULT '[]',
      delivery_estimate TEXT DEFAULT '2–3 business days across Pakistan via TCS',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      address_line TEXT NOT NULL,
      nearest_landmark TEXT,
      postal_code TEXT,
      payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery (COD)',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      subtotal INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_confirmation',
      courier_carrier TEXT,
      courier_tracking TEXT,
      dispatched_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      product_slug TEXT NOT NULL,
      product_name TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      image TEXT NOT NULL,
      selected_variants_json TEXT DEFAULT '{}',
      engraving_text TEXT,
      font_choice TEXT,
      engraving_location TEXT,
      logo_file_name TEXT,
      special_instructions TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bulk_quotes (
      id TEXT PRIMARY KEY,
      quote_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      company_name TEXT,
      whatsapp_number TEXT NOT NULL,
      email TEXT,
      product_name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      required_date TEXT,
      customization_requirements TEXT NOT NULL,
      logo_file_name TEXT,
      additional_requirements TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      quoted_amount_pkr INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
}

function seedInitialData(db: DatabaseSync) {
  // 1. Seed products if empty
  const countRow = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO products (
        id, slug, name, tagline, description, detailed_description, price, original_price,
        category_slug, category_name, images_json, in_stock, rating, reviews_count, badge,
        customization_json, specs_json, included_items_json, delivery_estimate, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const p of PRODUCTS) {
      // Normalize images to structured image list
      const images = (p.images || []).map((imgUrl, idx) => ({
        id: `img-${p.id}-${idx}`,
        url: imgUrl,
        altText: `${p.name} - Angle ${idx + 1}`,
        isMain: idx === 0,
        order: idx,
      }));

      insertStmt.run(
        p.id,
        p.slug,
        p.name,
        p.tagline || null,
        p.description,
        p.detailedDescription || null,
        p.price,
        p.originalPrice || null,
        p.categorySlug,
        p.categoryName,
        JSON.stringify(images),
        p.inStock ? 1 : 0,
        p.rating || 5.0,
        p.reviewsCount || 1,
        p.badge || null,
        JSON.stringify(p.customization),
        p.specs ? JSON.stringify(p.specs) : null,
        JSON.stringify(p.includedItems || []),
        p.deliveryEstimate || "2–3 business days across Pakistan via TCS",
        p.createdAt || now,
        now
      );
    }
  }

  // 2. Seed initial admin user if not exists
  const adminRow = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!adminRow) {
    // Default admin: password Admin@LaserUV2026!
    // We import hashPassword inline to avoid circular dependencies
    const crypto = require("node:crypto");
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@laseruvcreatives.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@LaserUV2026!";
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(adminPassword, salt, 64).toString("hex");
    const passwordHash = `${salt}:${hash}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (
        id, full_name, email, password_hash, role, is_email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      "admin-root-01",
      "LaserUVCreatives Admin",
      adminEmail,
      passwordHash,
      "admin",
      now,
      now
    );
  }

  // 3. Seed initial admin orders if empty
  const ordersCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
  if (ordersCount.count === 0 && MOCK_ADMIN_ORDERS.length > 0) {
    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_phone, customer_email,
        city, province, address_line, nearest_landmark, postal_code,
        payment_method, payment_status, subtotal, shipping_fee, total,
        status, courier_carrier, courier_tracking, dispatched_at, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_slug, product_name, unit_price, quantity,
        image, selected_variants_json, engraving_text, font_choice, engraving_location,
        logo_file_name, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const o of MOCK_ADMIN_ORDERS) {
      insertOrderStmt.run(
        o.id,
        o.orderNumber,
        null,
        o.customer.fullName,
        o.customer.phoneNumber,
        o.customer.email || null,
        o.shippingAddress.city,
        o.shippingAddress.province,
        o.shippingAddress.addressLine,
        o.shippingAddress.nearestLandmark || null,
        o.shippingAddress.postalCode || null,
        o.paymentMethod || "Cash on Delivery (COD)",
        o.paymentStatus || "unpaid",
        o.subtotal,
        o.shippingFee,
        o.total,
        o.status,
        o.courier?.carrier || null,
        o.courier?.trackingNumber || null,
        o.courier?.dispatchedAt || null,
        o.notes || null,
        o.createdAt,
        o.createdAt
      );

      for (const item of o.items) {
        insertItemStmt.run(
          item.id,
          o.id,
          item.productId,
          item.productSlug,
          item.productName,
          item.unitPrice,
          item.quantity,
          item.image,
          JSON.stringify(item.selectedVariants || {}),
          item.customization?.engravingText || null,
          item.customization?.fontChoice || null,
          item.customization?.engravingLocation || null,
          item.customization?.logoFileName || null,
          item.customization?.specialInstructions || null
        );
      }
    }
  }
}

// -------------------------------------------------------------
// Database Query Interface
// -------------------------------------------------------------

export const serverDb = {
  // Users
  getUserByEmail(email: string) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as any;
  },

  getUserById(id: string) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  },

  createUser(data: {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role?: string;
    isEmailVerified?: boolean;
    phone?: string;
  }) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (
        id, full_name, email, password_hash, role, is_email_verified, phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.fullName,
      data.email.toLowerCase().trim(),
      data.passwordHash,
      data.role || "customer",
      data.isEmailVerified ? 1 : 0,
      data.phone || null,
      now,
      now
    );
    return this.getUserById(data.id);
  },

  updateUser(id: string, updates: Partial<{
    fullName: string;
    phone: string;
    passwordHash: string;
    isEmailVerified: boolean;
    addressesJson: string;
  }>) {
    const db = getDatabase();
    const sets: string[] = [];
    const values: any[] = [];

    if (updates.fullName !== undefined) {
      sets.push("full_name = ?");
      values.push(updates.fullName);
    }
    if (updates.phone !== undefined) {
      sets.push("phone = ?");
      values.push(updates.phone);
    }
    if (updates.passwordHash !== undefined) {
      sets.push("password_hash = ?");
      values.push(updates.passwordHash);
    }
    if (updates.isEmailVerified !== undefined) {
      sets.push("is_email_verified = ?");
      values.push(updates.isEmailVerified ? 1 : 0);
    }
    if (updates.addressesJson !== undefined) {
      sets.push("addresses_json = ?");
      values.push(updates.addressesJson);
    }

    if (sets.length === 0) return this.getUserById(id);

    sets.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...values);
    return this.getUserById(id);
  },

  // OTP management
  setOtp(userId: string, data: { otpHash: string; expiresAt: string; cooldownUntil: string }) {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        otp_code_hash = ?,
        otp_expires_at = ?,
        otp_cooldown_until = ?,
        otp_attempts = 0,
        updated_at = ?
      WHERE id = ?
    `).run(data.otpHash, data.expiresAt, data.cooldownUntil, new Date().toISOString(), userId);
  },

  incrementOtpAttempts(userId: string) {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET otp_attempts = otp_attempts + 1, updated_at = ? WHERE id = ?
    `).run(new Date().toISOString(), userId);
  },

  clearOtp(userId: string) {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        otp_code_hash = NULL,
        otp_expires_at = NULL,
        otp_cooldown_until = NULL,
        otp_attempts = 0,
        updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), userId);
  },

  // Password reset tokens
  setResetToken(userId: string, data: { tokenHash: string; expiresAt: string }) {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        reset_token_hash = ?,
        reset_token_expires_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(data.tokenHash, data.expiresAt, new Date().toISOString(), userId);
  },

  clearResetToken(userId: string) {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        reset_token_hash = NULL,
        reset_token_expires_at = NULL,
        updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), userId);
  },

  // Sessions
  createSession(tokenHash: string, userId: string, role: string, expiresAt: string) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO sessions (token_hash, user_id, role, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(tokenHash, userId, role, expiresAt, now);
  },

  getSession(tokenHash: string) {
    const db = getDatabase();
    return db.prepare(`
      SELECT s.*, u.full_name, u.email, u.phone, u.is_email_verified
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = ?
    `).get(tokenHash) as any;
  },

  deleteSession(tokenHash: string) {
    const db = getDatabase();
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  },

  deleteUserSessions(userId: string) {
    const db = getDatabase();
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  },

  getCategories(): ProductCategory[] {
    const db = getDatabase();
    const products = this.getProducts();
    return db.prepare("SELECT data_json FROM categories ORDER BY rowid").all().map(row => {
      const category = JSON.parse(String(row.data_json)) as ProductCategory;
      return { ...category, productCount: products.filter(product => productCategories(product).includes(category.slug)).length };
    });
  },

  resolveCatalogSlug(kind: "product" | "category", slug: string): string | null {
    const db = getDatabase();
    const table = kind === "product" ? "products" : "categories";
    const row = db.prepare(`SELECT item.slug FROM catalog_redirects redirect JOIN ${table} item ON item.id = redirect.entity_id WHERE redirect.kind = ? AND redirect.slug = ?`).get(kind, slug);
    return row ? String(row.slug) : null;
  },

  updateCategory(id: string, data: Partial<ProductCategory>) {
    const db = getDatabase();
    const existing = this.getCategories().find(category => category.id === id);
    if (!existing) return null;
    const updated = { ...existing, name: data.name ?? existing.name, slug: data.slug ?? existing.slug, description: data.description ?? existing.description, seo: data.seo ?? existing.seo };
    validateCatalog(updated);
    return transaction(db, () => {
      checkSlug(db, "category", updated.slug, id);
      db.prepare("UPDATE categories SET slug = ?, data_json = ? WHERE id = ?").run(updated.slug, JSON.stringify(updated), id);
      for (const product of this.getProducts()) {
        if (!productCategories(product).includes(existing.slug)) continue;
        const categories = productCategories(product).map(slug => slug === existing.slug ? updated.slug : slug);
        const primary = product.categorySlug === existing.slug;
        const row = db.prepare("SELECT catalog_json FROM products WHERE id = ?").get(product.id)!;
        const extras = { ...JSON.parse(String(row.catalog_json)), categorySlugs: categories };
        db.prepare("UPDATE products SET category_slug = ?, category_name = ?, catalog_json = ?, updated_at = ? WHERE id = ?").run(primary ? updated.slug : product.categorySlug, primary ? updated.name : product.categoryName, JSON.stringify(extras), new Date().toISOString(), product.id);
      }
      saveRedirect(db, "category", id, existing.slug, updated.slug);
      return updated;
    });
  },

  createProduct(data: any) {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const updated = { ...data, id, slug: data.slug || slugify(data.name || "") };
    validateCatalog(updated);
    return transaction(db, () => {
      checkSlug(db, "product", updated.slug, id);
      this.validateProductCategories(updated);
      this.createProductRow(updated);
      this.saveProductCatalog(id, updated);
      return this.getProductById(id);
    });
  },

  updateProduct(id: string, data: any) {
    const db = getDatabase();
    const existing = this.getProductById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id };
    validateCatalog(updated);
    return transaction(db, () => {
      checkSlug(db, "product", updated.slug, id);
      this.validateProductCategories(updated);
      this.updateProductRow(id, { ...data, categoryName: updated.categoryName });
      this.saveProductCatalog(id, updated);
      saveRedirect(db, "product", id, existing.slug, updated.slug);
      return this.getProductById(id);
    });
  },

  validateProductCategories(data: any) {
    const categories = this.getCategories();
    if (data.categorySlugs !== undefined && (!Array.isArray(data.categorySlugs) || data.categorySlugs.some((slug: unknown) => typeof slug !== "string"))) throw new CatalogError("Select valid product categories.");
    if (!data.categorySlug || productCategories(data).some(slug => !categories.some(category => category.slug === slug))) throw new CatalogError("Select existing categories for this product.");
    data.categoryName = categories.find(category => category.slug === data.categorySlug)!.name;
  },

  saveProductCatalog(id: string, data: any) {
    getDatabase().prepare("UPDATE products SET catalog_json = ? WHERE id = ?").run(JSON.stringify({ categorySlugs: productCategories(data), seo: data.seo, video: data.video, variants: data.variants }), id);
  },

  // Products
  getProducts() {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all() as any[];
    return rows.map(formatProductRow);
  },

  getProductBySlug(slug: string) {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as any;
    return row ? formatProductRow(row) : null;
  },

  getProductById(id: string) {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
    return row ? formatProductRow(row) : null;
  },

  createProductRow(data: any) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = data.id || `luc-prod-${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    db.prepare(`
      INSERT INTO products (
        id, slug, name, tagline, description, detailed_description, price, original_price,
        category_slug, category_name, images_json, in_stock, rating, reviews_count, badge,
        customization_json, specs_json, included_items_json, delivery_estimate, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      slug,
      data.name,
      data.tagline || null,
      data.description,
      data.detailedDescription || null,
      Number(data.price),
      data.originalPrice ? Number(data.originalPrice) : null,
      data.categorySlug,
      data.categoryName || data.categorySlug,
      JSON.stringify(normalizeImagesInput(data.productImages || data.images, data.name)),
      data.inStock !== false ? 1 : 0,
      data.rating || 5.0,
      data.reviewsCount || 1,
      data.badge || null,
      JSON.stringify(data.customization || { allowsText: true, maxTextLength: 25, allowsLogo: false, engravingLocations: ["Standard"], fontOptions: [] }),
      data.specs ? JSON.stringify(data.specs) : null,
      JSON.stringify(data.includedItems || []),
      data.deliveryEstimate || "2–3 business days across Pakistan via TCS",
      now,
      now
    );

    return this.getProductById(id);
  },

  updateProductRow(id: string, data: any) {
    const db = getDatabase();
    const existing = this.getProductById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE products SET
        name = ?,
        slug = ?,
        tagline = ?,
        description = ?,
        detailed_description = ?,
        price = ?,
        original_price = ?,
        category_slug = ?,
        category_name = ?,
        images_json = ?,
        in_stock = ?,
        rating = ?,
        reviews_count = ?,
        badge = ?,
        customization_json = ?,
        specs_json = ?,
        included_items_json = ?,
        delivery_estimate = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.slug ?? existing.slug,
      data.tagline ?? existing.tagline ?? null,
      data.description ?? existing.description,
      data.detailedDescription ?? existing.detailedDescription ?? null,
      data.price !== undefined ? Number(data.price) : existing.price,
      data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : (existing.originalPrice ?? null),
      data.categorySlug ?? existing.categorySlug,
      data.categoryName ?? existing.categoryName,
      (data.productImages || data.images) ? JSON.stringify(normalizeImagesInput(data.productImages || data.images, data.name || existing.name)) : JSON.stringify(existing.productImages),
      data.inStock !== undefined ? (data.inStock ? 1 : 0) : (existing.inStock ? 1 : 0),
      data.rating ?? existing.rating,
      data.reviewsCount ?? existing.reviewsCount,
      data.badge ?? existing.badge ?? null,
      data.customization ? JSON.stringify(data.customization) : JSON.stringify(existing.customization),
      data.specs ? JSON.stringify(data.specs) : (existing.specs ? JSON.stringify(existing.specs) : null),
      data.includedItems ? JSON.stringify(data.includedItems) : JSON.stringify(existing.includedItems || []),
      data.deliveryEstimate ?? existing.deliveryEstimate,
      now,
      id
    );

    return this.getProductById(id);
  },

  deleteProduct(id: string) {
    const db = getDatabase();
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return true;
  },

  // Orders
  getOrders(filters?: { userId?: string; email?: string; status?: string }) {
    const db = getDatabase();
    let sql = "SELECT * FROM orders WHERE 1=1";
    const params: any[] = [];

    if (filters?.userId) {
      sql += " AND (user_id = ? OR customer_email = ?)";
      params.push(filters.userId, filters.email || "");
    } else if (filters?.email) {
      sql += " AND customer_email = ?";
      params.push(filters.email.toLowerCase().trim());
    }

    if (filters?.status && filters.status !== "all") {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    sql += " ORDER BY created_at DESC";

    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((orderRow) => {
      const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderRow.id) as any[];
      return formatOrderRow(orderRow, items);
    });
  },

  getOrderById(id: string) {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
    if (!row) return null;
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id) as any[];
    return formatOrderRow(row, items);
  },

  createOrder(data: any) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = data.id || `order-${Date.now()}`;
    const orderNumber = data.orderNumber || `LUC-${Math.floor(100000 + Math.random() * 900000)}`;

    db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_phone, customer_email,
        city, province, address_line, nearest_landmark, postal_code,
        payment_method, payment_status, subtotal, shipping_fee, total,
        status, courier_carrier, courier_tracking, dispatched_at, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orderNumber,
      data.userId || null,
      data.customer?.fullName || data.shippingAddress?.fullName || "Guest Customer",
      data.customer?.phoneNumber || data.shippingAddress?.phoneNumber || "",
      data.customer?.email?.toLowerCase().trim() || null,
      data.shippingAddress?.city || "",
      data.shippingAddress?.province || "Punjab",
      data.shippingAddress?.addressLine || "",
      data.shippingAddress?.nearestLandmark || null,
      data.shippingAddress?.postalCode || null,
      data.paymentMethod || "Cash on Delivery (COD)",
      data.paymentStatus || "unpaid",
      Number(data.subtotal || 0),
      Number(data.shippingFee || 0),
      Number(data.total || 0),
      data.status || "pending_confirmation",
      data.courier?.carrier || null,
      data.courier?.trackingNumber || null,
      data.courier?.dispatchedAt || null,
      data.notes || null,
      now,
      now
    );

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_slug, product_name, unit_price, quantity,
        image, selected_variants_json, engraving_text, font_choice, engraving_location,
        logo_file_name, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of data.items || []) {
      insertItemStmt.run(
        item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        id,
        item.productId || null,
        item.productSlug || "",
        item.productName || "Custom Item",
        Number(item.unitPrice || 0),
        Number(item.quantity || 1),
        item.image || "/products/pen-1.jpg",
        JSON.stringify(item.selectedVariants || {}),
        item.customization?.engravingText || null,
        item.customization?.fontChoice || null,
        item.customization?.engravingLocation || null,
        item.customization?.logoFileName || null,
        item.customization?.specialInstructions || null
      );
    }

    return this.getOrderById(id);
  },

  updateOrderStatus(id: string, status: string, courier?: { carrier?: string; trackingNumber?: string }) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const dispatchedAt = status === "dispatched" ? now : null;

    db.prepare(`
      UPDATE orders SET
        status = ?,
        courier_carrier = COALESCE(?, courier_carrier),
        courier_tracking = COALESCE(?, courier_tracking),
        dispatched_at = COALESCE(?, dispatched_at),
        updated_at = ?
      WHERE id = ?
    `).run(
      status,
      courier?.carrier || null,
      courier?.trackingNumber || null,
      dispatchedAt,
      now,
      id
    );

    return this.getOrderById(id);
  },

  // Contact submissions
  createContactSubmission(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const db = getDatabase();
    const id = `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO contact_submissions (id, name, email, phone, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(id, data.name, data.email.toLowerCase().trim(), data.phone || null, data.subject, data.message, now);

    return { id, ...data, status: "new", createdAt: now };
  },

  getContactSubmissions() {
    const db = getDatabase();
    return db.prepare("SELECT * FROM contact_submissions ORDER BY created_at DESC").all() as any[];
  },

  // Bulk Quotes
  createBulkQuote(data: any) {
    const db = getDatabase();
    const id = data.id || `quote-${Date.now()}`;
    const quoteNumber = data.quoteNumber || `QUOTE-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO bulk_quotes (
        id, quote_number, full_name, company_name, whatsapp_number, email,
        product_name, quantity, delivery_city, required_date,
        customization_requirements, logo_file_name, additional_requirements,
        status, quoted_amount_pkr, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      quoteNumber,
      data.fullName,
      data.companyName || null,
      data.whatsappNumber,
      data.email || null,
      data.productName,
      String(data.quantity),
      data.deliveryCity,
      data.requiredDate || null,
      data.customizationRequirements,
      data.logoFileName || null,
      data.additionalRequirements || null,
      data.status || "new",
      data.quotedAmountPKR || null,
      data.notes || null,
      now,
      now
    );

    return db.prepare("SELECT * FROM bulk_quotes WHERE id = ?").get(id);
  },

  getBulkQuotes() {
    const db = getDatabase();
    return db.prepare("SELECT * FROM bulk_quotes ORDER BY created_at DESC").all() as any[];
  },
};

// -------------------------------------------------------------
// Formatters and Helpers
// -------------------------------------------------------------

function safeJsonParse(str: string | null | undefined, fallback: any) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export interface StructuredProductImage {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
  order: number;
}

function normalizeImagesInput(images: any, productName: string): StructuredProductImage[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: `img-${Date.now()}-${idx}`,
          url: item,
          altText: `${productName} - View ${idx + 1}`,
          isMain: idx === 0,
          order: idx,
        };
      }
      return {
        id: item.id || `img-${Date.now()}-${idx}`,
        url: item.url,
        altText: item.altText || `${productName} - Image ${idx + 1}`,
        isMain: Boolean(item.isMain ?? (idx === 0)),
        order: item.order ?? idx,
      };
    });
  }
  return [];
}

function formatProductRow(row: any) {
  const images: StructuredProductImage[] = safeJsonParse(row.images_json, []);
  // Sort images with main image first, then by order
  images.sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  // Flat image URLs list for storefront backward compatibility
  const flatUrls = images.map((img) => img.url);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || undefined,
    description: row.description,
    detailedDescription: row.detailed_description || undefined,
    price: row.price,
    originalPrice: row.original_price || undefined,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    categorySlugs: safeJsonParse(row.catalog_json, {}).categorySlugs || [row.category_slug],
    seo: safeJsonParse(row.catalog_json, {}).seo,
    video: safeJsonParse(row.catalog_json, {}).video,
    variants: safeJsonParse(row.catalog_json, {}).variants ?? PRODUCTS.find(product => product.id === row.id)?.variants,
    images: flatUrls.length > 0 ? flatUrls : ["/products/pen-1.jpg"],
    productImages: images,
    inStock: Boolean(row.in_stock),
    rating: row.rating,
    reviewsCount: row.reviews_count,
    badge: row.badge || undefined,
    customization: safeJsonParse(row.customization_json, {}),
    specs: safeJsonParse(row.specs_json, undefined),
    includedItems: safeJsonParse(row.included_items_json, []),
    deliveryEstimate: row.delivery_estimate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatOrderRow(row: any, items: any[]) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id || undefined,
    customer: {
      fullName: row.customer_name,
      phoneNumber: row.customer_phone,
      email: row.customer_email || undefined,
    },
    shippingAddress: {
      fullName: row.customer_name,
      phoneNumber: row.customer_phone,
      city: row.city,
      province: row.province,
      addressLine: row.address_line,
      nearestLandmark: row.nearest_landmark || undefined,
      postalCode: row.postal_code || undefined,
    },
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id || "",
      productSlug: i.product_slug,
      productName: i.product_name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      image: i.image,
      selectedVariants: safeJsonParse(i.selected_variants_json, {}),
      customization: {
        engravingText: i.engraving_text || undefined,
        fontChoice: i.fontChoice || i.font_choice || undefined,
        engravingLocation: i.engraving_location || undefined,
        logoFileName: i.logo_file_name || undefined,
        specialInstructions: i.special_instructions || undefined,
      },
    })),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    total: row.total,
    status: row.status,
    courier: row.courier_carrier
      ? {
          carrier: row.courier_carrier,
          trackingNumber: row.courier_tracking || undefined,
          dispatchedAt: row.dispatched_at || undefined,
        }
      : undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
