import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface AdminDistributor {
  id: string;
  store_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDistributorData {
  store_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
}

export interface UpdateDistributorData {
  id: string;
  store_name?: string;
  contact_name?: string | null;
  email?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
}

// ==================== HOOKS ====================

export const useAdminDistributors = (filters?: {
  searchQuery?: string;
}) => {
  return useQuery<AdminDistributor[], Error>({
    queryKey: ['admin-distributors', filters],
    queryFn: async () => {
      let query = supabase
        .from('distributors')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const distributors = (data || []) as AdminDistributor[];

      // Aplicar filtro de búsqueda si existe
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return distributors.filter(distributor => 
          distributor.store_name.toLowerCase().includes(query) ||
          distributor.email.toLowerCase().includes(query) ||
          (distributor.contact_name?.toLowerCase().includes(query)) ||
          (distributor.phone?.toLowerCase().includes(query)) ||
          (distributor.address?.toLowerCase().includes(query)) ||
          (distributor.city?.toLowerCase().includes(query))
        );
      }

      return distributors;
    },
  });
};

export const useCreateDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (distributorData: CreateDistributorData): Promise<void> => {
      const { error } = await supabase
        .from('distributors')
        .insert([{
          store_name: distributorData.store_name,
          contact_name: distributorData.contact_name || null,
          email: distributorData.email,
          phone: distributorData.phone || null,
          address: distributorData.address || null,
          city: distributorData.city || null,
          state: distributorData.state || null,
          zip_code: distributorData.zip_code || null,
          country: distributorData.country || 'Guatemala',
          notes: distributorData.notes || null,
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Ya existe un distribuidor con este email o nombre de tienda.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-distributors'] });
      toast.success('Distribuidor creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el distribuidor', {
        description: error.message,
      });
    },
  });
};

export const useUpdateDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateDistributorData): Promise<void> => {
      const { error } = await supabase
        .from('distributors')
        .update({
          store_name: updateData.store_name,
          contact_name: updateData.contact_name,
          email: updateData.email,
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          zip_code: updateData.zip_code,
          country: updateData.country,
          notes: updateData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Ya existe un distribuidor con este email o nombre de tienda.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-distributors'] });
      toast.success('Distribuidor actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el distribuidor', {
        description: error.message,
      });
    },
  });
};

export const useDeleteDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('distributors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-distributors'] });
      toast.success('Distribuidor eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el distribuidor', {
        description: error.message,
      });
    },
  });
};

