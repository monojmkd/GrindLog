const { neon } = require("@neondatabase/serverless");
const { timingSafeEqual } = require("crypto");

const same = (a, b) => {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && timingSafeEqual(x, y);
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const pass = process.env.APP_PASSCODE, url = process.env.DATABASE_URL;
  if (!pass || !url) {
    return res.status(500).json({ error: "Set DATABASE_URL and APP_PASSCODE in the Vercel environment variables." });
  }
  if (!same(req.headers["x-passcode"], pass)) return res.status(401).json({ error: "unauthorized" });

  const sql = neon(url);
  try {
    await sql`CREATE TABLE IF NOT EXISTS app_state (
      id text PRIMARY KEY, data jsonb NOT NULL, updated bigint NOT NULL DEFAULT 0)`;

    if (req.method === "GET") {
      const rows = await sql`SELECT data FROM app_state WHERE id = 'main'`;
      return res.status(200).json({ data: rows[0] ? rows[0].data : null });
    }
    if (req.method === "PUT") {
      const b = req.body;
      if (!b || typeof b !== "object" || !Array.isArray(b.sessions)) {
        return res.status(400).json({ error: "bad body" });
      }
      await sql`INSERT INTO app_state (id, data, updated)
        VALUES ('main', ${JSON.stringify(b)}::jsonb, ${Number(b.updated) || 0})
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated = EXCLUDED.updated`;
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "database error" });
  }
};
