// @ts-nocheck
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const BASE = "https://api.myablefy.com";
const KEY = process.env.ABLEFY_API_KEY || "";
const SECRET = process.env.ABLEFY_API_SECRET || "";

async function api(path: string, method = "GET", body?: any) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}key=${KEY}&secret=${SECRET}`;
  const opts: any = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: `Non-JSON (${r.status})`, body: text.substring(0, 500) }; }
}

const handler = createMcpHandler(
  async (server) => {

    // AUTH TEST
    server.registerTool("test_auth", {
      title: "Test Auth",
      description: "Test API authentication via /api/me",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/me");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // PRODUCTS
    server.registerTool("list_products", {
      title: "List Products",
      description: "List all products",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/products");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_product", {
      title: "Get Product",
      description: "Get product by ID",
      inputSchema: z.object({ id: z.number().describe("Product ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/products/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // ORDERS
    server.registerTool("get_order", {
      title: "Get Order",
      description: "Get order by ID",
      inputSchema: z.object({ id: z.number().describe("Order ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/orders/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("create_order", {
      title: "Create Order",
      description: "Create a free order / give access to product",
      inputSchema: z.object({
        product_id: z.number().describe("Product ID"),
        email: z.string().describe("Customer email"),
        first_name: z.string().describe("First name"),
        last_name: z.string().describe("Last name"),
      }),
    }, async ({ product_id, email, first_name, last_name }) => {
      const result = await api("/api/orders", "POST", { product_id, email, first_name, last_name, key: KEY, secret: SECRET });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("cancel_order", {
      title: "Cancel Order",
      description: "Cancel an order by token",
      inputSchema: z.object({ token: z.string().describe("Order token") }),
    }, async ({ token }) => {
      const result = await api(`/api/orders/${token}/cancel`, "POST", { key: KEY, secret: SECRET });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // INVOICES
    server.registerTool("list_invoices", {
      title: "List Invoices",
      description: "Get list of invoices with optional filters",
      inputSchema: z.object({
        page: z.number().optional().describe("Page number"),
        date_from: z.string().optional().describe("Date from ISO8601"),
        date_to: z.string().optional().describe("Date to ISO8601"),
        invoice_state: z.enum(["unpaid", "paid", "canceled", "issued"]).optional(),
        payment_state: z.enum(["payment_waiting", "paying", "paid", "payment_canceled", "payment_refunded"]).optional(),
        product_id: z.number().optional().describe("Filter by product ID"),
      }),
    }, async ({ page, date_from, date_to, invoice_state, payment_state, product_id }) => {
      let path = "/api/invoices";
      const params: string[] = [];
      if (page) params.push(`page=${page}`);
      if (date_from) params.push(`date_from=${encodeURIComponent(date_from)}`);
      if (date_to) params.push(`date_to=${encodeURIComponent(date_to)}`);
      if (invoice_state) params.push(`invoice_state=${invoice_state}`);
      if (payment_state) params.push(`payment_state=${payment_state}`);
      if (product_id) params.push(`product_id=${product_id}`);
      if (params.length) path += "?" + params.join("&");
      const result = await api(path);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // PAYMENTS
    server.registerTool("get_payment", {
      title: "Get Payment",
      description: "Get payment info by ID",
      inputSchema: z.object({ id: z.string().describe("Payment ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/payments/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("refund_payment", {
      title: "Refund Payment",
      description: "Refund a payment by ID",
      inputSchema: z.object({
        id: z.number().describe("Payment ID"),
        amount: z.number().optional().describe("Amount to refund (optional, full refund if omitted)"),
      }),
    }, async ({ id, amount }) => {
      const body: any = { key: KEY, secret: SECRET };
      if (amount) body.amount = amount;
      const result = await api(`/api/payments/${id}/refund`, "POST", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // PRICING PLANS
    server.registerTool("list_pricing_plans", {
      title: "List Pricing Plans",
      description: "List all pricing plans",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/pricing_plans");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_pricing_plan", {
      title: "Get Pricing Plan",
      description: "Get pricing plan by ID",
      inputSchema: z.object({ id: z.number().describe("Pricing Plan ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/pricing_plans/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // TRANSFERS
    server.registerTool("get_transfer", {
      title: "Get Transfer",
      description: "Get transfer info by ID",
      inputSchema: z.object({ id: z.number().describe("Transfer ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/transfers/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // PAYERS (customers)
    server.registerTool("get_payer", {
      title: "Get Payer",
      description: "Get payer/customer info by transfer external ID",
      inputSchema: z.object({ transfer_ext_id: z.string().describe("Transfer external ID") }),
    }, async ({ transfer_ext_id }) => {
      const result = await api(`/api/payers/${transfer_ext_id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // PUBLISHERS
    server.registerTool("list_publishers", {
      title: "List Publishers",
      description: "List all affiliate publishers",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/publishers");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // WEBHOOK ENDPOINTS
    server.registerTool("list_webhooks", {
      title: "List Webhook Endpoints",
      description: "List all webhook endpoints",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/webhook_endpoints");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_webhook", {
      title: "Get Webhook Endpoint",
      description: "Get webhook endpoint by ID",
      inputSchema: z.object({ id: z.number().describe("Webhook endpoint ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/webhook_endpoints/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // FUNNELS
    server.registerTool("list_funnels", {
      title: "List Funnels",
      description: "List all funnels",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/funnels");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_funnel", {
      title: "Get Funnel",
      description: "Get funnel by ID",
      inputSchema: z.object({ id: z.number().describe("Funnel ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/funnels/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // EVENTS / E-TICKETS
    server.registerTool("get_event_tickets", {
      title: "Get Event Tickets",
      description: "Get e-tickets for an event by ID",
      inputSchema: z.object({ id: z.number().describe("Event ID") }),
    }, async ({ id }) => {
      const result = await api(`/api/events/${id}/e_tickets`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    // AFFILIATE REDIRECTIONS
    server.registerTool("list_affiliate_redirections", {
      title: "List Affiliate Redirections",
      description: "List all affiliate redirections",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/api/affiliate_redirections");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

  },
  {},
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
