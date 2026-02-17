import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Search,
  Tag,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  X
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useProductCategories,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
  ProductCategory
} from '@/hooks/useProductCategories';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminProductCategories: React.FC = () => {
  // Hooks de autenticación
  const { user } = useAuth();
  
  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;
  
  // Hooks de Supabase
  const { data: categories = [], isLoading, error } = useProductCategories();
  const createCategoryMutation = useCreateProductCategory();
  const updateCategoryMutation = useUpdateProductCategory();
  const deleteCategoryMutation = useDeleteProductCategory();

  // Estados para el diálogo de crear/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image_url: '',
    icon: '',
    display_order: 0,
    is_active: true,
  });

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para subida de imagen
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Función para subir imagen a Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { data, error } = await supabase.storage
        .from('products') // Usar el bucket de productos existente
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
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

  // Manejar selección de imagen
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

  // Remover imagen seleccionada
  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
    // Limpiar el input file
    const fileInput = document.getElementById('category_image_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Filtrar categorías
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      cat.id.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.is_active).length;
    const inactiveCategories = totalCategories - activeCategories;
    
    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
    };
  }, [categories]);

  // Abrir diálogo para crear nueva categoría
  const handleCreate = () => {
    setEditingCategory(null);
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      image_url: '',
      icon: '',
      display_order: categories.length,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar categoría
  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setSelectedImageFile(null);
    setImagePreview(category.image_url || null);
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      icon: category.icon || '',
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  // Generar slug a partir del nombre
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Manejar cambio en el nombre para generar slug automáticamente
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      id: editingCategory ? prev.id : generateSlug(name),
    }));
  };

  // Guardar categoría (crear o actualizar)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.id.trim()) {
      toast.error('El ID (slug) es requerido');
      return;
    }

    try {
      let imageUrl = formData.image_url;

      // Si hay un archivo nuevo seleccionado, subirlo
      if (selectedImageFile) {
        try {
          imageUrl = await uploadImageToStorage(selectedImageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          return; // No continuar si falla la subida
        }
      }

      if (editingCategory) {
        // Actualizar
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          name: formData.name,
          description: formData.description || null,
          image_url: imageUrl || null,
          icon: formData.icon || null,
          display_order: formData.display_order,
          is_active: formData.is_active,
        });
      } else {
        // Crear
        await createCategoryMutation.mutateAsync({
          id: formData.id,
          name: formData.name,
          description: formData.description || null,
          image_url: imageUrl || null,
          icon: formData.icon || null,
          display_order: formData.display_order,
          is_active: formData.is_active,
        });
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      setSelectedImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteCategoryMutation.mutateAsync(deleteConfirm);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  // Mover categoría arriba/abajo en el orden
  const handleMoveOrder = async (category: ProductCategory, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const targetCategory = categories[newIndex];
    const newOrder = targetCategory.display_order;

    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        display_order: newOrder,
      });
      await updateCategoryMutation.mutateAsync({
        id: targetCategory.id,
        display_order: category.display_order,
      });
    } catch (error) {
      console.error('Error al cambiar orden:', error);
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">Acceso Denegado</h3>
                  <p className="text-red-700">No tienes permisos para acceder a esta página.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <AdminPageHeader
          title="Categorías Productos"
          description="Gestiona las categorías de productos que se muestran en la tienda y página principal"
          icon={Tag}
        />

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Total Categorías</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.totalCategories}</p>
                </div>
                <div className="p-2 md:p-3 bg-indigo-100 rounded-full">
                  <Tag className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Categorías Activas</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1 md:mt-2">{stats.activeCategories}</p>
                </div>
                <div className="p-2 md:p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Categorías Inactivas</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-600 mt-1 md:mt-2">{stats.inactiveCategories}</p>
                </div>
                <div className="p-2 md:p-3 bg-slate-100 rounded-full">
                  <XCircle className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de búsqueda y acciones */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleCreate} className="bg-[#7d8768] hover:bg-[#6d7660] text-white w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de categorías */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7d8768] mb-4" />
              <p className="text-gray-600">Cargando categorías...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">Error al cargar categorías</h3>
                  <p className="text-red-700">{error.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No se encontraron categorías con ese criterio de búsqueda' : 'Comienza creando tu primera categoría'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate} className="bg-[#7d8768] hover:bg-[#6d7660] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Categoría
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Orden</TableHead>
                        <TableHead>ID / Slug</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Icono</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveOrder(category, 'up')}
                                disabled={categories.findIndex(c => c.id === category.id) === 0}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveOrder(category, 'down')}
                                disabled={categories.findIndex(c => c.id === category.id) === categories.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.id}</code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {category.image_url && (
                                <img 
                                  src={category.image_url} 
                                  alt={category.name}
                                  className="w-10 h-10 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {category.description || 'Sin descripción'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {category.icon ? (
                              <span className="text-2xl">{category.icon}</span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={category.is_active 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                              }
                            >
                              {category.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirm(category.id)}
                                className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="border-l-4 border-l-[#7d8768]">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {category.image_url && (
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-gray-900 mb-1">{category.name}</h3>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded block w-fit mb-2">{category.id}</code>
                            {category.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(category)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => setDeleteConfirm(category.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground text-[10px]">Icono:</span>
                          <div className="mt-0.5">
                            {category.icon ? (
                              <span className="text-lg">{category.icon}</span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px]">Estado:</span>
                          <div className="mt-0.5">
                            <Badge 
                              className={`text-[10px] ${
                                category.is_active 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {category.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Orden:</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOrder(category, 'up')}
                            disabled={categories.findIndex(c => c.id === category.id) === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOrder(category, 'down')}
                            disabled={categories.findIndex(c => c.id === category.id) === categories.length - 1}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Diálogo de crear/editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Modifica los datos de la categoría' 
                  : 'Completa el formulario para crear una nueva categoría de productos'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Cuidado de la Piel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID / Slug *
                </label>
                <Input
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="Ej: skin-care"
                  disabled={!!editingCategory}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingCategory 
                    ? 'El ID no se puede modificar después de crear la categoría'
                    : 'Se genera automáticamente desde el nombre. Solo letras minúsculas, números y guiones.'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la categoría..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen de la Categoría
                </label>
                <input
                  id="category_image_file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {imagePreview || formData.image_url ? (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview || formData.image_url || ''} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded border border-gray-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {!uploadingImage && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {!uploadingImage && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('category_image_file')?.click()}
                          disabled={uploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {selectedImageFile ? 'Cambiar Imagen' : 'Cambiar'}
                        </Button>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Subiendo imagen...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Selecciona una imagen para la categoría</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('category_image_file')?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Subiendo...' : 'Seleccionar Archivo'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF (máx. 5MB)</p>
                    </div>
                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Subiendo imagen...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono (Emoji)
                </label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="✨"
                  maxLength={2}
                />
                <p className="text-xs text-gray-500 mt-1">Un emoji o símbolo para representar la categoría</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden de Visualización
                </label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Número menor = aparece primero</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Categoría activa (visible en la tienda)
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                if (!uploadingImage) {
                  setSelectedImageFile(null);
                  setImagePreview(null);
                }
              }} disabled={uploadingImage}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-[#7d8768] hover:bg-[#6d7660] text-white"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending || uploadingImage}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending || uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadingImage ? 'Subiendo...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>¿Eliminar categoría?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
                {deleteConfirm && (
                  <span className="block mt-2 font-semibold">
                    Categoría: {categories.find(c => c.id === deleteConfirm)?.name}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteCategoryMutation.isPending}
              >
                {deleteCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProductCategories;

