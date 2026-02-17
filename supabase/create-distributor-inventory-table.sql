-- Script para crear la tabla de movimientos de inventario de distribuidores
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Movimientos de Inventario de Distribuidores
CREATE TABLE IF NOT EXISTS distributor_inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  distributor_id BIGINT NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('envio', 'devolucion')),
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  notes TEXT,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_distributor_inventory_movements_distributor_id ON distributor_inventory_movements(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_inventory_movements_product_id ON distributor_inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_distributor_inventory_movements_movement_type ON distributor_inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_distributor_inventory_movements_movement_date ON distributor_inventory_movements(movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_distributor_inventory_movements_created_at ON distributor_inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_distributor_inventory_movements_distributor_product ON distributor_inventory_movements(distributor_id, product_id);

-- Función para actualizar updated_at automáticamente (si es necesario en el futuro)
-- Por ahora no hay updated_at, pero podemos agregarlo si se necesita

-- Habilitar Row Level Security (RLS)
ALTER TABLE distributor_inventory_movements ENABLE ROW LEVEL SECURITY;

-- Asegurar que existe la función is_admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Primero intenta verificar con user_roles (método recomendado)
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = user_uuid AND role = 'admin'
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Verificar por email (método alternativo)
  BEGIN
    IF EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = user_uuid AND email = 'admin@botaniccare.com'
    ) THEN
      RETURN true;
    END IF;
  EXCEPTION
    WHEN others THEN
      RETURN false;
  END;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS: Solo los administradores pueden ver y gestionar movimientos
DROP POLICY IF EXISTS "Admins can view all distributor inventory movements" ON distributor_inventory_movements;
CREATE POLICY "Admins can view all distributor inventory movements"
  ON distributor_inventory_movements FOR SELECT
  TO authenticated
  USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can create distributor inventory movements" ON distributor_inventory_movements;
CREATE POLICY "Admins can create distributor inventory movements"
  ON distributor_inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete distributor inventory movements" ON distributor_inventory_movements;
CREATE POLICY "Admins can delete distributor inventory movements"
  ON distributor_inventory_movements FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'distributor_inventory_movements';

