import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

export const useBlogPosts = (filters?: {
  category?: string;
  searchQuery?: string;
  limit?: number;
}) => {
  return useQuery<BlogPost[], Error>({
    queryKey: ['blog-posts', filters],
    queryFn: async () => [],
    staleTime: Infinity,
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery<BlogPost | null, Error>({
    queryKey: ['blog-post', slug],
    queryFn: async () => null,
    enabled: !!slug,
  });
};

export const useBlogCategories = () => {
  return useQuery<string[], Error>({
    queryKey: ['blog-categories'],
    queryFn: async () => [],
  });
};

export const useAdminBlogPosts = (filters?: {
  category?: string;
  searchQuery?: string;
  status?: BlogPost['status'];
}) => {
  return useQuery<BlogPost[], Error>({
    queryKey: ['admin-blog-posts', filters],
    queryFn: async () => [],
  });
};

const blogDisabled = () => {
  toast.error('Blog: usa Shopify (Online Store → Blog) o conecta un CMS.', {
    description: 'Supabase fue retirado.',
  });
  throw new Error('Blog no configurado');
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_postData: CreateBlogPostData & { author_id: string }): Promise<BlogPost> => {
      blogDisabled();
      throw new Error('Blog');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: UpdateBlogPostData): Promise<BlogPost> => {
      blogDisabled();
      throw new Error('Blog');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: number): Promise<void> => {
      blogDisabled();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
};
