-- Script SQL para insertar ingredientes de cosmética natural en la tabla inventory_items
-- Incluye plantas, vitaminas, enzimas y otros ingredientes comunes de cosmética natural

-- ============================================
-- PLANTAS Y EXTRACTOS BOTÁNICOS
-- ============================================

-- Aloe Vera
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Aloe Vera', 'ING-PLANT-001', 'Planta', 'L', 'Extracto de Aloe Vera para propiedades hidratantes y calmantes', 5, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Gel de Aloe Vera', 'ING-PLANT-002', 'Planta', 'L', 'Gel puro de Aloe Vera', 5, 0, 0, true, true);

-- Calendula
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Caléndula', 'ING-PLANT-003', 'Planta', 'L', 'Extracto de Caléndula para propiedades antiinflamatorias', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Caléndula', 'ING-PLANT-004', 'Planta', 'L', 'Aceite de Caléndula macerado', 3, 0, 0, true, true);

-- Chamomile
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Manzanilla', 'ING-PLANT-005', 'Planta', 'L', 'Extracto de Manzanilla para propiedades calmantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite Esencial de Manzanilla', 'ING-PLANT-006', 'Planta', 'mL', 'Aceite esencial de Manzanilla', 100, 0, 0, true, true);

-- Lavender
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Lavanda', 'ING-PLANT-007', 'Planta', 'L', 'Extracto de Lavanda para propiedades relajantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite Esencial de Lavanda', 'ING-PLANT-008', 'Planta', 'mL', 'Aceite esencial de Lavanda', 100, 0, 0, true, true);

-- Rose
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Rosa', 'ING-PLANT-009', 'Planta', 'L', 'Extracto de Rosa para propiedades hidratantes y antioxidantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Rosa Mosqueta', 'ING-PLANT-010', 'Planta', 'L', 'Aceite de Rosa Mosqueta rico en vitamina C', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Agua de Rosas', 'ING-PLANT-011', 'Planta', 'L', 'Agua de Rosas destilada', 5, 0, 0, true, true);

-- Green Tea
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Té Verde', 'ING-PLANT-012', 'Planta', 'L', 'Extracto de Té Verde rico en antioxidantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Polvo de Té Verde', 'ING-PLANT-013', 'Planta', 'kg', 'Polvo de Té Verde matcha', 1, 0, 0, true, true);

-- Arnica
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Árnica', 'ING-PLANT-014', 'Planta', 'L', 'Extracto de Árnica para propiedades antiinflamatorias', 2, 0, 0, true, true);

-- Witch Hazel
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Hamamelis', 'ING-PLANT-015', 'Planta', 'L', 'Extracto de Hamamelis para propiedades astringentes', 3, 0, 0, true, true);

-- Echinacea
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Equinácea', 'ING-PLANT-016', 'Planta', 'L', 'Extracto de Equinácea para propiedades inmunoestimulantes', 2, 0, 0, true, true);

-- Ginkgo Biloba
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Ginkgo Biloba', 'ING-PLANT-017', 'Planta', 'L', 'Extracto de Ginkgo Biloba rico en antioxidantes', 2, 0, 0, true, true);

-- Ginseng
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Ginseng', 'ING-PLANT-018', 'Planta', 'L', 'Extracto de Ginseng para propiedades revitalizantes', 2, 0, 0, true, true);

-- Gotu Kola
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Centella Asiática', 'ING-PLANT-019', 'Planta', 'L', 'Extracto de Centella Asiática para propiedades regeneradoras', 2, 0, 0, true, true);

-- Comfrey
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Consuelda', 'ING-PLANT-020', 'Planta', 'L', 'Extracto de Consuelda para propiedades cicatrizantes', 2, 0, 0, true, true);

-- Burdock Root
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Raíz de Bardana', 'ING-PLANT-021', 'Planta', 'L', 'Extracto de Raíz de Bardana para propiedades purificantes', 2, 0, 0, true, true);

-- Dandelion
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Diente de León', 'ING-PLANT-022', 'Planta', 'L', 'Extracto de Diente de León para propiedades depurativas', 2, 0, 0, true, true);

-- Horsetail
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Cola de Caballo', 'ING-PLANT-023', 'Planta', 'L', 'Extracto de Cola de Caballo rico en silicio', 2, 0, 0, true, true);

-- Nettle
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Ortiga', 'ING-PLANT-024', 'Planta', 'L', 'Extracto de Ortiga para propiedades nutritivas', 2, 0, 0, true, true);

