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
  { name: "test-auth", description: "Test API authentication via /api/me", inputSchema: { type: "object", properties: {} } },
  { name: "list-products", description: "List all products", inputSchema: { type: "object", properties: {} } },
  { name: "get-product", description: "Get product by ID with pricing plans, authors etc.", inputSchema: { type: "object", properties: { id: { type: "number", description: "Product ID" } }, required: ["id"] } },
  { name: "create-product", description: "Create a new product", inputSchema: { type: "object", properties: { name: { type: "string" }, form: { type: "string", enum: ["download","course","event","service"] }, free: { type: "boolean" }, active: { type: "boolean" }, success_url: { type: "string" }, webhook_url: { type: "string" } }, required: ["name"] } },
  { name: "update-product", description: "Update a product", inputSchema: { type: "object", properties: { id: { type: "number" }, name: { type: "string" }, active: { type: "boolean" }, free: { type: "boolean" } }, required: ["id"] } },
  { name: "get-payment", description: "Get payment info by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "refund-payment", description: "Refund a payment (full or partial)", inputSchema: { type: "object", properties: { id: { type: "number", description: "Payment ID" }, amount: { type: "number", description: "Amount to refund (optional, full refund if omitted)" } }, required: ["id"] } },
  { name: "list-invoices", description: "List invoices with optional filters", inputSchema: { type: "object", properties: { page: { type: "number" }, date_from: { type: "string", description: "ISO8601 date" }, date_to: { type: "string", description: "ISO8601 date" }, invoice_state: { type: "string", enum: ["unpaid","paid","canceled","issued"] }, payment_state: { type: "string", enum: ["payment_waiting","paying","paid","payment_paused","payment_canceled","payment_refunded","payment_not_completed","payment_chargebacked","payment_pending"] }, product_id: { type: "number" } } } },
  { name: "get-order", description: "Get order by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "create-order", description: "Create a free order (give access to product)", inputSchema: { type: "object", properties: { product_id: { type: "number" }, email: { type: "string" }, first_name: { type: "string" }, last_name: { type: "string" } }, required: ["product_id","email","first_name","last_name"] } },
  { name: "cancel-order", description: "Cancel an order by token", inputSchema: { type: "object", properties: { token: { type: "string", description: "Order token" } }, required: ["token"] } },
  { name: "list-publishers", description: "List all publishers/affiliates", inputSchema: { type: "object", properties: {} } },
  { name: "enroll-publisher", description: "Enroll a publisher in an affiliate program", inputSchema: { type: "object", properties: { id: { type: "number", description: "Publisher ID" }, affiliate_program_id: { type: "number" } }, required: ["id","affiliate_program_id"] } },
  { name: "unenroll-publisher", description: "Unenroll a publisher from an affiliate program", inputSchema: { type: "object", properties: { id: { type: "number", description: "Publisher ID" }, affiliate_program_id: { type: "number" } }, required: ["id","affiliate_program_id"] } },
  { name: "list-pricing-plans", description: "List all pricing plans", inputSchema: { type: "object", properties: {} } },
  { name: "get-pricing-plan", description: "Get pricing plan by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "delete-pricing-plan", description: "Delete a pricing plan", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "get-transfer", description: "Get transfer info by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "list-webhook-endpoints", description: "List all webhook endpoints", inputSchema: { type: "object", properties: {} } },
  { name: "get-webhook-endpoint", description: "Get webhook endpoint by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "create-webhook-endpoint", description: "Create a webhook endpoint", inputSchema: { type: "object", properties: { name: { type: "string" }, url: { type: "string" }, event_form: { type: "string", enum: ["all_events","selected_events"] }, request_format: { type: "string", enum: ["x_www_form_urlencoded","json"] } }, required: ["name","url"] } },
  { name: "update-webhook-endpoint", description: "Update a webhook endpoint", inputSchema: { type: "object", properties: { id: { type: "number" }, name: { type: "string" }, url: { type: "string" } }, required: ["id","name","url"] } },
  { name: "delete-webhook-endpoint", description: "Delete a webhook endpoint", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "list-funnels", description: "List all funnels", inputSchema: { type: "object", properties: {} } },
  { name: "get-funnel", description: "Get funnel by ID", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "list-affiliate-redirections", description: "List affiliate redirections", inputSchema: { type: "object", properties: {} } },
  { name: "get-event-tickets", description: "Get e-tickets for an event", inputSchema: { type: "object", properties: { id: { type: "number", description: "Event ID" } }, required: ["id"] } },
];

async function executeTool(name: string, args: any): Promise<string> {
  switch (name) {
    case "test-auth": return JSON.stringify(await api("/me"), null, 2);
    case "list-products": return JSON.stringify(await api("/products"), null, 2);
    case "get-product": return JSON.stringify(await api(`/products/${args.id}`), null, 2);
    case "create-product": return JSON.stringify(await api("/products", "POST", { key: KEY, secret: SECRET, ...args }), null, 2);
    case "update-product": { const { id, ...rest } = args; return JSON.stringify(await api(`/products/${id}`, "PUT", { key: KEY, secret: SECRET, ...rest }), null, 2); }
    case "get-payment": return JSON.stringify(await api(`/payments/${args.id}`), null, 2);
    case "refund-payment": return JSON.stringify(await api(`/payments/${args.id}/refund`, "POST", { amount: args.amount }), null, 2);
    case "list-invoices": { const q = new URLSearchParams(); if (args.page) q.set("page", args.page); if (args.date_from) q.set("date_from", args.date_from); if (args.date_to) q.set("date_to", args.date_to); if (args.invoice_state) q.set("invoice_state", args.invoice_state); if (args.payment_state) q.set("payment_state", args.payment_state); if (args.product_id) q.set("product_id", args.product_id); const qs = q.toString() ? `?${q.toString()}` : ""; return JSON.stringify(await api(`/invoices${qs}`), null, 2); }
    case "get-order": return JSON.stringify(await api(`/orders/${args.id}`), null, 2);
    case "create-order": return JSON.stringify(await api("/orders", "POST", { key: KEY, secret: SECRET, ...args }), null, 2);
    case "cancel-order": return JSON.stringify(await api(`/orders/${args.token}/cancel`, "POST", { key: KEY, secret: SECRET }), null, 2);
    case "list-publishers": return JSON.stringify(await api("/publishers"), null, 2);
    case "enroll-publisher": return JSON.stringify(await api(`/publishers/${args.id}/enroll`, "POST", { key: KEY, secret: SECRET, affiliate_program_id: args.affiliate_program_id }), null, 2);
    case "unenroll-publisher": return JSON.stringify(await api(`/publishers/${args.id}/unenroll`, "POST", { key: KEY, secret: SECRET, affiliate_program_id: args.affiliate_program_id }), null, 2);
    case "list-pricing-plans": return JSON.stringify(await api("/pricing_plans"), null, 2);
    case "get-pricing-plan": return JSON.stringify(await api(`/pricing_plans/${args.id}`), null, 2);
    case "delete-pricing-plan": return JSON.stringify(await api(`/pricing_plans/${args.id}`, "DELETE"), null, 2);
    case "get-transfer": return JSON.stringify(await api(`/transfers/${args.id}`), null, 2);
    case "list-webhook-endpoints": return JSON.stringify(await api("/webhook_endpoints"), null, 2);
    case "get-webhook-endpoint": return JSON.stringify(await api(`/webhook_endpoints/${args.id}`), null, 2);
    case "create-webhook-endpoint": return JSON.stringify(await api("/webhook_endpoints", "POST", { key: KEY, secret: SECRET, ...args }), null, 2);
    case "update-webhook-endpoint": { const { id, ...rest } = args; return JSON.stringify(await api(`/webhook_endpoints/${id}`, "PUT", { key: KEY, secret: SECRET, ...rest }), null, 2); }
    case "delete-webhook-endpoint": return JSON.stringify(await api(`/webhook_endpoints/${args.id}`, "DELETE"), null, 2);
    case "list-funnels": return JSON.stringify(await api("/funnels"), null, 2);
    case "get-funnel": return JSON.stringify(await api(`/funnels/${args.id}`), null, 2);
    case "list-affiliate-redirections": return JSON.stringify(await api("/affiliate_redirections"), null, 2);
    case "get-event-tickets": return JSON.stringify(await api(`/events/${args.id}/e_tickets`), null, 2);
    default: return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.json({ status: "ok", name: "ablefy-mcp", version: "2.0.0", transport: "streamable-http", tools: TOOLS.length });
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
            serverInfo: { name: "ablefy", version: "2.0.0" }
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
