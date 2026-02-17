-- Script para crear las tablas de gestión de inventario
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Items de Inventario (productos internos/ingredientes/materias primas)
CREATE TABLE IF NOT EXISTS inventory_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL, -- Código SKU único
  category TEXT, -- Categoría (ej: Ingrediente, Empaque, Material, etc.)
  unit TEXT NOT NULL DEFAULT 'unidad' CHECK (unit IN ('unidad', 'kg', 'g', 'L', 'mL', 'm', 'cm', 'caja', 'bolsa')),
  description TEXT, -- Descripción del item
  min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0), -- Stock mínimo (punto de reorden)
  current_stock DECIMAL(10, 2) DEFAULT 0 CHECK (current_stock >= 0), -- Stock actual
  cost_per_unit DECIMAL(10, 2) DEFAULT 0 CHECK (cost_per_unit >= 0), -- Costo por unidad
  supplier TEXT, -- Proveedor
  location TEXT, -- Ubicación en almacén
  expiry_tracking BOOLEAN DEFAULT false, -- Si se rastrea fecha de caducidad
  notes TEXT, -- Notas adicionales
  active BOOLEAN DEFAULT true, -- Si el item está activo
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste', 'produccion', 'venta', 'perdida')),
  quantity DECIMAL(10, 2) NOT NULL, -- Cantidad positiva
  unit_cost DECIMAL(10, 2), -- Costo unitario al momento del movimiento
  reference_type TEXT, -- Tipo de referencia (production_batch, order, adjustment, etc.)
  reference_id BIGINT, -- ID de la referencia (puede ser de diferentes tablas)
  batch_id BIGINT REFERENCES production_batches(id) ON DELETE SET NULL, -- Relación con batch de producción
  notes TEXT, -- Notas sobre el movimiento
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Fecha del movimiento
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(active);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_batch_id ON inventory_movements(batch_id);

-- Función para actualizar el stock actual basado en movimientos
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el stock actual del item de inventario
  UPDATE inventory_items
  SET 
    current_stock = (
      SELECT COALESCE(SUM(
        CASE 
          WHEN movement_type IN ('entrada', 'ajuste') THEN quantity
          WHEN movement_type IN ('salida', 'produccion', 'venta', 'perdida') THEN -quantity
          ELSE 0
        END
      ), 0)
      FROM inventory_movements
      WHERE inventory_item_id = NEW.inventory_item_id
    ),
    updated_at = NOW()
  WHERE id = NEW.inventory_item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock cuando se crea un movimiento
DROP TRIGGER IF EXISTS trigger_update_inventory_stock ON inventory_movements;
CREATE TRIGGER trigger_update_inventory_stock
  AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock();

-- Habilitar Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para inventory_items
DROP POLICY IF EXISTS "Admins can view all inventory items" ON inventory_items;
CREATE POLICY "Admins can view all inventory items"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can create inventory items" ON inventory_items;
CREATE POLICY "Admins can create inventory items"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update inventory items" ON inventory_items;
CREATE POLICY "Admins can update inventory items"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete inventory items" ON inventory_items;
CREATE POLICY "Admins can delete inventory items"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Políticas RLS para inventory_movements
DROP POLICY IF EXISTS "Admins can view all inventory movements" ON inventory_movements;
CREATE POLICY "Admins can view all inventory movements"
  ON inventory_movements FOR SELECT
  TO authenticated
  USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can create inventory movements" ON inventory_movements;
CREATE POLICY "Admins can create inventory movements"
  ON inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update inventory movements" ON inventory_movements;
CREATE POLICY "Admins can update inventory movements"
  ON inventory_movements FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete inventory movements" ON inventory_movements;
CREATE POLICY "Admins can delete inventory movements"
  ON inventory_movements FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_inventory_items_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_items_updated_at_column();

-- Tabla de relación entre productos y items de inventario (para saber qué ingredientes usa un producto)
CREATE TABLE IF NOT EXISTS product_inventory_items (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_per_unit DECIMAL(10, 4) NOT NULL CHECK (quantity_per_unit > 0), -- Cantidad de ingrediente por unidad de producto
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, inventory_item_id)
);

CREATE INDEX IF NOT EXISTS idx_product_inventory_items_product_id ON product_inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_items_inventory_item_id ON product_inventory_items(inventory_item_id);

-- Habilitar RLS para product_inventory_items
ALTER TABLE product_inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage product inventory items" ON product_inventory_items;
CREATE POLICY "Admins can manage product inventory items"
  ON product_inventory_items FOR ALL
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

