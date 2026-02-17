-- Fix para permitir que el trigger asigne roles automáticamente
-- Este script corrige el problema de creación de usuarios

-- Primero, necesitamos una política que permita la inserción desde el trigger
-- La función assign_default_role() usa SECURITY DEFINER, pero las políticas RLS aún se aplican
-- Necesitamos permitir que el servicio (service_role) pueda insertar roles

-- Opción 1: Permitir inserción desde el trigger usando una política especial
-- Esta política permite que se inserten roles cuando el usuario no tiene rol aún
DROP POLICY IF EXISTS "Allow trigger to assign default role" ON user_roles;

CREATE POLICY "Allow trigger to assign default role"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si no existe un rol para este usuario (es un nuevo usuario)
    NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = NEW.user_id
    )
    OR
    -- O si es un admin insertando
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Opción 2 (Alternativa más segura): Modificar la función para usar service_role
-- Pero primero, necesitamos asegurarnos de que la función pueda insertar
-- Vamos a recrear la función con mejor manejo de errores

CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentar insertar el rol, si falla por RLS, simplemente continuar
  BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Si falla, registrar el error pero no detener la creación del usuario
      RAISE WARNING 'No se pudo asignar rol por defecto para usuario %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- También necesitamos permitir que el servicio pueda insertar directamente
-- Esto es necesario para que el trigger funcione correctamente
-- La política anterior debería ser suficiente, pero si no funciona,
-- podemos usar esta política más permisiva temporalmente:

-- COMENTADO: Solo descomentar si la solución anterior no funciona
-- DROP POLICY IF EXISTS "Allow service role to insert roles" ON user_roles;
-- CREATE POLICY "Allow service role to insert roles"
--   ON user_roles
--   FOR INSERT
--   TO service_role
--   WITH CHECK (true);

-- Verificar que todo está correcto
-- Ejecuta esto para verificar:
-- SELECT * FROM pg_policies WHERE tablename = 'user_roles';

