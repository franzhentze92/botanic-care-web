-- Script para verificar y crear la tabla app_settings si no existe
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, verificar si la tabla existe
DO $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'app_settings'
  ) THEN
    -- Crear la tabla si no existe
    CREATE TABLE app_settings (
      id BIGSERIAL PRIMARY KEY,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value JSONB,
      setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
      category TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Crear índices
    CREATE INDEX idx_app_settings_key ON app_settings(setting_key);
    CREATE INDEX idx_app_settings_category ON app_settings(category);

    RAISE NOTICE 'Tabla app_settings creada exitosamente';
  ELSE
    RAISE NOTICE 'La tabla app_settings ya existe';
  END IF;
END $$;

-- Verificar que la tabla existe y mostrar su estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'app_settings'
ORDER BY ordinal_position;

