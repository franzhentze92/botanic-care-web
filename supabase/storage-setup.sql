-- Script para configurar Supabase Storage para productos
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear el bucket 'products' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuarios autenticados suban archivos
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Allow public read access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Política para permitir que admins actualicen archivos
CREATE POLICY "Allow admins to update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para permitir que admins eliminen archivos
CREATE POLICY "Allow admins to delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

