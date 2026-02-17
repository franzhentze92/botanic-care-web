import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ==================== TYPES ====================

export interface FinishedProductStock {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image_url: string | null;
  total_stock: number;
  in_production: number;
  completed: number;
  in_warehouse: number;
  sold_out: number;
  batches_count: number;
  last_production_date: string | null;
  oldest_batch_date: string | null;
}

// ==================== HOOKS ====================

// Obtener stock de productos terminados
export const useFinishedProductsStock = (filters?: {
  productId?: number;
  searchQuery?: string;
  minStock?: number;
}) => {
  return useQuery<FinishedProductStock[], Error>({
    queryKey: ['finished-products-stock', filters],
    queryFn: async () => {
      // Obtener todos los batches con sus productos
      let batchesQuery = supabase
        .from('production_batches')
        .select(`
          id,
          product_id,
          quantity,
          status,
          production_date,
          product:products(id, name, sku, image_url)
        `)
        .not('product_id', 'is', null)
        .order('production_date', { ascending: false });

      if (filters?.productId) {
        batchesQuery = batchesQuery.eq('product_id', filters.productId);
      }

      const { data: batches, error } = await batchesQuery;

      if (error) throw error;

      // Calcular stock por producto
      const stockMap = new Map<number, FinishedProductStock>();

      (batches || []).forEach((batch: any) => {
        if (!batch.product_id || !batch.product) return;

        const productId = batch.product_id;
        
        if (!stockMap.has(productId)) {
          stockMap.set(productId, {
            product_id: productId,
            product_name: batch.product.name,
            product_sku: batch.product.sku,
            product_image_url: batch.product.image_url,
            total_stock: 0,
            in_production: 0,
            completed: 0,
            in_warehouse: 0,
            sold_out: 0,
            batches_count: 0,
            last_production_date: null,
            oldest_batch_date: null,
          });
        }

        const stock = stockMap.get(productId)!;
        stock.batches_count += 1;

        // Actualizar fechas
        if (!stock.last_production_date || batch.production_date > stock.last_production_date) {
          stock.last_production_date = batch.production_date;
        }
        if (!stock.oldest_batch_date || batch.production_date < stock.oldest_batch_date) {
          stock.oldest_batch_date = batch.production_date;
        }

        // Sumar cantidades según estado
        // Nota: batch.quantity puede ser menor que la cantidad original si se han vendido productos
        switch (batch.status) {
          case 'en_produccion':
            stock.in_production += batch.quantity;
            break;
          case 'completado':
            stock.completed += batch.quantity;
            // Solo contar como stock disponible si la cantidad es mayor a 0
            if (batch.quantity > 0) {
              stock.total_stock += batch.quantity;
            }
            break;
          case 'en_almacen':
            stock.in_warehouse += batch.quantity;
            // Solo contar como stock disponible si la cantidad es mayor a 0
            if (batch.quantity > 0) {
              stock.total_stock += batch.quantity;
            }
            break;
          case 'agotado':
            // Los agotados pueden tener cantidad 0 o aún tener cantidad si se marcaron manualmente como agotados
            stock.sold_out += batch.quantity;
            break;
          case 'cancelado':
            // Los cancelados no cuentan para el stock
            break;
        }
      });

      let stockArray = Array.from(stockMap.values());

      // Aplicar filtro de búsqueda
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        stockArray = stockArray.filter(s =>
          s.product_name.toLowerCase().includes(query) ||
          s.product_sku.toLowerCase().includes(query)
        );
      }

      // Aplicar filtro de stock mínimo
      if (filters?.minStock !== undefined) {
        stockArray = stockArray.filter(s => s.total_stock >= filters.minStock!);
      }

      // Ordenar por stock total descendente
      stockArray.sort((a, b) => b.total_stock - a.total_stock);

      return stockArray;
    },
  });
};

