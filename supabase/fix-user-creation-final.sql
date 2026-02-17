-- Solución Final: Permitir inserción desde trigger
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar la política restrictiva que bloquea la inserción desde el trigger
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;

-- La mejor solución: Permitir inserción cuando el usuario no tiene rol
-- Como el trigger usa SECURITY DEFINER, podemos crear una política más permisiva
-- que permita la inserción para nuevos usuarios

-- Política que permite inserción para nuevos usuarios o por admins
CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si el usuario para el que se está insertando no tiene rol aún
    -- Usamos una subconsulta para verificar esto
    NOT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = NEW.user_id
    )
    OR
    -- O si el usuario actual es admin
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Asegurar que la función del trigger existe y usa SECURITY DEFINER
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

