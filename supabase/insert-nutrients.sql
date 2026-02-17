-- Script para insertar categorías y nutrientes en la base de datos
-- Ejecuta este script después de crear el schema de nutrientes

-- Insertar categorías de nutrientes
INSERT INTO nutrient_categories (id, name, description, icon) VALUES
('vitamins', 'Vitaminas', 'Las vitaminas son compuestos orgánicos esenciales que la piel necesita para funcionar correctamente. En cosmética natural, las vitaminas actúan como antioxidantes, promueven la regeneración celular y protegen contra los daños ambientales.', 'Sun'),
('proteins', 'Proteínas', 'Las proteínas son los componentes básicos de la piel. En productos cosméticos naturales, las proteínas vegetales ayudan a fortalecer la estructura de la piel y mantener su elasticidad.', 'Bean'),
('minerals', 'Minerales', 'Los minerales son elementos inorgánicos esenciales que regulan las funciones de la piel, mantienen el equilibrio de humedad y proporcionan protección.', 'Sparkles'),
('fatty-acids', 'Ácidos Grasos', 'Los ácidos grasos son componentes esenciales de las membranas celulares y ayudan a mantener la barrera protectora de la piel, previniendo la pérdida de humedad.', 'Droplets'),
('antioxidants', 'Antioxidantes', 'Los antioxidantes protegen la piel del daño causado por los radicales libres, el estrés oxidativo y factores ambientales como la contaminación y la radiación UV.', 'Shield'),
('amino-acids', 'Aminoácidos', 'Los aminoácidos son los componentes básicos de las proteínas. En cosmética, ayudan a hidratar, reparar y mantener la salud de la piel.', 'Zap'),
('enzymes', 'Enzimas', 'Las enzimas naturales ayudan en la renovación celular, exfoliación suave y mejoran la textura de la piel sin irritación.', 'Flower2')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  updated_at = NOW();

-- Insertar nutrientes - Vitaminas
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Vitamina A (Retinol)', 'vitamins', 'Esencial para la regeneración celular y la producción de colágeno. Ayuda a mejorar la textura de la piel, reducir la apariencia de líneas finas y tratar el acné. Promueve la renovación celular.',
 ARRAY['Regeneración celular', 'Reducción de arrugas', 'Mejora de la textura', 'Tratamiento del acné', 'Producción de colágeno', 'Renovación celular', 'Unificación del tono'],
 ARRAY['Zanahoria', 'Espinaca', 'Aceite de rosa mosqueta', 'Aceite de hígado de bacalao', 'Batata', 'Kale', 'Hígado', 'Huevos']),

('Beta-Caroteno (Precursor Vitamina A)', 'vitamins', 'Precursor de la vitamina A que el cuerpo convierte según necesita. Proporciona protección antioxidante y puede dar un tono saludable a la piel.',
 ARRAY['Conversión a vitamina A', 'Protección antioxidante', 'Tono saludable', 'Protección solar natural', 'Anti-envejecimiento'],
 ARRAY['Zanahoria', 'Batata', 'Calabaza', 'Mango', 'Melón', 'Albaricoque', 'Espinaca']),

('Vitamina C (Ácido Ascórbico)', 'vitamins', 'Poderoso antioxidante hidrosoluble que protege contra los radicales libres, estimula la producción de colágeno, ayuda a iluminar la piel y reduce las manchas. Es esencial para la síntesis de colágeno.',
 ARRAY['Producción de colágeno', 'Protección antioxidante', 'Iluminación de la piel', 'Reducción de manchas', 'Protección UV', 'Anti-envejecimiento', 'Unificación del tono'],
 ARRAY['Rosa mosqueta', 'Acerola', 'Camu camu', 'Kiwi', 'Fresas', 'Cítricos', 'Guayaba', 'Pimiento rojo', 'Brócoli']),

('Vitamina E (Tocoferol)', 'vitamins', 'Antioxidante liposoluble natural que protege la piel del daño oxidativo, ayuda a mantener la humedad, promueve la cicatrización y trabaja en sinergia con la vitamina C.',
 ARRAY['Protección antioxidante', 'Hidratación profunda', 'Cicatrización', 'Antiinflamatorio', 'Protección de membranas', 'Sinergia con vitamina C', 'Suavidad'],
 ARRAY['Aceite de germen de trigo', 'Aceite de girasol', 'Aceite de argán', 'Almendras', 'Aguacate', 'Nueces', 'Espinaca']),

('Vitamina K', 'vitamins', 'Ayuda a reducir la apariencia de círculos oscuros y moretones, mejorando la circulación y promoviendo la cicatrización. También ayuda en la coagulación sanguínea.',
 ARRAY['Reducción de círculos oscuros', 'Mejora de circulación', 'Cicatrización', 'Coagulación', 'Reducción de moretones', 'Unificación del tono'],
 ARRAY['Espinaca', 'Col rizada', 'Brócoli', 'Aceite de oliva', 'Hojas verdes', 'Repollo', 'Perejil']),

('Vitamina B1 (Tiamina)', 'vitamins', 'Vitamina del complejo B que ayuda en el metabolismo celular y la producción de energía. Contribuye a la salud general de la piel y puede ayudar en la cicatrización.',
 ARRAY['Metabolismo celular', 'Producción de energía', 'Salud general', 'Cicatrización', 'Función celular'],
 ARRAY['Granos enteros', 'Legumbres', 'Nueces', 'Semillas', 'Levadura nutricional']),

('Vitamina B2 (Riboflavina)', 'vitamins', 'Vitamina del complejo B esencial para la producción de energía celular y el mantenimiento de la salud de la piel. Ayuda en la regeneración celular.',
 ARRAY['Producción de energía', 'Regeneración celular', 'Salud de la piel', 'Metabolismo', 'Mantenimiento celular'],
 ARRAY['Almendras', 'Espinaca', 'Brócoli', 'Huevos', 'Productos lácteos', 'Granos enteros']),

('Vitamina B3 (Niacinamida)', 'vitamins', 'Vitamina del complejo B extremadamente beneficiosa para la piel. Reduce la inflamación, minimiza los poros, mejora la barrera cutánea y unifica el tono. También puede reducir la producción de sebo.',
 ARRAY['Reducción de inflamación', 'Minimización de poros', 'Mejora de barrera cutánea', 'Unificación del tono', 'Control de sebo', 'Reducción de manchas', 'Anti-envejecimiento'],
 ARRAY['Levadura nutricional', 'Cacahuetes', 'Setas', 'Aguacate', 'Guisantes verdes', 'Arroz integral']),

