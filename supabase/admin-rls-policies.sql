-- RLS Policies for Admin Operations
-- ⚠️ IMPORTANTE: Este archivo ya NO es necesario si ejecutaste user-roles-schema.sql
-- El archivo user-roles-schema.sql ya incluye todas las políticas RLS necesarias
-- 
-- Solo ejecuta este archivo si:
-- 1. Ya ejecutaste user-roles-schema.sql pero necesitas actualizar las políticas
-- 2. O si quieres políticas más permisivas (no recomendado)

-- Actualizar políticas RLS para productos (requiere rol admin)
-- Estas políticas reemplazan las políticas anteriores que permitían a cualquier usuario autenticado

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- Policy: Solo admins pueden insertar productos
CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Solo admins pueden actualizar productos
CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Solo admins pueden eliminar productos
CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

