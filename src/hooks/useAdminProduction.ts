import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface ProductionBatch {
  id: number;
  batch_number: string;
  product_id: number | null;
  quantity: number;
  production_date: string;
  expiry_date: string | null;
  status: 'en_produccion' | 'completado' | 'cancelado' | 'en_almacen' | 'agotado';
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  creator?: {
    email: string;
  };
}

export interface CreateProductionBatchData {
  batch_number?: string;
  product_id: number | null;
  quantity: number;
  production_date: string;
  expiry_date?: string | null;
  status?: ProductionBatch['status'];
  location?: string | null;
  notes?: string | null;
}

export interface UpdateProductionBatchData extends Partial<CreateProductionBatchData> {
  id: number;
}

// ==================== HOOKS ====================

export const useAdminProductionBatches = (filters?: {
  status?: string;
  productId?: number;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery<ProductionBatch[], Error>({
    queryKey: ['admin-production-batches', filters],
    queryFn: async () => {
      let query = supabase
        .from('production_batches')
        .select(`
          *,
          product:products(id, name, sku)
        `)
        .order('production_date', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.productId && filters.productId !== 0) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters?.dateFrom) {
        query = query.gte('production_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('production_date', filters.dateTo);
      }

      const { data: batches, error } = await query;

      if (error) throw error;

      let filteredBatches = batches || [];

      // Aplicar búsqueda en memoria
      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        filteredBatches = filteredBatches.filter(batch =>
          batch.batch_number.toLowerCase().includes(search) ||
          (batch.product as any)?.name?.toLowerCase().includes(search) ||
          (batch.notes && batch.notes.toLowerCase().includes(search)) ||
          (batch.location && batch.location.toLowerCase().includes(search))
        );
      }

      // Obtener información de creadores
      const creatorIds = [...new Set(filteredBatches.map(b => b.created_by).filter(Boolean))];
      let creatorsMap = new Map<string, any>();

      if (creatorIds.length > 0) {
        try {
          const { data: creators } = await supabase
            .rpc('get_user_emails', { user_ids: creatorIds });

          if (creators && Array.isArray(creators)) {
            creators.forEach((creator: any) => {
              creatorsMap.set(creator.id, creator);
            });
          }
        } catch (e) {
          console.error('Error fetching creators:', e);
        }
      }

      return filteredBatches.map(batch => ({
        ...batch,
        product: (batch.product as any) || undefined,
        creator: batch.created_by ? creatorsMap.get(batch.created_by) : undefined,
      }));
    },
  });
};

// Función auxiliar para validar stock disponible
const validateStockAvailability = async (
  productId: number,
  quantity: number
): Promise<{ valid: boolean; missingItems?: Array<{ name: string; required: number; available: number; unit: string }>; error?: string }> => {
  try {
    // Obtener las recetas del producto con información de ingredientes
    const { data: recipes, error: recipesError } = await supabase
      .from('product_inventory_items')
      .select(`
        inventory_item_id,
        quantity_per_unit,
        inventory_item:inventory_items(id, name, sku, current_stock, unit)
      `)
      .eq('product_id', productId);

    if (recipesError) {
      return { valid: false, error: recipesError.message };
    }

    if (!recipes || recipes.length === 0) {
      return { valid: false, error: 'El producto no tiene receta definida' };
    }

    // Validar stock para cada ingrediente
    const missingItems: Array<{ name: string; required: number; available: number; unit: string }> = [];

    for (const recipe of recipes) {
      const inventoryItem = recipe.inventory_item as any;
      if (!inventoryItem) continue;

      const requiredQuantity = parseFloat(recipe.quantity_per_unit.toString()) * quantity;
      const availableStock = parseFloat(inventoryItem.current_stock?.toString() || '0');

      if (requiredQuantity > availableStock) {
        missingItems.push({
          name: inventoryItem.name || `Item ID: ${recipe.inventory_item_id}`,
          required: requiredQuantity,
          available: availableStock,
          unit: inventoryItem.unit || 'unidad',
        });
      }
    }

    if (missingItems.length > 0) {
      return { valid: false, missingItems };
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message || 'Error desconocido al validar stock' };
  }
};

