-- Script para refrescar el schema cache de Supabase PostgREST
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar que la tabla existe y está en el schema público
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'app_settings';

-- Verificar los permisos de la tabla
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'app_settings';

-- Asegurar que la tabla es accesible públicamente (necesario para PostgREST)
GRANT ALL ON app_settings TO authenticated;
GRANT ALL ON app_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE app_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE app_settings_id_seq TO anon;

-- Verificar la estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'app_settings'
ORDER BY ordinal_position;

-- NOTA: Después de ejecutar este script, puede tomar 1-2 minutos para que
-- PostgREST actualice su schema cache. Si no funciona inmediatamente:
-- 1. Espera 1-2 minutos
-- 2. Recarga la página completamente (Ctrl+F5 o Cmd+Shift+R)
-- 3. O reinicia el proyecto de Supabase desde el dashboard

