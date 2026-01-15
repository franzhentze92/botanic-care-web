-- Solución Más Simple: Permitir inserción temporalmente
-- Esta solución permite que el trigger funcione correctamente
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar la política restrictiva
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;

-- Solución temporal: Permitir que cualquier usuario autenticado inserte roles
-- Esto es necesario para que el trigger funcione
-- Una vez que tengas usuarios creados, puedes hacer la política más restrictiva
CREATE POLICY "Allow role assignment for new users"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Asegurar que la función del trigger existe
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'cliente')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- NOTA: Una vez que hayas creado el usuario admin, puedes hacer la política más restrictiva
-- ejecutando este SQL adicional (OPCIONAL):
/*
DROP POLICY IF EXISTS "Allow role assignment for new users" ON user_roles;

CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si el usuario no tiene rol (nuevo usuario)
    NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.user_id)
    OR
    -- O si el usuario actual es admin
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
*/

