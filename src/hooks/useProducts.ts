import { useQuery } from '@tanstack/react-query';
import { Product, productToUI, ProductUI } from '@/types/product';
import { isShopifyConfigured, shopifyGidToNumericId, shopifyStorefrontFetch } from '@/lib/shopify';

export interface UseProductsOptions {
  category?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  nutrientId?: number;
}

interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  featuredImage: { url: string; altText?: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  availableForSale: boolean;
  tags: string[];
}

interface ProductsQueryData {
  products: {
    edges: { node: ShopifyProductNode }[];
  };
}

interface CollectionProductsData {
  collection: {
    products: { edges: { node: ShopifyProductNode }[] };
  } | null;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  availableForSale
  tags
`;

function mapShopifyNodeToProduct(node: ShopifyProductNode): Product {
  const id = shopifyGidToNumericId(node.id);
  const price = parseFloat(node.priceRange.minVariantPrice.amount) || 0;
  const tags = node.tags || [];
  const badge = tags.find((t) => /bestseller|nuevo|sale|top|new/i.test(t)) || null;

  return {
    id,
    name: node.title,
    category: node.productType || 'Producto',
    price,
    original_price: null,
    image_url: node.featuredImage?.url ?? null,
    emoji: null,
    rating: 5,
    reviews_count: 0,
    badge,
    description: node.description?.replace(/<[^>]+>/g, '')?.slice(0, 200) || node.title,
    long_description: node.description,
    ingredients: null,
    benefits: null,
    size: null,
    in_stock: node.availableForSale,
    sku: node.handle,
  };
}

function applyPriceAndSearch(
  rows: ProductUI[],
  options: UseProductsOptions
): ProductUI[] {
  let out = rows;
  const q = options.searchQuery?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (options.minPrice !== undefined) {
    out = out.filter((p) => p.price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined) {
    out = out.filter((p) => p.price <= options.maxPrice!);
  }
  return out;
}

async function fetchShopifyProducts(options: UseProductsOptions): Promise<ProductUI[]> {
  if (options.nutrientId) {
    return [];
  }

  let edges: { node: ShopifyProductNode }[];

  if (options.category && options.category !== 'all') {
    const data = await shopifyStorefrontFetch<CollectionProductsData>(
      `
      query CollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            edges { node { ${PRODUCT_FIELDS} } }
          }
        }
      }
    `,
      { handle: options.category, first: 48 }
    );
    edges = data.collection?.products?.edges ?? [];
  } else {
    const data = await shopifyStorefrontFetch<ProductsQueryData>(
      `
      query CatalogProducts($first: Int!) {
        products(first: $first) {
          edges { node { ${PRODUCT_FIELDS} } }
        }
      }
    `,
      { first: 48 }
    );
    edges = data.products.edges;
  }

  let rows = edges.map((e) => mapShopifyNodeToProduct(e.node)).map(productToUI);
  rows = applyPriceAndSearch(rows, options);
  return rows;
}

export function useProducts(options: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', 'shopify', JSON.stringify(options)],
    queryFn: async (): Promise<ProductUI[]> => {
      if (!isShopifyConfigured()) {
        console.warn('[useProducts] Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN');
        return [];
      }
      try {
        return await fetchShopifyProducts(options);
      } catch (e) {
        console.error('[useProducts]', e);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
    throwOnError: false,
  });
}

interface NodeQueryData {
  node: (ShopifyProductNode & { __typename?: string }) | null;
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', 'shopify', id],
    queryFn: async (): Promise<ProductUI | null> => {
      if (!id || !isShopifyConfigured()) return null;
      const gid = `gid://shopify/Product/${id}`;
      const data = await shopifyStorefrontFetch<NodeQueryData>(
        `
        query ProductNode($id: ID!) {
          node(id: $id) {
            ... on Product {
              ${PRODUCT_FIELDS}
            }
          }
        }
      `,
        { id: gid }
      );
      const node = data.node;
      if (!node || !('handle' in node)) return null;
      return productToUI(mapShopifyNodeToProduct(node as ShopifyProductNode));
    },
    enabled: !!id && isShopifyConfigured(),
  });
}