('Vitamina B5 (Ácido Pantoténico)', 'vitamins', 'Vitamina del complejo B esencial para la síntesis de ácidos grasos y colesterol. Ayuda en la cicatrización de heridas, hidratación y mejora la barrera cutánea.',
 ARRAY['Cicatrización', 'Hidratación', 'Mejora de barrera', 'Síntesis de lípidos', 'Reparación', 'Antiinflamatorio'],
 ARRAY['Aguacate', 'Brócoli', 'Coliflor', 'Setas', 'Camote', 'Legumbres', 'Yema de huevo']),

('Vitamina B6 (Piridoxina)', 'vitamins', 'Vitamina del complejo B que participa en el metabolismo de proteínas y la síntesis de neurotransmisores. Puede ayudar a reducir la inflamación y mejorar la apariencia de la piel.',
 ARRAY['Metabolismo de proteínas', 'Reducción de inflamación', 'Mejora de apariencia', 'Síntesis de neurotransmisores', 'Salud de la piel'],
 ARRAY['Garbanzos', 'Atún', 'Salmón', 'Pechuga de pollo', 'Plátano', 'Papas', 'Semillas de girasol']),

('Vitamina B7 (Biotina)', 'vitamins', 'Vitamina del complejo B esencial para el metabolismo de grasas, carbohidratos y proteínas. Contribuye a la salud de la piel, cabello y uñas. Ayuda en la síntesis de queratina.',
 ARRAY['Metabolismo', 'Salud de la piel', 'Síntesis de queratina', 'Fortaleza', 'Hidratación', 'Funcionalidad celular'],
 ARRAY['Almendras', 'Nueces', 'Yema de huevo', 'Salmón', 'Aguacate', 'Batata', 'Coliflor']),

('Vitamina B9 (Ácido Fólico)', 'vitamins', 'Vitamina del complejo B esencial para la síntesis y reparación del ADN. Ayuda en la renovación celular, cicatrización y puede mejorar la apariencia de la piel.',
 ARRAY['Síntesis de ADN', 'Renovación celular', 'Cicatrización', 'Mejora de apariencia', 'Reparación celular', 'Salud general'],
 ARRAY['Espinaca', 'Brócoli', 'Col rizada', 'Legumbres', 'Aguacate', 'Cítricos', 'Granos fortificados']),

('Vitamina B12 (Cobalamina)', 'vitamins', 'Vitamina del complejo B esencial para la producción de glóbulos rojos y la función nerviosa. Contribuye a la salud general de la piel y puede mejorar el tono.',
 ARRAY['Producción de glóbulos rojos', 'Salud general', 'Mejora del tono', 'Función nerviosa', 'Oxigenación celular'],
 ARRAY['Algas', 'Levadura nutricional', 'Cereales fortificados', 'Leche de origen vegetal fortificada', 'Productos lácteos']),

('Vitamina D', 'vitamins', 'Vitamina liposoluble esencial para la salud ósea y celular. Ayuda en la regeneración celular, puede mejorar la apariencia de la piel y tiene propiedades antiinflamatorias.',
 ARRAY['Regeneración celular', 'Mejora de apariencia', 'Antiinflamatorio', 'Salud celular', 'Función inmunológica', 'Bienestar general'],
 ARRAY['Exposición solar', 'Hongos expuestos a UV', 'Leche fortificada', 'Yema de huevo', 'Aceite de hígado de bacalao']),

