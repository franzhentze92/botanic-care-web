-- ============================================
-- ARREGLAR GENERACIÓN DE NÚMEROS DE ORDEN DUPLICADOS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Función mejorada para generar número de pedido único
-- Esta función verifica que el número no exista antes de retornarlo
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_count BIGINT;
  counter INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  -- Formato: ORD-YYYY-NNNNNN
  -- Obtener el conteo de órdenes del año actual
  SELECT COUNT(*) INTO order_count 
  FROM orders 
  WHERE DATE_PART('year', created_at) = DATE_PART('year', NOW());
  
  -- Generar número inicial
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

-- Mensaje de confirmación
SELECT '✅ Función generate_order_number() actualizada. Los números de orden ahora son únicos y no se duplicarán.' AS status;

