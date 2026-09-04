/**
 * StudioSuite Pro — Neon Functions Serverless API
 * Single entry point routing all requests by URL path.
 * Uses @neondatabase/serverless for Postgres queries.
 */

import { neon } from "@neondatabase/serverless";

// ── Helpers ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

// ── Schema Bootstrap (idempotent) ────────────────────────────────────────────

async function ensureSchema(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      name        TEXT NOT NULL DEFAULT 'User',
      phone       VARCHAR(64),
      org         VARCHAR(255),
      plan_id     TEXT NOT NULL DEFAULT 'free',
      subscribed_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at  TIMESTAMPTZ,
      status      TEXT NOT NULL DEFAULT 'active',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      price_inr       NUMERIC NOT NULL DEFAULT 0,
      duration_days   INT NOT NULL DEFAULT 30,
      max_file_size_mb INT NOT NULL DEFAULT 25,
      badge           TEXT,
      features        JSONB DEFAULT '[]',
      allowed_tool_ids JSONB DEFAULT '"all"',
      currency        TEXT DEFAULT '₹'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_verifications (
      id          SERIAL PRIMARY KEY,
      tx_id       TEXT UNIQUE NOT NULL,
      user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
      user_name   TEXT,
      user_email  TEXT,
      plan_id     TEXT,
      plan_name   TEXT,
      amount_inr  NUMERIC,
      currency    TEXT DEFAULT '₹',
      status      TEXT DEFAULT 'verified_success',
      timestamp   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS enabled_features (
      tool_id TEXT PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS work_history (
      id          TEXT PRIMARY KEY,
      user_id     TEXT,
      tool_id     TEXT,
      tool_name   TEXT,
      filename    TEXT,
      file_size   BIGINT DEFAULT 0,
      timestamp   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed default plans if empty
  const plans = await sql`SELECT id FROM subscription_plans LIMIT 1`;
  if (plans.length === 0) {
    await sql`
      INSERT INTO subscription_plans (id, name, price_inr, duration_days, max_file_size_mb, badge, features, allowed_tool_ids)
      VALUES
        ('free',        'Free Tier',    0,    3650, 25,   'Basic',      '["Access to 50 Tools","25MB File Upload Limit","Standard Processing Speed","Local In-Browser Processing"]',           '"all"'),
        ('pro-monthly', 'Pro Monthly',  499,  30,   250,  'Popular',    '["All 50 Master Tools Unlocked","250MB File Upload Limit","Ultra-Fast WebAssembly Engine","Priority Email Support"]', '"all"'),
        ('pro-yearly',  'Pro Annual',   4999, 365,  1000, 'Best Value', '["All Pro Features Included","1GB Max File Upload Size","2 Months Free Savings","Commercial License Included"]',       '"all"')
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Seed default settings if missing
  await sql`
    INSERT INTO site_settings (key, value)
    VALUES
      ('admin_upi',       'merchant@upi'),
      ('admin_passcode',  'admin123'),
      ('footer_contact',  '{"company":"StudioSuite PRO Platform Inc.","address":"100 Innovation Parkway, Suite 400, Tech Park","phone":"+91 98765 43210","email":"support@studiosuitepro.com","hours":"Mon - Fri: 9:00 AM - 6:00 PM IST"}')
    ON CONFLICT (key) DO NOTHING
  `;
}

// ── Route handlers ────────────────────────────────────────────────────────────

// POST /api/auth/register
async function registerUser(sql: ReturnType<typeof neon>, body: Record<string, string>): Promise<Response> {
  const { email, password, name = "User" } = body;
  if (!email || !password) return err("email and password are required");

  const existing = await sql`SELECT id FROM users WHERE lower(email) = lower(${email}) LIMIT 1`;
  if (existing.length > 0) return err("Email already registered", 409);

  const id = "usr_" + Date.now();
  const expiresAt = new Date(Date.now() + 3650 * 86400000).toISOString();

  const [user] = await sql`
    INSERT INTO users (id, email, password, name, plan_id, expires_at, status)
    VALUES (${id}, ${email}, ${password}, ${name}, 'free', ${expiresAt}, 'active')
    RETURNING id, email, name, plan_id AS "planId", status, expires_at AS "expiresAt", subscribed_at AS "subscribedAt"
  `;
  return json(user, 201);
}

// POST /api/auth/login
async function loginUser(sql: ReturnType<typeof neon>, body: Record<string, string>): Promise<Response> {
  const { email, password } = body;
  if (!email || !password) return err("email and password are required");

  const [user] = await sql`
    SELECT id, email, name, password, plan_id AS "planId", status,
           expires_at AS "expiresAt", subscribed_at AS "subscribedAt",
           phone, org
    FROM users
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `;

  if (!user) return err("Invalid email or password", 401);
  if (user.password !== password) return err("Invalid email or password", 401);

  // Auto-expire if pro plan past expiry
  if (user.planId !== "free" && user.expiresAt && new Date(user.expiresAt) <= new Date()) {
    await sql`UPDATE users SET plan_id = 'free', status = 'expired' WHERE id = ${user.id}`;
    user.planId = "free";
    user.status = "expired";
  }

  // Don't return password to client
  const { password: _pw, ...safeUser } = user;
  return json(safeUser);
}

// POST /api/plans � create or update a plan
async function upsertPlan(sql: ReturnType<typeof neon>, body: Record<string, unknown>): Promise<Response> {
  const { id, name, price_inr, duration_days, max_file_size_mb, badge, features, allowed_tool_ids, currency } = body as Record<string, unknown>;
  if (!id || !name) return err("id and name are required");

  const featuresJson = JSON.stringify(Array.isArray(features) ? features : []);
  const allowedJson = Array.isArray(allowed_tool_ids)
    ? JSON.stringify(allowed_tool_ids)
    : (allowed_tool_ids === "all" || allowed_tool_ids === undefined || allowed_tool_ids === null)
      ? '"all"'
      : JSON.stringify(allowed_tool_ids);

  await sql`
    INSERT INTO subscription_plans (id, name, price_inr, duration_days, max_file_size_mb, badge, features, allowed_tool_ids, currency)
    VALUES (
      ${id as string},
      ${name as string},
      ${Number(price_inr) || 0},
      ${Number(duration_days) || 30},
      ${Number(max_file_size_mb) || 25},
      ${(badge as string) || ''},
      ${featuresJson}::jsonb,
      ${allowedJson}::jsonb,
      ${(currency as string) || 'INR'}
    )
    ON CONFLICT (id) DO UPDATE SET
      name             = EXCLUDED.name,
      price_inr        = EXCLUDED.price_inr,
      duration_days    = EXCLUDED.duration_days,
      max_file_size_mb = EXCLUDED.max_file_size_mb,
      badge            = EXCLUDED.badge,
      features         = EXCLUDED.features,
      allowed_tool_ids = EXCLUDED.allowed_tool_ids,
      currency         = EXCLUDED.currency
  `;
  const [row] = await sql`
    SELECT id, name,
           price_inr        AS "priceINR",
           duration_days    AS "durationDays",
           max_file_size_mb AS "maxFileSizeMB",
           badge, features,
           allowed_tool_ids AS "allowedToolIds",
           currency
    FROM subscription_plans WHERE id = ${id as string}
  `;
  return json(row, 200);
}

// DELETE /api/plans/:id
async function deletePlan(sql: ReturnType<typeof neon>, planId: string): Promise<Response> {
  if (planId === "free") return err("Cannot delete the default free plan", 400);
  await sql`DELETE FROM subscription_plans WHERE id = ${planId}`;
  return json({ ok: true });
}
// GET /api/plans
async function getPlans(sql: ReturnType<typeof neon>): Promise<Response> {
  const rows = await sql`
    SELECT id,
           name,
           price_inr        AS "priceINR",
           duration_days    AS "durationDays",
           max_file_size_mb AS "maxFileSizeMB",
           badge,
           features,
           allowed_tool_ids AS "allowedToolIds",
           currency
    FROM subscription_plans
    ORDER BY price_inr ASC
  `;
  return json(rows);
}

// GET /api/features
async function getFeatures(sql: ReturnType<typeof neon>): Promise<Response> {
  const rows = await sql`SELECT tool_id AS "toolId", enabled FROM enabled_features`;
  return json(rows);
}

// POST /api/features/toggle
async function toggleFeature(sql: ReturnType<typeof neon>, body: Record<string, unknown>): Promise<Response> {
  const { tool_id, enabled } = body;
  if (!tool_id) return err("tool_id is required");

  await sql`
    INSERT INTO enabled_features (tool_id, enabled, updated_at)
    VALUES (${tool_id as string}, ${!!enabled}, NOW())
    ON CONFLICT (tool_id) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()
  `;
  return json({ ok: true, tool_id, enabled: !!enabled });
}

// POST /api/features/enable-all
async function enableAllFeatures(sql: ReturnType<typeof neon>, body: Record<string, unknown>): Promise<Response> {
  const { tool_ids } = body;
  if (!Array.isArray(tool_ids) || tool_ids.length === 0) return err("tool_ids array is required");

  for (const tid of tool_ids as string[]) {
    await sql`
      INSERT INTO enabled_features (tool_id, enabled, updated_at)
      VALUES (${tid}, TRUE, NOW())
      ON CONFLICT (tool_id) DO UPDATE SET enabled = TRUE, updated_at = NOW()
    `;
  }
  return json({ ok: true, count: tool_ids.length });
}

// POST /api/features/disable-all
async function disableAllFeatures(sql: ReturnType<typeof neon>, body: Record<string, unknown>): Promise<Response> {
  const { tool_ids } = body;
  if (!Array.isArray(tool_ids) || tool_ids.length === 0) return err("tool_ids array is required");

  for (const tid of tool_ids as string[]) {
    await sql`
      INSERT INTO enabled_features (tool_id, enabled, updated_at)
      VALUES (${tid}, FALSE, NOW())
      ON CONFLICT (tool_id) DO UPDATE SET enabled = FALSE, updated_at = NOW()
    `;
  }
  return json({ ok: true, count: tool_ids.length });
}

// POST /api/subscribe
async function subscribeUser(sql: ReturnType<typeof neon>, body: Record<string, string>): Promise<Response> {
  const { user_id, plan_id, utr } = body;
  if (!user_id || !plan_id) return err("user_id and plan_id are required");

  const [plan] = await sql`SELECT * FROM subscription_plans WHERE id = ${plan_id} LIMIT 1`;
  if (!plan) return err("Plan not found", 404);

  const [user] = await sql`SELECT * FROM users WHERE id = ${user_id} LIMIT 1`;
  if (!user) return err("User not found", 404);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + (plan.duration_days || 30) * 86400000).toISOString();
  const txId = utr || "UPI_INR_" + Date.now();

  const [updatedUser] = await sql`
    UPDATE users
    SET plan_id = ${plan_id}, subscribed_at = ${now.toISOString()},
        expires_at = ${expiresAt}, status = 'active'
    WHERE id = ${user_id}
    RETURNING id, email, name, plan_id AS "planId", status,
              expires_at AS "expiresAt", subscribed_at AS "subscribedAt",
              phone, org
  `;

  await sql`
    INSERT INTO payment_verifications
      (tx_id, user_id, user_name, user_email, plan_id, plan_name, amount_inr, currency, status, timestamp)
    VALUES
      (${txId}, ${user_id}, ${user.name}, ${user.email}, ${plan_id},
       ${plan.name}, ${plan.price_inr}, '₹', 'verified_success', ${now.toISOString()})
    ON CONFLICT (tx_id) DO NOTHING
  `;

  return json(updatedUser);
}

// GET /api/payments
async function getPayments(sql: ReturnType<typeof neon>): Promise<Response> {
  const rows = await sql`
    SELECT id,
           tx_id       AS "txId",
           user_id     AS "userId",
           user_name   AS "userName",
           user_email  AS "userEmail",
           plan_id     AS "planId",
           plan_name   AS "planName",
           amount_inr  AS "amountINR",
           currency,
           status,
           timestamp
    FROM payment_verifications
    ORDER BY timestamp DESC
  `;
  return json(rows);
}

// DELETE /api/payments/:id
async function deletePayment(sql: ReturnType<typeof neon>, txId: string): Promise<Response> {
  await sql`DELETE FROM payment_verifications WHERE tx_id = ${txId}`;
  return json({ ok: true });
}

// DELETE /api/payments/all
async function deleteAllPayments(sql: ReturnType<typeof neon>): Promise<Response> {
  await sql`DELETE FROM payment_verifications`;
  return json({ ok: true });
}

// GET /api/users
async function getUsers(sql: ReturnType<typeof neon>): Promise<Response> {
  const rows = await sql`
    SELECT id, email, name, phone, org,
           plan_id      AS "planId",
           subscribed_at AS "subscribedAt",
           expires_at   AS "expiresAt",
           status,
           created_at   AS "createdAt"
    FROM users
    ORDER BY created_at DESC
  `;
  return json(rows);
}

// DELETE /api/users/:id
async function deleteUser(sql: ReturnType<typeof neon>, userId: string): Promise<Response> {
  await sql`DELETE FROM users WHERE id = ${userId}`;
  return json({ ok: true });
}

// POST /api/users/:id/plan
async function updateUserPlan(sql: ReturnType<typeof neon>, userId: string, body: Record<string, string>): Promise<Response> {
  const { plan_id } = body;
  if (!plan_id) return err("plan_id is required");

  const [plan] = await sql`SELECT * FROM subscription_plans WHERE id = ${plan_id} LIMIT 1`;
  if (!plan) return err("Plan not found", 404);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + (plan.duration_days || 30) * 86400000).toISOString();

  const [user] = await sql`
    UPDATE users
    SET plan_id = ${plan_id}, subscribed_at = ${now.toISOString()},
        expires_at = ${expiresAt}, status = 'active'
    WHERE id = ${userId}
    RETURNING id, email, name, plan_id AS "planId", status,
              expires_at AS "expiresAt", subscribed_at AS "subscribedAt",
              phone, org
  `;
  if (!user) return err("User not found", 404);
  return json(user);
}

// GET /api/settings
async function getSettings(sql: ReturnType<typeof neon>): Promise<Response> {
  const rows = await sql`SELECT key, value FROM site_settings`;
  const obj: Record<string, string> = {};
  for (const row of rows) obj[row.key] = row.value;
  return json(obj);
}

// POST /api/settings
async function upsertSetting(sql: ReturnType<typeof neon>, body: Record<string, string>): Promise<Response> {
  const { key, value } = body;
  if (!key || value === undefined) return err("key and value are required");

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  return json({ ok: true, key, value });
}

// POST /api/work-history
async function addWorkHistory(sql: ReturnType<typeof neon>, body: Record<string, unknown>): Promise<Response> {
  const { user_id, tool_id, tool_name, filename, file_size } = body;
  const id = "work_" + Date.now();

  await sql`
    INSERT INTO work_history (id, user_id, tool_id, tool_name, filename, file_size, timestamp)
    VALUES (
      ${id},
      ${(user_id as string) || "guest"},
      ${tool_id as string},
      ${tool_name as string},
      ${filename as string},
      ${Number(file_size) || 0},
      NOW()
    )
  `;
  return json({ ok: true, id });
}

// GET /api/work-history/:user_id
async function getWorkHistory(sql: ReturnType<typeof neon>, userId: string): Promise<Response> {
  const rows = await sql`
    SELECT id,
           user_id   AS "userId",
           tool_id   AS "toolId",
           tool_name AS "toolName",
           filename,
           file_size AS "fileSize",
           timestamp
    FROM work_history
    WHERE user_id = ${userId} OR user_id = 'guest'
    ORDER BY timestamp DESC
    LIMIT 50
  `;
  return json(rows);
}

// POST /api/users/:id/profile  (update name, email, phone, org)
async function updateUserProfile(sql: ReturnType<typeof neon>, userId: string, body: Record<string, string>): Promise<Response> {
  const { name, email, phone, org } = body;
  if (!name || !email) return err("name and email are required");

  // Check email uniqueness
  const existing = await sql`
    SELECT id FROM users WHERE lower(email) = lower(${email}) AND id != ${userId} LIMIT 1
  `;
  if (existing.length > 0) return err("Email already used by another account", 409);

  const [user] = await sql`
    UPDATE users
    SET name = ${name}, email = ${email},
        phone = ${phone || null}, org = ${org || null}
    WHERE id = ${userId}
    RETURNING id, email, name, phone, org, plan_id AS "planId",
              status, expires_at AS "expiresAt", subscribed_at AS "subscribedAt"
  `;
  if (!user) return err("User not found", 404);
  return json(user);
}

// POST /api/users/:id/password
async function updateUserPassword(sql: ReturnType<typeof neon>, userId: string, body: Record<string, string>): Promise<Response> {
  const { current_password, new_password } = body;
  if (!current_password || !new_password) return err("current_password and new_password are required");

  const [user] = await sql`SELECT password FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user) return err("User not found", 404);
  if (user.password !== current_password) return err("Current password is incorrect", 401);

  await sql`UPDATE users SET password = ${new_password} WHERE id = ${userId}`;
  return json({ ok: true });
}

// ── Main entry ────────────────────────────────────────────────────────────────

export default async function api(request: Request): Promise<Response> {
  // Handle preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, ""); // strip trailing slash
  const method = request.method.toUpperCase();

  let sql: ReturnType<typeof neon>;
  try {
    sql = getDb();
    await ensureSchema(sql);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "DB connection failed";
    return err("Database error: " + msg, 500);
  }

  let body: Record<string, unknown> = {};
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  try {
    // ── Auth routes ────────────────────────────────────────────────────────
    if (path === "/api/auth/register" && method === "POST") {
      return await registerUser(sql, body as Record<string, string>);
    }
    if (path === "/api/auth/login" && method === "POST") {
      return await loginUser(sql, body as Record<string, string>);
    }

    // ── Plans ─────────────────────────────────────────────────────────────
    if (path === "/api/plans" && method === "GET") {
      return await getPlans(sql);
    }
    if (path === "/api/plans" && method === "POST") {
      return await upsertPlan(sql, body);
    }
    const planDeleteMatch = path.match(/^\/api\/plans\/([^/]+)$/);
    if (planDeleteMatch && method === "DELETE") {
      return await deletePlan(sql, planDeleteMatch[1]);
    }

    // ── Features ──────────────────────────────────────────────────────────
    if (path === "/api/features" && method === "GET") {
      return await getFeatures(sql);
    }
    if (path === "/api/features/toggle" && method === "POST") {
      return await toggleFeature(sql, body);
    }
    if (path === "/api/features/enable-all" && method === "POST") {
      return await enableAllFeatures(sql, body);
    }
    if (path === "/api/features/disable-all" && method === "POST") {
      return await disableAllFeatures(sql, body);
    }

    // ── Subscribe ─────────────────────────────────────────────────────────
    if (path === "/api/subscribe" && method === "POST") {
      return await subscribeUser(sql, body as Record<string, string>);
    }

    // ── Payments ──────────────────────────────────────────────────────────
    if (path === "/api/payments" && method === "GET") {
      return await getPayments(sql);
    }
    if (path === "/api/payments/all" && method === "DELETE") {
      return await deleteAllPayments(sql);
    }
    const paymentDeleteMatch = path.match(/^\/api\/payments\/(.+)$/);
    if (paymentDeleteMatch && method === "DELETE") {
      return await deletePayment(sql, paymentDeleteMatch[1]);
    }

    // ── Users ─────────────────────────────────────────────────────────────
    if (path === "/api/users" && method === "GET") {
      return await getUsers(sql);
    }
    const userMatch = path.match(/^\/api\/users\/([^/]+)(\/(.+))?$/);
    if (userMatch) {
      const userId = userMatch[1];
      const subRoute = userMatch[3];
      if (method === "DELETE" && !subRoute) {
        return await deleteUser(sql, userId);
      }
      if (method === "POST" && subRoute === "plan") {
        return await updateUserPlan(sql, userId, body as Record<string, string>);
      }
      if (method === "POST" && subRoute === "profile") {
        return await updateUserProfile(sql, userId, body as Record<string, string>);
      }
      if (method === "POST" && subRoute === "password") {
        return await updateUserPassword(sql, userId, body as Record<string, string>);
      }
    }

    // ── Settings ──────────────────────────────────────────────────────────
    if (path === "/api/settings" && method === "GET") {
      return await getSettings(sql);
    }
    if (path === "/api/settings" && method === "POST") {
      return await upsertSetting(sql, body as Record<string, string>);
    }

    // ── Work History ──────────────────────────────────────────────────────
    if (path === "/api/work-history" && method === "POST") {
      return await addWorkHistory(sql, body);
    }
    const historyMatch = path.match(/^\/api\/work-history\/(.+)$/);
    if (historyMatch && method === "GET") {
      return await getWorkHistory(sql, historyMatch[1]);
    }

    return err("Route not found: " + method + " " + path, 404);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    console.error("[API Error]", msg, e);
    return err("Internal server error: " + msg, 500);
  }
}