// Función auxiliar para descontar ingredientes del inventario
const deductInventoryIngredients = async (
  productId: number,
  quantity: number,
  batchId: number,
  batchNumber: string,
  userId: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Primero validar que hay suficiente stock
    const stockValidation = await validateStockAvailability(productId, quantity);
    
    if (!stockValidation.valid) {
      if (stockValidation.missingItems && stockValidation.missingItems.length > 0) {
        const missingList = stockValidation.missingItems
          .map(item => `• ${item.name}: se requieren ${item.required.toFixed(2)} ${item.unit}, disponible ${item.available.toFixed(2)} ${item.unit}`)
          .join('\n');
        return { 
          success: false, 
          error: `Stock insuficiente para completar la producción:\n${missingList}` 
        };
      }
      return { success: false, error: stockValidation.error || 'Error al validar stock' };
    }

    // Obtener las recetas del producto
    const { data: recipes, error: recipesError } = await supabase
      .from('product_inventory_items')
      .select('inventory_item_id, quantity_per_unit')
      .eq('product_id', productId);

    if (recipesError) {
      return { success: false, error: recipesError.message };
    }

    if (!recipes || recipes.length === 0) {
      return { success: false, error: 'El producto no tiene receta definida' };
    }

    // Crear movimientos de inventario para cada ingrediente
    const movements = recipes.map(recipe => ({
      inventory_item_id: recipe.inventory_item_id,
      movement_type: 'produccion' as const,
      quantity: parseFloat(recipe.quantity_per_unit.toString()) * quantity,
      batch_id: batchId,
      reference_type: 'production_batch',
      reference_id: batchId,
      movement_date: new Date().toISOString().split('T')[0],
      notes: `Consumo para producción de batch ${batchNumber}`,
      created_by: userId || null,
    }));

    // Insertar todos los movimientos
    const { error: movementsError } = await supabase
      .from('inventory_movements')
      .insert(movements);

    if (movementsError) {
      return { success: false, error: movementsError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

export const useCreateProductionBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchData: CreateProductionBatchData & { created_by: string }): Promise<ProductionBatch> => {
      const { data, error } = await supabase
        .from('production_batches')
        .insert([batchData])
        .select(`
          *,
          product:products(id, name, sku)
        `)
        .single();

      if (error) throw error;

      // Si el batch se crea con estado "completado" y tiene un producto, validar y descontar ingredientes
      if (
        batchData.status === 'completado' &&
        batchData.product_id &&
        data?.quantity
      ) {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        // Validar stock antes de crear el batch
        const stockValidation = await validateStockAvailability(
          batchData.product_id,
          data.quantity
        );

        if (!stockValidation.valid) {
          // Eliminar el batch que acabamos de crear porque no hay suficiente stock
          await supabase.from('production_batches').delete().eq('id', data.id);
          
          if (stockValidation.missingItems && stockValidation.missingItems.length > 0) {
            const missingList = stockValidation.missingItems
              .map(item => `• ${item.name}: se requieren ${item.required.toFixed(2)} ${item.unit}, disponible ${item.available.toFixed(2)} ${item.unit}`)
              .join('\n');
            throw new Error(`Stock insuficiente para completar la producción:\n${missingList}`);
          }
          throw new Error(stockValidation.error || 'No hay suficiente stock disponible');
        }

        const deductionResult = await deductInventoryIngredients(
          batchData.product_id,
          data.quantity,
          data.id,
          data.batch_number,
          userId
        );

        if (!deductionResult.success) {
          console.error('Error deducting inventory:', deductionResult.error);
          toast.warning('El batch se creó, pero hubo un error al descontar ingredientes del inventario', {
            description: deductionResult.error,
          });
        } else {
          // Invalidar queries de inventario para refrescar los datos
          queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
          queryClient.invalidateQueries({ queryKey: ['admin-inventory-movements'] });
          toast.success('Batch creado e ingredientes descontados del inventario');
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-production-batches'] });
    },
    onError: (error: Error) => {
      toast.error('Error al crear el batch', {
        description: error.message,
      });
    },
  });
};

export const useUpdateProductionBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProductionBatchData & { created_by?: string }): Promise<ProductionBatch> => {
      // Primero obtener el batch actual para verificar si está cambiando a 'completado'
      const { data: currentBatch, error: fetchError } = await supabase
        .from('production_batches')
        .select('*, product:products(id)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Actualizar el batch
      const { data, error } = await supabase
        .from('production_batches')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          product:products(id, name, sku)
        `)
        .single();

      if (error) throw error;

      // Si el estado cambió a 'completado' (y no estaba completado antes), validar y descontar ingredientes del inventario
      if (
        updateData.status === 'completado' && 
        currentBatch?.status !== 'completado' &&
        currentBatch?.product_id && 
        data?.quantity
      ) {
        // Validar stock antes de actualizar
        const stockValidation = await validateStockAvailability(
          currentBatch.product_id,
          data.quantity
        );

        if (!stockValidation.valid) {
          // Revertir la actualización del batch
          await supabase
            .from('production_batches')
            .update({ status: currentBatch.status })
            .eq('id', id);

          if (stockValidation.missingItems && stockValidation.missingItems.length > 0) {
            const missingList = stockValidation.missingItems
              .map(item => `• ${item.name}: se requieren ${item.required.toFixed(2)} ${item.unit}, disponible ${item.available.toFixed(2)} ${item.unit}`)
              .join('\n');
            throw new Error(`Stock insuficiente para completar la producción:\n${missingList}`);
          }
          throw new Error(stockValidation.error || 'No hay suficiente stock disponible');
        }

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        const deductionResult = await deductInventoryIngredients(
          currentBatch.product_id,
          data.quantity,
          id,
          data.batch_number,
          userId
        );

        if (!deductionResult.success) {
          console.error('Error deducting inventory:', deductionResult.error);
          toast.warning('El batch se actualizó, pero hubo un error al descontar ingredientes del inventario', {
            description: deductionResult.error,
          });
        } else {
          // Invalidar queries de inventario para refrescar los datos
          queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
          queryClient.invalidateQueries({ queryKey: ['admin-inventory-movements'] });
          toast.success('Ingredientes descontados del inventario');
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-production-batches'] });
      toast.success('Batch de producción actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el batch', {
        description: error.message,
      });
    },
  });
};

export const useDeleteProductionBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('production_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-production-batches'] });
      toast.success('Batch de producción eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el batch', {
        description: error.message,
      });
    },
  });
};

