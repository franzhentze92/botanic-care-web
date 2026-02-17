-- Script para insertar productos en la base de datos
-- Ejecuta este script en el SQL Editor de Supabase después de crear la tabla

-- Limpiar productos existentes (opcional - descomenta si quieres empezar desde cero)
-- DELETE FROM products;

-- Insertar productos de Cuidado de la Piel
INSERT INTO products (
  name, category, price, original_price, image_url, emoji, rating, reviews_count, 
  badge, description, long_description, ingredients, benefits, size, in_stock, sku
) VALUES
-- Producto 1: Crema Hidratante Facial
(
  'Crema Hidratante Facial',
  'skin-care',
  24.99,
  29.99,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🌹',
  4.8,
  1247,
  'MÁS VENDIDO',
  'Crema hidratante facial con ingredientes naturales para piel suave y radiante',
  'Nuestra crema hidratante facial premium está formulada con ingredientes naturales cuidadosamente seleccionados para proporcionar hidratación profunda y duradera. Ideal para todo tipo de piel, especialmente para pieles secas y sensibles.',
  ARRAY['Aloe Vera', 'Aceite de Jojoba', 'Vitamina E', 'Extracto de Rosa', 'Glicerina Natural'],
  ARRAY['Hidratación profunda', 'Suaviza la piel', 'Reduce líneas finas', 'Protección antioxidante', 'Sin parabenos'],
  '50ml',
  true,
  'SK-001'
),
-- Producto 2: Serum Antienvejecimiento
(
  'Serum Antienvejecimiento',
  'skin-care',
  34.99,
  NULL,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '✨',
  4.9,
  892,
  'NUEVO',
  'Serum con vitamina C y retinol para reducir líneas finas y arrugas',
  'Nuestro serum antienvejecimiento combina la potencia de la vitamina C estabilizada con retinol natural para combatir los signos del envejecimiento. Formulado para mejorar la textura de la piel y reducir la aparición de arrugas.',
  ARRAY['Vitamina C', 'Retinol Natural', 'Ácido Hialurónico', 'Niacinamida', 'Peptidos'],
  ARRAY['Reduce arrugas', 'Mejora la textura', 'Unifica el tono', 'Protección antioxidante', 'Hidratación intensiva'],
  '30ml',
  true,
  'SK-002'
),
-- Producto 3: Limpiador Facial Suave
(
  'Limpiador Facial Suave',
  'skin-care',
  18.99,
  22.99,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🌱',
  4.7,
  567,
  'OFERTA',
  'Limpiador facial suave con aceite de árbol de té natural',
  'Un limpiador facial suave y efectivo que elimina impurezas sin resecar la piel. Enriquecido con aceite de árbol de té natural para propiedades antibacterianas.',
  ARRAY['Aceite de Árbol de Té', 'Aloe Vera', 'Glicerina', 'Extracto de Manzanilla', 'Vitamina B5'],
  ARRAY['Limpieza profunda', 'Antibacteriano natural', 'No reseca la piel', 'Calma la irritación', 'Equilibra el pH'],
  '200ml',
  true,
  'SK-003'
),
-- Producto 4: Mascarilla Facial
(
  'Mascarilla Facial',
  'skin-care',
  14.99,
  18.99,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '🧖‍♀️',
  4.7,
  678,
  'OFERTA',
  'Mascarilla facial purificante con arcilla natural',
  'Mascarilla facial purificante con arcilla natural que elimina impurezas y exceso de grasa. Deja la piel limpia y renovada.',
  ARRAY['Arcilla Verde', 'Aloe Vera', 'Aceite de Árbol de Té', 'Vitamina E', 'Extracto de Té Verde'],
  ARRAY['Purifica la piel', 'Elimina impurezas', 'Controla la grasa', 'Renueva la piel', 'Efecto detox'],
  '100g',
  true,
  'SK-004'
),
-- Producto 5: Tónico Facial
(
  'Tónico Facial Equilibrante',
  'skin-care',
  19.99,
  NULL,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '💧',
  4.6,
  423,
  NULL,
  'Tónico facial con extractos naturales para equilibrar el pH de la piel',
  'Tónico facial refrescante que equilibra el pH de la piel y prepara la piel para los siguientes pasos de tu rutina de cuidado.',
  ARRAY['Agua de Rosas', 'Hammamelis', 'Ácido Glicólico Natural', 'Extracto de Té Verde', 'Glicerina'],
  ARRAY['Equilibra el pH', 'Cierra poros', 'Refresca la piel', 'Prepara para hidratación', 'Sin alcohol'],
  '150ml',
  true,
  'SK-005'
),
-- Producto 6: Contorno de Ojos
(
  'Crema Contorno de Ojos',
  'skin-care',
  27.99,
  32.99,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '👁️',
  4.8,
  756,
  'OFERTA',
  'Crema especializada para el contorno de ojos con efecto anti-edad',
  'Crema específica para el área delicada del contorno de ojos. Reduce bolsas, ojeras y líneas de expresión con ingredientes naturales.',
  ARRAY['Cafeína', 'Ácido Hialurónico', 'Vitamina K', 'Extracto de Pepino', 'Aceite de Almendras'],
  ARRAY['Reduce bolsas', 'Aclara ojeras', 'Hidratación intensiva', 'Antienvejecimiento', 'Textura ligera'],
  '30ml',
  true,
  'SK-006'
);

