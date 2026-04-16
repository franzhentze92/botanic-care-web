import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

const shopifyHint = () => {
  toast.info('Pedidos y cuentas: usa tu tienda Shopify', {
    description: 'Historial de pedidos en la cuenta de cliente de Shopify.',
  });
};

export const useOrders = () => {
  const { user } = useAuth();
  return useQuery<OrderWithItems[], Error>({
    queryKey: ['orders', user?.id],
    queryFn: async () => [],
    enabled: !!user,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_orderData: CreateOrderData): Promise<OrderWithItems> => {
      shopifyHint();
      throw new Error('Checkout en Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAddresses = () => {
  const { user } = useAuth();
  return useQuery<Address[], Error>({
    queryKey: ['addresses', user?.id],
    queryFn: async () => [],
    enabled: !!user,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_addressData: CreateAddressData): Promise<Address> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: UpdateAddressData): Promise<Address> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: number): Promise<void> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const usePaymentMethods = () => {
  const { user } = useAuth();
  return useQuery<PaymentMethod[], Error>({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => [],
    enabled: !!user,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_paymentData: CreatePaymentMethodData): Promise<PaymentMethod> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: UpdatePaymentMethodData): Promise<PaymentMethod> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: number): Promise<void> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

export const useUserProfile = () => {
  const { user } = useAuth();
  return useQuery<UserProfile | null, Error>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => null,
    enabled: !!user,
    throwOnError: false,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_profileData: UpdateUserProfileData): Promise<UserProfile> => {
      shopifyHint();
      throw new Error('Shopify');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};
