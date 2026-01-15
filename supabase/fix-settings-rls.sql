-- Script para corregir las políticas RLS de app_settings
-- Ejecuta este script en el SQL Editor de Supabase después de crear la tabla

-- Asegurar que la función is_admin existe
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Primero intenta verificar con user_roles (método recomendado)
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  ) THEN
    RETURN true;
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

-- Deshabilitar RLS temporalmente para verificar que la tabla funciona
-- (Solo para debugging - luego volver a habilitar)
-- ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- O mejor: Crear políticas más permisivas temporalmente para debugging
DROP POLICY IF EXISTS "Allow all authenticated users temporarily" ON app_settings;
CREATE POLICY "Allow all authenticated users temporarily"
  ON app_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verificar que las políticas están activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'app_settings';

