import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string;
  emoji: string | null;
  rating: number;
  reviews_count: number;
  badge: string | null;
  description: string;
  long_description: string | null;
  ingredients: string[] | null;
  benefits: string[] | null;
  size: string | null;
  in_stock: boolean;
  sku: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductData {
  name: string;
  category: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  emoji?: string | null;
  rating?: number;
  reviews_count?: number;
  badge?: string | null;
  description: string;
  long_description?: string | null;
  ingredients?: string[] | null;
  benefits?: string[] | null;
  size?: string | null;
  in_stock?: boolean;
  sku: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

// Hook para obtener todos los productos (admin)
export const useAdminProducts = () => {
  return useQuery<AdminProduct[], Error>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Hook para crear un producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductData & { nutrientIds?: number[] }): Promise<AdminProduct> => {
      const { nutrientIds, ...productDataWithoutNutrients } = productData;
      
      // Insertar el producto
      const { data, error } = await supabase
        .from('products')
        .insert([productDataWithoutNutrients])
        .select()
        .single();

      if (error) throw error;

      // Si hay nutrientIds, insertar las relaciones en product_nutrients
      if (nutrientIds && nutrientIds.length > 0 && data) {
        const productNutrients = nutrientIds.map(nutrientId => ({
          product_id: data.id,
          nutrient_id: nutrientId,
        }));

        const { error: nutrientsError } = await supabase
          .from('product_nutrients')
          .insert(productNutrients);

        if (nutrientsError) {
          console.error('Error al asociar nutrientes:', nutrientsError);
          // No lanzamos el error para no revertir la creación del producto
          // pero lo registramos en consola
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-nutrients'] });
      toast.success('Producto creado exitosamente', {
        description: 'El producto ha sido agregado a la base de datos',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al crear producto', {
        description: error.message,
      });
    },
  });
};

// Hook para actualizar un producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProductData & { nutrientIds?: number[] }): Promise<AdminProduct> => {
      const { nutrientIds, ...productUpdateData } = updateData;
      
      // Actualizar el producto
      const { data, error } = await supabase
        .from('products')
        .update(productUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Si hay nutrientIds, actualizar las relaciones en product_nutrients
      if (nutrientIds !== undefined && data) {
        // Eliminar todas las relaciones existentes
        const { error: deleteError } = await supabase
          .from('product_nutrients')
          .delete()
          .eq('product_id', id);

        if (deleteError) {
          console.error('Error al eliminar relaciones de nutrientes:', deleteError);
        }

        // Insertar las nuevas relaciones si hay nutrientIds
        if (nutrientIds.length > 0) {
          const productNutrients = nutrientIds.map(nutrientId => ({
            product_id: id,
            nutrient_id: nutrientId,
          }));

          const { error: insertError } = await supabase
            .from('product_nutrients')
            .insert(productNutrients);

          if (insertError) {
            console.error('Error al insertar relaciones de nutrientes:', insertError);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-nutrients'] });
      toast.success('Producto actualizado exitosamente', {
        description: 'Los cambios han sido guardados',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar producto', {
        description: error.message,
      });
    },
  });
};

// Hook para eliminar un producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente', {
        description: 'El producto ha sido removido de la base de datos',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar producto', {
        description: error.message,
      });
    },
  });
};

