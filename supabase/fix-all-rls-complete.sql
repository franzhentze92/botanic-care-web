-- ============================================
-- SCRIPT COMPLETO PARA ARREGLAR TODAS LAS POLÍTICAS RLS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- ============================================
-- 1. USER_PROFILES - Políticas RLS
-- ============================================

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation for new users" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Política para SELECT: usuarios autenticados pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para INSERT: usuarios autenticados pueden crear su propio perfil
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuarios autenticados pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. ORDERS - Políticas RLS
-- ============================================

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Política para SELECT: usuarios pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para INSERT: usuarios pueden crear sus propias órdenes
CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuarios pueden actualizar sus propias órdenes pendientes
CREATE POLICY "Users can update their own pending orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. ORDER_ITEMS - Políticas RLS
-- ============================================

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create items in their own orders" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Política para SELECT: usuarios pueden ver items de sus propias órdenes
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

-- Política para INSERT: usuarios pueden crear items en sus propias órdenes
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
-- 4. PRODUCT_CATEGORIES - Políticas RLS (Lectura pública)
-- ============================================

-- Eliminar TODAS las políticas existentes (incluyendo las de admin)
DROP POLICY IF EXISTS "Public can view all categories" ON product_categories;
DROP POLICY IF EXISTS "Public can view active categories" ON product_categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON product_categories;
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON product_categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON product_categories;
DROP POLICY IF EXISTS "Product categories are insertable by admins" ON product_categories;
DROP POLICY IF EXISTS "Product categories are updatable by admins" ON product_categories;
DROP POLICY IF EXISTS "Product categories are deletable by admins" ON product_categories;

-- Política para SELECT: lectura pública de TODAS las categorías (no solo activas)
-- Esto permite que la app cargue las categorías incluso si algunas están inactivas
CREATE POLICY "Public can view all categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

-- Políticas para admins (INSERT, UPDATE, DELETE)
-- Función is_admin debe existir (se crea en otros scripts)
CREATE POLICY "Admins can insert categories"
  ON product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  );

CREATE POLICY "Admins can update categories"
  ON product_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON product_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  );

-- ============================================
-- 5. ADDRESSES - Políticas RLS
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can create their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;

-- Política para SELECT
CREATE POLICY "Users can view their own addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can create their own addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update their own addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete their own addresses"
  ON addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. PAYMENT_METHODS - Políticas RLS
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;

-- Política para SELECT
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can create their own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update their own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 7. Verificar que RLS está habilitado
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. Mensaje de confirmación
-- ============================================

-- ============================================
-- 9. ARREGLAR GENERACIÓN DE NÚMEROS DE ORDEN DUPLICADOS
-- ============================================

-- Función mejorada para generar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_count BIGINT;
  counter INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  -- Formato: ORD-YYYY-NNNNNN
  SELECT COUNT(*) INTO order_count 
  FROM orders 
  WHERE DATE_PART('year', created_at) = DATE_PART('year', NOW());
  
  new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((order_count + 1)::TEXT, 6, '0');
  
  -- Verificar si existe y generar uno nuevo si es necesario
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) AND counter < max_attempts LOOP
    counter := counter + 1;
    order_count := order_count + 1;
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((order_count + 1)::TEXT, 6, '0');
  END LOOP;
  
  -- Si después de max_attempts aún hay duplicado, usar timestamp para garantizar unicidad
  IF EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT, 'FM000000');
  END IF;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Verificar que el trigger esté correctamente configurado
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- ============================================
-- 10. PRODUCTS - Políticas RLS (Acceso Público)
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- Política para SELECT: acceso público de lectura
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Políticas para admins (INSERT, UPDATE, DELETE)
CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  );

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  );

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@botaniccare.com'
    )
  );

-- Asegurar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

SELECT '✅ Script ejecutado correctamente. Todas las políticas RLS y triggers han sido configurados. La función generate_order_number() ahora previene duplicados. Productos tienen acceso público de lectura.' AS status;

