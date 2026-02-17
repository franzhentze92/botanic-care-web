-- Schema para el sistema de nutrientes/ingredientes
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Categorías de Nutrientes
CREATE TABLE IF NOT EXISTS nutrient_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Nutrientes/Ingredientes
CREATE TABLE IF NOT EXISTS nutrients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES nutrient_categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL,
  sources TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación muchos a muchos entre productos y nutrientes
CREATE TABLE IF NOT EXISTS product_nutrients (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  nutrient_id BIGINT NOT NULL REFERENCES nutrients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, nutrient_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_nutrients_category_id ON nutrients(category_id);
CREATE INDEX IF NOT EXISTS idx_product_nutrients_product_id ON product_nutrients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_nutrients_nutrient_id ON product_nutrients(nutrient_id);

-- Trigger para actualizar updated_at en nutrient_categories
DROP TRIGGER IF EXISTS update_nutrient_categories_updated_at ON nutrient_categories;
CREATE TRIGGER update_nutrient_categories_updated_at
  BEFORE UPDATE ON nutrient_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en nutrients
DROP TRIGGER IF EXISTS update_nutrients_updated_at ON nutrients;
CREATE TRIGGER update_nutrients_updated_at
  BEFORE UPDATE ON nutrients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE nutrient_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_nutrients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lectura pública
DROP POLICY IF EXISTS "Allow public read access to nutrient_categories" ON nutrient_categories;
CREATE POLICY "Allow public read access to nutrient_categories"
  ON nutrient_categories
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to nutrients" ON nutrients;
CREATE POLICY "Allow public read access to nutrients"
  ON nutrients
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to product_nutrients" ON product_nutrients;
CREATE POLICY "Allow public read access to product_nutrients"
  ON product_nutrients
  FOR SELECT
  USING (true);

