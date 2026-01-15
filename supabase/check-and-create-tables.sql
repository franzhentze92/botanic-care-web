-- Script para verificar y crear las tablas necesarias
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- Verificar si las tablas existen
-- ============================================

-- Verificar user_roles
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
    THEN '✅ La tabla user_roles EXISTE'
    ELSE '❌ La tabla user_roles NO EXISTE'
  END AS user_roles_status;

-- Verificar user_profiles
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
    THEN '✅ La tabla user_profiles EXISTE'
    ELSE '❌ La tabla user_profiles NO EXISTE'
  END AS user_profiles_status;

-- ============================================
-- Crear user_roles si no existe
-- ============================================

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Habilitar RLS en user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Crear user_profiles si no existe
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email_notifications BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Habilitar RLS en user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Verificar datos existentes
-- ============================================

-- Contar usuarios en auth.users
SELECT 
  COUNT(*) as total_auth_users,
  'usuarios en auth.users' as descripcion
FROM auth.users;

-- Contar roles asignados
SELECT 
  COUNT(*) as total_user_roles,
  'roles en user_roles' as descripcion
FROM user_roles;

-- Contar perfiles creados
SELECT 
  COUNT(*) as total_user_profiles,
  'perfiles en user_profiles' as descripcion
FROM user_profiles;

-- ============================================
-- Ver usuarios sin rol asignado
-- ============================================

SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE 
    WHEN ur.id IS NULL THEN '❌ Sin rol'
    ELSE '✅ Con rol: ' || ur.role
  END AS estado_rol,
  CASE 
    WHEN up.id IS NULL THEN '❌ Sin perfil'
    ELSE '✅ Con perfil'
  END AS estado_perfil
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

