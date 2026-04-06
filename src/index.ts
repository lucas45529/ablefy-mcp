import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://api.myablefy.com/api";
const KEY = process.env.ABLEFY_API_KEY || "";
const SECRET = process.env.ABLEFY_API_SECRET || "";

async function api(path: string, method = "GET", body?: any) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}key=${KEY}&secret=${SECRET}`;
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url);
  return r.json();
}

const server = new McpServer({ name: "ablefy", version: "1.0.0" });

server.tool("test-auth", "Test API authentication", {}, async () => {
  const d = await api("/me");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("list-products", "List all products", {}, async () => {
  const d = await api("/products");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-product", "Get product by ID", { id: z.number().describe("Product ID") }, async ({ id }) => {
  const d = await api(`/products/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("create-product", "Create a new product", {
  name: z.string().describe("Product name"),
  form: z.enum(["download", "course", "event", "service"]).optional().describe("Product type"),
  free: z.boolean().optional().describe("Is free product"),
  active: z.boolean().optional().describe("Is active"),
  success_url: z.string().optional().describe("Success redirect URL"),
  webhook_url: z.string().optional().describe("Webhook URL")
}, async (args) => {
  const d = await api("/products", "POST", { key: KEY, secret: SECRET, ...args });
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("update-product", "Update a product", {
  id: z.number().describe("Product ID"),
  name: z.string().describe("Product name"),
  active: z.boolean().optional(),
  free: z.boolean().optional()
}, async ({ id, ...rest }) => {
  const d = await api(`/products/${id}`, "PUT", { key: KEY, secret: SECRET, ...rest });
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-payment", "Get payment by ID", { id: z.string().describe("Payment ID") }, async ({ id }) => {
  const d = await api(`/payments/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("refund-payment", "Refund a payment", {
  id: z.number().describe("Payment ID"),
  amount: z.number().optional().describe("Amount to refund (full if empty)")
}, async ({ id, amount }) => {
  const d = await api(`/payments/${id}/refund`, "POST", { amount });
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("list-invoices", "List invoices with filters", {
  page: z.number().optional().describe("Page number"),
  date_from: z.string().optional().describe("From date ISO8601"),
  date_to: z.string().optional().describe("To date ISO8601"),
  invoice_state: z.enum(["unpaid", "paid", "canceled", "issued"]).optional(),
  payment_state: z.string().optional(),
  product_id: z.number().optional()
}, async (args) => {
  const params = Object.entries(args).filter(([_, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join("&");
  const d = await api(`/invoices${params ? "?" + params : ""}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-order", "Get order by ID", { id: z.number().describe("Order ID") }, async ({ id }) => {
  const d = await api(`/orders/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("create-order", "Create free order", {
  product_id: z.number().describe("Product ID"),
  email: z.string().describe("Customer email"),
  first_name: z.string().describe("First name"),
  last_name: z.string().describe("Last name")
}, async (args) => {
  const d = await api("/orders", "POST", args);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("cancel-order", "Cancel an order/subscription", {
  token: z.string().describe("Order token")
}, async ({ token }) => {
  const d = await api(`/orders/${token}/cancel`, "POST", { key: KEY, secret: SECRET });
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("list-pricing-plans", "List pricing plans", {}, async () => {
  const d = await api("/pricing_plans");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-pricing-plan", "Get pricing plan by ID", { id: z.number() }, async ({ id }) => {
  const d = await api(`/pricing_plans/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("delete-pricing-plan", "Delete pricing plan", { id: z.number() }, async ({ id }) => {
  const d = await api(`/pricing_plans/${id}`, "DELETE");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("list-publishers", "List affiliate publishers", {}, async () => {
  const d = await api("/publishers");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("list-funnels", "List all funnels", {}, async () => {
  const d = await api("/funnels");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-funnel", "Get funnel by ID", { id: z.number() }, async ({ id }) => {
  const d = await api(`/funnels/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("list-webhook-endpoints", "List webhook endpoints", {}, async () => {
  const d = await api("/webhook_endpoints");
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-transfer", "Get transfer by ID", { id: z.number() }, async ({ id }) => {
  const d = await api(`/transfers/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

server.tool("get-event-tickets", "Get e-tickets for event", {
  id: z.number().describe("Event ID"),
  count: z.number().optional().describe("Number of records")
}, async ({ id, count }) => {
  const p = count ? `?count=${count}` : "";
  const d = await api(`/events/${id}/e_tickets${p}`);
  return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
