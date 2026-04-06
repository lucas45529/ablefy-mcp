import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

const BASE = "https://api.myablefy.com/api";
const KEY = process.env.ABLEFY_API_KEY || "";
const SECRET = process.env.ABLEFY_API_SECRET || "";

async function api(path: string, method = "GET", body?: any) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}key=${KEY}&secret=${SECRET}`;
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: `Non-JSON response (${r.status})`, body: text.substring(0, 500) }; }
}

const handler = createMcpHandler(server => {
  server.tool('test-auth', 'Test API authentication via /api/me', {}, async () => {
    const result = await api('/me');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-products', 'List all products', {}, async () => {
    const result = await api('/products');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-product', 'Get product by ID', { id: z.number().describe('Product ID') }, async ({ id }) => {
    const result = await api(`/products/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('create-product', 'Create a new product', { name: z.string(), form: z.enum(['download','course','event','service']).optional(), free: z.boolean().optional(), active: z.boolean().optional() }, async (args) => {
    const result = await api('/products', 'POST', { key: KEY, secret: SECRET, ...args });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('update-product', 'Update a product', { id: z.number(), name: z.string().optional(), active: z.boolean().optional(), free: z.boolean().optional() }, async ({ id, ...rest }) => {
    const result = await api(`/products/${id}`, 'PUT', { key: KEY, secret: SECRET, ...rest });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-payment', 'Get payment info by ID', { id: z.number().describe('Payment ID') }, async ({ id }) => {
    const result = await api(`/payments/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('refund-payment', 'Refund a payment', { id: z.number().describe('Payment ID'), amount: z.number().optional().describe('Amount to refund') }, async ({ id, amount }) => {
    const result = await api(`/payments/${id}/refund`, 'POST', { amount });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-invoices', 'List invoices with optional filters', { page: z.number().optional(), date_from: z.string().optional(), date_to: z.string().optional(), invoice_state: z.string().optional(), payment_state: z.string().optional(), product_id: z.number().optional() }, async (args) => {
    const q = new URLSearchParams();
    if (args.page) q.set('page', String(args.page));
    if (args.date_from) q.set('date_from', args.date_from);
    if (args.date_to) q.set('date_to', args.date_to);
    if (args.invoice_state) q.set('invoice_state', args.invoice_state);
    if (args.payment_state) q.set('payment_state', args.payment_state);
    if (args.product_id) q.set('product_id', String(args.product_id));
    const qs = q.toString() ? `?${q.toString()}` : '';
    const result = await api(`/invoices${qs}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-order', 'Get order by ID', { id: z.number() }, async ({ id }) => {
    const result = await api(`/orders/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('create-order', 'Create a free order', { product_id: z.number(), email: z.string(), first_name: z.string(), last_name: z.string() }, async (args) => {
    const result = await api('/orders', 'POST', { key: KEY, secret: SECRET, ...args });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('cancel-order', 'Cancel an order by token', { token: z.string().describe('Order token') }, async ({ token }) => {
    const result = await api(`/orders/${token}/cancel`, 'POST', { key: KEY, secret: SECRET });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-publishers', 'List all publishers/affiliates', {}, async () => {
    const result = await api('/publishers');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('enroll-publisher', 'Enroll a publisher in an affiliate program', { id: z.number().describe('Publisher ID'), affiliate_program_id: z.number() }, async ({ id, affiliate_program_id }) => {
    const result = await api(`/publishers/${id}/enroll`, 'POST', { key: KEY, secret: SECRET, affiliate_program_id });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('unenroll-publisher', 'Unenroll a publisher from an affiliate program', { id: z.number().describe('Publisher ID'), affiliate_program_id: z.number() }, async ({ id, affiliate_program_id }) => {
    const result = await api(`/publishers/${id}/unenroll`, 'POST', { key: KEY, secret: SECRET, affiliate_program_id });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-pricing-plans', 'List all pricing plans', {}, async () => {
    const result = await api('/pricing_plans');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-pricing-plan', 'Get pricing plan by ID', { id: z.number() }, async ({ id }) => {
    const result = await api(`/pricing_plans/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('delete-pricing-plan', 'Delete a pricing plan', { id: z.number() }, async ({ id }) => {
    const result = await api(`/pricing_plans/${id}`, 'DELETE');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-transfer', 'Get transfer info by ID', { id: z.number() }, async ({ id }) => {
    const result = await api(`/transfers/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-webhook-endpoints', 'List all webhook endpoints', {}, async () => {
    const result = await api('/webhook_endpoints');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-webhook-endpoint', 'Get webhook endpoint by ID', { id: z.number() }, async ({ id }) => {
    const result = await api(`/webhook_endpoints/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('create-webhook-endpoint', 'Create a webhook endpoint', { name: z.string(), url: z.string(), event_form: z.enum(['all_events','selected_events']).optional(), request_format: z.enum(['x_www_form_urlencoded','json']).optional() }, async (args) => {
    const result = await api('/webhook_endpoints', 'POST', { key: KEY, secret: SECRET, ...args });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('update-webhook-endpoint', 'Update a webhook endpoint', { id: z.number(), name: z.string(), url: z.string() }, async ({ id, ...rest }) => {
    const result = await api(`/webhook_endpoints/${id}`, 'PUT', { key: KEY, secret: SECRET, ...rest });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('delete-webhook-endpoint', 'Delete a webhook endpoint', { id: z.number() }, async ({ id }) => {
    const result = await api(`/webhook_endpoints/${id}`, 'DELETE');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-funnels', 'List all funnels', {}, async () => {
    const result = await api('/funnels');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-funnel', 'Get funnel by ID', { id: z.number() }, async ({ id }) => {
    const result = await api(`/funnels/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('list-affiliate-redirections', 'List affiliate redirections', {}, async () => {
    const result = await api('/affiliate_redirections');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('get-event-tickets', 'Get e-tickets for an event', { id: z.number().describe('Event ID') }, async ({ id }) => {
    const result = await api(`/events/${id}/e_tickets`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });
}, {}, { basePath: '/', verboseLogs: true });

export { handler as GET, handler as POST, handler as DELETE };
