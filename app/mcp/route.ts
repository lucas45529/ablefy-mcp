// @ts-nocheck
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const BASE = "https://api.myablefy.com/api";
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
    server.registerTool("test_auth", {
      title: "Test Auth",
      description: "Test API authentication via /api/me",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/me");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_products", {
      title: "List Products",
      description: "List all products",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/products");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_product", {
      title: "Get Product",
      description: "Get product by ID",
      inputSchema: z.object({ id: z.number().describe("Product ID") }),
    }, async ({ id }) => {
      const result = await api(`/products/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("create_product", {
      title: "Create Product",
      description: "Create a new product",
      inputSchema: z.object({
        name: z.string(),
        form: z.enum(["download","course","event","service"]).optional(),
        free: z.boolean().optional(),
        active: z.boolean().optional(),
      }),
    }, async (args) => {
      const result = await api("/products", "POST", { key: KEY, secret: SECRET, ...args });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("update_product", {
      title: "Update Product",
      description: "Update a product",
      inputSchema: z.object({
        id: z.number(),
        name: z.string().optional(),
        active: z.boolean().optional(),
        free: z.boolean().optional(),
      }),
    }, async ({ id, ...rest }) => {
      const result = await api(`/products/${id}`, "PUT", { key: KEY, secret: SECRET, ...rest });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_payment", {
      title: "Get Payment",
      description: "Get payment info by ID",
      inputSchema: z.object({ id: z.number().describe("Payment ID") }),
    }, async ({ id }) => {
      const result = await api(`/payments/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("refund_payment", {
      title: "Refund Payment",
      description: "Refund a payment",
      inputSchema: z.object({
        id: z.number().describe("Payment ID"),
        amount: z.number().optional().describe("Amount to refund"),
      }),
    }, async ({ id, amount }) => {
      const result = await api(`/payments/${id}/refund`, "POST", { amount });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_orders", {
      title: "List Orders",
      description: "List all orders",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/orders");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_order", {
      title: "Get Order",
      description: "Get order by ID",
      inputSchema: z.object({ id: z.number().describe("Order ID") }),
    }, async ({ id }) => {
      const result = await api(`/orders/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_customers", {
      title: "List Customers",
      description: "List all customers",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/customers");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_customer", {
      title: "Get Customer",
      description: "Get customer by ID",
      inputSchema: z.object({ id: z.number().describe("Customer ID") }),
    }, async ({ id }) => {
      const result = await api(`/customers/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_licenses", {
      title: "List Licenses",
      description: "List all licenses",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/licenses");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_license", {
      title: "Get License",
      description: "Get license by ID",
      inputSchema: z.object({ id: z.number().describe("License ID") }),
    }, async ({ id }) => {
      const result = await api(`/licenses/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_coupons", {
      title: "List Coupons",
      description: "List all coupons",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/coupons");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_coupon", {
      title: "Get Coupon",
      description: "Get coupon by ID",
      inputSchema: z.object({ id: z.number().describe("Coupon ID") }),
    }, async ({ id }) => {
      const result = await api(`/coupons/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_webhook_endpoints", {
      title: "List Webhooks",
      description: "List all webhook endpoints",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/webhook_endpoints");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_webhook_endpoint", {
      title: "Get Webhook",
      description: "Get webhook endpoint by ID",
      inputSchema: z.object({ id: z.number() }),
    }, async ({ id }) => {
      const result = await api(`/webhook_endpoints/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("create_webhook_endpoint", {
      title: "Create Webhook",
      description: "Create a webhook endpoint",
      inputSchema: z.object({
        name: z.string(),
        url: z.string(),
        event_form: z.enum(["all_events","selected_events"]).optional(),
      }),
    }, async (args) => {
      const result = await api("/webhook_endpoints", "POST", { key: KEY, secret: SECRET, ...args });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("delete_webhook_endpoint", {
      title: "Delete Webhook",
      description: "Delete a webhook endpoint",
      inputSchema: z.object({ id: z.number() }),
    }, async ({ id }) => {
      const result = await api(`/webhook_endpoints/${id}`, "DELETE");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_funnels", {
      title: "List Funnels",
      description: "List all funnels",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/funnels");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_funnel", {
      title: "Get Funnel",
      description: "Get funnel by ID",
      inputSchema: z.object({ id: z.number() }),
    }, async ({ id }) => {
      const result = await api(`/funnels/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("list_affiliate_redirections", {
      title: "List Affiliate Redirections",
      description: "List affiliate redirections",
      inputSchema: z.object({}),
    }, async () => {
      const result = await api("/affiliate_redirections");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.registerTool("get_event_tickets", {
      title: "Get Event Tickets",
      description: "Get e-tickets for an event",
      inputSchema: z.object({ id: z.number().describe("Event ID") }),
    }, async ({ id }) => {
      const result = await api(`/events/${id}/e_tickets`);
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
