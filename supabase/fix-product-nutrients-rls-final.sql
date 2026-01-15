-- Script para corregir las políticas RLS de product_nutrients
-- Ejecuta este script en el SQL Editor de Supabase
-- Esto permitirá a usuarios autenticados crear/editar/eliminar relaciones de nutrientes en productos

-- Eliminar todas las políticas existentes de product_nutrients
DROP POLICY IF EXISTS "Allow public read access to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated insert to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated update to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated delete to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to insert product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to update product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to delete product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow authenticated users to manage product_nutrients" ON product_nutrients;

-- Política de lectura pública (mantener la existente si funciona)
CREATE POLICY "Allow public read access to product_nutrients"
  ON product_nutrients
  FOR SELECT
  TO public
  USING (true);

-- Política para inserción (usuarios autenticados)
CREATE POLICY "Allow authenticated insert to product_nutrients"
  ON product_nutrients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualización (usuarios autenticados)
CREATE POLICY "Allow authenticated update to product_nutrients"
  ON product_nutrients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para eliminación (usuarios autenticados)
CREATE POLICY "Allow authenticated delete to product_nutrients"
  ON product_nutrients
  FOR DELETE
  TO authenticated
  USING (true);