('Colina', 'vitamins', 'Nutriente esencial del complejo B que es importante para la estructura celular y la función de las membranas. Ayuda en la síntesis de lípidos y puede mejorar la barrera cutánea.',
 ARRAY['Estructura celular', 'Función de membranas', 'Síntesis de lípidos', 'Mejora de barrera', 'Hidratación', 'Salud celular'],
 ARRAY['Huevos', 'Brócoli', 'Coliflor', 'Tofu', 'Quinoa', 'Aguacate', 'Maní'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Insertar nutrientes - Proteínas
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Colágeno Tipo I', 'proteins', 'Proteína estructural principal de la piel (90% del colágeno en la piel). Proporciona firmeza, estructura y resistencia. Aunque el colágeno tópico no penetra profundamente, los péptidos vegetales pueden estimular su producción endógena.',
 ARRAY['Firmeza de la piel', 'Estructura', 'Resistencia', 'Reducción de arrugas', 'Apariencia juvenil', 'Soporte de la piel'],
 ARRAY['Péptidos de colágeno vegetal', 'Péptidos de arroz', 'Proteína de trigo hidrolizada', 'Aminoácidos esenciales', 'Extractos de plantas']),

('Colágeno Tipo III', 'proteins', 'Tipo de colágeno que se encuentra en la piel joven y elástica. Trabaja junto con el colágeno tipo I para proporcionar flexibilidad y estructura. Los péptidos pueden estimular su producción.',
 ARRAY['Elasticidad', 'Flexibilidad', 'Estructura', 'Piel joven', 'Reducción de arrugas', 'Soporte'],
 ARRAY['Péptidos de colágeno vegetal', 'Péptidos de soja', 'Extractos de plantas', 'Aminoácidos']),

('Queratina', 'proteins', 'Proteína estructural fibrosa que forma la capa externa de la piel (estrato córneo) y proporciona protección, resistencia y barrera contra factores externos. Fortalece la estructura cutánea.',
 ARRAY['Fortalecimiento de la piel', 'Protección', 'Barrera cutánea', 'Textura mejorada', 'Resistencia', 'Hidratación'],
 ARRAY['Proteína de trigo', 'Proteína de soja', 'Queratina vegetal', 'Extractos de plantas', 'Aminoácidos azufrados']),

('Elastina', 'proteins', 'Proteína elástica que permite que la piel recupere su forma después de estirarse o comprimirse. Mantiene la flexibilidad y elasticidad natural de la piel.',
 ARRAY['Flexibilidad', 'Recuperación de elasticidad', 'Apariencia joven', 'Elasticidad', 'Resistencia al estiramiento', 'Firmeza'],
 ARRAY['Péptidos vegetales', 'Proteínas de origen vegetal', 'Extractos de plantas', 'Aminoácidos específicos']),

('Fibrilina', 'proteins', 'Proteína estructural que proporciona soporte a las fibras elásticas y ayuda en la organización del tejido conectivo. Es esencial para la estructura de la piel.',
 ARRAY['Soporte estructural', 'Organización del tejido', 'Integridad de la piel', 'Estructura', 'Firmeza'],
 ARRAY['Extractos vegetales', 'Péptidos', 'Aminoácidos']),

('Fibronectina', 'proteins', 'Proteína de adhesión celular que ayuda en la cicatrización de heridas, adhesión celular y organización del tejido. Promueve la reparación de la piel.',
 ARRAY['Cicatrización', 'Adhesión celular', 'Reparación', 'Organización del tejido', 'Regeneración'],
 ARRAY['Extractos vegetales', 'Péptidos', 'Proteínas vegetales']),

('Laminina', 'proteins', 'Proteína de la membrana basal que proporciona estructura y soporte a las capas de la piel. Es importante para la integridad y función de la barrera cutánea.',
 ARRAY['Estructura de la membrana', 'Soporte', 'Integridad de la barrera', 'Función celular', 'Salud de la piel'],
 ARRAY['Extractos vegetales', 'Péptidos', 'Proteínas naturales']),

('Ceramidas', 'proteins', 'Lípidos similares a ceras que forman parte de la barrera cutánea. Aunque técnicamente son lípidos, actúan como componentes estructurales esenciales que previenen la pérdida de humedad.',
 ARRAY['Barrera cutánea', 'Prevención de pérdida de humedad', 'Hidratación', 'Protección', 'Integridad de la piel', 'Suavidad'],
 ARRAY['Aceites vegetales', 'Extractos de plantas', 'Aceite de girasol', 'Aceite de cáñamo', 'Arroz', 'Trigo']),

('Péptidos de Arroz', 'proteins', 'Péptidos derivados de la proteína de arroz que tienen propiedades hidratantes y pueden estimular la producción de colágeno. Son especialmente beneficiosos para pieles sensibles.',
 ARRAY['Hidratación', 'Estimulación de colágeno', 'Pieles sensibles', 'Suavidad', 'Textura mejorada', 'Protección'],
 ARRAY['Arroz', 'Proteína de arroz hidrolizada', 'Extractos de arroz']),

('Péptidos de Soya', 'proteins', 'Péptidos derivados de la proteína de soja que proporcionan hidratación, mejoran la textura de la piel y pueden tener propiedades antioxidantes.',
 ARRAY['Hidratación', 'Mejora de textura', 'Protección antioxidante', 'Firmeza', 'Elasticidad', 'Nutrición'],
 ARRAY['Soja', 'Proteína de soja hidrolizada', 'Extractos de soja', 'Tofu']),

('Péptidos de Trigo', 'proteins', 'Péptidos derivados del trigo que proporcionan hidratación y pueden ayudar a mejorar la barrera cutánea. Son útiles para pieles secas.',
 ARRAY['Hidratación', 'Mejora de barrera', 'Pieles secas', 'Protección', 'Nutrición', 'Suavidad'],
 ARRAY['Trigo', 'Proteína de trigo hidrolizada', 'Germen de trigo']),

('Proteína de Cáñamo', 'proteins', 'Proteína completa derivada del cáñamo que proporciona todos los aminoácidos esenciales. Hidrata, nutre y mejora la textura de la piel.',
 ARRAY['Hidratación', 'Nutrición completa', 'Mejora de textura', 'Aminoácidos esenciales', 'Reparación', 'Firmeza'],
 ARRAY['Cáñamo', 'Proteína de cáñamo', 'Semillas de cáñamo', 'Aceite de cáñamo']),

('Proteína de Chícharo', 'proteins', 'Proteína vegetal rica en aminoácidos que hidrata y puede ayudar a mejorar la elasticidad de la piel. Es especialmente beneficiosa para pieles sensibles.',
 ARRAY['Hidratación', 'Mejora de elasticidad', 'Pieles sensibles', 'Nutrición', 'Reparación', 'Suavidad'],
 ARRAY['Chícharos', 'Proteína de chícharo', 'Guisantes verdes', 'Extractos de guisantes']),

('Proteína de Quinoa', 'proteins', 'Proteína completa de origen vegetal que proporciona todos los aminoácidos esenciales. Nutre, hidrata y mejora la apariencia general de la piel.',
 ARRAY['Nutrición completa', 'Hidratación', 'Mejora de apariencia', 'Aminoácidos esenciales', 'Reparación', 'Firmeza'],
 ARRAY['Quinoa', 'Proteína de quinoa', 'Extractos de quinoa']),

('Ácido Hialurónico (Glicosaminoglicano)', 'proteins', 'Aunque técnicamente es un glicosaminoglicano, actúa como componente estructural importante que puede retener hasta 1000 veces su peso en agua, proporcionando hidratación intensa y volumen.',
 ARRAY['Hidratación intensa', 'Relleno de arrugas', 'Piel más llena', 'Mejora de volumen', 'Reducción de líneas finas', 'Estructura'],
 ARRAY['Fermentación vegetal', 'Extractos de plantas', 'Raíz de konjac', 'Bambú', 'Avena'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Insertar nutrientes - Minerales
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Zinc', 'minerals', 'Mineral esencial que ayuda a controlar la producción de aceite, reduce la inflamación, promueve la cicatrización de heridas y tiene propiedades antimicrobianas. Es crucial para la salud de la piel y la función inmunológica.',
 ARRAY['Control de acné', 'Antiinflamatorio', 'Cicatrización', 'Protección solar', 'Propiedades antimicrobianas', 'Regulación de sebo', 'Curación de heridas'],
 ARRAY['Óxido de zinc', 'Zinc PCA', 'Zinc gluconato', 'Extractos de plantas ricas en zinc', 'Semillas de calabaza', 'Lentejas']),

('Selenio', 'minerals', 'Antioxidante mineral esencial que protege contra el daño solar, ayuda a mantener la elasticidad de la piel y trabaja en sinergia con la vitamina E para proteger las células del estrés oxidativo.',
 ARRAY['Protección antioxidante', 'Anti-envejecimiento', 'Protección solar', 'Elasticidad', 'Sinergia con vitamina E', 'Protección celular'],
 ARRAY['Nueces de Brasil', 'Semillas de girasol', 'Extractos vegetales', 'Ajo', 'Setas', 'Atún', 'Huevos']),

('Cobre', 'minerals', 'Mineral esencial que estimula la producción de colágeno y elastina, promueve la regeneración celular y tiene propiedades antimicrobianas. También ayuda en la síntesis de melanina.',
 ARRAY['Producción de colágeno', 'Regeneración celular', 'Propiedades antimicrobianas', 'Síntesis de elastina', 'Producción de melanina', 'Anti-envejecimiento'],
 ARRAY['Péptidos de cobre', 'Extractos de plantas', 'Semillas de sésamo', 'Nueces', 'Chocolate oscuro', 'Legumbres']),

('Magnesio', 'minerals', 'Mineral esencial que ayuda a regular el estrés en la piel, promueve la relajación celular, mejora el tono y ayuda en la síntesis de proteínas. También tiene propiedades antiinflamatorias.',
 ARRAY['Relajación', 'Regulación del estrés', 'Mejora del tono', 'Síntesis de proteínas', 'Antiinflamatorio', 'Hidratación'],
 ARRAY['Sal de Epsom', 'Extractos de algas', 'Arcilla', 'Espinaca', 'Almendras', 'Aguacate', 'Quinoa']),

('Hierro', 'minerals', 'Mineral esencial que transporta oxígeno a las células de la piel, mejorando la circulación y dando un tono saludable. La deficiencia puede causar palidez y falta de brillo.',
 ARRAY['Transporte de oxígeno', 'Mejora de circulación', 'Tono saludable', 'Brillo natural', 'Salud celular', 'Prevención de palidez'],
 ARRAY['Extractos vegetales', 'Legumbres', 'Espinaca', 'Quinoa', 'Semillas de calabaza', 'Lentejas']),

('Calcio', 'minerals', 'Mineral esencial que ayuda a mantener la integridad de la barrera cutánea, regula la renovación celular y es importante para la función de las células de la piel.',
 ARRAY['Integridad de barrera', 'Renovación celular', 'Función celular', 'Firmeza', 'Salud de la piel'],
 ARRAY['Extractos de algas', 'Semillas de sésamo', 'Almendras', 'Brócoli', 'Hojas verdes', 'Tofu']),

('Potasio', 'minerals', 'Mineral esencial que ayuda a mantener el equilibrio de humedad en las células de la piel, regula el pH y mejora la hidratación.',
 ARRAY['Equilibrio de humedad', 'Regulación de pH', 'Hidratación', 'Función celular', 'Salud de la piel'],
 ARRAY['Plátano', 'Aguacate', 'Espinaca', 'Patata', 'Tomate', 'Frijoles']),

('Fósforo', 'minerals', 'Mineral esencial que participa en la producción de energía celular y es importante para la estructura y función de las células de la piel.',
 ARRAY['Producción de energía', 'Estructura celular', 'Función celular', 'Metabolismo', 'Salud celular'],
 ARRAY['Semillas de girasol', 'Nueces', 'Lentejas', 'Quinoa', 'Avena', 'Frijoles']),

('Azufre', 'minerals', 'Mineral esencial que es componente de la queratina y el colágeno. Tiene propiedades antimicrobianas y ayuda en la cicatrización. Es especialmente beneficioso para pieles con acné.',
 ARRAY['Síntesis de queratina', 'Síntesis de colágeno', 'Propiedades antimicrobianas', 'Cicatrización', 'Tratamiento de acné', 'Limpieza'],
 ARRAY['Ajo', 'Cebolla', 'Brócoli', 'Col', 'Huevos', 'Legumbres']),

('Silicio', 'minerals', 'Mineral esencial que fortalece el tejido conectivo, mejora la elasticidad de la piel y promueve la síntesis de colágeno. Ayuda a mantener la firmeza y estructura de la piel.',
 ARRAY['Fortalecimiento de tejido conectivo', 'Elasticidad', 'Síntesis de colágeno', 'Firmeza', 'Estructura de la piel', 'Anti-envejecimiento'],
 ARRAY['Extractos de bambú', 'Avena', 'Cebada', 'Arroz integral', 'Algas', 'Pepino']),

('Manganeso', 'minerals', 'Mineral esencial que actúa como cofactor enzimático para la síntesis de colágeno y tiene propiedades antioxidantes. Ayuda en la protección contra el estrés oxidativo.',
 ARRAY['Síntesis de colágeno', 'Protección antioxidante', 'Protección contra estrés oxidativo', 'Función enzimática', 'Salud celular'],
 ARRAY['Nueces', 'Semillas', 'Granos enteros', 'Espinaca', 'Té', 'Legumbres']),

('Yodo', 'minerals', 'Mineral esencial que ayuda en la función tiroidea, que a su vez regula el metabolismo celular y la salud general de la piel. También tiene propiedades antimicrobianas.',
 ARRAY['Función tiroidea', 'Metabolismo celular', 'Salud general', 'Propiedades antimicrobianas', 'Regulación hormonal'],
 ARRAY['Algas marinas', 'Sal marina', 'Pescado', 'Yogur', 'Huevos']),

('Cromo', 'minerals', 'Mineral esencial que ayuda a regular el azúcar en sangre, lo que puede afectar la salud de la piel. También puede ayudar en la cicatrización.',
 ARRAY['Regulación de azúcar', 'Salud de la piel', 'Cicatrización', 'Metabolismo', 'Equilibrio'],
 ARRAY['Brócoli', 'Uvas', 'Jugo de uva', 'Granos enteros', 'Nueces', 'Legumbres']),

('Molibdeno', 'minerals', 'Mineral esencial que actúa como cofactor enzimático y ayuda en la detoxificación. Contribuye a la salud general de la piel.',
 ARRAY['Función enzimática', 'Detoxificación', 'Salud general', 'Metabolismo', 'Protección celular'],
 ARRAY['Legumbres', 'Granos enteros', 'Nueces', 'Hojas verdes', 'Leche']),

('Boro', 'minerals', 'Mineral que ayuda en la absorción de calcio y magnesio, contribuyendo a la salud de la piel y la función celular.',
 ARRAY['Absorción de calcio', 'Absorción de magnesio', 'Salud de la piel', 'Función celular', 'Estructura'],
 ARRAY['Frutas', 'Verduras', 'Nueces', 'Legumbres', 'Vino']),

('Germanio', 'minerals', 'Mineral traza que puede tener propiedades antioxidantes y ayudar en la oxigenación celular, mejorando la salud y apariencia de la piel.',
 ARRAY['Protección antioxidante', 'Oxigenación celular', 'Mejora de apariencia', 'Salud celular', 'Energía'],
 ARRAY['Ajo', 'Ginseng', 'Algas', 'Setas', 'Extractos naturales'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Insertar nutrientes - Ácidos Grasos
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Omega-3 (Ácido Alfa-Linolénico - ALA)', 'fatty-acids', 'Ácido graso esencial Omega-3 de origen vegetal que reduce la inflamación, nutre la piel profundamente y ayuda a mantener la barrera cutánea saludable.',
 ARRAY['Antiinflamatorio', 'Nutrición profunda', 'Barrera cutánea', 'Hidratación', 'Reparación celular'],
 ARRAY['Aceite de linaza', 'Aceite de chía', 'Aceite de cáñamo', 'Aceite de rosa mosqueta', 'Nueces', 'Semillas de lino']),

('Omega-3 (EPA - Ácido Eicosapentaenoico)', 'fatty-acids', 'Ácido graso Omega-3 de cadena larga con potentes propiedades antiinflamatorias que calma la piel irritada y reduce el enrojecimiento.',
 ARRAY['Antiinflamatorio', 'Calma la irritación', 'Reduce enrojecimiento', 'Hidratación profunda'],
 ARRAY['Aceite de pescado', 'Aceite de algas', 'Microalgas']),

('Omega-3 (DHA - Ácido Docosahexaenoico)', 'fatty-acids', 'Ácido graso Omega-3 esencial para la salud celular y la función de las membranas de la piel.',
 ARRAY['Salud celular', 'Función de membranas', 'Hidratación', 'Nutrición profunda'],
 ARRAY['Aceite de pescado', 'Aceite de algas', 'Microalgas']),

('Omega-6 (Ácido Linoleico)', 'fatty-acids', 'Ácido graso esencial Omega-6 que ayuda a mantener la integridad de la barrera cutánea y previene la pérdida de humedad.',
 ARRAY['Barrera cutánea', 'Hidratación', 'Reparación', 'Prevención de pérdida de agua'],
 ARRAY['Aceite de girasol', 'Aceite de cártamo', 'Aceite de maíz', 'Aceite de soja', 'Nueces']),

('Omega-6 (GLA - Ácido Gamma-Linolénico)', 'fatty-acids', 'Ácido graso Omega-6 especializado que reduce la inflamación y mejora la condición de la piel seca y sensible.',
 ARRAY['Antiinflamatorio', 'Hidratación', 'Calma piel sensible', 'Mejora textura'],
 ARRAY['Aceite de borraja', 'Aceite de onagra', 'Aceite de grosella negra', 'Aceite de cáñamo']),

('Omega-9 (Ácido Oleico)', 'fatty-acids', 'Ácido graso monoinsaturado que proporciona hidratación profunda, suaviza la piel y restaura su brillo natural.',
 ARRAY['Hidratación profunda', 'Suavidad', 'Brillo natural', 'Penetración profunda'],
 ARRAY['Aceite de oliva', 'Aceite de aguacate', 'Aceite de almendras', 'Aceite de nuez de macadamia', 'Aceite de jojoba']),

('Ácido Esteárico', 'fatty-acids', 'Ácido graso saturado que actúa como emoliente, proporcionando una barrera protectora y suavizando la textura de la piel.',
 ARRAY['Emoliente', 'Barrera protectora', 'Suavidad', 'Hidratación'],
 ARRAY['Aceite de coco', 'Manteca de karité', 'Aceite de cacao', 'Aceite de palma']),

('Ácido Palmítico', 'fatty-acids', 'Ácido graso saturado que ayuda a mantener la barrera cutánea y proporciona propiedades emolientes para suavizar la piel.',
 ARRAY['Barrera cutánea', 'Emoliente', 'Hidratación', 'Protección'],
 ARRAY['Aceite de palma', 'Aceite de coco', 'Manteca de karité']),

('Ácido Láurico', 'fatty-acids', 'Ácido graso de cadena media con propiedades antimicrobianas que ayuda a mantener la piel limpia y protegida.',
 ARRAY['Antimicrobiano', 'Limpieza', 'Protección', 'Hidratación ligera'],
 ARRAY['Aceite de coco', 'Aceite de babassu', 'Leche materna'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Insertar nutrientes - Antioxidantes
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Vitamina C (Ácido Ascórbico)', 'antioxidants', 'Antioxidante hidrosoluble extremadamente potente que neutraliza los radicales libres, estimula la producción de colágeno y protege contra el daño UV. Es esencial para la síntesis de colágeno y elastina.',
 ARRAY['Protección antioxidante', 'Producción de colágeno', 'Iluminación de la piel', 'Reducción de manchas', 'Protección UV', 'Anti-envejecimiento'],
 ARRAY['Rosa mosqueta', 'Acerola', 'Camu camu', 'Kiwi', 'Fresas', 'Cítricos', 'Guayaba', 'Pimiento rojo']),

('Vitamina E (Tocoferol)', 'antioxidants', 'Antioxidante liposoluble que protege las membranas celulares del daño oxidativo. Trabaja en sinergia con la vitamina C y protege contra el estrés oxidativo causado por la radiación UV.',
 ARRAY['Protección antioxidante', 'Protección de membranas celulares', 'Sinergia con vitamina C', 'Antiinflamatorio', 'Hidratación profunda', 'Cicatrización'],
 ARRAY['Aceite de germen de trigo', 'Aceite de girasol', 'Aceite de argán', 'Almendras', 'Aguacate', 'Aceite de oliva', 'Nueces']),

('Carotenoides (Beta-Caroteno)', 'antioxidants', 'Precursor de la vitamina A y potente antioxidante que proporciona protección contra el daño solar y puede dar un tono saludable y dorado a la piel.',
 ARRAY['Protección antioxidante', 'Protección solar natural', 'Tono saludable', 'Conversión a vitamina A', 'Anti-envejecimiento'],
 ARRAY['Zanahoria', 'Batata', 'Calabaza', 'Mango', 'Melón', 'Albaricoque', 'Espinaca']),

('Licopeno', 'antioxidants', 'Carotenoide rojo extremadamente potente que protege contra el daño UV y el envejecimiento prematuro. Es uno de los antioxidantes más efectivos contra los radicales libres.',
 ARRAY['Protección UV', 'Anti-envejecimiento', 'Protección antioxidante', 'Reducción de arrugas', 'Mejora de textura'],
 ARRAY['Tomate', 'Sandía', 'Pomelo rojo', 'Guayaba rosa', 'Papaya']),

('Luteína', 'antioxidants', 'Carotenoide que filtra la luz azul y protege la piel contra el daño de la radiación visible de alta energía. También protege contra el estrés oxidativo.',
 ARRAY['Protección contra luz azul', 'Filtro de radiación', 'Protección antioxidante', 'Anti-envejecimiento', 'Salud cutánea'],
 ARRAY['Espinaca', 'Kale', 'Brócoli', 'Maíz', 'Yema de huevo', 'Naranjas']),

('Zeaxantina', 'antioxidants', 'Carotenoide que trabaja en sinergia con la luteína para proteger contra el daño de la luz visible y proporcionar protección antioxidante.',
 ARRAY['Protección contra luz visible', 'Sinergia con luteína', 'Protección antioxidante', 'Anti-envejecimiento'],
 ARRAY['Maíz', 'Naranjas', 'Yema de huevo', 'Kale', 'Espinaca']),

('Polifenoles', 'antioxidants', 'Compuestos naturales con potentes propiedades antioxidantes que protegen contra el envejecimiento prematuro, reducen la inflamación y mejoran la apariencia de la piel.',
 ARRAY['Protección antioxidante', 'Anti-envejecimiento', 'Antiinflamatorio', 'Mejora de circulación', 'Protección UV'],
 ARRAY['Té verde', 'Té negro', 'Uvas', 'Arándanos', 'Cacao', 'Romero', 'Manzanas', 'Cebolla']),

('Flavonoides', 'antioxidants', 'Grupo diverso de antioxidantes vegetales que ayudan a proteger la piel contra los radicales libres, mejoran la circulación y tienen propiedades antiinflamatorias.',
 ARRAY['Protección UV', 'Antiinflamatorio', 'Mejora de la circulación', 'Protección antioxidante', 'Fortalecimiento capilar'],
 ARRAY['Té verde', 'Ginkgo biloba', 'Propóleos', 'Miel', 'Cítricos', 'Bayas', 'Vino tinto']),

('Resveratrol', 'antioxidants', 'Polifenol potente encontrado en la piel de las uvas y el vino tinto. Tiene propiedades anti-envejecimiento, antiinflamatorias y protege contra el daño UV.',
 ARRAY['Anti-envejecimiento', 'Antiinflamatorio', 'Protección UV', 'Mejora de textura', 'Reducción de arrugas'],
 ARRAY['Uvas rojas', 'Vino tinto', 'Arándanos', 'Moras', 'Maní', 'Cacao']),

('Quercetina', 'antioxidants', 'Flavonoide con propiedades antiinflamatorias y antioxidantes potentes. Ayuda a calmar la piel irritada y protege contra el estrés oxidativo.',
 ARRAY['Antiinflamatorio', 'Protección antioxidante', 'Calma irritación', 'Protección UV', 'Antihistamínico natural'],
 ARRAY['Cebollas', 'Manzanas', 'Té verde', 'Bayas', 'Uvas', 'Brócoli', 'Caperes']),

('Catequinas (EGCG)', 'antioxidants', 'Polifenoles del té verde, especialmente la epigalocatequina galato (EGCG), con potentes propiedades antioxidantes y antiinflamatorias. Protegen contra el daño UV y el envejecimiento.',
 ARRAY['Protección UV', 'Anti-envejecimiento', 'Protección antioxidante', 'Antiinflamatorio', 'Mejora de textura', 'Reducción de inflamación'],
 ARRAY['Té verde', 'Té blanco', 'Matcha', 'Té negro']),

('Ácido Elágico', 'antioxidants', 'Polifenol que protege contra el daño UV, reduce la aparición de manchas oscuras y tiene propiedades antiinflamatorias. También ayuda en la reparación del ADN.',
 ARRAY['Protección UV', 'Reducción de manchas', 'Antiinflamatorio', 'Reparación de ADN', 'Anti-envejecimiento'],
 ARRAY['Granadas', 'Fresas', 'Frambuesas', 'Arándanos', 'Nueces', 'Uvas']),

('Curcumina', 'antioxidants', 'Compuesto activo de la cúrcuma con potentes propiedades antiinflamatorias y antioxidantes. Calma la piel, reduce el enrojecimiento y protege contra el estrés oxidativo.',
 ARRAY['Antiinflamatorio', 'Protección antioxidante', 'Calma enrojecimiento', 'Anti-envejecimiento', 'Mejora de apariencia'],
 ARRAY['Cúrcuma', 'Curry', 'Jengibre']),

('Ácido Ferúlico', 'antioxidants', 'Antioxidante que estabiliza la vitamina C y E, aumentando su efectividad. Protege contra el daño UV y reduce la aparición de manchas y líneas finas.',
 ARRAY['Estabilización de vitaminas', 'Protección UV', 'Sinergia antioxidante', 'Reducción de manchas', 'Anti-envejecimiento'],
 ARRAY['Arroz integral', 'Avena', 'Manzanas', 'Naranjas', 'Semillas de sésamo', 'Granos enteros']),

('Glutatión', 'antioxidants', 'Antioxidante maestro producido naturalmente por el cuerpo. Neutraliza radicales libres, protege las células del daño oxidativo y ayuda en la detoxificación.',
 ARRAY['Protección antioxidante', 'Detoxificación', 'Protección celular', 'Anti-envejecimiento', 'Iluminación'],
 ARRAY['Espárragos', 'Aguacate', 'Espinaca', 'Brócoli', 'Ajo', 'Nueces']),

('Coenzima Q10 (Ubiquinona)', 'antioxidants', 'Antioxidante que disminuye con la edad. Protege contra el daño oxidativo, mejora la producción de energía celular y reduce la aparición de arrugas.',
 ARRAY['Protección antioxidante', 'Energía celular', 'Reducción de arrugas', 'Anti-envejecimiento', 'Mejora de firmeza'],
 ARRAY['Pescado', 'Carne de res', 'Aceites vegetales', 'Nueces', 'Vegetales de hoja verde']),

('Astaxantina', 'antioxidants', 'Carotenoide extremadamente potente, más fuerte que otros antioxidantes. Protege contra el daño UV, reduce la inflamación y mejora la elasticidad de la piel.',
 ARRAY['Protección UV', 'Antiinflamatorio', 'Mejora de elasticidad', 'Protección antioxidante', 'Reducción de arrugas'],
 ARRAY['Salmón', 'Trucha', 'Camarones', 'Algas', 'Krill']),

('Ácido Alfa-Lipoico', 'antioxidants', 'Antioxidante único que es tanto hidrosoluble como liposoluble. Reduce la inflamación, protege contra el daño oxidativo y puede ayudar a reducir la apariencia de líneas finas.',
 ARRAY['Protección antioxidante', 'Antiinflamatorio', 'Reducción de líneas finas', 'Protección celular', 'Mejora de textura'],
 ARRAY['Espinaca', 'Brócoli', 'Tomate', 'Patatas', 'Levadura', 'Carne de órganos']),

('Selenio', 'antioxidants', 'Mineral antioxidante que protege contra el daño solar y ayuda a mantener la elasticidad de la piel. Trabaja en sinergia con la vitamina E.',
 ARRAY['Protección antioxidante', 'Protección solar', 'Elasticidad', 'Sinergia con vitamina E', 'Anti-envejecimiento'],
 ARRAY['Nueces de Brasil', 'Semillas de girasol', 'Ajo', 'Setas', 'Atún', 'Huevos'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Insertar nutrientes - Aminoácidos
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Ácido Hialurónico', 'amino-acids', 'Aunque técnicamente no es un aminoácido, es un componente clave que puede retener hasta 1000 veces su peso en agua, proporcionando hidratación intensa y mejorando la apariencia de la piel.',
 ARRAY['Hidratación intensa', 'Relleno de arrugas', 'Piel más llena', 'Mejora de volumen', 'Reducción de líneas finas'],
 ARRAY['Fermentación vegetal', 'Extractos de plantas', 'Raíz de konjac', 'Bambú']),

('Glicina', 'amino-acids', 'Aminoácido no esencial que es el componente más abundante del colágeno. Ayuda en la síntesis de colágeno, promueve la cicatrización y mantiene la hidratación de la piel.',
 ARRAY['Síntesis de colágeno', 'Cicatrización', 'Hidratación', 'Reparación celular', 'Firmeza'],
 ARRAY['Proteínas vegetales', 'Extractos de soja', 'Gelatina vegetal', 'Extractos de trigo']),

('Prolina', 'amino-acids', 'Aminoácido no esencial crucial para la producción de colágeno y la estructura de la piel. Ayuda a mantener la elasticidad y firmeza cutánea.',
 ARRAY['Producción de colágeno', 'Estructura de la piel', 'Elasticidad', 'Firmeza', 'Prevención de arrugas'],
 ARRAY['Proteínas vegetales', 'Extractos naturales', 'Quinoa', 'Soja']),

('Lisina', 'amino-acids', 'Aminoácido esencial que participa en la síntesis de colágeno y elastina, ayuda en la reparación de tejidos y fortalece la barrera cutánea.',
 ARRAY['Síntesis de colágeno', 'Reparación de tejidos', 'Fortalecimiento de barrera', 'Cicatrización', 'Elasticidad'],
 ARRAY['Legumbres', 'Quinoa', 'Soja', 'Semillas', 'Nueces']),

('Arginina', 'amino-acids', 'Aminoácido semi-esencial que mejora la circulación sanguínea en la piel, promueve la cicatrización y ayuda en la regeneración celular.',
 ARRAY['Mejora de circulación', 'Cicatrización', 'Regeneración celular', 'Hidratación', 'Oxigenación'],
 ARRAY['Nueces', 'Semillas', 'Granos', 'Legumbres', 'Avena']),

('Ácido Glutámico', 'amino-acids', 'Aminoácido no esencial que actúa como humectante natural, ayudando a mantener la hidratación de la piel y mejorando su textura.',
 ARRAY['Hidratación', 'Humectante natural', 'Mejora de textura', 'Suavidad', 'Brillo'],
 ARRAY['Proteínas vegetales', 'Algas', 'Extractos de soja', 'Levadura nutricional']),

('Serina', 'amino-acids', 'Aminoácido no esencial que ayuda a mantener la hidratación natural de la piel y contribuye a la síntesis de ceramidas, importantes para la barrera cutánea.',
 ARRAY['Hidratación natural', 'Síntesis de ceramidas', 'Barrera cutánea', 'Retención de humedad', 'Suavidad'],
 ARRAY['Proteínas vegetales', 'Soja', 'Lentejas', 'Espinacas']),

('Treonina', 'amino-acids', 'Aminoácido esencial que participa en la síntesis de colágeno y elastina, ayudando a mantener la estructura y elasticidad de la piel.',
 ARRAY['Síntesis de colágeno', 'Elasticidad', 'Estructura de la piel', 'Firmeza', 'Reparación'],
 ARRAY['Legumbres', 'Nueces', 'Semillas', 'Espinacas', 'Aguacate']),

('Tirosina', 'amino-acids', 'Aminoácido no esencial que es precursor de la melanina y otros compuestos importantes. Ayuda a mantener un tono de piel saludable y uniforme.',
 ARRAY['Tono de piel uniforme', 'Producción de melanina', 'Protección UV natural', 'Mejora de apariencia'],
 ARRAY['Almendras', 'Aguacate', 'Plátano', 'Semillas de sésamo', 'Soja']),

('Cisteína', 'amino-acids', 'Aminoácido no esencial rico en azufre que es precursor del glutatión, un potente antioxidante. Ayuda a proteger la piel del estrés oxidativo y promueve la síntesis de queratina.',
 ARRAY['Protección antioxidante', 'Síntesis de queratina', 'Fortalecimiento', 'Protección contra estrés oxidativo', 'Regeneración'],
 ARRAY['Ajo', 'Cebolla', 'Brócoli', 'Granos enteros', 'Legumbres']),

('Metionina', 'amino-acids', 'Aminoácido esencial rico en azufre que es importante para la síntesis de colágeno y la formación de queratina. Ayuda a fortalecer la estructura de la piel.',
 ARRAY['Síntesis de colágeno', 'Formación de queratina', 'Fortalecimiento', 'Estructura de la piel', 'Protección'],
 ARRAY['Sésamo', 'Brasil nuts', 'Soja', 'Espinacas', 'Brócoli']),

('Histidina', 'amino-acids', 'Aminoácido esencial que actúa como antioxidante y ayuda a proteger la piel contra los daños de los radicales libres. También participa en la respuesta inflamatoria.',
 ARRAY['Protección antioxidante', 'Protección contra radicales libres', 'Antiinflamatorio', 'Reparación', 'Salud general'],
 ARRAY['Legumbres', 'Semillas', 'Granos enteros', 'Maíz']),

('Fenilalanina', 'amino-acids', 'Aminoácido esencial que es precursor de la tirosina y otros compuestos importantes. Ayuda en la síntesis de proteínas y mantenimiento de la salud cutánea.',
 ARRAY['Síntesis de proteínas', 'Salud cutánea', 'Mantenimiento celular', 'Estructura', 'Reparación'],
 ARRAY['Semillas', 'Nueces', 'Soja', 'Lentejas', 'Quinoa']),

('Triptófano', 'amino-acids', 'Aminoácido esencial que es precursor de la serotonina y otros compuestos. Contribuye al bienestar general que se refleja en la salud de la piel.',
 ARRAY['Bienestar general', 'Salud de la piel', 'Relajación', 'Mejora del aspecto', 'Equilibrio'],
 ARRAY['Semillas de calabaza', 'Avena', 'Soja', 'Espinacas', 'Quinoa']),

('Leucina', 'amino-acids', 'Aminoácido esencial de cadena ramificada que estimula la síntesis de proteínas, ayudando en la reparación y regeneración de la piel.',
 ARRAY['Síntesis de proteínas', 'Reparación', 'Regeneración', 'Firmeza', 'Recuperación'],
 ARRAY['Legumbres', 'Nueces', 'Semillas', 'Quinoa', 'Arroz integral']),

('Isoleucina', 'amino-acids', 'Aminoácido esencial de cadena ramificada que ayuda en la reparación de tejidos y mantenimiento de la estructura de la piel.',
 ARRAY['Reparación de tejidos', 'Estructura de la piel', 'Mantenimiento', 'Fuerza', 'Integridad'],
 ARRAY['Legumbres', 'Nueces', 'Semillas', 'Granos enteros']),

('Valina', 'amino-acids', 'Aminoácido esencial de cadena ramificada que participa en la síntesis de proteínas y ayuda a mantener la integridad estructural de la piel.',
 ARRAY['Síntesis de proteínas', 'Integridad estructural', 'Mantenimiento', 'Fuerza', 'Reparación'],
 ARRAY['Legumbres', 'Nueces', 'Semillas', 'Granos enteros', 'Champiñones'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Insertar nutrientes - Enzimas
INSERT INTO nutrients (name, category_id, description, benefits, sources) VALUES
('Papaina', 'enzymes', 'Enzima proteolítica derivada de la papaya que exfolia suavemente la piel, eliminando células muertas sin irritación. Es más suave que los exfoliantes químicos tradicionales.',
 ARRAY['Exfoliación suave', 'Renovación celular', 'Brillo natural', 'Eliminación de células muertas', 'Mejora de textura', 'Sin irritación'],
 ARRAY['Papaya', 'Extractos de papaya', 'Fruta de papaya verde']),

('Bromelina', 'enzymes', 'Enzima proteolítica extraída de la piña que ayuda a exfoliar suavemente, reducir la inflamación y mejorar la textura de la piel. También tiene propiedades antiinflamatorias.',
 ARRAY['Exfoliación suave', 'Antiinflamatorio', 'Mejora de textura', 'Renovación celular', 'Reducción de hinchazón', 'Cicatrización'],
 ARRAY['Piña', 'Extractos de piña', 'Tallo de piña', 'Jugo de piña']),

('Ficina', 'enzymes', 'Enzima proteolítica derivada de la higuera que exfolia suavemente la piel y ayuda en la renovación celular. Es especialmente efectiva para pieles sensibles.',
 ARRAY['Exfoliación suave', 'Renovación celular', 'Pieles sensibles', 'Mejora de textura', 'Brillo natural'],
 ARRAY['Higo', 'Látex de higuera', 'Extractos de higo']),

('Quimotripsina', 'enzymes', 'Enzima proteolítica que ayuda en la exfoliación y renovación celular. También tiene propiedades antiinflamatorias y puede ayudar en la cicatrización.',
 ARRAY['Exfoliación', 'Renovación celular', 'Antiinflamatorio', 'Cicatrización', 'Mejora de textura'],
 ARRAY['Fermentación vegetal', 'Extractos de plantas', 'Procesos biotecnológicos']),

('Tripsina', 'enzymes', 'Enzima proteolítica que ayuda en la exfoliación suave y renovación celular. Facilita la eliminación de células muertas y mejora la absorción de otros ingredientes activos.',
 ARRAY['Exfoliación suave', 'Renovación celular', 'Mejora de absorción', 'Eliminación de células muertas', 'Mejora de textura'],
 ARRAY['Fermentación vegetal', 'Extractos naturales', 'Procesos biotecnológicos']),

('Superóxido Dismutasa (SOD)', 'enzymes', 'Enzima antioxidante que neutraliza los radicales libres superóxido, protegiendo la piel del estrés oxidativo y el envejecimiento prematuro.',
 ARRAY['Protección antioxidante', 'Neutralización de radicales libres', 'Anti-envejecimiento', 'Protección contra estrés oxidativo', 'Mejora de apariencia'],
 ARRAY['Melón', 'Brócoli', 'Repollo', 'Espinaca', 'Extractos de plantas', 'Algas']),

('Catalasa', 'enzymes', 'Enzima antioxidante que descompone el peróxido de hidrógeno, protegiendo las células del daño oxidativo. Ayuda a mantener la salud celular y prevenir el envejecimiento.',
 ARRAY['Protección antioxidante', 'Protección celular', 'Anti-envejecimiento', 'Salud celular', 'Prevención de daño oxidativo'],
 ARRAY['Patatas', 'Hígado', 'Extractos vegetales', 'Fermentación']),

('Glutatión Peroxidasa', 'enzymes', 'Enzima antioxidante que trabaja con el glutatión para proteger las células del daño oxidativo. Es esencial para la detoxificación celular.',
 ARRAY['Protección antioxidante', 'Detoxificación', 'Protección celular', 'Sinergia con glutatión', 'Anti-envejecimiento'],
 ARRAY['Vegetales de hoja verde', 'Brócoli', 'Ajo', 'Cebolla', 'Extractos vegetales']),

('Coagulasa', 'enzymes', 'Enzima que ayuda en la coagulación y cicatrización de heridas menores. Puede ser útil en productos para pieles con pequeñas irritaciones.',
 ARRAY['Cicatrización', 'Coagulación', 'Reparación', 'Protección de heridas menores'],
 ARRAY['Extractos naturales', 'Fermentación']),

('Hialuronidasa', 'enzymes', 'Enzima que ayuda a descomponer el ácido hialurónico, facilitando su absorción y distribución en la piel. Mejora la eficacia de productos con ácido hialurónico.',
 ARRAY['Mejora de absorción', 'Distribución de ácido hialurónico', 'Eficacia mejorada', 'Hidratación profunda'],
 ARRAY['Extractos naturales', 'Fermentación', 'Procesos biotecnológicos']),

('Colagenasa', 'enzymes', 'Enzima que ayuda en la renovación del colágeno degradado, facilitando la producción de nuevo colágeno y mejorando la firmeza de la piel.',
 ARRAY['Renovación de colágeno', 'Producción de nuevo colágeno', 'Mejora de firmeza', 'Anti-envejecimiento', 'Estructura de la piel'],
 ARRAY['Extractos naturales', 'Fermentación', 'Procesos biotecnológicos']),

('Elastasa', 'enzymes', 'Enzima que ayuda en la renovación de la elastina, mejorando la elasticidad y flexibilidad de la piel.',
 ARRAY['Renovación de elastina', 'Mejora de elasticidad', 'Flexibilidad', 'Anti-envejecimiento', 'Firmeza'],
 ARRAY['Extractos naturales', 'Fermentación']),

('Lipasa', 'enzymes', 'Enzima que descompone los lípidos, ayudando a limpiar los poros y mejorar la textura de la piel. Útil para pieles grasas o con acné.',
 ARRAY['Limpieza de poros', 'Mejora de textura', 'Control de grasa', 'Prevención de acné', 'Limpieza profunda'],
 ARRAY['Extractos vegetales', 'Fermentación', 'Aceites vegetales']),

('Amilasa', 'enzymes', 'Enzima que descompone los carbohidratos complejos, ayudando en la exfoliación suave y mejora de la textura de la piel.',
 ARRAY['Exfoliación suave', 'Mejora de textura', 'Renovación celular', 'Brillo natural'],
 ARRAY['Extractos de plantas', 'Fermentación', 'Granos']),

('Proteasa', 'enzymes', 'Enzima general que descompone proteínas, ayudando en la exfoliación suave, eliminación de células muertas y mejora de la textura de la piel.',
 ARRAY['Exfoliación suave', 'Eliminación de células muertas', 'Mejora de textura', 'Renovación celular', 'Brillo natural'],
 ARRAY['Extractos vegetales', 'Fermentación', 'Plantas proteolíticas'])

ON CONFLICT (name) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  sources = EXCLUDED.sources,
  updated_at = NOW();

-- Nota: Después de ejecutar este script, necesitarás asociar los nutrientes con los productos
-- usando INSERT INTO product_nutrients (product_id, nutrient_id) VALUES (...);
-- Por ejemplo, si un producto tiene "Vitamina E" en su lista de ingredientes, 
-- necesitarás hacer match manual o crear un script de migración