-- Rosemary
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Romero', 'ING-PLANT-025', 'Planta', 'L', 'Extracto de Romero para propiedades antioxidantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite Esencial de Romero', 'ING-PLANT-026', 'Planta', 'mL', 'Aceite esencial de Romero', 100, 0, 0, true, true);

-- Sage
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Salvia', 'ING-PLANT-027', 'Planta', 'L', 'Extracto de Salvia para propiedades astringentes', 2, 0, 0, true, true);

-- Thyme
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Tomillo', 'ING-PLANT-028', 'Planta', 'L', 'Extracto de Tomillo para propiedades antisépticas', 2, 0, 0, true, true);

-- Tea Tree
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite Esencial de Árbol de Té', 'ING-PLANT-029', 'Planta', 'mL', 'Aceite esencial de Árbol de Té para propiedades antibacterianas', 100, 0, 0, true, true);

-- Eucalyptus
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite Esencial de Eucalipto', 'ING-PLANT-030', 'Planta', 'mL', 'Aceite esencial de Eucalipto', 100, 0, 0, true, true);

-- Peppermint
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Menta', 'ING-PLANT-031', 'Planta', 'L', 'Extracto de Menta para propiedades refrescantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite Esencial de Menta', 'ING-PLANT-032', 'Planta', 'mL', 'Aceite esencial de Menta', 100, 0, 0, true, true);

-- Jojoba
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Jojoba', 'ING-PLANT-033', 'Planta', 'L', 'Aceite de Jojoba similar al sebo natural', 5, 0, 0, true, true);

-- Argan
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Argán', 'ING-PLANT-034', 'Planta', 'L', 'Aceite de Argán rico en vitamina E', 3, 0, 0, true, true);

-- Coconut
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Coco', 'ING-PLANT-035', 'Planta', 'L', 'Aceite de Coco virgen', 5, 0, 0, true, true);

-- Olive
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Oliva', 'ING-PLANT-036', 'Planta', 'L', 'Aceite de Oliva extra virgen', 5, 0, 0, true, true);

-- Sweet Almond
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Almendras Dulces', 'ING-PLANT-037', 'Planta', 'L', 'Aceite de Almendras Dulces', 5, 0, 0, true, true);

-- Avocado
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Aguacate', 'ING-PLANT-038', 'Planta', 'L', 'Aceite de Aguacate rico en ácidos grasos', 3, 0, 0, true, true);

-- Shea Butter
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Manteca de Karité', 'ING-PLANT-039', 'Planta', 'kg', 'Manteca de Karité sin refinar', 5, 0, 0, true, true);

-- Cocoa Butter
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Manteca de Cacao', 'ING-PLANT-040', 'Planta', 'kg', 'Manteca de Cacao', 5, 0, 0, true, true);

-- Mango Butter
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Manteca de Mango', 'ING-PLANT-041', 'Planta', 'kg', 'Manteca de Mango', 3, 0, 0, true, true);

-- ============================================
-- VITAMINAS
-- ============================================

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina A (Retinol)', 'ING-VIT-001', 'Vitamina', 'g', 'Vitamina A en forma de retinol para propiedades anti-envejecimiento', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina B3 (Niacinamida)', 'ING-VIT-002', 'Vitamina', 'g', 'Niacinamida para propiedades antiinflamatorias y regulación de sebo', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina B5 (Pantotenol)', 'ING-VIT-003', 'Vitamina', 'g', 'Pantotenol para propiedades hidratantes y cicatrizantes', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina C (Ácido Ascórbico)', 'ING-VIT-004', 'Vitamina', 'g', 'Ácido ascórbico para propiedades antioxidantes y iluminadoras', 300, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina C (Fosfato de Magnesio Ascorbilo)', 'ING-VIT-005', 'Vitamina', 'g', 'Vitamina C estabilizada para uso cosmético', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina E (Tocoferol)', 'ING-VIT-006', 'Vitamina', 'g', 'Tocoferol para propiedades antioxidantes y protectoras', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Vitamina E', 'ING-VIT-007', 'Vitamina', 'L', 'Aceite de Vitamina E', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Vitamina K', 'ING-VIT-008', 'Vitamina', 'g', 'Vitamina K para propiedades antiinflamatorias', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Provitamina B5 (D-Pantenol)', 'ING-VIT-009', 'Vitamina', 'g', 'D-Pantenol para propiedades hidratantes', 200, 0, 0, true, true);

