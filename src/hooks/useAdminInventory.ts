import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string | null;
  unit: 'unidad' | 'kg' | 'g' | 'L' | 'mL' | 'm' | 'cm' | 'caja' | 'bolsa';
  description: string | null;
  min_stock: number;
  current_stock: number;
  cost_per_unit: number;
  supplier: string | null;
  location: string | null;
  expiry_tracking: boolean;
  notes: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: number;
  inventory_item_id: number;
  movement_type: 'entrada' | 'salida' | 'ajuste' | 'produccion' | 'venta' | 'perdida';
  quantity: number;
  unit_cost: number | null;
  reference_type: string | null;
  reference_id: number | null;
  batch_id: number | null;
  notes: string | null;
  movement_date: string;
  created_by: string | null;
  created_at: string;
  // Datos relacionados
  inventory_item?: InventoryItem;
  batch?: {
    id: number;
    batch_number: string;
  };
}

export interface CreateInventoryItemData {
  name: string;
  sku: string;
  category?: string | null;
  unit?: InventoryItem['unit'];
  description?: string | null;
  min_stock?: number;
  cost_per_unit?: number;
  supplier?: string | null;
  location?: string | null;
  expiry_tracking?: boolean;
  notes?: string | null;
  active?: boolean;
}

export interface UpdateInventoryItemData extends Partial<CreateInventoryItemData> {
  id: number;
}

export interface CreateInventoryMovementData {
  inventory_item_id: number;
  movement_type: InventoryMovement['movement_type'];
  quantity: number;
  unit_cost?: number | null;
  reference_type?: string | null;
  reference_id?: number | null;
  batch_id?: number | null;
  notes?: string | null;
  movement_date?: string;
}

// ==================== HOOKS ====================

export const useAdminInventoryItems = (filters?: {
  category?: string;
  active?: boolean;
  lowStock?: boolean;
  searchQuery?: string;
}) => {
  return useQuery<InventoryItem[], Error>({
    queryKey: ['admin-inventory-items', filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      const { data: items, error } = await query;

      if (error) throw error;

      let filteredItems = items || [];

      // Filtrar por stock bajo
      if (filters?.lowStock) {
        filteredItems = filteredItems.filter(item => item.current_stock <= item.min_stock);
      }

      // Aplicar búsqueda
      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          (item.supplier && item.supplier.toLowerCase().includes(search))
        );
      }

      return filteredItems;
    },
  });
};

export const useAdminInventoryMovements = (filters?: {
  inventoryItemId?: number;
  movementType?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery<InventoryMovement[], Error>({
    queryKey: ['admin-inventory-movements', filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          inventory_item:inventory_items(*),
          batch:production_batches(id, batch_number)
        `)
        .order('movement_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.inventoryItemId) {
        query = query.eq('inventory_item_id', filters.inventoryItemId);
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

      const { data: movements, error } = await query;

      if (error) throw error;

      return (movements || []).map((movement: any) => ({
        ...movement,
        inventory_item: movement.inventory_item || undefined,
        batch: movement.batch || undefined,
      }));
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: CreateInventoryItemData & { created_by: string }): Promise<InventoryItem> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      toast.success('Item de inventario creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el item', {
        description: error.message,
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateInventoryItemData): Promise<InventoryItem> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-movements'] });
      toast.success('Item de inventario actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el item', {
        description: error.message,
      });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      toast.success('Item de inventario eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el item', {
        description: error.message,
      });
    },
  });
};

export const useCreateInventoryMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movementData: CreateInventoryMovementData & { created_by: string }): Promise<InventoryMovement> => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([movementData])
        .select(`
          *,
          inventory_item:inventory_items(*),
          batch:production_batches(id, batch_number)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-movements'] });
      toast.success('Movimiento de inventario registrado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al registrar el movimiento', {
        description: error.message,
      });
    },
  });
};

