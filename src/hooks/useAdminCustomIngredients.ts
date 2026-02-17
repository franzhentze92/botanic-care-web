import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CustomOil, CustomExtract, CustomFunction } from '@/types/custom-cream';

// ==================== TYPES ====================

export interface CreateCustomOilData {
  id: string;
  name: string;
  emoji?: string | null;
  description?: string | null;
  price_modifier?: number;
}

export interface UpdateCustomOilData extends Partial<CreateCustomOilData> {
  id: string;
}

export interface CreateCustomExtractData {
  id: string;
  name: string;
  emoji?: string | null;
  price_modifier?: number;
}

export interface UpdateCustomExtractData extends Partial<CreateCustomExtractData> {
  id: string;
}

export interface CreateCustomFunctionData {
  id: string;
  name: string;
  emoji?: string | null;
  ingredients: string[];
  price_modifier?: number;
}

export interface UpdateCustomFunctionData extends Partial<CreateCustomFunctionData> {
  id: string;
}

// ==================== HOOKS - CUSTOM OILS ====================

export const useAdminCustomOils = () => {
  return useQuery<CustomOil[], Error>({
    queryKey: ['admin-custom-oils'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_oils')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateCustomOil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oilData: CreateCustomOilData): Promise<CustomOil> => {
      const { data, error } = await supabase
        .from('custom_oils')
        .insert([oilData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-oils'] });
      queryClient.invalidateQueries({ queryKey: ['custom-oils'] });
      toast.success('Aceite base creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el aceite base', {
        description: error.message,
      });
    },
  });
};

export const useUpdateCustomOil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCustomOilData): Promise<CustomOil> => {
      const { data, error } = await supabase
        .from('custom_oils')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-oils'] });
      queryClient.invalidateQueries({ queryKey: ['custom-oils'] });
      toast.success('Aceite base actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el aceite base', {
        description: error.message,
      });
    },
  });
};

export const useDeleteCustomOil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('custom_oils')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-oils'] });
      queryClient.invalidateQueries({ queryKey: ['custom-oils'] });
      toast.success('Aceite base eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el aceite base', {
        description: error.message,
      });
    },
  });
};

// ==================== HOOKS - CUSTOM EXTRACTS ====================

export const useAdminCustomExtracts = () => {
  return useQuery<CustomExtract[], Error>({
    queryKey: ['admin-custom-extracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_extracts')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateCustomExtract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extractData: CreateCustomExtractData): Promise<CustomExtract> => {
      const { data, error } = await supabase
        .from('custom_extracts')
        .insert([extractData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['custom-extracts'] });
      toast.success('Extracto botánico creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el extracto botánico', {
        description: error.message,
      });
    },
  });
};

export const useUpdateCustomExtract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCustomExtractData): Promise<CustomExtract> => {
      const { data, error } = await supabase
        .from('custom_extracts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['custom-extracts'] });
      toast.success('Extracto botánico actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el extracto botánico', {
        description: error.message,
      });
    },
  });
};

export const useDeleteCustomExtract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('custom_extracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['custom-extracts'] });
      toast.success('Extracto botánico eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el extracto botánico', {
        description: error.message,
      });
    },
  });
};

// ==================== HOOKS - CUSTOM FUNCTIONS ====================

export const useAdminCustomFunctions = () => {
  return useQuery<CustomFunction[], Error>({
    queryKey: ['admin-custom-functions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_functions')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateCustomFunction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (functionData: CreateCustomFunctionData): Promise<CustomFunction> => {
      const { data, error } = await supabase
        .from('custom_functions')
        .insert([functionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-functions'] });
      queryClient.invalidateQueries({ queryKey: ['custom-functions'] });
      toast.success('Función activa creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear la función activa', {
        description: error.message,
      });
    },
  });
};

export const useUpdateCustomFunction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCustomFunctionData): Promise<CustomFunction> => {
      const { data, error } = await supabase
        .from('custom_functions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-functions'] });
      queryClient.invalidateQueries({ queryKey: ['custom-functions'] });
      toast.success('Función activa actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la función activa', {
        description: error.message,
      });
    },
  });
};

export const useDeleteCustomFunction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('custom_functions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-functions'] });
      queryClient.invalidateQueries({ queryKey: ['custom-functions'] });
      toast.success('Función activa eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la función activa', {
        description: error.message,
      });
    },
  });
};