-- ============================================
-- ENZIMAS
-- ============================================

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Enzima Papaína', 'ING-ENZ-001', 'Enzima', 'g', 'Enzima de Papaya para exfoliación enzimática suave', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Enzima Bromelina', 'ING-ENZ-002', 'Enzima', 'g', 'Enzima de Piña para exfoliación enzimática', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Enzima Proteasa', 'ING-ENZ-003', 'Enzima', 'g', 'Enzima proteasa para descomposición de proteínas', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Enzima Lipasa', 'ING-ENZ-004', 'Enzima', 'g', 'Enzima lipasa para descomposición de lípidos', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Superóxido Dismutasa (SOD)', 'ING-ENZ-005', 'Enzima', 'g', 'Enzima antioxidante Superóxido Dismutasa', 50, 0, 0, true, true);

-- ============================================
-- OTROS INGREDIENTES NATURALES
-- ============================================

-- Ácidos
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Ácido Láctico', 'ING-ACID-001', 'Ácido', 'L', 'Ácido láctico para exfoliación química suave', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Ácido Glicólico', 'ING-ACID-002', 'Ácido', 'L', 'Ácido glicólico para exfoliación química', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Ácido Salicílico', 'ING-ACID-003', 'Ácido', 'g', 'Ácido salicílico para propiedades exfoliantes y antiacné', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Ácido Hialurónico', 'ING-ACID-004', 'Ácido', 'g', 'Ácido hialurónico para propiedades hidratantes', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Ácido Cítrico', 'ING-ACID-005', 'Ácido', 'g', 'Ácido cítrico para ajuste de pH', 500, 0, 0, true, true);

-- Arcillas
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Arcilla de Caolín', 'ING-CLAY-001', 'Arcilla', 'kg', 'Arcilla blanca de caolín para mascarillas', 5, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Arcilla de Bentonita', 'ING-CLAY-002', 'Arcilla', 'kg', 'Arcilla de bentonita para propiedades purificantes', 5, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Arcilla Verde Francesa', 'ING-CLAY-003', 'Arcilla', 'kg', 'Arcilla verde francesa para mascarillas', 3, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Arcilla de Rhassoul', 'ING-CLAY-004', 'Arcilla', 'kg', 'Arcilla de Rhassoul para limpieza profunda', 3, 0, 0, false, true);

-- Ceras
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Cera de Abeja', 'ING-WAX-001', 'Cera', 'kg', 'Cera de abeja natural', 5, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Cera de Candelilla', 'ING-WAX-002', 'Cera', 'kg', 'Cera de Candelilla vegetal', 3, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Cera de Carnaúba', 'ING-WAX-003', 'Cera', 'kg', 'Cera de Carnaúba', 3, 0, 0, false, true);

-- Mantecas Adicionales
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Manteca de Kokum', 'ING-BUTTER-001', 'Manteca', 'kg', 'Manteca de Kokum', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Manteca de Cupuaçu', 'ING-BUTTER-002', 'Manteca', 'kg', 'Manteca de Cupuaçu', 2, 0, 0, true, true);

-- Aceites Adicionales
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Semilla de Uva', 'ING-OIL-001', 'Aceite', 'L', 'Aceite de Semilla de Uva ligero', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Girasol', 'ING-OIL-002', 'Aceite', 'L', 'Aceite de Girasol', 5, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Sésamo', 'ING-OIL-003', 'Aceite', 'L', 'Aceite de Sésamo', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Onagra', 'ING-OIL-004', 'Aceite', 'L', 'Aceite de Onagra rico en GLA', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Borraja', 'ING-OIL-005', 'Aceite', 'L', 'Aceite de Borraja rico en GLA', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Tamanu', 'ING-OIL-006', 'Aceite', 'L', 'Aceite de Tamanu para propiedades regeneradoras', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Aceite de Espino Amarillo', 'ING-OIL-007', 'Aceite', 'L', 'Aceite de Espino Amarillo rico en omega-7', 2, 0, 0, true, true);

-- Extractos y Polvos
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Avena Coloidal', 'ING-EXT-001', 'Extracto', 'kg', 'Avena coloidal para propiedades calmantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Raíz de Regaliz', 'ING-EXT-002', 'Extracto', 'L', 'Extracto de Raíz de Regaliz para propiedades iluminadoras', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Cúrcuma', 'ING-EXT-003', 'Extracto', 'L', 'Extracto de Cúrcuma para propiedades antiinflamatorias', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Ginseng', 'ING-EXT-004', 'Extracto', 'L', 'Extracto de Ginseng para propiedades revitalizantes', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Polvo de Manzanilla', 'ING-EXT-005', 'Extracto', 'kg', 'Polvo de Manzanilla', 1, 0, 0, true, true);

