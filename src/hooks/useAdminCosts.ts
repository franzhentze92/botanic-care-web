import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Cost {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  category: 'sueldo' | 'redes_sociales' | 'impuestos' | 'marketing' | 'servicios' | 'alquiler' | 'otros';
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  date: string;
  is_recurring: boolean;
  next_payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCostData {
  name: string;
  description?: string | null;
  amount: number;
  category: Cost['category'];
  frequency: Cost['frequency'];
  date: string;
  is_recurring?: boolean;
  next_payment_date?: string | null;
}

export interface UpdateCostData extends Partial<CreateCostData> {
  id: number;
}

// ==================== HOOKS ====================

export const useAdminCosts = (filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  frequency?: string;
}) => {
  return useQuery<Cost[], Error>({
    queryKey: ['admin-costs', filters],
    queryFn: async () => {
      let query = supabase
        .from('costs')
        .select('*')
        .order('date', { ascending: false });

      // Aplicar filtros
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.frequency && filters.frequency !== 'all') {
        query = query.eq('frequency', filters.frequency);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching costs:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (costData: CreateCostData): Promise<Cost> => {
      const { data, error } = await supabase
        .from('costs')
        .insert([costData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-costs'] });
      // Invalidar análisis cuando se crea un costo
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Costo creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el costo', {
        description: error.message,
      });
    },
  });
};

export const useUpdateCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCostData): Promise<Cost> => {
      const { data, error } = await supabase
        .from('costs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-costs'] });
      // Invalidar análisis cuando se actualiza un costo
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Costo actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el costo', {
        description: error.message,
      });
    },
  });
};

export const useDeleteCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('costs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-costs'] });
      // Invalidar análisis cuando se elimina un costo
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Costo eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el costo', {
        description: error.message,
      });
    },
  });
};

