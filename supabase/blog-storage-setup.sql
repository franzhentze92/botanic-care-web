-- Script para configurar Supabase Storage para imágenes del blog
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear el bucket 'blog' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que admins suban imágenes del blog
DROP POLICY IF EXISTS "Allow admins to upload blog images" ON storage.objects;
CREATE POLICY "Allow admins to upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para permitir lectura pública de imágenes del blog
DROP POLICY IF EXISTS "Allow public read access to blog images" ON storage.objects;
CREATE POLICY "Allow public read access to blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog');

-- Política para permitir que admins actualicen imágenes del blog
DROP POLICY IF EXISTS "Allow admins to update blog images" ON storage.objects;
CREATE POLICY "Allow admins to update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para permitir que admins eliminen imágenes del blog
DROP POLICY IF EXISTS "Allow admins to delete blog images" ON storage.objects;
CREATE POLICY "Allow admins to delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

