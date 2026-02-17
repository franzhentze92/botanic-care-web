-- Script para verificar usuarios sin rol o perfil
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- Verificar usuarios sin rol asignado
-- ============================================

SELECT 
  'Usuarios sin rol asignado' AS tipo,
  COUNT(*) AS cantidad
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM user_roles);

-- Listar usuarios sin rol
SELECT 
  au.id,
  au.email,
  au.created_at,
  '❌ Sin rol' AS estado
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM user_roles)
ORDER BY au.created_at DESC;

-- ============================================
-- Verificar usuarios sin perfil
-- ============================================

SELECT 
  'Usuarios sin perfil' AS tipo,
  COUNT(*) AS cantidad
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM user_profiles);

-- Listar usuarios sin perfil
SELECT 
  au.id,
  au.email,
  au.created_at,
  '❌ Sin perfil' AS estado
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM user_profiles)
ORDER BY au.created_at DESC;

-- ============================================
-- Verificar si los triggers existen
-- ============================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- ============================================
-- Asignar roles y perfiles a usuarios que faltan
-- ============================================

-- Asignar rol 'cliente' a usuarios que no tienen rol
INSERT INTO user_roles (user_id, role)
SELECT id, 'cliente'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Crear perfiles para usuarios que no tienen perfil
INSERT INTO user_profiles (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Reporte final
-- ============================================

SELECT 
  '📊 REPORTE FINAL' AS titulo,
  (SELECT COUNT(*) FROM auth.users) AS total_usuarios_auth,
  (SELECT COUNT(*) FROM user_roles) AS total_roles_asignados,
  (SELECT COUNT(*) FROM user_profiles) AS total_perfiles_creados,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT user_id FROM user_roles)) AS usuarios_sin_rol,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT user_id FROM user_profiles)) AS usuarios_sin_perfil;

-- Mostrar todos los usuarios y su estado
SELECT 
  au.id,
  au.email,
  au.created_at::date AS fecha_registro,
  COALESCE(ur.role, '❌ Sin rol') AS rol,
  CASE 
    WHEN up.id IS NOT NULL THEN '✅ Con perfil'
    ELSE '❌ Sin perfil'
  END AS estado_perfil
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

