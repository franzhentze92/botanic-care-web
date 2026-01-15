-- Schema para el Constructor de Cremas Personalizadas
-- Ejecuta este script en el SQL Editor de Supabase después de crear la tabla de productos

-- Tabla de Aceites Base
CREATE TABLE IF NOT EXISTS custom_oils (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  price_modifier DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Extractos Botánicos
CREATE TABLE IF NOT EXISTS custom_extracts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  price_modifier DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Funciones Activas
CREATE TABLE IF NOT EXISTS custom_functions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  ingredients TEXT[] NOT NULL,
  price_modifier DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Cremas Personalizadas (configuraciones guardadas)
CREATE TABLE IF NOT EXISTS custom_creams (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID, -- Si implementas autenticación de usuarios
  oil_id TEXT NOT NULL REFERENCES custom_oils(id),
  extract_ids TEXT[] NOT NULL, -- Array de IDs de extractos (máximo 2)
  function_id TEXT NOT NULL REFERENCES custom_functions(id),
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  final_price DECIMAL(10, 2) NOT NULL,
  name TEXT, -- Nombre personalizado que el usuario puede dar
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_cart', 'ordered', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pedidos de Cremas Personalizadas (cuando se ordenan)
CREATE TABLE IF NOT EXISTS custom_cream_orders (
  id BIGSERIAL PRIMARY KEY,
  custom_cream_id BIGINT NOT NULL REFERENCES custom_creams(id),
  order_id BIGINT, -- Referencia a tabla de órdenes si la tienes
  user_id UUID, -- Si implementas autenticación
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  subscription BOOLEAN DEFAULT false, -- Si es parte de una suscripción
  subscription_frequency TEXT CHECK (subscription_frequency IN ('monthly', 'bimonthly', 'quarterly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_custom_creams_user_id ON custom_creams(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_creams_status ON custom_creams(status);
CREATE INDEX IF NOT EXISTS idx_custom_cream_orders_user_id ON custom_cream_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_cream_orders_status ON custom_cream_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_cream_orders_subscription ON custom_cream_orders(subscription);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_custom_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_custom_oils_updated_at ON custom_oils;
CREATE TRIGGER update_custom_oils_updated_at
  BEFORE UPDATE ON custom_oils
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_extracts_updated_at ON custom_extracts;
CREATE TRIGGER update_custom_extracts_updated_at
  BEFORE UPDATE ON custom_extracts
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_functions_updated_at ON custom_functions;
CREATE TRIGGER update_custom_functions_updated_at
  BEFORE UPDATE ON custom_functions
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_creams_updated_at ON custom_creams;
CREATE TRIGGER update_custom_creams_updated_at
  BEFORE UPDATE ON custom_creams
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_cream_orders_updated_at ON custom_cream_orders;
CREATE TRIGGER update_custom_cream_orders_updated_at
  BEFORE UPDATE ON custom_cream_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE custom_oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_extracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_creams ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_cream_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública de opciones
DROP POLICY IF EXISTS "Allow public read access to custom_oils" ON custom_oils;
CREATE POLICY "Allow public read access to custom_oils"
  ON custom_oils
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to custom_extracts" ON custom_extracts;
CREATE POLICY "Allow public read access to custom_extracts"
  ON custom_extracts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to custom_functions" ON custom_functions;
CREATE POLICY "Allow public read access to custom_functions"
  ON custom_functions
  FOR SELECT
  USING (true);

-- Políticas para custom_creams (los usuarios pueden crear sus propias cremas)
DROP POLICY IF EXISTS "Allow public insert to custom_creams" ON custom_creams;
CREATE POLICY "Allow public insert to custom_creams"
  ON custom_creams
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read own custom_creams" ON custom_creams;
CREATE POLICY "Allow public read own custom_creams"
  ON custom_creams
  FOR SELECT
  USING (true); -- Por ahora permitir lectura pública, puedes restringir después con user_id

-- Políticas para custom_cream_orders
DROP POLICY IF EXISTS "Allow public insert to custom_cream_orders" ON custom_cream_orders;
CREATE POLICY "Allow public insert to custom_cream_orders"
  ON custom_cream_orders
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read own custom_cream_orders" ON custom_cream_orders;
CREATE POLICY "Allow public read own custom_cream_orders"
  ON custom_cream_orders
  FOR SELECT
  USING (true); -- Por ahora permitir lectura pública, puedes restringir después con user_id

