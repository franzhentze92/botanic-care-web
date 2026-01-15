-- Script para corregir las políticas RLS de product_nutrients (Versión 2)
-- Ejecuta este script en el SQL Editor de Supabase
-- Esto permitirá a los admins crear/editar/eliminar relaciones de nutrientes en productos

-- Primero, verificar/crear la función is_admin si no existe
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si existe la tabla user_roles antes de usarla
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    -- Si existe user_roles, verificar ahí
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
      -- Si no puede acceder a auth.users, retornar false
      RETURN false;
  END;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar TODAS las políticas existentes de product_nutrients
DROP POLICY IF EXISTS "Allow public read access to product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to insert product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to update product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to delete product_nutrients" ON product_nutrients;

-- Recrear la política de lectura pública
CREATE POLICY "Allow public read access to product_nutrients"
  ON product_nutrients FOR SELECT
  USING (true);

-- Política para inserción (solo admins)
CREATE POLICY "Allow admins to insert product_nutrients"
  ON product_nutrients FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

-- Política para actualización (solo admins)
CREATE POLICY "Allow admins to update product_nutrients"
  ON product_nutrients FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- Política para eliminación (solo admins)
CREATE POLICY "Allow admins to delete product_nutrients"
  ON product_nutrients FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_nutrients'
ORDER BY policyname;