-- Insertar productos de Cuidado Corporal
INSERT INTO products (
  name, category, price, original_price, image_url, emoji, rating, reviews_count, 
  badge, description, long_description, ingredients, benefits, size, in_stock, sku
) VALUES
-- Producto 7: Gel Corporal de Aloe Vera
(
  'Gel Corporal de Aloe Vera',
  'body-care',
  15.99,
  NULL,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '🌵',
  4.6,
  734,
  NULL,
  'Gel corporal de aloe vera puro para calmar e hidratar la piel',
  'Gel corporal refrescante con aloe vera puro para calmar e hidratar la piel después del sol o ejercicio. Absorción rápida sin dejar residuos grasos.',
  ARRAY['Aloe Vera Puro', 'Vitamina E', 'Aceite de Coco', 'Extracto de Pepino', 'Mentol Natural'],
  ARRAY['Calma la piel', 'Hidratación inmediata', 'Refrescante', 'Sin residuos grasos', 'Ideal post-sol'],
  '250ml',
  true,
  'BC-001'
),
-- Producto 8: Aceite Corporal de Lavanda
(
  'Aceite Corporal de Lavanda',
  'body-care',
  21.99,
  24.99,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🌿',
  4.8,
  1023,
  'OFERTA',
  'Aceite corporal de lavanda para relajación e hidratación profunda',
  'Aceite corporal de lavanda puro para masajes relajantes e hidratación profunda. Perfecto para usar antes de dormir o después de un baño caliente.',
  ARRAY['Aceite de Lavanda', 'Aceite de Almendras', 'Aceite de Jojoba', 'Vitamina E', 'Aceites Esenciales'],
  ARRAY['Relajación', 'Hidratación profunda', 'Mejora el sueño', 'Antiestrés', 'Nutrición intensiva'],
  '100ml',
  true,
  'BC-002'
),
-- Producto 9: Exfoliante Corporal
(
  'Exfoliante Corporal Natural',
  'body-care',
  17.99,
  20.99,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '🧴',
  4.7,
  589,
  'OFERTA',
  'Exfoliante corporal con azúcar y aceites naturales',
  'Exfoliante corporal suave que elimina células muertas y deja la piel suave y radiante. Formulado con azúcar de caña y aceites nutritivos.',
  ARRAY['Azúcar de Caña', 'Aceite de Coco', 'Aceite de Oliva', 'Extracto de Vainilla', 'Vitamina E'],
  ARRAY['Exfoliación suave', 'Elimina células muertas', 'Hidratación profunda', 'Piel suave', 'Aroma natural'],
  '200g',
  true,
  'BC-003'
),
-- Producto 10: Crema Corporal Hidratante
(
  'Crema Corporal Hidratante',
  'body-care',
  19.99,
  NULL,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🧴',
  4.6,
  892,
  NULL,
  'Crema corporal hidratante de rápida absorción',
  'Crema corporal ligera de rápida absorción que hidrata profundamente sin dejar sensación grasosa. Ideal para uso diario.',
  ARRAY['Manteca de Karité', 'Aceite de Almendras', 'Glicerina', 'Vitamina E', 'Extracto de Caléndula'],
  ARRAY['Hidratación profunda', 'Absorción rápida', 'No grasa', 'Uso diario', 'Piel suave'],
  '300ml',
  true,
  'BC-004'
);

