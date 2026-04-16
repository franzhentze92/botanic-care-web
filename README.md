# Botanic Care

Marketing site (static HTML in `botanic-html/`) plus a React app (`app.html`) for extra routes. **Product data and checkout are intended to live in Shopify**, not in a custom database.

## Shopify (catalog & checkout)

1. Create a **custom app** in Shopify Admin and enable the **Storefront API**.
2. Copy the **Storefront API public access token** and your shop domain (`your-store.myshopify.com`).
3. Add to `.env` in the project root:

```env
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_api_token
# Public shop URL for customer login links (optional, no trailing slash)
VITE_SHOPIFY_STORE_URL=https://your-custom-domain.com
```

The React **Shop** page (`/shop`) loads products via the Storefront API (`src/hooks/useProducts.ts`, `src/lib/shopify.ts`). Static pages under `public/*.html` use hand-authored HTML; you can later add a small script to hydrate the grid from the same API.

**Customer accounts:** sign-in / register in the React app are disabled in favor of **Shopify customer accounts** (`AuthContext` points users to the storefront). Adjust copy and links as needed.

## Legacy React admin

Older admin and dashboard screens were built against a remote database. That dependency has been removed; a small **`src/lib/supabase.ts` stub** keeps those modules compiling while returning empty data. **Operate the real store in [Shopify Admin](https://admin.shopify.com)** (products, orders, discounts, blog, etc.).

## Other environment variables

```env
# Contact form (optional)
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
```

## Scripts

```bash
npm install
npm run dev
npm run build
```

`predev` / `prebuild` run `scripts/copy-home-html.mjs` to sync `botanic-html/*.html` into `index.html` and `public/`.

## Tech stack

- Vite, React 18, TypeScript, Tailwind, shadcn/ui
- **Shopify Storefront API** for product listing in the React shop
- Supabase **removed** from dependencies
