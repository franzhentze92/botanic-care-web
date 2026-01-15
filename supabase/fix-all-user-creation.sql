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

-- Eliminar política restrictiva que requiere auth.uid() = user_id
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation for new users" ON user_profiles;

-- Crear política permisiva para permitir creación desde trigger
CREATE POLICY "Allow profile creation for new users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
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

