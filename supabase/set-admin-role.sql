-- Script para asignar rol de admin a consultationsnts@gmail.com
-- Ejecuta este SQL en el editor SQL de Supabase

-- Primero, obtenemos el user_id del usuario por su email
-- Luego insertamos o actualizamos su rol a 'admin'

INSERT INTO user_roles (user_id, role)
SELECT 
  id as user_id,
  'admin' as role
FROM auth.users
WHERE email = 'consultationsnts@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Verificar que se asignó correctamente
SELECT 
  u.email,
  ur.role,
  ur.created_at,
  ur.updated_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'consultationsnts@gmail.com';

