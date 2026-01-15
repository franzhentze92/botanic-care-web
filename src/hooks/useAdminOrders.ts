import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface AdminOrder {
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

export interface AdminOrderItem {
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

export interface AdminOrderWithItems extends AdminOrder {
  items: AdminOrderItem[];
  user_email?: string;
  user_name?: string;
}

// ==================== HOOKS ====================

export const useAdminOrders = () => {
  return useQuery<AdminOrderWithItems[], Error>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      // Obtener todos los pedidos
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('Orders fetched:', orders?.length || 0, orders);

      if (!orders || orders.length === 0) {
        console.log('No orders found in database');
        return [];
      }

      // Obtener items para cada pedido
      const orderIds = orders.map(o => o.id);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Obtener información de usuarios desde auth.users (si profiles no existe, usamos user_id directamente)
      const userIds = [...new Set(orders.map(o => o.user_id))];
      let users: any[] = [];
      
      // Intentar obtener desde profiles primero (si la tabla existe)
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', userIds);
        
        // Si no hay error y hay datos, usar profiles
        if (!profilesError && profiles) {
          users = profiles;
        } else {
          // Si profiles no existe o hay error, usar user_id directamente
          users = userIds.map(id => ({ id, email: '', first_name: '', last_name: '' }));
        }
      } catch (error) {
        // Si hay un error al intentar acceder a profiles (tabla no existe), usar user_id directamente
        users = userIds.map(id => ({ id, email: '', first_name: '', last_name: '' }));
      }

      // Combinar orders con sus items y usuarios
      return orders.map(order => {
        const user = users?.find(u => u.id === order.user_id);
        return {
          ...order,
          items: (items || []).filter(item => item.order_id === order.id),
          user_email: user?.email || '',
          user_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
        } as AdminOrderWithItems;
      });
    },
  });
};

// Función auxiliar para descontar productos terminados de los batches
const deductFinishedProducts = async (orderId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    // Obtener los items de la orden
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)
      .not('product_id', 'is', null)
      .eq('is_custom_cream', false);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    if (!orderItems || orderItems.length === 0) {
      return { success: true }; // No hay productos para descontar
    }

    // Agrupar por producto
    const productQuantities = new Map<number, number>();
    orderItems.forEach(item => {
      if (item.product_id) {
        const current = productQuantities.get(item.product_id) || 0;
        productQuantities.set(item.product_id, current + item.quantity);
      }
    });

    // Para cada producto, descontar de los batches más antiguos primero (FIFO)
    for (const [productId, totalQuantity] of productQuantities.entries()) {
      let remainingQuantity = totalQuantity;

      // Obtener batches disponibles ordenados por fecha de producción (más antiguos primero)
      const { data: availableBatches, error: batchesError } = await supabase
        .from('production_batches')
        .select('id, quantity, status')
        .eq('product_id', productId)
        .in('status', ['completado', 'en_almacen'])
        .order('production_date', { ascending: true })
        .order('created_at', { ascending: true });

      if (batchesError) {
        console.error('Error fetching batches:', batchesError);
        continue;
      }

      if (!availableBatches || availableBatches.length === 0) {
        console.warn(`No hay batches disponibles para el producto ${productId}`);
        continue;
      }

      // Descontar de cada batch hasta completar la cantidad requerida
      for (const batch of availableBatches) {
        if (remainingQuantity <= 0) break;

        const availableInBatch = batch.quantity;
        const toDeduct = Math.min(remainingQuantity, availableInBatch);
        const remainingInBatch = availableInBatch - toDeduct;
        remainingQuantity -= toDeduct;

        // Si el batch se agota completamente, marcarlo como agotado
        if (remainingInBatch === 0) {
          const { error: updateError } = await supabase
            .from('production_batches')
            .update({ status: 'agotado', quantity: 0 })
            .eq('id', batch.id);

          if (updateError) {
            console.error('Error updating batch:', updateError);
            return { success: false, error: `Error al actualizar batch ${batch.id}: ${updateError.message}` };
          }
        } else {
          // Si queda stock, actualizar la cantidad
          // Nota: En producción real, podrías querer crear un nuevo batch con la cantidad restante
          // Por simplicidad, actualizamos la cantidad del batch existente
          const { error: updateError } = await supabase
            .from('production_batches')
            .update({ quantity: remainingInBatch })
            .eq('id', batch.id);

          if (updateError) {
            console.error('Error updating batch quantity:', updateError);
            return { success: false, error: `Error al actualizar cantidad del batch ${batch.id}: ${updateError.message}` };
          }
        }
      }

      // Si no hay suficiente stock, advertir pero no fallar
      if (remainingQuantity > 0) {
        console.warn(`Stock insuficiente para el producto ${productId}. Faltan ${remainingQuantity} unidades.`);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deductFinishedProducts:', error);
    return { success: false, error: error.message || 'Error desconocido al descontar productos' };
  }
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, trackingNumber, estimatedDelivery }: {
      orderId: number;
      status: AdminOrder['status'];
      trackingNumber?: string;
      estimatedDelivery?: string;
    }): Promise<AdminOrder> => {
      // Obtener el estado actual de la orden
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (trackingNumber !== undefined) {
        updateData.tracking_number = trackingNumber;
      }

      if (estimatedDelivery !== undefined) {
        updateData.estimated_delivery = estimatedDelivery;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Si el estado cambió a 'delivered' o 'shipped' (y no estaba en ese estado antes), descontar productos
      if (
        (status === 'delivered' || status === 'shipped') &&
        currentOrder?.status !== 'delivered' &&
        currentOrder?.status !== 'shipped'
      ) {
        const deductionResult = await deductFinishedProducts(orderId);
        
        if (!deductionResult.success) {
          // Revertir el cambio de estado si falla el descuento
          await supabase
            .from('orders')
            .update({ status: currentOrder.status, updated_at: currentOrder.updated_at || new Date().toISOString() })
            .eq('id', orderId);
          
          throw new Error(deductionResult.error || 'Error al descontar productos del inventario');
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finished-products-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-production-batches'] });
      // Invalidar análisis cuando se actualiza un pedido
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-operational-analytics'] });
      toast.success('Estado del pedido actualizado', {
        description: 'El pedido ha sido actualizado exitosamente.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el pedido', {
        description: error.message,
      });
    },
  });
};

