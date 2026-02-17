import { useQuery } from '@tanstack/react-query';
import { supabase, supabasePublic } from '@/lib/supabase';
import { Product, productToUI, ProductUI } from '@/types/product';

export interface UseProductsOptions {
  category?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  nutrientId?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', JSON.stringify(options)],
    queryFn: async (): Promise<ProductUI[]> => {
      console.log('🔍 useProducts: Iniciando fetch de productos...', options);
      try {
        // If filtering by nutrient, we need to join with product_nutrients
        if (options.nutrientId) {
          // First, get product IDs that have this nutrient
        const { data: productNutrients, error: pnError } = await supabase
          .from('product_nutrients')
          .select('product_id')
          .eq('nutrient_id', options.nutrientId);

        if (pnError) {
          throw new Error(`Failed to fetch product nutrients: ${pnError.message}`);
        }

        const productIds = (productNutrients || []).map(pn => pn.product_id);

        if (productIds.length === 0) {
          return []; // No products with this nutrient
        }

        // Now query products with these IDs
        // Usar cliente público para evitar problemas con sesiones de usuarios nuevos
        let query = supabasePublic
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .in('id', productIds)
          .order('created_at', { ascending: false });

        // Apply other filters
        if (options.category && options.category !== 'all') {
          query = query.eq('category', options.category);
        }

        if (options.minPrice !== undefined) {
          query = query.gte('price', options.minPrice);
        }

        if (options.maxPrice !== undefined) {
          query = query.lte('price', options.maxPrice);
        }

        if (options.searchQuery) {
          query = query.or(
            `name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
          );
        }

        console.log('🔍 useProducts (nutrient): Ejecutando query...');
        console.log('🔍 useProducts (nutrient): Query construida, esperando respuesta...');
        
        // Agregar timeout real
        try {
          const { data, error } = await Promise.race([
            query,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]) as any;
          
          console.log('🔍 useProducts (nutrient): Query completada', { 
            dataLength: data?.length || 0, 
            error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null 
          });

          if (error) {
            console.error('❌ Error fetching products with nutrient filter:', error);
            // Si es error de permisos, intentar sin filtro in_stock
            if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('RLS')) {
              console.warn('Error de permisos, intentando obtener productos sin filtro...');
              let fallbackQuery = supabasePublic
                .from('products')
                .select('*')
                .in('id', productIds)
                .order('created_at', { ascending: false });
              
              if (options.category && options.category !== 'all') {
                fallbackQuery = fallbackQuery.eq('category', options.category);
              }
              
              const { data: allData, error: allError } = await fallbackQuery;
              
              if (allError) {
                console.error('Error incluso sin filtro:', allError);
                return [];
              }
              
              // Filtrar manualmente los que están en stock
              return (allData || []).filter(p => p.in_stock === true).map(productToUI);
            }
            return [];
          }

          return (data || []).map(productToUI);
        } catch (queryError: any) {
          console.error('❌ Error en la query de productos (nutrient):', queryError);
          if (queryError.message?.includes('timeout')) {
            console.error('⏱️ TIMEOUT: La query de productos (nutrient) se colgó después de 5 segundos');
          }
          return [];
        }
      } else {
        // Normal query without nutrient filter
        // Usar cliente público para evitar problemas con sesiones de usuarios nuevos
        let query = supabasePublic
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .order('created_at', { ascending: false });

        // Apply filters
        if (options.category && options.category !== 'all') {
          query = query.eq('category', options.category);
        }

        if (options.minPrice !== undefined) {
          query = query.gte('price', options.minPrice);
        }

        if (options.maxPrice !== undefined) {
          query = query.lte('price', options.maxPrice);
        }

        if (options.searchQuery) {
          query = query.or(
            `name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
          );
        }

        console.log('🔍 useProducts (normal): Ejecutando query...');
        console.log('🔍 useProducts (normal): Query construida, esperando respuesta...');
        
        // Agregar timeout real con AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.error('⏱️ TIMEOUT: La query se colgó después de 5 segundos');
        }, 5000);
        
        try {
          const { data, error } = await Promise.race([
            query,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]) as any;
          
          clearTimeout(timeoutId);
          console.log('🔍 useProducts (normal): Query completada', { 
            dataLength: data?.length || 0, 
            error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null 
          });

          if (error) {
            console.error('❌ Error fetching products:', error);
            // Si es error de permisos, intentar sin filtro in_stock
            if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('RLS')) {
              console.warn('Error de permisos, intentando obtener todos los productos...');
              const { data: allData, error: allError } = await supabasePublic
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
              
              if (allError) {
                console.error('Error incluso sin filtro:', allError);
                return [];
              }
              
              // Filtrar manualmente los que están en stock
              return (allData || []).filter(p => p.in_stock === true).map(productToUI);
            }
            return [];
          }

          const products = (data || []).map(productToUI);
          console.log('✅ useProducts: Productos obtenidos:', products.length);
          return products;
        } catch (queryError: any) {
          console.error('❌ Error en la query de productos:', queryError);
          if (queryError.message?.includes('timeout')) {
            console.error('⏱️ TIMEOUT: La query se colgó después de 5 segundos. Probable problema de RLS.');
            console.error('💡 SOLUCIÓN: Ejecuta el script supabase/disable-rls-temporary.sql en Supabase');
          }
          return [];
        }
      }
      } catch (err: any) {
        console.error('❌ Error en useProducts:', err);
        // Retornar array vacío en lugar de lanzar error para no romper la UI
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Permitir refetch al montar
    refetchOnReconnect: false,
    retry: 2, // Reintentar 2 veces
    throwOnError: false, // No lanzar error, retornar datos vacíos
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<ProductUI | null> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data ? productToUI(data as Product) : null;
    },
    enabled: !!id,
  });
}

