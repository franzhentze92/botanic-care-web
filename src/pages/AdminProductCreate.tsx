import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, X, Loader2, ArrowLeft, X as XIcon } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useCreateProduct, CreateProductData } from '@/hooks/useAdminProducts';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MultiSelectNutrients } from '@/components/MultiSelectNutrients';
import { useProductCategories } from '@/hooks/useProductCategories';

const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const createProductMutation = useCreateProduct();
  const { data: productCategories = [], isLoading: isLoadingCategories } = useProductCategories();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedNutrientIds, setSelectedNutrientIds] = useState<number[]>([]);
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    category: 'skin-care',
    price: 0,
    original_price: null,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    emoji: '🌿',
    rating: 5,
    reviews_count: 0,
    badge: null,
    description: '',
    long_description: '',
    ingredients: null,
    benefits: null,
    size: null,
    in_stock: true,
    sku: '',
  });

  // Get first category ID as default, or 'skin-care' if no categories exist
  const defaultCategory = productCategories.length > 0 ? productCategories[0].id : 'skin-care';

  // Update category when categories load
  React.useEffect(() => {
    if (productCategories.length > 0 && !productCategories.find(cat => cat.id === formData.category)) {
      setFormData(prev => ({ ...prev, category: productCategories[0].id }));
    }
  }, [productCategories, formData.category]);

  // Map product categories from database to select format
  const categories = productCategories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const badges = [
    { value: 'MÁS VENDIDO', label: 'Más Vendido' },
    { value: 'NUEVO', label: 'Nuevo' },
    { value: 'OFERTA', label: 'Oferta' },
    { value: 'TEMPORADA', label: 'Temporada' }
  ];

  const uploadImageToStorage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('products')
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

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits?.includes(newBenefit.trim())) {
      setFormData({
        ...formData,
        benefits: [...(formData.benefits || []), newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    const updated = formData.benefits?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      benefits: updated.length > 0 ? updated : null
    });
  };

  const handleBenefitKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.sku || formData.price <= 0) {
      toast.error('Error de validación', {
        description: 'Por favor, completa todos los campos obligatorios (Nombre, Descripción, SKU y Precio).',
      });
      return;
    }

    let imageUrl = formData.image_url;

    if (selectedImageFile) {
      try {
        imageUrl = await uploadImageToStorage(selectedImageFile);
      } catch (error) {
        return;
      }
    }

    const { data: nutrients = [] } = await supabase
      .from('nutrients')
      .select('id, name')
      .in('id', selectedNutrientIds);
    
    const ingredientNames = nutrients.map(n => n.name);

    const productData: CreateProductData & { nutrientIds?: number[] } = {
      ...formData,
      image_url: imageUrl || formData.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      ingredients: ingredientNames.length > 0 ? ingredientNames : null,
      benefits: formData.benefits && formData.benefits.length > 0 ? formData.benefits : null,
      nutrientIds: selectedNutrientIds,
    };

    try {
      await createProductMutation.mutateAsync(productData);
      toast.success('Producto creado exitosamente', {
        description: `El producto "${productData.name}" ha sido agregado correctamente.`,
      });
      navigate('/admin');
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#7d8768]/5 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-editorial-new">
              Crear <span className="text-[#7d8768]">Nuevo Producto</span>
            </h1>
            <p className="text-lg text-gray-600 font-audrey">
              Completa el formulario para agregar un nuevo producto a tu tienda
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 font-editorial-new">
                <Plus className="h-5 w-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">Nombre del Producto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Crema Hidratante Facial"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-gray-700 font-medium">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice" className="text-gray-700 font-medium">Precio Original</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.original_price || ''}
                        onChange={(e) => setFormData({...formData, original_price: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-700 font-medium">Categoría</Label>
                    {isLoadingCategories ? (
                      <div className="mt-1 text-sm text-gray-500">Cargando categorías...</div>
                    ) : categories.length > 0 ? (
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 text-sm text-red-500">No hay categorías disponibles. Por favor crea una categoría primero.</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="badge" className="text-gray-700 font-medium">Badge</Label>
                    <Select 
                      value={formData.badge ? String(formData.badge) : 'none'} 
                      onValueChange={(value) => {
                        setFormData({
                          ...formData, 
                          badge: value === 'none' ? null : value
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin badge</SelectItem>
                        {badges.map((badge) => (
                          <SelectItem key={badge.value} value={badge.value}>
                            {badge.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sku" className="text-gray-700 font-medium">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="SKU001"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="size" className="text-gray-700 font-medium">Tamaño</Label>
                    <Input
                      id="size"
                      value={formData.size || ''}
                      onChange={(e) => setFormData({...formData, size: e.target.value || null})}
                      placeholder="Ej: 50ml, 100g"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image" className="text-gray-700 font-medium">Imagen del Producto</Label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="cursor-pointer"
                          disabled={uploadingImage}
                        />
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedImageFile(null);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-[#7d8768]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Subiendo imagen...</span>
                        </div>
                      )}
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      {!imagePreview && formData.image_url && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Imagen por defecto:</p>
                          <img
                            src={formData.image_url}
                            alt="Default"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emoji" className="text-gray-700 font-medium">Emoji</Label>
                    <Input
                      id="emoji"
                      value={formData.emoji || ''}
                      onChange={(e) => setFormData({...formData, emoji: e.target.value || null})}
                      placeholder="🌿"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={formData.in_stock}
                      onChange={(e) => setFormData({...formData, in_stock: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="inStock" className="text-gray-700 font-medium">En Stock</Label>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-gray-700 font-medium">Descripción Corta *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción breve del producto"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="longDescription" className="text-gray-700 font-medium">Descripción Larga</Label>
                  <Textarea
                    id="longDescription"
                    value={formData.long_description || ''}
                    onChange={(e) => setFormData({...formData, long_description: e.target.value || null})}
                    placeholder="Descripción detallada del producto"
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="ingredients" className="text-gray-700 font-medium">Ingredientes (Nutrientes)</Label>
                  <div className="mt-1">
                    <MultiSelectNutrients
                      selectedNutrientIds={selectedNutrientIds}
                      onSelectionChange={(nutrientIds) => setSelectedNutrientIds(nutrientIds)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Selecciona uno o más nutrientes que contiene este producto
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="benefits" className="text-gray-700 font-medium">Beneficios</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="benefits"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyPress={handleBenefitKeyPress}
                        placeholder="Escribe un beneficio y presiona Enter o haz clic en +"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addBenefit}
                        disabled={!newBenefit.trim()}
                        className="bg-[#7d8768] hover:bg-[#7a7539] text-white"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.benefits && formData.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                        {formData.benefits.map((benefit, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-[#8e421e] text-white border-0 px-3 py-1 text-sm flex items-center gap-2"
                          >
                            {benefit}
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                              aria-label={`Eliminar ${benefit}`}
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {(!formData.benefits || formData.benefits.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No hay beneficios agregados aún</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={createProductMutation.isPending}
                  className="bg-[#7d8768] hover:bg-[#6d7660] text-white px-6 py-2"
                >
                  {createProductMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Crear Producto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin')}
                  className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768]/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductCreate;

