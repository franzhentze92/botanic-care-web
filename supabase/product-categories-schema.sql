-- Schema para la tabla de categorías de productos
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY, -- Usar slug como ID (ej: 'skin-care', 'body-care')
  name TEXT NOT NULL UNIQUE, -- Nombre de la categoría (ej: 'Cuidado de la Piel')
  description TEXT, -- Descripción de la categoría
  image_url TEXT, -- URL de la imagen de la categoría
  icon TEXT, -- Emoji o icono para la categoría
  display_order INTEGER DEFAULT 0, -- Orden de visualización
  is_active BOOLEAN DEFAULT true, -- Si la categoría está activa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar categorías iniciales
INSERT INTO product_categories (id, name, description, image_url, icon, display_order, is_active)
VALUES
  ('skin-care', 'Cuidado de la Piel', 'Productos para el cuidado facial y de la piel', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', '✨', 1, true),
  ('body-care', 'Cuidado Corporal', 'Productos para el cuidado del cuerpo', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop', '🌿', 2, true),
  ('baby-care', 'Cuidado del Bebé', 'Productos suaves y seguros para bebés', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', '👶', 3, true),
  ('home-care', 'Cuidado del Hogar', 'Productos naturales para el hogar', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', '🏠', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Asegurar que la función is_admin existe (usar la misma que en otros scripts)
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
  
  -- Si no existe user_roles, verifica por email
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

-- Habilitar Row Level Security (RLS)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON product_categories;
DROP POLICY IF EXISTS "Product categories are insertable by admins" ON product_categories;
DROP POLICY IF EXISTS "Product categories are updatable by admins" ON product_categories;
DROP POLICY IF EXISTS "Product categories are deletable by admins" ON product_categories;

-- Política para lectura pública (todos pueden leer)
CREATE POLICY "Product categories are viewable by everyone"
  ON product_categories FOR SELECT
  USING (true);

-- Política para inserción (solo admins)
CREATE POLICY "Product categories are insertable by admins"
  ON product_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

-- Política para actualización (solo admins)
CREATE POLICY "Product categories are updatable by admins"
  ON product_categories FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- Política para eliminación (solo admins)
CREATE POLICY "Product categories are deletable by admins"
  ON product_categories FOR DELETE
  TO authenticated
  USING (is_admin() = true);

