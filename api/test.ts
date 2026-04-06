import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE = "https://api.myablefy.com/api";
const KEY = process.env.ABLEFY_API_KEY || "";
const SECRET = process.env.ABLEFY_API_SECRET || "";

async function apiCall(path: string) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}key=${KEY}&secret=${SECRET}`;
  const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const text = await r.text();
  try { return { status: r.status, data: JSON.parse(text) }; }
  catch { return { status: r.status, error: "Non-JSON", body: text.substring(0, 300) }; }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const results: any[] = [];
  const tests = [
    { name: "test-auth", path: "/me" },
    { name: "list-products", path: "/products" },
    { name: "list-invoices", path: "/invoices" },
    { name: "list-publishers", path: "/publishers" },
    { name: "list-pricing-plans", path: "/pricing_plans" },
    { name: "list-webhook-endpoints", path: "/webhook_endpoints" },
    { name: "list-funnels", path: "/funnels" },
    { name: "list-affiliate-redirections", path: "/affiliate_redirections" },
  ];

  for (const t of tests) {
    try {
      const r = await apiCall(t.path);
      const ok = r.status === 200 && !r.error;
      results.push({ tool: t.name, status: r.status, ok, preview: JSON.stringify(r.data || r).substring(0, 200) });
    } catch (e: any) {
      results.push({ tool: t.name, ok: false, error: e.message });
    }
  }

  const passed = results.filter(r => r.ok).length;
  const total = results.length;

  res.json({ summary: `${passed}/${total} passed`, results });
}
