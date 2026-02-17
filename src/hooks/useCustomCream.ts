import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  CustomOil,
  CustomExtract,
  CustomFunction,
  CustomCream,
  CustomCreamOrder,
  customOilToUI,
  customExtractToUI,
  customFunctionToUI,
  CustomOilUI,
  CustomExtractUI,
  CustomFunctionUI,
  CustomCreamUI,
} from '@/types/custom-cream';

// Hook para obtener todos los aceites base
export function useCustomOils() {
  return useQuery({
    queryKey: ['custom-oils'],
    queryFn: async (): Promise<CustomOilUI[]> => {
      const { data, error } = await supabase
        .from('custom_oils')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch custom oils: ${error.message}`);
      }

      return (data || []).map(customOilToUI);
    },
    staleTime: 1000 * 60 * 60, // 1 hour - estas opciones no cambian frecuentemente
  });
}

// Hook para obtener todos los extractos
export function useCustomExtracts() {
  return useQuery({
    queryKey: ['custom-extracts'],
    queryFn: async (): Promise<CustomExtractUI[]> => {
      const { data, error } = await supabase
        .from('custom_extracts')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch custom extracts: ${error.message}`);
      }

      return (data || []).map(customExtractToUI);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook para obtener todas las funciones activas
export function useCustomFunctions() {
  return useQuery({
    queryKey: ['custom-functions'],
    queryFn: async (): Promise<CustomFunctionUI[]> => {
      const { data, error } = await supabase
        .from('custom_functions')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch custom functions: ${error.message}`);
      }

      return (data || []).map(customFunctionToUI);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook para calcular el precio de una crema personalizada
export function useCalculateCustomCreamPrice() {
  return useQuery({
    queryKey: ['calculate-price'],
    enabled: false, // Solo se ejecuta manualmente
    queryFn: async ({
      oilId,
      extractIds,
      functionId,
      basePrice = 25.00,
    }: {
      oilId: string;
      extractIds: string[];
      functionId: string;
      basePrice?: number;
    }): Promise<number> => {
      // Obtener modificadores de precio
      const [oilResult, extractsResult, functionResult] = await Promise.all([
        supabase.from('custom_oils').select('price_modifier').eq('id', oilId).single(),
        supabase.from('custom_extracts').select('price_modifier').in('id', extractIds),
        supabase.from('custom_functions').select('price_modifier').eq('id', functionId).single(),
      ]);

      if (oilResult.error) throw new Error(`Failed to fetch oil: ${oilResult.error.message}`);
      if (functionResult.error) throw new Error(`Failed to fetch function: ${functionResult.error.message}`);

      const oilModifier = oilResult.data?.price_modifier || 0;
      const functionModifier = functionResult.data?.price_modifier || 0;
      const extractModifiers = (extractsResult.data || []).reduce(
        (sum, extract) => sum + (extract.price_modifier || 0),
        0
      );

      const finalPrice = basePrice + oilModifier + extractModifiers + functionModifier;

      return Math.round(finalPrice * 100) / 100; // Redondear a 2 decimales
    },
  });
}

// Hook para crear una crema personalizada
export function useCreateCustomCream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      oilId,
      extractIds,
      functionId,
      basePrice = 25.00,
      name = null,
      userId = null,
    }: {
      oilId: string;
      extractIds: string[];
      functionId: string;
      basePrice?: number;
      name?: string | null;
      userId?: string | null;
    }): Promise<CustomCream> => {
      // Calcular precio final
      const [oilResult, extractsResult, functionResult] = await Promise.all([
        supabase.from('custom_oils').select('price_modifier').eq('id', oilId).single(),
        supabase.from('custom_extracts').select('price_modifier').in('id', extractIds),
        supabase.from('custom_functions').select('price_modifier').eq('id', functionId).single(),
      ]);

      if (oilResult.error) throw new Error(`Failed to fetch oil: ${oilResult.error.message}`);
      if (functionResult.error) throw new Error(`Failed to fetch function: ${functionResult.error.message}`);

      const oilModifier = oilResult.data?.price_modifier || 0;
      const functionModifier = functionResult.data?.price_modifier || 0;
      const extractModifiers = (extractsResult.data || []).reduce(
        (sum, extract) => sum + (extract.price_modifier || 0),
        0
      );

      const finalPrice = Math.round((basePrice + oilModifier + extractModifiers + functionModifier) * 100) / 100;

      // Crear la crema personalizada
      const { data, error } = await supabase
        .from('custom_creams')
        .insert({
          user_id: userId,
          oil_id: oilId,
          extract_ids: extractIds,
          function_id: functionId,
          base_price: basePrice,
          final_price: finalPrice,
          name: name,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create custom cream: ${error.message}`);
      }

      return data as CustomCream;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['custom-creams'] });
    },
  });
}

