import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface ProductRecipe {
  id: number;
  product_id: number;
  inventory_item_id: number;
  quantity_per_unit: number;
  notes: string | null;
  created_at: string;
  // Datos relacionados
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  inventory_item?: {
    id: number;
    name: string;
    sku: string;
    unit: string;
  };
}

export interface CreateProductRecipeData {
  product_id: number;
  inventory_item_id: number;
  quantity_per_unit: number;
  notes?: string | null;
}

export interface UpdateProductRecipeData {
  id: number;
  quantity_per_unit?: number;
  notes?: string | null;
}

// ==================== HOOKS ====================

// Hook para obtener todas las recetas
export const useAdminRecipes = (filters?: {
  productId?: number;
  searchQuery?: string;
}) => {
  return useQuery<ProductRecipe[], Error>({
    queryKey: ['admin-recipes', filters],
    queryFn: async () => {
      let query = supabase
        .from('product_inventory_items')
        .select(`
          *,
          product:products(id, name, sku),
          inventory_item:inventory_items(id, name, sku, unit)
        `)
        .order('product_id', { ascending: true });

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      let recipes = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        inventory_item_id: item.inventory_item_id,
        quantity_per_unit: parseFloat(item.quantity_per_unit.toString()),
        notes: item.notes,
        created_at: item.created_at,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
        } : undefined,
        inventory_item: item.inventory_item ? {
          id: item.inventory_item.id,
          name: item.inventory_item.name,
          sku: item.inventory_item.sku,
          unit: item.inventory_item.unit,
        } : undefined,
      }));

      // Aplicar búsqueda en memoria
      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        recipes = recipes.filter(recipe =>
          recipe.product?.name?.toLowerCase().includes(search) ||
          recipe.inventory_item?.name?.toLowerCase().includes(search)
        );
      }

      return recipes;
    },
  });
};

// Hook para obtener recetas de un producto específico
export const useAdminProductRecipes = (productId: number) => {
  return useAdminRecipes({ productId });
};

// Hook para crear una receta
export const useCreateProductRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeData: CreateProductRecipeData): Promise<ProductRecipe> => {
      const { data, error } = await supabase
        .from('product_inventory_items')
        .insert([recipeData])
        .select(`
          *,
          product:products(id, name, sku),
          inventory_item:inventory_items(id, name, sku, unit)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        product_id: data.product_id,
        inventory_item_id: data.inventory_item_id,
        quantity_per_unit: parseFloat(data.quantity_per_unit.toString()),
        notes: data.notes,
        created_at: data.created_at,
        product: data.product ? {
          id: data.product.id,
          name: data.product.name,
          sku: data.product.sku,
        } : undefined,
        inventory_item: data.inventory_item ? {
          id: data.inventory_item.id,
          name: data.inventory_item.name,
          sku: data.inventory_item.sku,
          unit: data.inventory_item.unit,
        } : undefined,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      toast.success('Receta creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear la receta', {
        description: error.message,
      });
    },
  });
};

// Hook para crear múltiples recetas en lote
export const useCreateProductRecipesBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipesData: CreateProductRecipeData[]): Promise<ProductRecipe[]> => {
      const { data, error } = await supabase
        .from('product_inventory_items')
        .insert(recipesData)
        .select(`
          *,
          product:products(id, name, sku),
          inventory_item:inventory_items(id, name, sku, unit)
        `);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        inventory_item_id: item.inventory_item_id,
        quantity_per_unit: parseFloat(item.quantity_per_unit.toString()),
        notes: item.notes,
        created_at: item.created_at,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
        } : undefined,
        inventory_item: item.inventory_item ? {
          id: item.inventory_item.id,
          name: item.inventory_item.name,
          sku: item.inventory_item.sku,
          unit: item.inventory_item.unit,
        } : undefined,
      }));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      toast.success(`${data.length} ${data.length === 1 ? 'receta creada' : 'recetas creadas'} exitosamente`);
    },
    onError: (error: Error) => {
      toast.error('Error al crear las recetas', {
        description: error.message,
      });
    },
  });
};

// Hook para actualizar una receta
export const useUpdateProductRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProductRecipeData): Promise<ProductRecipe> => {
      const { data, error } = await supabase
        .from('product_inventory_items')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          product:products(id, name, sku),
          inventory_item:inventory_items(id, name, sku, unit)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        product_id: data.product_id,
        inventory_item_id: data.inventory_item_id,
        quantity_per_unit: parseFloat(data.quantity_per_unit.toString()),
        notes: data.notes,
        created_at: data.created_at,
        product: data.product ? {
          id: data.product.id,
          name: data.product.name,
          sku: data.product.sku,
        } : undefined,
        inventory_item: data.inventory_item ? {
          id: data.inventory_item.id,
          name: data.inventory_item.name,
          sku: data.inventory_item.sku,
          unit: data.inventory_item.unit,
        } : undefined,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      toast.success('Receta actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la receta', {
        description: error.message,
      });
    },
  });
};

// Hook para eliminar una receta
export const useDeleteProductRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('product_inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      toast.success('Receta eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la receta', {
        description: error.message,
      });
    },
  });
};

