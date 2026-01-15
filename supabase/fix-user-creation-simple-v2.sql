-- Solución Simple V2: Permitir inserción desde trigger usando service_role
-- Esta es la solución más directa y segura

-- Eliminar la política restrictiva
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;

-- Crear una política más permisiva que permite:
-- 1. Inserción cuando el usuario no tiene rol (nuevo usuario)
-- 2. Inserción por admins
-- Usamos una subconsulta para verificar si el usuario es nuevo
CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si el usuario para el que se está insertando no tiene rol aún
    (SELECT COUNT(*) FROM user_roles WHERE user_id = NEW.user_id) = 0
    OR
    -- O si el usuario actual es admin
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

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

