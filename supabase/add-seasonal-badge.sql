-- Script para agregar el badge 'TEMPORADA' a la lista de badges permitidos
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, eliminar el constraint existente
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_badge_check;

-- Agregar el nuevo constraint con 'TEMPORADA' incluido
ALTER TABLE products 
ADD CONSTRAINT products_badge_check 
CHECK (badge IN ('MÁS VENDIDO', 'NUEVO', 'OFERTA', 'PERSONALIZADA', 'TEMPORADA'));

