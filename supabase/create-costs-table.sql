-- Script para crear la tabla de costos en el panel de admin
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Costos
CREATE TABLE IF NOT EXISTS costs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL CHECK (category IN ('sueldo', 'redes_sociales', 'impuestos', 'marketing', 'servicios', 'alquiler', 'otros')),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('one_time', 'monthly', 'quarterly', 'yearly')),
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  next_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(date DESC);
CREATE INDEX IF NOT EXISTS idx_costs_category ON costs(category);
CREATE INDEX IF NOT EXISTS idx_costs_frequency ON costs(frequency);
CREATE INDEX IF NOT EXISTS idx_costs_is_recurring ON costs(is_recurring);

-- Habilitar Row Level Security (RLS)
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo los administradores pueden ver y gestionar costos
-- Política para SELECT (leer)
DROP POLICY IF EXISTS "Admins can view all costs" ON costs;
CREATE POLICY "Admins can view all costs"
  ON costs FOR SELECT
  TO authenticated
  USING (is_admin() = true);

-- Política para INSERT (crear)
DROP POLICY IF EXISTS "Admins can create costs" ON costs;
CREATE POLICY "Admins can create costs"
  ON costs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

-- Política para UPDATE (actualizar)
DROP POLICY IF EXISTS "Admins can update costs" ON costs;
CREATE POLICY "Admins can update costs"
  ON costs FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- Política para DELETE (eliminar)
DROP POLICY IF EXISTS "Admins can delete costs" ON costs;
CREATE POLICY "Admins can delete costs"
  ON costs FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_costs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_costs_updated_at ON costs;
CREATE TRIGGER update_costs_updated_at
  BEFORE UPDATE ON costs
  FOR EACH ROW
  EXECUTE FUNCTION update_costs_updated_at_column();

