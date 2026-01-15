-- Script para corregir las políticas RLS de la tabla distributors
-- Ejecuta este script en el SQL Editor de Supabase para corregir el error 403

-- Paso 1: Asegurar que existe la función is_admin (si no existe, crearla)
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

-- Paso 2: Eliminar todas las políticas existentes de distributors
DROP POLICY IF EXISTS "Admins can view all distributors" ON distributors;
DROP POLICY IF EXISTS "Admins can create distributors" ON distributors;
DROP POLICY IF EXISTS "Admins can update distributors" ON distributors;
DROP POLICY IF EXISTS "Admins can delete distributors" ON distributors;

-- Paso 3: Crear nuevas políticas usando la función is_admin()
CREATE POLICY "Admins can view all distributors"
  ON distributors FOR SELECT
  TO authenticated
  USING (is_admin() = true);

CREATE POLICY "Admins can create distributors"
  ON distributors FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

CREATE POLICY "Admins can update distributors"
  ON distributors FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

CREATE POLICY "Admins can delete distributors"
  ON distributors FOR DELETE
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
WHERE tablename = 'distributors';

