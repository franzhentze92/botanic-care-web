-- Script para establecer la fecha de llegada estimada por defecto al día siguiente
-- cuando se crea una orden
-- Ejecuta este script en el SQL Editor de Supabase

-- Modificar la función set_order_number para también establecer estimated_delivery
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generar número de pedido si no se proporciona
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  
  -- Establecer fecha de llegada estimada al día siguiente si no se proporciona
  IF NEW.estimated_delivery IS NULL THEN
    NEW.estimated_delivery := (CURRENT_DATE + INTERVAL '2 days')::DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