-- Insertar productos de Cuidado del Bebé
INSERT INTO products (
  name, category, price, original_price, image_url, emoji, rating, reviews_count, 
  badge, description, long_description, ingredients, benefits, size, in_stock, sku
) VALUES
-- Producto 11: Crema para Bebés
(
  'Crema para Bebés',
  'baby-care',
  19.99,
  NULL,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '👶',
  4.7,
  456,
  NULL,
  'Crema suave y natural para el cuidado de la piel del bebé',
  'Crema especialmente formulada para la piel sensible de los bebés. Libre de ingredientes irritantes y dermatológicamente probada.',
  ARRAY['Óxido de Zinc', 'Lanolina', 'Vitamina E', 'Extracto de Caléndula', 'Aceite de Coco'],
  ARRAY['Protección de la piel', 'Previene irritaciones', 'Hidratación suave', 'Seguro para bebés', 'Sin fragancias'],
  '100g',
  true,
  'BB-001'
),
-- Producto 12: Aceite de Masaje para Bebés
(
  'Aceite de Masaje para Bebés',
  'baby-care',
  16.99,
  NULL,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🫂',
  4.9,
  234,
  'PERSONALIZADA',
  'Aceite de masaje natural para bebés con ingredientes suaves',
  'Aceite de masaje natural diseñado específicamente para bebés. Promueve la relajación y fortalece el vínculo entre padres e hijos.',
  ARRAY['Aceite de Almendras', 'Aceite de Girasol', 'Vitamina E', 'Extracto de Manzanilla', 'Aceite de Lavanda'],
  ARRAY['Relajación del bebé', 'Fortalece vínculos', 'Hidratación natural', 'Seguro y suave', 'Promueve el sueño'],
  '50ml',
  true,
  'BB-002'
),
-- Producto 13: Champú para Bebés
(
  'Champú Suave para Bebés',
  'baby-care',
  12.99,
  15.99,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🧴',
  4.8,
  567,
  'OFERTA',
  'Champú suave y natural para el cabello del bebé',
  'Champú especialmente formulado para el cabello delicado de los bebés. Sin lágrimas y con ingredientes naturales suaves.',
  ARRAY['Extracto de Manzanilla', 'Aceite de Coco', 'Glicerina', 'Vitamina E', 'Agua Purificada'],
  ARRAY['Sin lágrimas', 'Suave y natural', 'Limpieza delicada', 'Seguro para bebés', 'Aroma suave'],
  '200ml',
  true,
  'BB-003'
),
-- Producto 14: Toallitas Húmedas
(
  'Toallitas Húmedas Naturales',
  'baby-care',
  8.99,
  11.99,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '🧻',
  4.6,
  1234,
  'OFERTA',
  'Toallitas húmedas naturales para el cuidado del bebé',
  'Toallitas húmedas suaves y naturales para la limpieza diaria del bebé. Sin alcohol ni fragancias artificiales.',
  ARRAY['Agua Purificada', 'Extracto de Caléndula', 'Aloe Vera', 'Vitamina E', 'Sin Alcohol'],
  ARRAY['Suaves y naturales', 'Sin alcohol', 'Limpieza delicada', 'Hipoalergénicas', 'Pack económico'],
  '80 unidades',
  true,
  'BB-004'
);

