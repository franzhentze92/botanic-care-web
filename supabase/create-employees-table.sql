-- Script para crear la tabla de trabajadores/empleados en el panel de admin
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Trabajadores/Empleados
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional: puede estar asociado a un usuario
  employee_code TEXT UNIQUE, -- Código único del empleado (ej: EMP-001)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL, -- Cargo/Puesto (ej: 'gerente', 'vendedor', 'contador', 'diseñador', etc.)
  department TEXT, -- Departamento (ej: 'ventas', 'administracion', 'marketing', etc.)
  hire_date DATE NOT NULL, -- Fecha de contratación
  salary DECIMAL(10, 2), -- Salario (opcional, para casos específicos)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  notes TEXT, -- Notas adicionales
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);

-- Función para generar código de empleado automáticamente
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  emp_count BIGINT;
BEGIN
  -- Formato: EMP-NNNNNN
  SELECT COUNT(*) + 1 INTO emp_count FROM employees;
  new_code := 'EMP-' || LPAD(emp_count::TEXT, 6, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código de empleado automáticamente
CREATE OR REPLACE FUNCTION set_employee_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
    NEW.employee_code := generate_employee_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_employee_code ON employees;
CREATE TRIGGER trigger_set_employee_code
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION set_employee_code();

-- Habilitar Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo los administradores pueden ver y gestionar trabajadores
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
CREATE POLICY "Admins can view all employees"
  ON employees FOR SELECT
  TO authenticated
  USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can create employees" ON employees;
CREATE POLICY "Admins can create employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update employees" ON employees;
CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "Admins can delete employees" ON employees;
CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_employees_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employees_updated_at_column();

