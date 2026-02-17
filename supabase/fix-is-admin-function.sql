-- Script para corregir la función is_admin
-- Ejecuta este script en el SQL Editor de Supabase

-- Función is_admin que funciona sin user_roles
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si existe la tabla user_roles antes de usarla
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    -- Si existe user_roles, verificar ahí
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
      -- Si no puede acceder a auth.users, retornar false
      RETURN false;
  END;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que la función funciona
SELECT 
  auth.uid() as current_user_id,
  is_admin() as is_admin_check;

-- Ahora ejecuta fix-settings-access.sql de nuevo para crear las políticas correctas

