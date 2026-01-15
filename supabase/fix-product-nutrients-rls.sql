-- Script para corregir las políticas RLS de product_nutrients
-- Ejecuta este script en el SQL Editor de Supabase
-- Esto permitirá a los admins crear/editar/eliminar relaciones de nutrientes en productos

-- Asegurar que la función is_admin existe
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
  
  -- Si no existe user_roles, verifica por email
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

-- Eliminar políticas existentes si existen (solo las de escritura, mantener la de lectura)
DROP POLICY IF EXISTS "Allow admins to insert product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to update product_nutrients" ON product_nutrients;
DROP POLICY IF EXISTS "Allow admins to delete product_nutrients" ON product_nutrients;

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

