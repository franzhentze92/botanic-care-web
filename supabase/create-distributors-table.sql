-- Script para crear la tabla de distribuidores/tiendas
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, eliminar la tabla si existe (solo si necesitas empezar desde cero)
-- DROP TABLE IF EXISTS distributors CASCADE;

-- Tabla de Distribuidores
CREATE TABLE IF NOT EXISTS distributors (
  id BIGSERIAL PRIMARY KEY,
  store_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Guatemala',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_name),
  UNIQUE(email)
);

-- Índices para mejor rendimiento (solo si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distributors_email') THEN
    CREATE INDEX idx_distributors_email ON distributors(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distributors_store_name') THEN
    CREATE INDEX idx_distributors_store_name ON distributors(store_name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distributors_city') THEN
    CREATE INDEX idx_distributors_city ON distributors(city);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distributors_created_at') THEN
    CREATE INDEX idx_distributors_created_at ON distributors(created_at DESC);
  END IF;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_distributors_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_distributors_updated_at ON distributors;
CREATE TRIGGER update_distributors_updated_at
  BEFORE UPDATE ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION update_distributors_updated_at_column();

-- Habilitar Row Level Security (RLS)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'distributors') THEN
    ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Asegurar que existe la función is_admin (si no existe, crearla)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Primero intenta verificar con user_roles (método recomendado)
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = user_uuid AND role = 'admin'
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Verificar por email (método alternativo)
  BEGIN
    IF EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = user_uuid AND email = 'admin@botaniccare.com'
    ) THEN
      RETURN true;
    END IF;
  EXCEPTION
    WHEN others THEN
      RETURN false;
  END;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS: Solo los administradores pueden ver y gestionar distribuidores
-- Solo crear políticas si la tabla existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'distributors') THEN
    -- Política para SELECT (ver distribuidores)
    DROP POLICY IF EXISTS "Admins can view all distributors" ON distributors;
    CREATE POLICY "Admins can view all distributors"
      ON distributors FOR SELECT
      TO authenticated
      USING (is_admin() = true);

    -- Política para INSERT (crear distribuidores)
    DROP POLICY IF EXISTS "Admins can create distributors" ON distributors;
    CREATE POLICY "Admins can create distributors"
      ON distributors FOR INSERT
      TO authenticated
      WITH CHECK (is_admin() = true);

    -- Política para UPDATE (actualizar distribuidores)
    DROP POLICY IF EXISTS "Admins can update distributors" ON distributors;
    CREATE POLICY "Admins can update distributors"
      ON distributors FOR UPDATE
      TO authenticated
      USING (is_admin() = true)
      WITH CHECK (is_admin() = true);

    -- Política para DELETE (eliminar distribuidores)
    DROP POLICY IF EXISTS "Admins can delete distributors" ON distributors;
    CREATE POLICY "Admins can delete distributors"
      ON distributors FOR DELETE
      TO authenticated
      USING (is_admin() = true);
  END IF;
END $$;

