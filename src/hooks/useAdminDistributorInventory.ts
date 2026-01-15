import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Función auxiliar para restaurar productos terminados cuando un distribuidor devuelve
const restoreFinishedProductsForDistributor = async (
  productId: number,
  quantity: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Crear un nuevo batch con estado "completado" para las devoluciones
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const { data: newBatch, error: batchError } = await supabase
      .from('production_batches')
      .insert([{
        product_id: productId,
        quantity: quantity,
        production_date: new Date().toISOString().split('T')[0],
        status: 'completado',
        notes: `Devolución de distribuidor - ${new Date().toISOString()}`,
        created_by: userId,
      }])
      .select()
      .single();

    if (batchError) {
      return { success: false, error: batchError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in restoreFinishedProductsForDistributor:', error);
    return { success: false, error: error.message || 'Error desconocido al restaurar productos' };
  }
};

// Función auxiliar para descontar productos terminados de los batches cuando se envía a distribuidor
const deductFinishedProductsForDistributor = async (
  productId: number,
  quantity: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    let remainingQuantity = quantity;

    // Obtener batches disponibles ordenados por fecha de producción (más antiguos primero)
    const { data: availableBatches, error: batchesError } = await supabase
      .from('production_batches')
      .select('id, quantity, status')
      .eq('product_id', productId)
      .in('status', ['completado', 'en_almacen'])
      .order('production_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (batchesError) {
      return { success: false, error: batchesError.message };
    }

    if (!availableBatches || availableBatches.length === 0) {
      return { success: false, error: `No hay batches disponibles para el producto ${productId}` };
    }

    // Verificar que hay suficiente stock total
    const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalAvailable < remainingQuantity) {
      return { 
        success: false, 
        error: `Stock insuficiente. Disponible: ${totalAvailable}, Requerido: ${remainingQuantity}` 
      };
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

    return { success: true };
  } catch (error: any) {
    console.error('Error in deductFinishedProductsForDistributor:', error);
    return { success: false, error: error.message || 'Error desconocido al descontar productos' };
  }
};

// ==================== TYPES ====================

export interface DistributorInventoryMovement {
  id: number;
  distributor_id: number;
  product_id: number;
  movement_type: 'envio' | 'devolucion';
  quantity: number;
  notes: string | null;
  movement_date: string;
  created_by: string | null;
  created_at: string;
  // Datos relacionados
  distributor?: {
    id: number;
    store_name: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
    sku: string;
    image_url: string | null;
  };
}

export interface DistributorStock {
  distributor_id: number;
  distributor_name: string;
  product_id: number;
  product_name: string;
  product_sku: string;
  current_stock: number;
  total_sent: number;
  total_returned: number;
}

export interface CreateDistributorInventoryMovementData {
  distributor_id: number;
  product_id: number;
  movement_type: 'envio' | 'devolucion';
  quantity: number;
  notes?: string | null;
  movement_date?: string;
}

// ==================== HOOKS ====================

// Obtener movimientos de inventario de distribuidores
export const useDistributorInventoryMovements = (filters?: {
  distributorId?: number;
  productId?: number;
  movementType?: 'envio' | 'devolucion' | 'all';
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery<DistributorInventoryMovement[], Error>({
    queryKey: ['distributor-inventory-movements', filters],
    queryFn: async () => {
      let query = supabase
        .from('distributor_inventory_movements')
        .select(`
          *,
          distributor:distributors(id, store_name, email),
          product:products(id, name, sku, image_url)
        `)
        .order('movement_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.distributorId) {
        query = query.eq('distributor_id', filters.distributorId);
      }

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters?.movementType && filters.movementType !== 'all') {
        query = query.eq('movement_type', filters.movementType);
      }

      if (filters?.dateFrom) {
        query = query.gte('movement_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('movement_date', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((movement: any) => ({
        ...movement,
        distributor: movement.distributor || undefined,
        product: movement.product || undefined,
      }));
    },
  });
};

