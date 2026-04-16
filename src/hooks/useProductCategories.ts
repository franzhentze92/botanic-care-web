import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isShopifyConfigured, shopifyStorefrontFetch } from '@/lib/shopify';

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductCategoryData {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateProductCategoryData extends Partial<CreateProductCategoryData> {
  id: string;
}

interface CollectionsData {
  collections: {
    edges: {
      node: {
        id: string;
        title: string;
        handle: string;
        description: string;
        image: { url: string } | null;
      };
    }[];
  };
}

async function fetchCollections(): Promise<ProductCategory[]> {
  if (!isShopifyConfigured()) return [];
  const data = await shopifyStorefrontFetch<CollectionsData>(
    `
    query Collections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image { url }
          }
        }
      }
    }
  `,
    { first: 50 }
  );
  return data.collections.edges.map((e, i) => ({
    id: e.node.handle,
    name: e.node.title,
    description: e.node.description || null,
    image_url: e.node.image?.url ?? null,
    icon: null,
    display_order: i,
    is_active: true,
  }));
}

export const useProductCategories = () => {
  return useQuery<ProductCategory[], Error>({
    queryKey: ['product-categories'],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 10,
  });
};

export const useActiveProductCategories = () => {
  return useQuery<ProductCategory[], Error>({
    queryKey: ['active-product-categories'],
    queryFn: async () => {
      const rows = await fetchCollections();
      return rows.filter((c) => c.is_active);
    },
    staleTime: 1000 * 60 * 10,
    throwOnError: false,
  });
};

const adminOnly = () => {
  toast.error('Las colecciones se administran en Shopify Admin', {
    description: 'Productos → Colecciones',
  });
  throw new Error('Use Shopify Admin');
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_categoryData: CreateProductCategoryData): Promise<ProductCategory> => {
      adminOnly();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: UpdateProductCategoryData): Promise<ProductCategory> => {
      adminOnly();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string): Promise<void> => {
      adminOnly();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};
