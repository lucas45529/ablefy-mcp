import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE = "https://api.myablefy.com/api";
const KEY = process.env.ABLEFY_API_KEY || "";
const SECRET = process.env.ABLEFY_API_SECRET || "";

async function api(path: string, method = "GET", body?: any) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}key=${KEY}&secret=${SECRET}`;
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const text = await r.text(); try { return JSON.parse(text); } catch { return { error: `Non-JSON response (${r.status})`, body: text.substring(0, 500) }; }
}

const TOOLS = [
  { name: "test-auth", description: "Test API authentication", inputSchema: { type: "object", properties: {} } },
  { name: "list-products", description: "List all products", inputSchema: { type: "object", properties: {} } },
  { name: "get-product", description: "Get product by ID", inputSchema: { type: "object", properties: { id: { type: "number", description: "Product ID" } }, required: ["id"] } },
  { name: "create-product", description: "Create a new product", inputSchema: { type: "object", properties: { name: { type: "string" }, form: { type: "string", enum: ["download","course","event","service"] }, free: { type: "boolean" }, active: { type: "boolean" }, success_url: { type: "string" }, webhook_url: { type: "string" } }, required: ["name"] } },
  { name: "update-product", description: "Update a product", inputSchema: { type: "object", properties: { id: { type: "number" }, name: { type: "string" }, active: { type: "boolean" }, free: { type: "boolean" } }, required: ["id"] } },
  { name: "list-sales-pages", description: "List all sales pages", inputSchema: { type: "object", properties: {} } },
  { name: "get-sales-page", description: "Get sales page by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "create-sales-page", description: "Create a new sales page", inputSchema: { type: "object", properties: { product_id: { type: "number" }, name: { type: "string" }, slug: { type: "string" } }, required: ["product_id","name"] } },
  { name: "update-sales-page", description: "Update a sales page", inputSchema: { type: "object", properties: { id: { type: "number" }, name: { type: "string" }, slug: { type: "string" } }, required: ["id"] } },
  { name: "list-payments", description: "List all payments", inputSchema: { type: "object", properties: {} } },
  { name: "get-payment", description: "Get payment by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "create-refund", description: "Create a refund for a payment", inputSchema: { type: "object", properties: { payment_id: { type: "number" }, amount: { type: "number" }, reason: { type: "string" } }, required: ["payment_id"] } },
  { name: "list-orders", description: "List all orders", inputSchema: { type: "object", properties: {} } },
  { name: "get-order", description: "Get order by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "list-customers", description: "List all customers", inputSchema: { type: "object", properties: {} } },
  { name: "get-customer", description: "Get customer by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "list-coupons", description: "List all coupons", inputSchema: { type: "object", properties: {} } },
  { name: "create-coupon", description: "Create a coupon", inputSchema: { type: "object", properties: { code: { type: "string" }, discount_percentage: { type: "number" }, product_id: { type: "number" } }, required: ["code"] } },
  { name: "cancel-subscription", description: "Cancel a subscription", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "list-publishers", description: "List all publishers/affiliates", inputSchema: { type: "object", properties: {} } },
];

async function executeTool(name: string, args: any): Promise<string> {
  switch (name) {
    case "test-auth": return JSON.stringify(await api("/me"), null, 2);
    case "list-products": return JSON.stringify(await api("/products"), null, 2);
    case "get-product": return JSON.stringify(await api(`/products/${args.id}`), null, 2);
    case "create-product": return JSON.stringify(await api("/products", "POST", { key: KEY, secret: SECRET, ...args }), null, 2);
    case "update-product": { const { id, ...rest } = args; return JSON.stringify(await api(`/products/${id}`, "PUT", { key: KEY, secret: SECRET, ...rest }), null, 2); }
    case "list-sales-pages": return JSON.stringify(await api("/sales_pages"), null, 2);
    case "get-sales-page": return JSON.stringify(await api(`/sales_pages/${args.id}`), null, 2);
    case "create-sales-page": return JSON.stringify(await api("/sales_pages", "POST", { key: KEY, secret: SECRET, ...args }), null, 2);
    case "update-sales-page": { const { id, ...rest } = args; return JSON.stringify(await api(`/sales_pages/${id}`, "PUT", { key: KEY, secret: SECRET, ...rest }), null, 2); }
    case "list-payments": return JSON.stringify(await api("/payments"), null, 2);
    case "get-payment": return JSON.stringify(await api(`/payments/${args.id}`), null, 2);
    case "create-refund": return JSON.stringify(await api(`/payments/${args.payment_id}/refund`, "POST", { key: KEY, secret: SECRET, amount: args.amount, reason: args.reason }), null, 2);
    case "list-orders": return JSON.stringify(await api("/orders"), null, 2);
    case "get-order": return JSON.stringify(await api(`/orders/${args.id}`), null, 2);
    case "list-customers": return JSON.stringify(await api("/customers"), null, 2);
    case "get-customer": return JSON.stringify(await api(`/customers/${args.id}`), null, 2);
    case "list-coupons": return JSON.stringify(await api("/coupons"), null, 2);
    case "create-coupon": return JSON.stringify(await api("/coupons", "POST", { key: KEY, secret: SECRET, ...args }), null, 2);
    case "cancel-subscription": return JSON.stringify(await api(`/subscriptions/${args.id}/cancel`, "POST", { key: KEY, secret: SECRET }), null, 2);
    case "list-publishers": return JSON.stringify(await api("/publishers"), null, 2);
    default: return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.json({ status: "ok", name: "ablefy-mcp", version: "1.0.0", transport: "streamable-http" });
  }

  if (req.method === "POST") {
    const { method, params, id } = req.body;

    if (method === "notifications/initialized") return res.status(202).end();

    switch (method) {
      case "initialize":
        return res.json({
          jsonrpc: "2.0", id,
          result: {
            protocolVersion: "2025-03-26",
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: "ablefy", version: "1.0.0" }
          }
        });
      case "tools/list":
        return res.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
      case "tools/call":
        try {
          const text = await executeTool(params.name, params.arguments || {});
          return res.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } });
        } catch (e: any) {
          return res.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true } });
        }
      default:
        return res.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
