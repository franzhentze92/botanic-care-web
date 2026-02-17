-- Script para insertar las opciones del constructor de cremas personalizadas
-- Ejecuta este script después de crear las tablas con custom-cream-schema.sql

-- Insertar Aceites Base
INSERT INTO custom_oils (id, name, emoji, description, price_modifier) VALUES
('uva', 'Aceite de semilla de uva', '🍇', 'Rico en antioxidantes', 0.00),
('jojoba', 'Aceite de jojoba', '🌿', 'Hidratación profunda', 2.00),
('almendra', 'Aceite de almendra', '🌰', 'Suaviza la piel', 1.50),
('rosa', 'Aceite de rosa mosqueta', '🌹', 'Regenerador natural', 3.00)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  price_modifier = EXCLUDED.price_modifier,
  updated_at = NOW();

-- Insertar Extractos Botánicos
INSERT INTO custom_extracts (id, name, emoji, price_modifier) VALUES
('aloe', 'Aloe vera', '🌱', 1.50),
('pepino', 'Hidrolato de pepino', '🥒', 1.00),
('acerola', 'Extracto de acerola', '🍒', 2.00),
('zanahoria', 'Extracto de zanahoria', '🥕', 1.50)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  price_modifier = EXCLUDED.price_modifier,
  updated_at = NOW();

-- Insertar Funciones Activas
INSERT INTO custom_functions (id, name, emoji, ingredients, price_modifier) VALUES
(
  'anti-aging',
  'Anti-aging',
  '✨',
  ARRAY['Extracto de hongos', 'Aceite de incienso', 'Aceite de geranio', 'Ácido hialurónico'],
  5.00
),
(
  'hidratante',
  'Hidratante',
  '💧',
  ARRAY['Ácido hialurónico', 'Glicerina vegetal', 'Manteca de karité', 'Ceramidas'],
  3.00
),
(
  'purificante',
  'Purificante',
  '🌸',
  ARRAY['Arcilla verde', 'Aceite de árbol de té', 'Extracto de hamamelis', 'Niacinamida'],
  4.00
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  ingredients = EXCLUDED.ingredients,
  price_modifier = EXCLUDED.price_modifier,
  updated_at = NOW();

-- Verificar que los datos se insertaron correctamente
SELECT 
  'Aceites Base' as tipo,
  COUNT(*) as cantidad
FROM custom_oils
UNION ALL
SELECT 
  'Extractos Botánicos' as tipo,
  COUNT(*) as cantidad
FROM custom_extracts
UNION ALL
SELECT 
  'Funciones Activas' as tipo,
  COUNT(*) as cantidad
FROM custom_functions;

