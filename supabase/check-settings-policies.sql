-- Script para verificar las políticas RLS de app_settings
-- Ejecuta este script en el SQL Editor de Supabase

-- Ver todas las políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'app_settings'
ORDER BY policyname;

-- Verificar el usuario actual y si es admin
SELECT 
  auth.uid() as current_user_id,
  is_admin() as is_admin_check;

-- Probar acceso directo a la tabla
SELECT COUNT(*) as total_settings FROM app_settings;

-- Si la consulta anterior funciona, intenta insertar un registro de prueba
INSERT INTO app_settings (setting_key, setting_value, setting_type, category)
VALUES ('test.key', '"test value"', 'string', 'test')
ON CONFLICT (setting_key) DO NOTHING
RETURNING *;

-- Limpiar el registro de prueba
DELETE FROM app_settings WHERE setting_key = 'test.key';

