import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabasePublic } from '@/lib/supabase';
import { toast } from 'sonner';

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
  id: string; // slug
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

// Hook para obtener todas las categorías
export const useProductCategories = () => {
  return useQuery<ProductCategory[], Error>({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Hook para obtener solo categorías activas (para uso público)
export const useActiveProductCategories = () => {
  return useQuery<ProductCategory[], Error>({
    queryKey: ['active-product-categories'],
    queryFn: async () => {
      console.log('🔍 useActiveProductCategories: Iniciando fetch de categorías...');
      try {
        // Intentar obtener categorías activas
        console.log('🔍 useActiveProductCategories: Ejecutando query...');
        console.log('🔍 useActiveProductCategories: Query construida, esperando respuesta...');
        
        try {
          // Usar cliente público para evitar problemas con sesiones de usuarios nuevos
          const { data, error } = await Promise.race([
            supabasePublic
              .from('product_categories')
              .select('*')
              .eq('is_active', true)
              .order('display_order', { ascending: true })
              .order('name', { ascending: true }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]) as any;
          
          console.log('🔍 useActiveProductCategories: Query completada', { 
            dataLength: data?.length || 0, 
            error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null 
          });
          
          if (error) {
            console.error('❌ Error loading categories:', error);
            
            // Si es error de permisos, intentar sin filtro is_active
            if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('RLS')) {
              console.warn('Error de permisos, intentando obtener todas las categorías...');
              const { data: allData, error: allError } = await supabasePublic
                .from('product_categories')
                .select('*')
                .order('display_order', { ascending: true })
                .order('name', { ascending: true });
              
              if (allError) {
                console.error('Error incluso sin filtro:', allError);
                return [];
              }
              
              // Filtrar manualmente las activas
              return (allData || []).filter(cat => cat.is_active === true);
            }
            
            // Para otros errores, retornar array vacío
            return [];
          }
          
          const categories = data || [];
          console.log('✅ useActiveProductCategories: Categorías obtenidas:', categories.length);
          return categories;
        } catch (queryError: any) {
          console.error('❌ Error en la query de categorías:', queryError);
          if (queryError.message?.includes('timeout')) {
            console.error('⏱️ TIMEOUT: La query se colgó después de 5 segundos. Probable problema de RLS.');
            console.error('💡 SOLUCIÓN: Ejecuta el script supabase/disable-rls-temporary.sql en Supabase');
          }
          return [];
        }
      } catch (err: any) {
        console.error('❌ Error en useActiveProductCategories:', err);
        // Siempre retornar array vacío en lugar de lanzar error
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Permitir refetch al montar
    refetchOnReconnect: false, // No refetch al reconectar
    retry: 2, // Reintentar 2 veces
    // No lanzar error, siempre retornar datos (aunque sea array vacío)
    throwOnError: false,
  });
};

// Hook para crear una categoría
export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: CreateProductCategoryData): Promise<ProductCategory> => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([{
          ...categoryData,
          display_order: categoryData.display_order ?? 0,
          is_active: categoryData.is_active ?? true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['active-product-categories'] });
      toast.success('Categoría creada exitosamente', {
        description: 'La categoría ha sido agregada a la base de datos',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al crear categoría', {
        description: error.message,
      });
    },
  });
};

// Hook para actualizar una categoría
export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProductCategoryData): Promise<ProductCategory> => {
      const { data, error } = await supabase
        .from('product_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['active-product-categories'] });
      toast.success('Categoría actualizada exitosamente', {
        description: 'Los cambios han sido guardados',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar categoría', {
        description: error.message,
      });
    },
  });
};

// Hook para eliminar una categoría
export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['active-product-categories'] });
      toast.success('Categoría eliminada exitosamente', {
        description: 'La categoría ha sido removida de la base de datos',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar categoría', {
        description: error.message,
      });
    },
  });
};

