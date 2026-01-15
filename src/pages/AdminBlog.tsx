import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  type BlogPost,
  type CreateBlogPostData,
} from '@/hooks/useBlog';
import { Search, Plus, Edit, Trash2, Eye, Calendar, FileText, Upload, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useProductCategories } from '@/hooks/useProductCategories';

const AdminBlog = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const { data: posts, isLoading } = useAdminBlogPosts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    searchQuery: searchQuery || undefined,
  });

  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();
  const { data: productCategories = [], isLoading: isLoadingCategories } = useProductCategories();

  // Form state
  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: '',
    tags: [],
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImageToStorage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { data, error } = await supabase.storage
        .from('blog')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

      setUploadingImage(false);
      return publicUrl;
    } catch (error: any) {
      setUploadingImage(false);
      toast.error('Error al subir la imagen', {
        description: error.message || 'No se pudo subir la imagen.',
      });
      throw error;
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Tipo de archivo inválido', {
        description: 'Por favor, selecciona un archivo de imagen (JPG, PNG, etc.)',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', {
        description: 'La imagen no debe exceder 5MB',
      });
      return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, featured_image: '' });
    // Limpiar el input file
    const fileInput = document.getElementById('featured_image_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image: '',
      category: '',
      tags: [],
      status: 'draft',
      meta_title: '',
      meta_description: '',
    });
    setTagInput('');
    setSelectedImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image: post.featured_image || '',
      category: post.category || '',
      tags: post.tags || [],
      status: post.status,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    });
    setTagInput('');
    setSelectedImageFile(null);
    setImagePreview(post.featured_image || null);
    setIsDialogOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Error', { description: 'No se pudo identificar al usuario' });
      return;
    }

    let imageUrl = formData.featured_image;

    // Si hay un archivo nuevo seleccionado, subirlo primero
    if (selectedImageFile) {
      try {
        imageUrl = await uploadImageToStorage(selectedImageFile);
      } catch (error) {
        console.error('Error uploading image:', error);
        return; // No continuar si falla la subida
      }
    }

    const submitData = {
      ...formData,
      category: formData.category || null,
      excerpt: formData.excerpt || null,
      featured_image: imageUrl || null,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      tags: formData.tags || [],
    };

    try {
      if (editingPost) {
        await updateMutation.mutateAsync({
          id: editingPost.id,
          ...submitData,
        });
      } else {
        await createMutation.mutateAsync({
          ...submitData,
          author_id: user.id,
        });
      }
      setIsDialogOpen(false);
      setEditingPost(null);
      setSelectedImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este post?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // Use product categories from database
  const categories = productCategories.map(cat => cat.name).sort();

  if (!user) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-editorial-new">Acceso Denegado</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title="Gestión de Blog"
          description="Crea, edita y gestiona los posts del blog"
          actionButton={{
            label: "Nuevo Post",
            onClick: handleOpenCreate,
            icon: Plus
          }}
        />
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!open && !uploadingImage) {
              setIsDialogOpen(false);
              setEditingPost(null);
              setSelectedImageFile(null);
              setImagePreview(null);
            } else if (open) {
              setIsDialogOpen(true);
            }
          }}
        >
          <DialogContent 
              className="max-w-4xl max-h-[90vh] overflow-y-auto"
              onInteractOutside={(e) => {
                if (uploadingImage) {
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle className="font-editorial-new">
                  {editingPost ? 'Editar Post' : 'Nuevo Post'}
                </DialogTitle>
                <DialogDescription>
                  {editingPost ? 'Actualiza la información del post' : 'Completa la información para crear un nuevo post'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Resumen</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    placeholder="Breve descripción del post..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenido * (Markdown)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                    placeholder="Escribe el contenido del post en formato Markdown..."
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category || undefined}
                      onValueChange={(value) => setFormData({ ...formData, category: value === 'none' ? null : value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'draft' | 'published' | 'archived') =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="featured_image">Imagen Destacada</Label>
                  <div className="space-y-4">
                    {!imagePreview && !formData.featured_image && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:border-[#7d8768] transition-colors">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          Sube una imagen desde tu dispositivo o ingresa una URL
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <div>
                            <Input
                              id="featured_image_file"
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => document.getElementById('featured_image_file')?.click()}
                              disabled={uploadingImage}
                              className="bg-[#7d8768] hover:bg-[#6a7559] text-white"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? 'Subiendo...' : 'Seleccionar Archivo'}
                            </Button>
                          </div>
                          <span className="text-gray-400">o</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Máximo 5MB - JPG, PNG, GIF, etc.</p>
                        {uploadingImage && (
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Subiendo imagen...</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(imagePreview || formData.featured_image) && (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={imagePreview || formData.featured_image || ''}
                            alt="Preview"
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="featured_image_file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('featured_image_file')?.click()}
                            disabled={uploadingImage}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Cambiar Imagen
                          </Button>
                          {uploadingImage && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Subiendo...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">O usa URL</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="featured_image_url" className="text-sm text-gray-600">
                        Ingresar URL de imagen
                      </Label>
                      <Input
                        id="featured_image_url"
                        type="url"
                        value={formData.featured_image}
                        onChange={(e) => {
                          setFormData({ ...formData, featured_image: e.target.value });
                          if (!selectedImageFile) {
                            setImagePreview(e.target.value || null);
                          }
                        }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        disabled={!!selectedImageFile}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Agregar tag y presionar Enter"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Agregar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Título (SEO)</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Título para SEO"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Descripción (SEO)</Label>
                    <Input
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Descripción para SEO"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#7d8768] hover:bg-[#6a7559]">
                    {editingPost ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-[#7d8768]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-green-600">
                  {posts?.filter((p) => p.status === 'published').length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Borradores</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {posts?.filter((p) => p.status === 'draft').length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vistas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Posts Table */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Cargando posts...</p>
          </Card>
        ) : posts && posts.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vistas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.category ? (
                          <Badge variant="outline">{post.category}</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {post.status === 'published'
                            ? 'Publicado'
                            : post.status === 'draft'
                            ? 'Borrador'
                            : 'Archivado'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.published_at
                          ? format(new Date(post.published_at), 'd MMM yyyy', { locale: es })
                          : post.created_at
                          ? format(new Date(post.created_at), 'd MMM yyyy', { locale: es })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {post.status === 'published' && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(post)}
                            className="text-[#7d8768] hover:text-[#6a7559]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No hay posts disponibles.</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;

