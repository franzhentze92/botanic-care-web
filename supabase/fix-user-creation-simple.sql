-- Solución Simple: Permitir que el trigger asigne roles
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar la política restrictiva que bloquea la inserción desde el trigger
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;

-- Crear una nueva política que permite:
-- 1. Que el trigger asigne roles automáticamente (cuando no existe rol para el usuario)
-- 2. Que los admins puedan asignar roles manualmente
CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si es un nuevo usuario sin rol (trigger automático)
    NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = NEW.user_id
    )
    OR
    -- O si el usuario actual es admin
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar que la función del trigger existe y está correcta
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

