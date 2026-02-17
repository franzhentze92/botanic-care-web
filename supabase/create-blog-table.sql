-- Script para crear la tabla de blog posts
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL amigable
  content TEXT NOT NULL, -- Contenido completo del post
  excerpt TEXT, -- Resumen corto
  featured_image TEXT, -- URL de imagen destacada
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Autor del post
  category TEXT, -- Categoría del post
  tags TEXT[], -- Array de tags
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE, -- Fecha de publicación
  views INTEGER DEFAULT 0, -- Contador de visitas
  meta_title TEXT, -- Para SEO
  meta_description TEXT, -- Para SEO
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

-- Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_text TEXT;
BEGIN
  -- Convertir a minúsculas, reemplazar espacios con guiones, eliminar caracteres especiales
  slug_text := lower(title_text);
  slug_text := regexp_replace(slug_text, '[^a-z0-9\s-]', '', 'g');
  slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
  slug_text := regexp_replace(slug_text, '-+', '-', 'g');
  slug_text := trim(both '-' from slug_text);
  RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- Función para generar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(title_text TEXT, post_id BIGINT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(title_text);
  final_slug := base_slug;
  
  -- Verificar si el slug ya existe (excluyendo el post actual si se está editando)
  WHILE EXISTS (
    SELECT 1 FROM blog_posts 
    WHERE slug = final_slug 
    AND (post_id IS NULL OR id != post_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar slug automáticamente
CREATE OR REPLACE FUNCTION set_blog_post_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title, NEW.id);
  ELSIF OLD.title IS DISTINCT FROM NEW.title THEN
    -- Si cambió el título, actualizar el slug
    NEW.slug := generate_unique_slug(NEW.title, NEW.id);
  END IF;
  
  -- Si se publica por primera vez, establecer published_at
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') AND NEW.published_at IS NULL THEN
    NEW.published_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_blog_post_slug ON blog_posts;
CREATE TRIGGER trigger_set_blog_post_slug
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_post_slug();

-- Habilitar Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Público puede ver posts publicados, admins pueden gestionar todos
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (status = 'published' OR is_admin() = true);

-- Permitir lectura pública también (para usuarios no autenticados)
DROP POLICY IF EXISTS "Anonymous can view published posts" ON blog_posts;
CREATE POLICY "Anonymous can view published posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

-- Solo admins pueden crear posts
DROP POLICY IF EXISTS "Admins can create blog posts" ON blog_posts;
CREATE POLICY "Admins can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() = true);

-- Solo admins pueden actualizar posts
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- Solo admins pueden eliminar posts
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (is_admin() = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at_column();

