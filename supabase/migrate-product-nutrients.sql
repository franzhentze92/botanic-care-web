-- Script de migración para asociar ingredientes de productos con nutrientes
-- Este script busca coincidencias entre los ingredientes de los productos y los nutrientes en la base de datos
-- Ejecuta este script después de haber ejecutado nutrients-schema.sql e insert-nutrients.sql

-- Función auxiliar para buscar coincidencias (usaremos un enfoque con CTEs)

-- 1. Asociar "Vitamina E" -> Vitamina E (Tocoferol)
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Vitamina E (Tocoferol)'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%vitamina e%'
       OR LOWER(ingredient) LIKE '%tocoferol%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 2. Asociar "Vitamina C" -> Vitamina C (Ácido Ascórbico)
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Vitamina C (Ácido Ascórbico)'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%vitamina c%'
       OR LOWER(ingredient) LIKE '%ácido ascórbico%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 3. Asociar "Vitamina A" o "Retinol" -> Vitamina A (Retinol)
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Vitamina A (Retinol)'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%vitamina a%'
       OR LOWER(ingredient) LIKE '%retinol%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 4. Asociar "Vitamina K" -> Vitamina K
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Vitamina K'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%vitamina k%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 5. Asociar "Ácido Hialurónico" -> Ácido Hialurónico
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Ácido Hialurónico'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%ácido hialurónico%'
       OR LOWER(ingredient) LIKE '%hialurónico%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 6. Asociar "Zinc" u "Óxido de Zinc" -> Zinc
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Zinc'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%zinc%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 7. Asociar aceites con Omega-9
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Omega-9'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%aceite de oliva%'
       OR LOWER(ingredient) LIKE '%aceite de aguacate%'
       OR LOWER(ingredient) LIKE '%aceite de almendras%'
       OR LOWER(ingredient) LIKE '%aceite de jojoba%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 8. Asociar aceites con Omega-3
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Omega-3'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%aceite de linaza%'
       OR LOWER(ingredient) LIKE '%aceite de chía%'
       OR LOWER(ingredient) LIKE '%aceite de cáñamo%'
       OR LOWER(ingredient) LIKE '%aceite de rosa mosqueta%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 9. Asociar aceites con Omega-6
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Omega-6'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%aceite de girasol%'
       OR LOWER(ingredient) LIKE '%aceite de cártamo%'
       OR LOWER(ingredient) LIKE '%aceite de borraja%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 10. Asociar "Té Verde" o "Extracto de Té Verde" -> Polifenoles
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Polifenoles'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%té verde%'
       OR LOWER(ingredient) LIKE '%te verde%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 11. Asociar "Té Verde" -> Flavonoides (también)
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Flavonoides'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%té verde%'
       OR LOWER(ingredient) LIKE '%te verde%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 12. Asociar "Glicerina" -> Glicina (aminoácido relacionado)
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Glicina'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%glicerina%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 13. Asociar "Colágeno" o "Péptidos" -> Colágeno
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Colágeno'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%colágeno%'
       OR LOWER(ingredient) LIKE '%peptidos%'
       OR LOWER(ingredient) LIKE '%péptidos%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 14. Asociar "Aceite de Coco" -> Omega-9 (también tiene Omega-9, aunque principalmente es ácido láurico)
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Omega-9'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%aceite de coco%'
  )
  AND NOT EXISTS (
    SELECT 1 FROM product_nutrients pn 
    WHERE pn.product_id = p.id AND pn.nutrient_id = n.id
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- 15. Asociar "Arcilla" -> Magnesio
INSERT INTO product_nutrients (product_id, nutrient_id)
SELECT DISTINCT p.id, n.id
FROM products p
CROSS JOIN nutrients n
WHERE n.name = 'Magnesio'
  AND EXISTS (
    SELECT 1 
    FROM unnest(p.ingredients) AS ingredient 
    WHERE LOWER(ingredient) LIKE '%arcilla%'
  )
ON CONFLICT (product_id, nutrient_id) DO NOTHING;

-- Verificar los resultados
SELECT 
  p.name as producto,
  COUNT(pn.nutrient_id) as nutrientes_asociados,
  STRING_AGG(n.name, ', ' ORDER BY n.name) as nutrientes
FROM products p
LEFT JOIN product_nutrients pn ON p.id = pn.product_id
LEFT JOIN nutrients n ON pn.nutrient_id = n.id
GROUP BY p.id, p.name
ORDER BY nutrientes_asociados DESC, p.name;

-- Estadísticas generales
SELECT 
  COUNT(DISTINCT pn.product_id) as productos_con_nutrientes,
  COUNT(DISTINCT pn.nutrient_id) as nutrientes_utilizados,
  COUNT(*) as total_asociaciones
FROM product_nutrients pn;

