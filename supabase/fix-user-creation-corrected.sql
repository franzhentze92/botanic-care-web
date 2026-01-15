-- Solución Corregida: Permitir que el trigger asigne roles
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar la política restrictiva que bloquea la inserción desde el trigger
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;

-- Crear una política que permite la inserción cuando:
-- 1. El usuario no tiene rol aún (nuevo usuario)
-- 2. O cuando el usuario actual es admin
-- Nota: En RLS, no podemos usar NEW directamente, así que usamos una función helper

-- Primero, crear una función helper que verifique si el usuario es nuevo
CREATE OR REPLACE FUNCTION is_new_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política que permite inserción para nuevos usuarios o por admins
CREATE POLICY "Allow role assignment"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si es un nuevo usuario (sin rol previo)
    is_new_user(NEW.user_id)
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

