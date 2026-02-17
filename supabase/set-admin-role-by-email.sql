-- Script para asignar rol admin a admin@botaniccare.com
-- Ejecuta este script en el SQL Editor de Supabase

-- Actualizar el rol de admin@botaniccare.com a 'admin'
UPDATE user_roles 
SET role = 'admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@botaniccare.com'
);

-- Verificar el cambio
SELECT 
  au.email,
  ur.role,
  '✅ Rol actualizado' AS estado
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'admin@botaniccare.com';

