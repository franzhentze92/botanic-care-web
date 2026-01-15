-- Script FINAL para crear app_settings correctamente
-- Ejecuta este script completo en el SQL Editor de Supabase

-- Paso 1: Verificar si la tabla existe en algún schema
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE tablename = 'app_settings';

-- Paso 2: Eliminar la tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- Paso 3: Crear la tabla en el schema público
CREATE TABLE public.app_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 4: Crear índices
CREATE INDEX idx_app_settings_key ON public.app_settings(setting_key);
CREATE INDEX idx_app_settings_category ON public.app_settings(category);

-- Paso 5: Otorgar permisos explícitamente
GRANT ALL ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO anon;
GRANT ALL ON public.app_settings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.app_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.app_settings_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.app_settings_id_seq TO service_role;

-- Paso 6: Deshabilitar RLS (temporalmente para que funcione)
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- Paso 7: Verificar que la tabla se creó correctamente
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'app_settings';

-- Paso 8: Verificar permisos
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'app_settings';

-- Paso 9: Probar inserción
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, category)
VALUES ('test.key', '"test value"', 'string', 'test')
ON CONFLICT (setting_key) DO NOTHING
RETURNING *;

-- Paso 10: Limpiar el test
DELETE FROM public.app_settings WHERE setting_key = 'test.key';

-- Paso 11: Verificar que puedes leer
SELECT COUNT(*) as total FROM public.app_settings;

