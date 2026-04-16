import { useQuery } from '@tanstack/react-query';
import { Nutrient, NutrientCategory, NutrientWithCategory } from '@/types/nutrient';

export function useNutrientCategories() {
  return useQuery({
    queryKey: ['nutrient-categories'],
    queryFn: async (): Promise<NutrientCategory[]> => [],
    staleTime: Infinity,
  });
}

export function useNutrients() {
  return useQuery({
    queryKey: ['nutrients'],
    queryFn: async (): Promise<Nutrient[]> => [],
    staleTime: Infinity,
  });
}

export function useNutrientsWithCategories() {
  return useQuery({
    queryKey: ['nutrients-with-categories'],
    queryFn: async (): Promise<NutrientWithCategory[]> => [],
    staleTime: Infinity,
  });
}

export function useNutrientsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['nutrients', 'category', categoryId],
    queryFn: async (): Promise<Nutrient[]> => [],
    enabled: !!categoryId,
    staleTime: Infinity,
  });
}

export function useProductNutrients(productId: number) {
  return useQuery({
    queryKey: ['product-nutrients', productId],
    queryFn: async (): Promise<Nutrient[]> => [],
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}