// Obtener stock por distribuidor y producto
export const useDistributorStock = (filters?: {
  distributorId?: number;
  productId?: number;
}) => {
  return useQuery<DistributorStock[], Error>({
    queryKey: ['distributor-stock', filters],
    queryFn: async () => {
      // Obtener todos los movimientos
      let movementsQuery = supabase
        .from('distributor_inventory_movements')
        .select(`
          distributor_id,
          product_id,
          movement_type,
          quantity,
          distributor:distributors(id, store_name),
          product:products(id, name, sku)
        `);

      if (filters?.distributorId) {
        movementsQuery = movementsQuery.eq('distributor_id', filters.distributorId);
      }

      if (filters?.productId) {
        movementsQuery = movementsQuery.eq('product_id', filters.productId);
      }

      const { data: movements, error } = await movementsQuery;

      if (error) throw error;

      // Calcular stock por distribuidor y producto
      const stockMap = new Map<string, DistributorStock>();

      (movements || []).forEach((movement: any) => {
        const key = `${movement.distributor_id}-${movement.product_id}`;
        
        if (!stockMap.has(key)) {
          stockMap.set(key, {
            distributor_id: movement.distributor_id,
            distributor_name: movement.distributor?.store_name || 'Desconocido',
            product_id: movement.product_id,
            product_name: movement.product?.name || 'Desconocido',
            product_sku: movement.product?.sku || '',
            current_stock: 0,
            total_sent: 0,
            total_returned: 0,
          });
        }

        const stock = stockMap.get(key)!;
        
        if (movement.movement_type === 'envio') {
          stock.total_sent += movement.quantity;
          stock.current_stock += movement.quantity; // Envío aumenta stock del distribuidor
        } else if (movement.movement_type === 'devolucion') {
          stock.total_returned += movement.quantity;
          stock.current_stock -= movement.quantity; // Devolución reduce stock del distribuidor
        }
      });

      // El stock actual del distribuidor ya está calculado correctamente en el loop anterior
      // stock = total enviado - total devuelto

      return Array.from(stockMap.values());
    },
  });
};

// Crear movimiento de inventario de distribuidor
export const useCreateDistributorInventoryMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      movementData: CreateDistributorInventoryMovementData & { created_by: string }
    ): Promise<DistributorInventoryMovement> => {
      // Si es un envío, verificar y descontar del stock de productos terminados
      if (movementData.movement_type === 'envio' && movementData.product_id) {
        const deductionResult = await deductFinishedProductsForDistributor(
          movementData.product_id,
          movementData.quantity
        );

        if (!deductionResult.success) {
          throw new Error(deductionResult.error || 'Error al descontar productos del inventario');
        }
      }

      // Si es una devolución, restaurar el stock de productos terminados
      if (movementData.movement_type === 'devolucion' && movementData.product_id) {
        const restoreResult = await restoreFinishedProductsForDistributor(
          movementData.product_id,
          movementData.quantity
        );

        if (!restoreResult.success) {
          throw new Error(restoreResult.error || 'Error al restaurar productos al inventario');
        }
      }

      const { data, error } = await supabase
        .from('distributor_inventory_movements')
        .insert([movementData])
        .select(`
          *,
          distributor:distributors(id, store_name, email),
          product:products(id, name, sku, image_url)
        `)
        .single();

      if (error) {
        // Si falla la inserción después de descontar/restaurar, el error se mostrará
        // (En producción podrías querer revertir las operaciones)
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-stock'] });
      queryClient.invalidateQueries({ queryKey: ['finished-products-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-production-batches'] });
      toast.success('Movimiento registrado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al registrar el movimiento', {
        description: error.message,
      });
    },
  });
};

// Eliminar movimiento de inventario de distribuidor
export const useDeleteDistributorInventoryMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('distributor_inventory_movements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-stock'] });
      toast.success('Movimiento eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el movimiento', {
        description: error.message,
      });
    },
  });
};