// Hook para obtener cremas personalizadas del usuario
export function useCustomCreams(userId?: string | null) {
  return useQuery({
    queryKey: ['custom-creams', userId],
    queryFn: async (): Promise<CustomCreamUI[]> => {
      let query = supabase
        .from('custom_creams')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch custom creams: ${error.message}`);
      }

      return (data || []).map((cream: CustomCream) => ({
        id: cream.id,
        userId: cream.user_id,
        oilId: cream.oil_id,
        extractIds: cream.extract_ids,
        functionId: cream.function_id,
        basePrice: cream.base_price,
        finalPrice: cream.final_price,
        name: cream.name,
        status: cream.status,
        createdAt: cream.created_at,
        updatedAt: cream.updated_at,
      }));
    },
    enabled: true, // Siempre habilitado, puede filtrar por userId después
  });
}

// Hook para actualizar el estado de una crema personalizada
export function useUpdateCustomCreamStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      creamId,
      status,
    }: {
      creamId: number;
      status: 'draft' | 'in_cart' | 'ordered' | 'completed';
    }): Promise<CustomCream> => {
      const { data, error } = await supabase
        .from('custom_creams')
        .update({ status })
        .eq('id', creamId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update custom cream status: ${error.message}`);
      }

      return data as CustomCream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-creams'] });
    },
  });
}

// Hook para crear un pedido de crema personalizada
export function useCreateCustomCreamOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customCreamId,
      quantity = 1,
      subscription = false,
      subscriptionFrequency = null,
      userId = null,
      orderId = null,
    }: {
      customCreamId: number;
      quantity?: number;
      subscription?: boolean;
      subscriptionFrequency?: 'monthly' | 'bimonthly' | 'quarterly' | null;
      userId?: string | null;
      orderId?: number | null;
    }): Promise<CustomCreamOrder> => {
      // Obtener el precio de la crema
      const { data: cream, error: creamError } = await supabase
        .from('custom_creams')
        .select('final_price')
        .eq('id', customCreamId)
        .single();

      if (creamError) {
        throw new Error(`Failed to fetch custom cream: ${creamError.message}`);
      }

      const unitPrice = cream.final_price;
      const totalPrice = unitPrice * quantity;

      // Crear el pedido
      const { data, error } = await supabase
        .from('custom_cream_orders')
        .insert({
          custom_cream_id: customCreamId,
          order_id: orderId,
          user_id: userId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          subscription,
          subscription_frequency: subscriptionFrequency,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create custom cream order: ${error.message}`);
      }

      // Actualizar el estado de la crema
      await supabase
        .from('custom_creams')
        .update({ status: 'ordered' })
        .eq('id', customCreamId);

      return data as CustomCreamOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-creams'] });
      queryClient.invalidateQueries({ queryKey: ['custom-cream-orders'] });
    },
  });
}

// Función helper para calcular precio sin hook (para uso en componentes)
export async function calculateCustomCreamPrice(
  oilId: string,
  extractIds: string[],
  functionId: string,
  basePrice: number = 25.00
): Promise<number> {
  const [oilResult, extractsResult, functionResult] = await Promise.all([
    supabase.from('custom_oils').select('price_modifier').eq('id', oilId).single(),
    extractIds.length > 0
      ? supabase.from('custom_extracts').select('price_modifier').in('id', extractIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('custom_functions').select('price_modifier').eq('id', functionId).single(),
  ]);

  if (oilResult.error) throw new Error(`Failed to fetch oil: ${oilResult.error.message}`);
  if (functionResult.error) throw new Error(`Failed to fetch function: ${functionResult.error.message}`);

  const oilModifier = oilResult.data?.price_modifier || 0;
  const functionModifier = functionResult.data?.price_modifier || 0;
  const extractModifiers = (extractsResult.data || []).reduce(
    (sum, extract) => sum + (extract.price_modifier || 0),
    0
  );

  const finalPrice = basePrice + oilModifier + extractModifiers + functionModifier;
  return Math.round(finalPrice * 100) / 100;
}

