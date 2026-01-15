-- Script SIMPLIFICADO para corregir las políticas RLS de product_nutrients
-- Si el script anterior no funciona, ejecuta este como alternativa
-- Ejecuta este script en el SQL Editor de Supabase

-- OPCIÓN 1: Deshabilitar RLS temporalmente (solo para debugging)
-- ALTER TABLE product_nutrients DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Políticas más permisivas (permite a todos los usuarios autenticados)
-- Si la opción 1 funciona, entonces el problema es con is_admin()
-- Usa esta opción SOLO si estás seguro de que solo usuarios autenticados pueden acceder

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Allow public read access to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to insert product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to update product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to delete product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated users to manage product_nutrients" ON product_nutrients;

-- Política de lectura pública
CREATE POLICY "Allow public read access to product_nutrients"
  ON product_nutrients FOR SELECT
  USING (true);

-- Política para que usuarios autenticados puedan insertar/actualizar/eliminar
-- NOTA: Esto es menos seguro, pero útil para debugging
-- Cambia esto después de verificar que funciona
CREATE POLICY "Allow authenticated users to manage product_nutrients"
  ON product_nutrients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

