-- Script Completo: Crear todas las tablas de usuarios y verificar datos
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- PASO 1: Crear tabla user_roles
-- ============================================

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_roles
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read all roles" ON user_roles;
CREATE POLICY "Users can read all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow role assignment for new users" ON user_roles;
CREATE POLICY "Allow role assignment for new users"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update roles" ON user_roles;
CREATE POLICY "Only admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- PASO 2: Crear tabla user_profiles
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email_notifications BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow profile creation for new users" ON user_profiles;
CREATE POLICY "Allow profile creation for new users"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- PASO 3: Crear funciones de trigger
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
-- PASO 4: Crear triggers
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
-- PASO 5: Asignar roles y perfiles a usuarios existentes
-- ============================================

-- Asignar rol 'cliente' a usuarios que no tienen rol
INSERT INTO user_roles (user_id, role)
SELECT id, 'cliente'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Crear perfiles para usuarios que no tienen perfil
INSERT INTO user_profiles (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- PASO 6: Reporte de verificación
-- ============================================

-- Mostrar resumen
SELECT 
  '📊 RESUMEN DE USUARIOS' AS titulo,
  (SELECT COUNT(*) FROM auth.users) AS total_usuarios_auth,
  (SELECT COUNT(*) FROM user_roles) AS total_roles_asignados,
  (SELECT COUNT(*) FROM user_profiles) AS total_perfiles_creados;

-- Mostrar usuarios y su estado
SELECT 
  au.id,
  au.email,
  au.created_at::date AS fecha_registro,
  COALESCE(ur.role, '❌ Sin rol') AS rol,
  CASE 
    WHEN up.id IS NOT NULL THEN '✅ Con perfil'
    ELSE '❌ Sin perfil'
  END AS estado_perfil
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

