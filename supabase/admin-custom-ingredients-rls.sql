-- Políticas RLS para que solo admins puedan gestionar ingredientes de cremas personalizadas
-- Ejecuta este script en el SQL Editor de Supabase

-- Políticas para custom_oils: Solo admins pueden crear, actualizar y eliminar
DROP POLICY IF EXISTS "Admins can insert custom_oils" ON custom_oils;
CREATE POLICY "Admins can insert custom_oils"
  ON custom_oils FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update custom_oils" ON custom_oils;
CREATE POLICY "Admins can update custom_oils"
  ON custom_oils FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete custom_oils" ON custom_oils;
CREATE POLICY "Admins can delete custom_oils"
  ON custom_oils FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Políticas para custom_extracts: Solo admins pueden crear, actualizar y eliminar
DROP POLICY IF EXISTS "Admins can insert custom_extracts" ON custom_extracts;
CREATE POLICY "Admins can insert custom_extracts"
  ON custom_extracts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update custom_extracts" ON custom_extracts;
CREATE POLICY "Admins can update custom_extracts"
  ON custom_extracts FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete custom_extracts" ON custom_extracts;
CREATE POLICY "Admins can delete custom_extracts"
  ON custom_extracts FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Políticas para custom_functions: Solo admins pueden crear, actualizar y eliminar
DROP POLICY IF EXISTS "Admins can insert custom_functions" ON custom_functions;
CREATE POLICY "Admins can insert custom_functions"
  ON custom_functions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update custom_functions" ON custom_functions;
CREATE POLICY "Admins can update custom_functions"
  ON custom_functions FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete custom_functions" ON custom_functions;
CREATE POLICY "Admins can delete custom_functions"
  ON custom_functions FOR DELETE
  TO authenticated
  USING (is_admin() = true);

