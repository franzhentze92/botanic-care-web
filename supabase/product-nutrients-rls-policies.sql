-- Políticas RLS para la tabla product_nutrients
-- Ejecuta este script en el SQL Editor de Supabase

-- Habilitar RLS en la tabla product_nutrients (si no está habilitado)
ALTER TABLE product_nutrients ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para poder recrearlas)
DROP POLICY IF EXISTS "Allow public read access to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated insert to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated update to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated delete to product_nutrients" ON product_nutrients;

-- Política: Permitir lectura pública de product_nutrients
CREATE POLICY "Allow public read access to product_nutrients"
ON product_nutrients
FOR SELECT
TO public
USING (true);

-- Política: Permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated insert to product_nutrients"
ON product_nutrients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Permitir actualización a usuarios autenticados
CREATE POLICY "Allow authenticated update to product_nutrients"
ON product_nutrients
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política: Permitir eliminación a usuarios autenticados
CREATE POLICY "Allow authenticated delete to product_nutrients"
ON product_nutrients
FOR DELETE
TO authenticated
USING (true);

