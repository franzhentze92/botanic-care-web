-- ============================================
-- DESHABILITAR RLS TEMPORALMENTE (SOLO PARA DEBUG)
-- ⚠️ ADVERTENCIA: Esto deshabilita la seguridad. Solo para debug.
-- ============================================

-- DESHABILITAR RLS COMPLETAMENTE PARA PRODUCTOS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- DESHABILITAR RLS COMPLETAMENTE PARA CATEGORÍAS
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'product_categories');

-- Mensaje de confirmación
SELECT '⚠️ RLS DESHABILITADO TEMPORALMENTE. Esto es solo para debug. Vuelve a habilitarlo después.' AS status;

