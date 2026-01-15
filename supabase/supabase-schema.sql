-- Products table schema for Botanic Care
-- Run this SQL in your Supabase SQL editor to create the products table

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skin-care', 'body-care', 'baby-care', 'home-care')),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price >= 0),
  image_url TEXT,
  emoji TEXT,
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  badge TEXT CHECK (badge IN ('MÁS VENDIDO', 'NUEVO', 'OFERTA', 'PERSONALIZADA', 'TEMPORADA')),
  description TEXT NOT NULL,
  long_description TEXT,
  ingredients TEXT[],
  benefits TEXT[],
  size TEXT,
  in_stock BOOLEAN DEFAULT true,
  sku TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create an index on in_stock for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Create an index on price for faster sorting
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

-- Create a policy to allow anyone to read products
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  USING (true);

-- Example insert (you can remove this after testing)
-- INSERT INTO products (
--   name, category, price, original_price, image_url, emoji, rating, reviews_count, 
--   badge, description, long_description, ingredients, benefits, size, in_stock, sku
-- ) VALUES (
--   'Crema Hidratante Facial',
--   'skin-care',
--   24.99,
--   29.99,
--   'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
--   '🌹',
--   4.8,
--   1247,
--   'MÁS VENDIDO',
--   'Crema hidratante facial con ingredientes naturales para piel suave y radiante',
--   'Nuestra crema hidratante facial premium está formulada con ingredientes naturales cuidadosamente seleccionados para proporcionar hidratación profunda y duradera. Ideal para todo tipo de piel, especialmente para pieles secas y sensibles.',
--   ARRAY['Aloe Vera', 'Aceite de Jojoba', 'Vitamina E', 'Extracto de Rosa', 'Glicerina Natural'],
--   ARRAY['Hidratación profunda', 'Suaviza la piel', 'Reduce líneas finas', 'Protección antioxidante', 'Sin parabenos'],
--   '50ml',
--   true,
--   'SK-001'
-- );

