-- Script SIMPLE para crear app_settings
-- Ejecuta este script completo en el SQL Editor de Supabase

-- Crear la tabla solo si no existe
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON public.app_settings(category);

-- Otorgar permisos
GRANT ALL ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.app_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.app_settings_id_seq TO anon;

-- Deshabilitar RLS
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- Verificar que se creó
SELECT 'Tabla creada exitosamente' as status, COUNT(*) as total_registros 
FROM public.app_settings;

