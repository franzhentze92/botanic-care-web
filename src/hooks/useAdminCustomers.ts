import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface AdminCustomer {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
}

export interface CreateCustomerData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateCustomerData {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

// ==================== HOOKS ====================

export const useAdminCustomers = (filters?: {
  searchQuery?: string;
}) => {
  return useQuery<AdminCustomer[], Error>({
    queryKey: ['admin-customers', filters],
    queryFn: async () => {
      // Obtener todos los pedidos para calcular estadísticas de clientes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total, created_at')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Obtener todos los perfiles de usuario
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, phone, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Obtener emails de usuarios
      const userIds = profiles ? [...new Set(profiles.map(p => p.user_id))] : [];
      let userEmailMap = new Map<string, string>();
      
      try {
        const { data: userEmails, error: emailError } = await supabase
          .rpc('get_user_emails', { user_ids: userIds });
        
        if (userEmails && !emailError && Array.isArray(userEmails)) {
          userEmails.forEach((item: any) => {
            if (item.id && item.email) {
              userEmailMap.set(item.id, item.email);
            }
          });
        }
      } catch (e) {
        console.error('Error obteniendo emails:', e);
      }

      // Calcular estadísticas por usuario
      const orderStats = new Map<string, { total_orders: number; total_spent: number; last_order_date: string | null }>();
      
      if (orders) {
        orders.forEach(order => {
          const userId = order.user_id;
          const stats = orderStats.get(userId) || { total_orders: 0, total_spent: 0, last_order_date: null };
          stats.total_orders += 1;
          stats.total_spent += parseFloat(order.total.toString());
          if (!stats.last_order_date || order.created_at > stats.last_order_date) {
            stats.last_order_date = order.created_at;
          }
          orderStats.set(userId, stats);
        });
      }

      // Combinar información
      const customers: AdminCustomer[] = (profiles || []).map(profile => {
        const stats = orderStats.get(profile.user_id) || { total_orders: 0, total_spent: 0, last_order_date: null };
        const email = userEmailMap.get(profile.user_id) || `${profile.user_id.substring(0, 8)}...`;
        
        return {
          user_id: profile.user_id,
          email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          created_at: profile.created_at,
          total_orders: stats.total_orders,
          total_spent: stats.total_spent,
          last_order_date: stats.last_order_date,
        };
      });

      // Aplicar filtro de búsqueda si existe
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return customers.filter(customer => 
          customer.email.toLowerCase().includes(query) ||
          (customer.first_name?.toLowerCase().includes(query)) ||
          (customer.last_name?.toLowerCase().includes(query)) ||
          customer.user_id.toLowerCase().includes(query)
        );
      }

      return customers;
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: CreateCustomerData): Promise<void> => {
      // Usar signUp para crear el usuario (esto creará la cuenta en auth.users)
      // Nota: Esto funcionará incluso si el email requiere confirmación
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: {
          data: {
            first_name: customerData.first_name,
            last_name: customerData.last_name,
          },
        },
      });

      if (authError) {
        // Si el usuario ya existe, informar al usuario
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          throw new Error('Este email ya está registrado. Usa la opción de editar para actualizar la información.');
        }
        throw authError;
      }

      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // Crear perfil de usuario
      // El trigger debería crear el perfil automáticamente, pero lo creamos explícitamente por si acaso
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          first_name: customerData.first_name || null,
          last_name: customerData.last_name || null,
          phone: customerData.phone || null,
        }])
        .select()
        .single();

      // Si el perfil ya existe (creado por trigger), no es un error
      if (profileError && profileError.code !== '23505') { // 23505 = duplicate key
        // Si hay un error diferente, intentar actualizar el perfil existente
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            first_name: customerData.first_name || null,
            last_name: customerData.last_name || null,
            phone: customerData.phone || null,
          })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('Error creating/updating profile:', updateError);
          throw updateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Cliente creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el cliente', {
        description: error.message,
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, ...updateData }: UpdateCustomerData): Promise<void> => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updateData.first_name,
          last_name: updateData.last_name,
          phone: updateData.phone,
        })
        .eq('user_id', user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el cliente', {
        description: error.message,
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      // Nota: No podemos eliminar usuarios de auth.users desde el cliente
      // Solo podemos eliminar el perfil. El usuario permanecerá en auth.users pero sin perfil
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // También eliminar de user_roles si existe
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // Ignorar error si la tabla no existe o no hay rol
      if (rolesError && !rolesError.message.includes('does not exist')) {
        console.warn('Error deleting user role:', rolesError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el cliente', {
        description: error.message,
      });
    },
  });
};

