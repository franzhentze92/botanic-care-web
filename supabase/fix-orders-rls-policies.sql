-- Script para corregir las políticas RLS de orders y order_items
-- Este script asegura que:
-- 1. Los usuarios puedan crear y ver sus propias órdenes
-- 2. Los administradores puedan ver y actualizar todas las órdenes
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- FUNCIÓN AUXILIAR PARA VERIFICAR ADMIN
-- ============================================

-- Función para verificar si un usuario es admin
-- Usa SECURITY DEFINER para tener permisos de lectura en auth.users
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Primero intenta verificar con user_roles (método recomendado)
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;
  
  -- Si no existe user_roles, verifica por email (solo si la tabla existe)
  -- Esta es una alternativa si no usas user_roles
  BEGIN
    IF EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = user_uuid AND email = 'admin@botaniccare.com'
    ) THEN
      RETURN true;
    END IF;
  EXCEPTION
    WHEN others THEN
      -- Si falla (por ejemplo, no tiene permisos), retorna false
      RETURN false;
  END;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS PARA ORDERS
-- ============================================

-- Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Allow admin email to view all orders" ON orders;
DROP POLICY IF EXISTS "Allow admin email to update all orders" ON orders;

-- Política 1: Los usuarios pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 2: Los usuarios pueden crear sus propias órdenes
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política 3: Los usuarios pueden actualizar sus propias órdenes (solo si están pendientes)
CREATE POLICY "Users can update their own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Política 4: Los administradores pueden ver todas las órdenes
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    is_admin() = true
    OR
    auth.uid() = user_id  -- Los usuarios también pueden ver sus propias órdenes
  );

-- Política 5: Los administradores pueden actualizar todas las órdenes
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    is_admin() = true
    OR
    (auth.uid() = user_id AND status = 'pending')  -- Los usuarios pueden actualizar solo sus órdenes pendientes
  )
  WITH CHECK (
    is_admin() = true
    OR
    auth.uid() = user_id
  );

-- ============================================
-- POLÍTICAS PARA ORDER_ITEMS
-- ============================================

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create items in their own orders" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Política 1: Los usuarios pueden ver los items de sus propias órdenes
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Política 2: Los usuarios pueden crear items en sus propias órdenes
CREATE POLICY "Users can create items in their own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Política 3: Los administradores pueden ver todos los order_items
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    is_admin() = true
    OR
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

