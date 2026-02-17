-- ============================================
-- ARREGLAR RLS PARA ÓRDENES - CUENTAS NUEVAS
-- Este script asegura que las cuentas nuevas puedan crear órdenes
-- ============================================

-- ============================================
-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar políticas de orders
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON orders';
  END LOOP;
END $$;

-- Eliminar políticas de order_items
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'order_items') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON order_items';
  END LOOP;
END $$;

-- ============================================
-- 2. CREAR POLÍTICAS SIMPLES PARA ORDERS
-- ============================================

-- Política 1: Los usuarios autenticados pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 2: Los usuarios autenticados pueden crear sus propias órdenes
CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política 3: Los usuarios autenticados pueden actualizar sus propias órdenes pendientes
CREATE POLICY "Users can update their own pending orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. CREAR POLÍTICAS SIMPLES PARA ORDER_ITEMS
-- ============================================

-- Política 1: Los usuarios autenticados pueden ver items de sus propias órdenes
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Política 2: Los usuarios autenticados pueden crear items en sus propias órdenes
CREATE POLICY "Users can create items in their own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. ASEGURAR QUE RLS ESTÉ HABILITADO
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. VERIFICAR POLÍTICAS
-- ============================================

-- Mostrar todas las políticas de orders
SELECT 
  'orders' as tabla,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'orders';

-- Mostrar todas las políticas de order_items
SELECT 
  'order_items' as tabla,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'order_items';

-- Mensaje de confirmación
SELECT '✅ Políticas RLS configuradas para orders y order_items. Las cuentas nuevas ahora pueden crear órdenes.' AS status;

