/**
 * Shopify Storefront API (GraphQL) — single backend for catalog & checkout links.
 * Env: VITE_SHOPIFY_STORE_DOMAIN (e.g. your-store.myshopify.com), VITE_SHOPIFY_STOREFRONT_TOKEN
 */

const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;
const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined;

export function isShopifyConfigured(): boolean {
  return Boolean(domain && token && domain.includes('.myshopify.com'));
}

export function getShopifyStorefrontUrl(): string {
  if (!domain) return '';
  return `https://${domain}/api/2024-10/graphql.json`;
}

export async function shopifyStorefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify Storefront API is not configured (VITE_SHOPIFY_STORE_DOMAIN, VITE_SHOPIFY_STOREFRONT_TOKEN)');
  }
  const res = await fetch(getShopifyStorefrontUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  if (!json.data) {
    throw new Error('Empty Shopify response');
  }
  return json.data;
}

/** Last segment of a Shopify GID is numeric: gid://shopify/Product/123 → 123 */
export function shopifyGidToNumericId(gid: string): number {
  const last = gid.split('/').pop();
  const n = parseInt(last || '0', 10);
  return Number.isFinite(n) ? n : 0;
}
