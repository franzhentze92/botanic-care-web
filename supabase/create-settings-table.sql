-- Script para crear la tabla de configuración/settings
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- FUNCIÓN AUXILIAR PARA VERIFICAR ADMIN
-- ============================================

-- Función para verificar si un usuario es admin
-- Usa SECURITY DEFINER para tener permisos de lectura en auth.users
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
  
  -- Si no existe user_roles, verifica por email (solo si la tabla existe)
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

-- ============================================
-- TABLA DE SETTINGS
-- ============================================

-- Tabla de Settings/Configuración
CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL, -- Clave única del setting (ej: 'general.storeName')
  setting_value JSONB, -- Valor del setting (permite diferentes tipos de datos)
  setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
  category TEXT NOT NULL, -- Categoría del setting (general, orders, security)
  description TEXT, -- Descripción del setting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- Habilitar Row Level Security (RLS)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- Políticas RLS: Solo admins pueden gestionar settings
DROP POLICY IF EXISTS "Admins can view all settings" ON app_settings;
CREATE POLICY "Admins can view all settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can create settings" ON app_settings;
CREATE POLICY "Admins can create settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update settings" ON app_settings;
CREATE POLICY "Admins can update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete settings" ON app_settings;
CREATE POLICY "Admins can delete settings"
  ON app_settings FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_app_settings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at_column();

-- Función helper para obtener un setting
CREATE OR REPLACE FUNCTION get_setting(setting_key_param TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT setting_value INTO result
  FROM app_settings
  WHERE setting_key = setting_key_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función helper para establecer un setting
CREATE OR REPLACE FUNCTION set_setting(setting_key_param TEXT, setting_value_param JSONB, setting_category TEXT, setting_type_param TEXT DEFAULT 'string')
RETURNS VOID AS $$
BEGIN
  INSERT INTO app_settings (setting_key, setting_value, category, setting_type)
  VALUES (setting_key_param, setting_value_param, setting_category, setting_type_param)
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = setting_value_param,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

