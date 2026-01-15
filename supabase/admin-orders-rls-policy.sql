-- RLS Policy para permitir a administradores ver todos los pedidos
-- ⚠️ IMPORTANTE: Este script debe ejecutarse DESPUÉS de fix-orders-rls-policies.sql
-- Ejecuta primero fix-orders-rls-policies.sql para asegurar que los usuarios puedan crear órdenes

-- ============================================
-- NOTA: Las políticas básicas de usuarios ya están en fix-orders-rls-policies.sql
-- Este script solo agrega políticas adicionales para administradores
-- ============================================

-- Policy: Admins pueden ver todos los pedidos (se agrega sin eliminar las de usuarios)
-- Si usas user_roles, descomenta esta:
-- CREATE POLICY "Admins can view all orders"
--   ON orders FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- Policy: Admins pueden actualizar todos los pedidos
-- Si usas user_roles, descomenta esta:
-- CREATE POLICY "Admins can update all orders"
--   ON orders FOR UPDATE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- Policy: Admins pueden ver todos los order_items
-- Si usas user_roles, descomenta esta:
-- CREATE POLICY "Admins can view all order items"
--   ON order_items FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- ALTERNATIVA: Si no tienes user_roles configurado, descomenta estas políticas
-- y comenta las políticas anteriores que usan user_roles

-- DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
-- DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
-- DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- CREATE POLICY "Allow admin email to view all orders"
--   ON orders FOR SELECT
--   TO authenticated
--   USING (
--     (auth.uid() IN (
--       SELECT id FROM auth.users WHERE email = 'admin@botaniccare.com'
--     ))
--     OR
--     (auth.uid() = user_id)  -- Los usuarios también pueden ver sus propios pedidos
--   );

-- CREATE POLICY "Allow admin email to update all orders"
--   ON orders FOR UPDATE
--   TO authenticated
--   USING (
--     auth.uid() IN (
--       SELECT id FROM auth.users WHERE email = 'admin@botaniccare.com'
--     )
--   )
--   WITH CHECK (
--     auth.uid() IN (
--       SELECT id FROM auth.users WHERE email = 'admin@botaniccare.com'
--     )
--   );

-- CREATE POLICY "Allow admin email to view all order items"
--   ON order_items FOR SELECT
--   TO authenticated
--   USING (
--     (auth.uid() IN (
--       SELECT id FROM auth.users WHERE email = 'admin@botaniccare.com'
--     ))
--     OR
--     EXISTS (
--       SELECT 1 FROM orders
--       WHERE orders.id = order_items.order_id
--       AND orders.user_id = auth.uid()
--     )
--   );

