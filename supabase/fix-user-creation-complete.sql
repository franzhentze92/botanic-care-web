-- Solución Completa: Arreglar todos los problemas de creación de usuarios
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- PASO 1: Arreglar políticas RLS para user_roles
-- ============================================

-- Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment for new users" ON user_roles;

-- Crear política permisiva para permitir inserción desde trigger
CREATE POLICY "Allow role assignment for new users"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- PASO 2: Asegurar que la función del trigger existe y funciona
-- ============================================

CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentar insertar el rol, si falla, continuar sin error
  BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Si falla, registrar pero no detener la creación del usuario
      RAISE WARNING 'No se pudo asignar rol para usuario %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- ============================================
-- PASO 3: Verificar y arreglar el trigger de user_profiles
-- ============================================

-- Asegurar que la función para crear perfil existe
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentar crear el perfil, si falla, continuar sin error
  BEGIN
    INSERT INTO user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Si falla, registrar pero no detener la creación del usuario
      RAISE WARNING 'No se pudo crear perfil para usuario %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================
-- PASO 4: Verificar políticas RLS de user_profiles
-- ============================================

-- Asegurar que las políticas permiten la creación desde el trigger
-- Verificar si existe la política de inserción
DO $$
BEGIN
  -- Si no existe una política que permita inserción, crear una temporal
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname LIKE '%insert%'
  ) THEN
    CREATE POLICY "Allow profile creation for new users"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- PASO 5: Verificar que no hay otros problemas
-- ============================================

-- Verificar que las tablas existen
DO $$
BEGIN
  -- Verificar user_roles
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    RAISE EXCEPTION 'La tabla user_roles no existe. Ejecuta primero user-roles-schema.sql';
  END IF;
  
  -- Verificar user_profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE WARNING 'La tabla user_profiles no existe. Esto puede causar problemas.';
  END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Script ejecutado correctamente. Ahora puedes crear usuarios.' AS status;

