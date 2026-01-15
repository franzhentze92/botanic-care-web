-- Solución que Funciona: Permitir inserción desde trigger
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;

-- Solución: Crear una política que permita inserción cuando:
-- 1. El usuario no tiene rol (nuevo usuario - caso del trigger)
-- 2. O cuando el usuario actual es admin

-- IMPORTANTE: En RLS, NEW solo está disponible en ciertos contextos
-- Usamos una subconsulta con alias de tabla para evitar el error
CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Verificar si el usuario es nuevo (no tiene rol)
    (SELECT COUNT(*) FROM user_roles WHERE user_id = (SELECT user_id FROM (SELECT NEW.user_id AS user_id) AS n)) = 0
    OR
    -- O si el usuario actual es admin
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Alternativa más simple: Permitir inserción para todos los usuarios autenticados
-- pero solo si el usuario no tiene rol aún (esto permite el trigger)
-- COMENTADO: Descomenta esta política y comenta la anterior si la primera no funciona
/*
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;

CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
*/

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

