-- Script para permitir acceso público a los artículos del blog publicados
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes para blog_posts
DROP POLICY IF EXISTS "Allow public read access to published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public read access" ON blog_posts;

-- Crear política para permitir lectura pública de artículos publicados
CREATE POLICY "Allow public read access to published blog posts"
ON blog_posts
FOR SELECT
TO public
USING (status = 'published');

-- Asegurar que RLS esté habilitado
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'blog_posts';

-- Mensaje de confirmación
SELECT '✅ Script ejecutado correctamente. Los artículos publicados del blog ahora son accesibles públicamente.' AS status;

