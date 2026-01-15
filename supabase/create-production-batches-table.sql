-- Script para crear la tabla de batches de producción
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Batches de Producción
CREATE TABLE IF NOT EXISTS production_batches (
  id BIGSERIAL PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL, -- Número de lote único
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL, -- Producto producido
  quantity INTEGER NOT NULL CHECK (quantity > 0), -- Cantidad producida
  production_date DATE NOT NULL, -- Fecha de producción
  expiry_date DATE, -- Fecha de caducidad/vencimiento
  status TEXT NOT NULL DEFAULT 'en_produccion' CHECK (status IN ('en_produccion', 'completado', 'cancelado', 'en_almacen', 'agotado')),
  location TEXT, -- Ubicación del lote (almacén, etc.)
  notes TEXT, -- Notas u observaciones
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin que creó el batch
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_production_batches_batch_number ON production_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_production_date ON production_batches(production_date);
CREATE INDEX IF NOT EXISTS idx_production_batches_expiry_date ON production_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_production_batches_created_by ON production_batches(created_by);

-- Función para generar número de lote automáticamente
CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS TEXT AS $$
DECLARE
  batch_num TEXT;
  counter INTEGER := 1;
BEGIN
  -- Formato: BATCH-YYYYMMDD-XXX
  batch_num := 'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
  
  -- Verificar si existe, incrementar contador si es necesario
  WHILE EXISTS (SELECT 1 FROM production_batches WHERE batch_number = batch_num) LOOP
    counter := counter + 1;
    batch_num := 'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
  END LOOP;
  
  RETURN batch_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de lote automáticamente
CREATE OR REPLACE FUNCTION set_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_number IS NULL OR NEW.batch_number = '' THEN
    NEW.batch_number := generate_batch_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_batch_number ON production_batches;
CREATE TRIGGER trigger_set_batch_number
  BEFORE INSERT ON production_batches
  FOR EACH ROW
  EXECUTE FUNCTION set_batch_number();

-- Habilitar Row Level Security (RLS)
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden gestionar batches
DROP POLICY IF EXISTS "Admins can view all production batches" ON production_batches;
CREATE POLICY "Admins can view all production batches"
  ON production_batches FOR SELECT
  TO authenticated
  USING (is_admin() = true);

-- Solo admins pueden crear batches
DROP POLICY IF EXISTS "Admins can create production batches" ON production_batches;
CREATE POLICY "Admins can create production batches"
  ON production_batches FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

-- Solo admins pueden actualizar batches
DROP POLICY IF EXISTS "Admins can update production batches" ON production_batches;
CREATE POLICY "Admins can update production batches"
  ON production_batches FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- Solo admins pueden eliminar batches
DROP POLICY IF EXISTS "Admins can delete production batches" ON production_batches;
CREATE POLICY "Admins can delete production batches"
  ON production_batches FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_production_batches_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_production_batches_updated_at ON production_batches;
CREATE TRIGGER update_production_batches_updated_at
  BEFORE UPDATE ON production_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_production_batches_updated_at_column();

