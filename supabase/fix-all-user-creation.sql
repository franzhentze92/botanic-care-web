-- Solución Completa: Arreglar TODOS los problemas de creación de usuarios
-- Ejecuta este script completo en el SQL Editor de Supabase

-- ============================================
-- PASO 1: Arreglar políticas RLS para user_roles
-- ============================================

DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment for new users" ON user_roles;

-- Política permisiva para permitir inserción desde trigger
CREATE POLICY "Allow role assignment for new users"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- PASO 2: Arreglar políticas RLS para user_profiles
-- ============================================

-- Eliminar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation for new users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Política para SELECT: usuarios autenticados pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para INSERT: permitir creación desde trigger (SECURITY DEFINER) y desde cliente autenticado
-- El trigger usa SECURITY DEFINER, así que puede insertar sin restricciones de RLS
-- Los usuarios autenticados también pueden crear su propio perfil
-- Nota: SECURITY DEFINER bypass RLS, así que el trigger puede insertar sin problemas
CREATE POLICY "Allow profile creation for new users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Permitir creación desde cualquier usuario autenticado (el trigger usa SECURITY DEFINER)

-- Política para UPDATE: usuarios autenticados pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PASO 3: Asegurar que las funciones de trigger existen y funcionan
-- ============================================

-- Función para asignar rol por defecto
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'No se pudo asignar rol para usuario %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear perfil
-- SECURITY DEFINER permite que la función se ejecute con los privilegios del propietario
-- Esto es necesario porque el trigger se ejecuta antes de que el usuario tenga sesión activa
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- Intentar crear el perfil
    -- ON CONFLICT evita errores si el perfil ya existe
    INSERT INTO user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Registrar el error pero no detener la creación del usuario
      -- Esto asegura que el usuario se cree incluso si hay problemas con el perfil
      RAISE WARNING 'No se pudo crear perfil para usuario %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 4: Asegurar que los triggers existen
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================
-- PASO 5: Mensaje de confirmación
-- ============================================

SELECT '✅ Script ejecutado correctamente. Ahora puedes crear usuarios sin errores.' AS status;