-- Proteínas y Péptidos
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Colágeno Hidrolizado', 'ING-PROT-001', 'Proteína', 'g', 'Colágeno hidrolizado para propiedades anti-envejecimiento', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Proteína de Seda', 'ING-PROT-002', 'Proteína', 'g', 'Proteína de seda para propiedades suavizantes', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Proteína de Trigo', 'ING-PROT-003', 'Proteína', 'g', 'Proteína de trigo para propiedades hidratantes', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Complejo de Péptidos', 'ING-PROT-004', 'Proteína', 'g', 'Complejo de péptidos para propiedades anti-envejecimiento', 100, 0, 0, true, true);

-- Minerales
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Óxido de Zinc', 'ING-MIN-001', 'Mineral', 'g', 'Óxido de zinc para protección solar física', 500, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Dióxido de Titanio', 'ING-MIN-002', 'Mineral', 'g', 'Dióxido de titanio para protección solar física', 500, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Sal del Mar Muerto', 'ING-MIN-003', 'Mineral', 'kg', 'Sal del Mar Muerto rica en minerales', 5, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Sal Rosa del Himalaya', 'ING-MIN-004', 'Mineral', 'kg', 'Sal rosa del Himalaya', 3, 0, 0, false, true);

-- Conservantes Naturales
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Semilla de Pomelo', 'ING-PRES-001', 'Conservante', 'L', 'Extracto de semilla de pomelo como conservante natural', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Filtrado de Fermento de Raíz de Rábano', 'ING-PRES-002', 'Conservante', 'L', 'Filtrado de fermento de raíz de rábano como conservante natural', 2, 0, 0, true, true);

-- Emulsificantes Naturales
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Lecitina', 'ING-EMUL-001', 'Emulsificante', 'g', 'Lecitina como emulsionante natural', 200, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Alcohol Cetearílico', 'ING-EMUL-002', 'Emulsificante', 'g', 'Alcohol cetearílico como emulsionante y espesante', 500, 0, 0, false, true);

-- Humectantes
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Glicerina', 'ING-HUM-001', 'Humectante', 'L', 'Glicerina vegetal como humectante', 10, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Sorbitol', 'ING-HUM-002', 'Humectante', 'kg', 'Sorbitol como humectante natural', 5, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Miel', 'ING-HUM-003', 'Humectante', 'kg', 'Miel pura como humectante natural', 5, 0, 0, true, true);

-- Exfoliantes
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Microesferas de Jojoba', 'ING-EXF-001', 'Exfoliante', 'kg', 'Microesferas de jojoba biodegradables', 3, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Cristales de Azúcar', 'ING-EXF-002', 'Exfoliante', 'kg', 'Cristales de azúcar para exfoliación', 5, 0, 0, false, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Semillas de Albaricoque Molidas', 'ING-EXF-003', 'Exfoliante', 'kg', 'Semillas de albaricoque molidas', 2, 0, 0, false, true);

-- Antioxidantes
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Coenzima Q10', 'ING-ANT-001', 'Antioxidante', 'g', 'Coenzima Q10 para propiedades antioxidantes', 100, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Resveratrol', 'ING-ANT-002', 'Antioxidante', 'g', 'Resveratrol para propiedades antioxidantes', 50, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Ácido Ferúlico', 'ING-ANT-003', 'Antioxidante', 'g', 'Ácido ferúlico para potenciar antioxidantes', 100, 0, 0, true, true);

-- Botánicos Adicionales
INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Agua de Hamamelis', 'ING-BOT-001', 'Botánico', 'L', 'Agua de Hamamelis destilada', 5, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Pepino', 'ING-BOT-002', 'Botánico', 'L', 'Extracto de Pepino para propiedades refrescantes', 3, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Ginkgo Biloba', 'ING-BOT-003', 'Botánico', 'L', 'Extracto de Ginkgo Biloba', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Té Blanco', 'ING-BOT-004', 'Botánico', 'L', 'Extracto de Té Blanco rico en antioxidantes', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Granada', 'ING-BOT-005', 'Botánico', 'L', 'Extracto de Granada rico en antioxidantes', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Semilla de Uva', 'ING-BOT-006', 'Botánico', 'L', 'Extracto de Semilla de Uva rico en polifenoles', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Arándano', 'ING-BOT-007', 'Botánico', 'L', 'Extracto de Arándano para propiedades antioxidantes', 2, 0, 0, true, true);

INSERT INTO inventory_items (name, sku, category, unit, description, min_stock, current_stock, cost_per_unit, expiry_tracking, active)
VALUES ('Extracto de Cardo Mariano', 'ING-BOT-008', 'Botánico', 'L', 'Extracto de Cardo Mariano', 2, 0, 0, true, true);

