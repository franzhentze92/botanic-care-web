-- Política RLS para permitir que los administradores lean todos los perfiles de usuario
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar si existe la función is_admin (debería existir del script anterior)
-- Si no existe, la creamos
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

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;

-- Crear política para que los admins puedan leer todos los perfiles
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    is_admin() = true
    OR
    auth.uid() = user_id  -- Los usuarios también pueden ver sus propios perfiles
  );

-- Verificar que la política funciona
-- SELECT * FROM user_profiles LIMIT 5;

