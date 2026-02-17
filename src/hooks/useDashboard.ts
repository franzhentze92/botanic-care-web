import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Order {
  id: number;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  tracking_number: string | null;
  estimated_delivery: string | null;
  shipping_address_id: number | null;
  payment_method_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_image_url: string | null;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_custom_cream: boolean;
  custom_cream_id: number | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Address {
  id: number;
  user_id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  is_default?: boolean;
  phone?: string;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id: number;
}

export interface PaymentMethod {
  id: number;
  user_id: string;
  type: 'card' | 'paypal' | 'cash_on_delivery';
  card_brand: string | null;
  last4: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  cardholder_name: string | null;
  paypal_email: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodData {
  type: 'card' | 'paypal' | 'cash_on_delivery';
  card_brand?: string;
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
  cardholder_name?: string;
  paypal_email?: string;
  is_default?: boolean;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {
  id: number;
}

export interface UserProfile {
  id: number;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  email_notifications: boolean;
  newsletter: boolean;
  language: 'es' | 'en';
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileData {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  email_notifications?: boolean;
  newsletter?: boolean;
  language?: 'es' | 'en';
}

// ==================== ORDERS HOOKS ====================

export interface CreateOrderData {
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address_id?: number | null;
  payment_method_id?: number | null;
  notes?: string | null;
  items: Array<{
    product_id?: number | null;
    product_name: string;
    product_image_url?: string | null;
    product_sku?: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_custom_cream?: boolean;
    custom_cream_id?: number | null;
  }>;
}

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery<OrderWithItems[], Error>({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return [];

      // Obtener items para cada pedido
      const orderIds = orders.map(o => o.id);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Combinar orders con sus items
      return orders.map(order => ({
        ...order,
        items: (items || []).filter(item => item.order_id === order.id)
      })) as OrderWithItems[];
    },
    enabled: !!user,
    refetchOnWindowFocus: true, // Refrescar cuando la ventana recibe foco
    refetchInterval: 30000, // Refrescar cada 30 segundos para ver actualizaciones del admin
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData): Promise<OrderWithItems> => {
      if (!user) {
        const error = new Error('User not authenticated');
        console.error('Error en useCreateOrder: Usuario no autenticado');
        throw error;
      }

      // Verificar sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const error = new Error('No active session');
        console.error('Error en useCreateOrder: No hay sesión activa');
        throw error;
      }

      // Crear la orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost,
          tax: orderData.tax,
          total: orderData.total,
          shipping_address_id: orderData.shipping_address_id || null,
          payment_method_id: orderData.payment_method_id || null,
          notes: orderData.notes || null,
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error al crear la orden:', orderError);
        // Mejorar mensaje de error
        if (orderError.code === '23505') {
          throw new Error('Ya existe una orden con este número. Por favor, intenta de nuevo.');
        } else if (orderError.code === 'PGRST301' || orderError.message?.includes('permission') || orderError.message?.includes('policy')) {
          throw new Error('No tienes permisos para crear órdenes. Verifica que hayas confirmado tu email.');
        }
        throw orderError;
      }

      // Crear los items de la orden
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        product_image_url: item.product_image_url || null,
        product_sku: item.product_sku || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        is_custom_cream: item.is_custom_cream || false,
        custom_cream_id: item.custom_cream_id || null,
      }));

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: items || [],
      } as OrderWithItems;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidar análisis cuando se crea un pedido
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-operational-analytics'] });
    },
    onError: (error: Error) => {
      toast.error('Error al crear la orden', {
        description: error.message,
      });
    },
  });
};

// ==================== ADDRESSES HOOKS ====================

export const useAddresses = () => {
  const { user } = useAuth();

  return useQuery<Address[], Error>({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (addressData: CreateAddressData): Promise<Address> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('addresses')
        .insert([{
          ...addressData,
          user_id: user.id,
          country: addressData.country || 'Guatemala',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Dirección agregada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al agregar dirección', {
        description: error.message,
      });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateAddressData): Promise<Address> => {
      const { data, error } = await supabase
        .from('addresses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Dirección actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar dirección', {
        description: error.message,
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Dirección eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar dirección', {
        description: error.message,
      });
    },
  });
};

// ==================== PAYMENT METHODS HOOKS ====================

export const usePaymentMethods = () => {
  const { user } = useAuth();

  return useQuery<PaymentMethod[], Error>({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (paymentData: CreatePaymentMethodData): Promise<PaymentMethod> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          ...paymentData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Método de pago agregado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al agregar método de pago', {
        description: error.message,
      });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdatePaymentMethodData): Promise<PaymentMethod> => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Método de pago actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar método de pago', {
        description: error.message,
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Método de pago eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar método de pago', {
        description: error.message,
      });
    },
  });
};

// ==================== USER PROFILE HOOKS ====================

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery<UserProfile | null, Error>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Verificar que haya sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Si el error es "no rows found", el perfil no existe aún
        if (error && error.code === 'PGRST116') {
          // Intentar crear el perfil
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (createError) {
            // Si falla, esperar un momento (el trigger puede haberlo creado)
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: retryData } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            return retryData || null;
          }
          
          return newProfile;
        }

        // Si hay error de permisos, retornar null en lugar de lanzar error
        if (error) {
          if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('401') || error.message?.includes('406')) {
            console.warn('Error de permisos al acceder al perfil:', error);
            return null;
          }
          throw error;
        }

        return data;
      } catch (err: any) {
        console.error('Error en useUserProfile:', err);
        // Retornar null en lugar de lanzar error para no romper la UI
        return null;
      }
    },
    enabled: !!user, // Ejecutar si hay usuario
    retry: 3, // Reintentar 3 veces
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false, // No lanzar error, retornar null
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profileData: UpdateUserProfileData): Promise<UserProfile> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar perfil', {
        description: error.message,
      });
    },
  });
};

