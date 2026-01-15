-- Script para deshabilitar RLS temporalmente (SOLO PARA DEBUGGING)
-- Ejecuta este script en el SQL Editor de Supabase
-- IMPORTANTE: Esto permite acceso a todos los usuarios autenticados
-- Úsalo solo para verificar que el problema es RLS, luego vuelve a habilitarlo

-- Deshabilitar RLS temporalmente
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'app_settings';

-- Probar acceso
SELECT COUNT(*) as total_settings FROM app_settings;

-- NOTA: Una vez que verifiques que funciona, ejecuta el siguiente comando para volver a habilitar RLS:
-- ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

