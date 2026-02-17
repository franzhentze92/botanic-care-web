import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Nutrient, NutrientCategory, NutrientWithCategory } from '@/types/nutrient';

// Hook para obtener todas las categorías de nutrientes
export function useNutrientCategories() {
  return useQuery({
    queryKey: ['nutrient-categories'],
    queryFn: async (): Promise<NutrientCategory[]> => {
      const { data, error } = await supabase
        .from('nutrient_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch nutrient categories: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour (categories don't change often)
  });
}

// Hook para obtener todos los nutrientes
export function useNutrients() {
  return useQuery({
    queryKey: ['nutrients'],
    queryFn: async (): Promise<Nutrient[]> => {
      const { data, error } = await supabase
        .from('nutrients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch nutrients: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook para obtener nutrientes con sus categorías
export function useNutrientsWithCategories() {
  return useQuery({
    queryKey: ['nutrients-with-categories'],
    queryFn: async (): Promise<NutrientWithCategory[]> => {
      const { data, error } = await supabase
        .from('nutrients')
        .select(`
          *,
          category:nutrient_categories(*)
        `)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch nutrients with categories: ${error.message}`);
      }

      return (data || []).map(item => ({
        ...item,
        category: item.category as NutrientCategory,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook para obtener nutrientes por categoría
export function useNutrientsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['nutrients', 'category', categoryId],
    queryFn: async (): Promise<Nutrient[]> => {
      const { data, error } = await supabase
        .from('nutrients')
        .select('*')
        .eq('category_id', categoryId)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch nutrients by category: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 60,
  });
}

// Hook para obtener nutrientes de un producto
export function useProductNutrients(productId: number) {
  return useQuery({
    queryKey: ['product-nutrients', productId],
    queryFn: async (): Promise<Nutrient[]> => {
      const { data, error } = await supabase
        .from('product_nutrients')
        .select(`
          nutrient:nutrients(*)
        `)
        .eq('product_id', productId);

      if (error) {
        throw new Error(`Failed to fetch product nutrients: ${error.message}`);
      }

      return (data || []).map(item => item.nutrient as Nutrient);
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

