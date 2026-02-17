-- ============================================
-- ARREGLAR RLS PARA CUENTAS NUEVAS
-- Este script asegura que las cuentas nuevas puedan acceder a productos y categorías
-- ============================================

-- ============================================
-- 1. VERIFICAR Y ARREGLAR POLÍTICAS DE PRODUCTOS
-- ============================================

-- Eliminar TODAS las políticas existentes de products
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON products';
  END LOOP;
END $$;

-- Crear política SIMPLE que permita acceso público SIN restricciones
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Asegurar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. VERIFICAR Y ARREGLAR POLÍTICAS DE CATEGORÍAS
-- ============================================

-- Eliminar TODAS las políticas existentes de product_categories
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'product_categories') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON product_categories';
  END LOOP;
END $$;

-- Crear política SIMPLE que permita acceso público SIN restricciones
CREATE POLICY "Public can view all categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

-- Asegurar que RLS esté habilitado
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. VERIFICAR QUE NO HAY POLÍTICAS CONFLICTIVAS
-- ============================================

-- Mostrar todas las políticas de products
SELECT 
  'products' as tabla,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'products';

-- Mostrar todas las políticas de product_categories
SELECT 
  'product_categories' as tabla,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'product_categories';

-- ============================================
-- 4. VERIFICAR TRIGGERS DE USUARIOS NUEVOS
-- ============================================

-- Verificar que los triggers existen
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth'
  AND trigger_name IN ('on_auth_user_created', 'on_auth_user_created_profile');

-- Verificar que las funciones existen
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('assign_default_role', 'create_user_profile');

-- ============================================
-- 5. ASEGURAR QUE LOS USUARIOS NUEVOS TENGAN PERFIL Y ROL
-- ============================================

-- Crear perfiles para usuarios que no tienen perfil
INSERT INTO user_profiles (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Asignar rol 'cliente' a usuarios que no tienen rol
INSERT INTO user_roles (user_id, role)
SELECT id, 'cliente'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 6. MENSAJE DE CONFIRMACIÓN
-- ============================================

SELECT '✅ Script ejecutado. Las políticas RLS ahora permiten acceso público a productos y categorías.' AS status;
SELECT '✅ Verifica las tablas arriba. Deben mostrar "public" en roles y "SELECT" en cmd.' AS status;

