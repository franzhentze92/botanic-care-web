import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabasePublic } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string | null;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  author?: {
    email: string;
    name?: string;
  };
}

export interface CreateBlogPostData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  featured_image?: string | null;
  category?: string | null;
  tags?: string[];
  status?: BlogPost['status'];
  meta_title?: string | null;
  meta_description?: string | null;
  published_at?: string | null;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: number;
}

// ==================== HOOKS - CLIENT SIDE ====================

// Hook para obtener posts publicados (para clientes)
export const useBlogPosts = (filters?: {
  category?: string;
  searchQuery?: string;
  limit?: number;
}) => {
  return useQuery<BlogPost[], Error>({
    queryKey: ['blog-posts', filters],
    queryFn: async () => {
      // Usar supabasePublic para acceso público sin autenticación
      let query = supabasePublic
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      let filteredPosts = posts || [];

      // Aplicar búsqueda en memoria
      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(search) ||
          post.content.toLowerCase().includes(search) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(search)) ||
          post.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }

      // Obtener información de autores
      const authorIds = [...new Set(filteredPosts.map(p => p.author_id).filter(Boolean))];
      let authorsMap = new Map<string, any>();

      if (authorIds.length > 0) {
        try {
          const { data: authors } = await supabase
            .rpc('get_user_emails', { user_ids: authorIds });

          if (authors && Array.isArray(authors)) {
            authors.forEach((author: any) => {
              authorsMap.set(author.id, author);
            });
          }
        } catch (e) {
          console.error('Error fetching authors:', e);
        }
      }

      return filteredPosts.map(post => ({
        ...post,
        author: post.author_id ? authorsMap.get(post.author_id) : undefined,
      }));
    },
  });
};

// Hook para obtener un post individual por slug
export const useBlogPost = (slug: string) => {
  return useQuery<BlogPost | null, Error>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      // Usar supabasePublic para acceso público sin autenticación
      const { data: post, error } = await supabasePublic
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw error;
      }

      // Incrementar contador de vistas (usar supabase normal para escritura)
      if (post) {
        supabase
          .from('blog_posts')
          .update({ views: (post.views || 0) + 1 })
          .eq('id', post.id)
          .then(() => {
            // Invalidar query para refrescar contador
          });
      }

      // Obtener información del autor
      if (post?.author_id) {
        try {
          const { data: authors } = await supabase
            .rpc('get_user_emails', { user_ids: [post.author_id] });

          if (authors && authors.length > 0) {
            post.author = authors[0];
          }
        } catch (e) {
          console.error('Error fetching author:', e);
        }
      }

      return post;
    },
  });
};

// Hook para obtener categorías únicas
export const useBlogCategories = () => {
  return useQuery<string[], Error>({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      // Usar supabasePublic para acceso público sin autenticación
      const { data, error } = await supabasePublic
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set((data || []).map(p => p.category).filter(Boolean))];
      return categories.sort();
    },
  });
};

// ==================== HOOKS - ADMIN ====================

// Hook para obtener todos los posts (admin)
export const useAdminBlogPosts = (filters?: {
  status?: string;
  category?: string;
  searchQuery?: string;
}) => {
  return useQuery<BlogPost[], Error>({
    queryKey: ['admin-blog-posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      let filteredPosts = posts || [];

      // Aplicar búsqueda
      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(search) ||
          post.content.toLowerCase().includes(search) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(search))
        );
      }

      // Obtener información de autores
      const authorIds = [...new Set(filteredPosts.map(p => p.author_id).filter(Boolean))];
      let authorsMap = new Map<string, any>();

      if (authorIds.length > 0) {
        try {
          const { data: authors } = await supabase
            .rpc('get_user_emails', { user_ids: authorIds });

          if (authors && Array.isArray(authors)) {
            authors.forEach((author: any) => {
              authorsMap.set(author.id, author);
            });
          }
        } catch (e) {
          console.error('Error fetching authors:', e);
        }
      }

      return filteredPosts.map(post => ({
        ...post,
        author: post.author_id ? authorsMap.get(post.author_id) : undefined,
      }));
    },
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreateBlogPostData & { author_id: string }): Promise<BlogPost> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post del blog creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el post', {
        description: error.message,
      });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateBlogPostData): Promise<BlogPost> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post'] });
      toast.success('Post del blog actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el post', {
        description: error.message,
      });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post del blog eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el post', {
        description: error.message,
      });
    },
  });
};

