-- ============================================
-- DESHABILITAR RLS COMPLETAMENTE PARA PRODUCTOS Y CATEGORÍAS
-- ⚠️ Esto permite acceso público sin restricciones
-- ============================================

-- DESHABILITAR RLS PARA PRODUCTOS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- DESHABILITAR RLS PARA CATEGORÍAS
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
  'products' as tabla,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'products'

UNION ALL

SELECT 
  'product_categories' as tabla,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'product_categories';

-- Verificar que las tablas son accesibles
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_categories FROM product_categories;

-- Mensaje de confirmación
SELECT '✅ RLS DESHABILITADO COMPLETAMENTE. Productos y categorías ahora son accesibles públicamente sin restricciones.' AS status;