-- Insertar productos de Cuidado del Hogar
INSERT INTO products (
  name, category, price, original_price, image_url, emoji, rating, reviews_count, 
  badge, description, long_description, ingredients, benefits, size, in_stock, sku
) VALUES
-- Producto 15: Limpiador Natural para el Hogar
(
  'Limpiador Natural para el Hogar',
  'home-care',
  12.99,
  15.99,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '🏠',
  4.8,
  189,
  'OFERTA',
  'Limpiador natural para el hogar con aceites esenciales',
  'Limpiador multiusos natural para el hogar. Efectivo y seguro para toda la familia, incluyendo mascotas.',
  ARRAY['Vinagre de Manzana', 'Bicarbonato de Sodio', 'Aceites Esenciales', 'Jabón de Castilla', 'Agua Purificada'],
  ARRAY['Limpieza efectiva', 'Seguro para niños', 'Eco-friendly', 'Multiusos', 'Fragancia natural'],
  '500ml',
  true,
  'HC-001'
),
-- Producto 16: Difusor de Aromas
(
  'Difusor de Aromas',
  'home-care',
  29.99,
  NULL,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '💨',
  4.6,
  312,
  NULL,
  'Difusor de aromas para crear un ambiente relajante en el hogar',
  'Difusor de aromas ultrasónico que dispersa aceites esenciales en el aire. Crea un ambiente relajante y purifica el aire de forma natural.',
  ARRAY['Materiales No Tóxicos', 'Tecnología Ultrasónica', 'LED RGB', 'Tanque de Vidrio', 'Base de Madera'],
  ARRAY['Purifica el aire', 'Ambiente relajante', 'Tecnología silenciosa', 'Diseño elegante', 'Fácil de usar'],
  '300ml',
  true,
  'HC-002'
),
-- Producto 17: Velas Aromáticas
(
  'Velas Aromáticas Naturales',
  'home-care',
  18.99,
  22.99,
  'https://images.unsplash.com/photo-1570194065650-8e9e7354b9a7?w=400&h=400&fit=crop',
  '🕯️',
  4.7,
  445,
  'OFERTA',
  'Velas aromáticas con cera de soja y aceites esenciales',
  'Velas aromáticas naturales hechas con cera de soja y aceites esenciales puros. Quema limpia y duradera.',
  ARRAY['Cera de Soja', 'Aceites Esenciales Puros', 'Mecha de Algodón', 'Sin Parafina', 'Fragancia Natural'],
  ARRAY['Quema limpia', 'Duradera', 'Aroma natural', 'Eco-friendly', 'Relajante'],
  '200g',
  true,
  'HC-003'
),
-- Producto 18: Spray Ambiental
(
  'Spray Ambiental Natural',
  'home-care',
  14.99,
  NULL,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  '🌿',
  4.5,
  278,
  NULL,
  'Spray ambiental con aceites esenciales para purificar el aire',
  'Spray ambiental natural que purifica y refresca el aire del hogar. Formulado con aceites esenciales puros.',
  ARRAY['Agua Destilada', 'Aceites Esenciales', 'Alcohol de Cereales', 'Extractos Naturales', 'Sin Químicos'],
  ARRAY['Purifica el aire', 'Aroma natural', 'Fácil de usar', 'Eco-friendly', 'Múltiples fragancias'],
  '250ml',
  true,
  'HC-004'
);

-- Verificar que los productos se insertaron correctamente
SELECT 
  COUNT(*) as total_productos,
  category,
  COUNT(*) as cantidad_por_categoria
FROM products
GROUP BY category
ORDER BY category;

