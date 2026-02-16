-- ============================================
-- SCRIPT SIMPLE PARA ARREGLAR PRODUCTOS Y CATEGORÍAS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- 1. PRODUCTOS - Permitir acceso público de lectura
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Asegurar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. CATEGORÍAS - Permitir acceso público de lectura
DROP POLICY IF EXISTS "Public can view all categories" ON product_categories;
DROP POLICY IF EXISTS "Public can view active categories" ON product_categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON product_categories;
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON product_categories;

CREATE POLICY "Public can view all categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

-- Asegurar que RLS esté habilitado
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
SELECT '✅ Políticas RLS configuradas. Productos y categorías ahora son accesibles públicamente.' AS status;

