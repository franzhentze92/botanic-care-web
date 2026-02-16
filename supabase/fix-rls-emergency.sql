-- ============================================
-- SCRIPT DE EMERGENCIA - ARREGLAR PRODUCTOS Y CATEGORÍAS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- DESHABILITAR RLS TEMPORALMENTE PARA PRODUCTOS (SOLO PARA DEBUG)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- O MEJOR: Crear política que permita TODO a TODOS
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;

-- Crear política que permita lectura pública SIN restricciones
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Asegurar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORÍAS
-- ============================================

-- Eliminar TODAS las políticas existentes de categorías
DROP POLICY IF EXISTS "Public can view all categories" ON product_categories;
DROP POLICY IF EXISTS "Public can view active categories" ON product_categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON product_categories;
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON product_categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON product_categories;

-- Crear política que permita lectura pública SIN restricciones
CREATE POLICY "Public can view all categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

-- Asegurar que RLS esté habilitado
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- ============================================
-- VERIFICAR QUE NO HAY OTRAS POLÍTICAS BLOQUEANDO
-- ============================================

-- Verificar todas las políticas de products
SELECT 
  'products' as tabla,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'products';

-- Verificar todas las políticas de product_categories
SELECT 
  'product_categories' as tabla,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'product_categories';

-- Mensaje de confirmación
SELECT '✅ Script ejecutado. Verifica las políticas arriba. Deben mostrar "public" en roles y "SELECT" en cmd.' AS status;

