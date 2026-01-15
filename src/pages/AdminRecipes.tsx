import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Package,
  FlaskConical,
  Search,
  AlertCircle,
  X
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminRecipes,
  useAdminProductRecipes,
  useCreateProductRecipe,
  useCreateProductRecipesBatch,
  useUpdateProductRecipe,
  useDeleteProductRecipe,
  ProductRecipe,
  CreateProductRecipeData
} from '@/hooks/useAdminRecipes';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useAdminInventoryItems } from '@/hooks/useAdminInventory';
import { toast } from 'sonner';

const AdminRecipes: React.FC = () => {
  const { user } = useAuth();

  // Estados para filtros
  const [filterProduct, setFilterProduct] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<ProductRecipe | null>(null);
  const [formData, setFormData] = useState<CreateProductRecipeData>({
    product_id: 0,
    inventory_item_id: 0,
    quantity_per_unit: 0,
    notes: '',
  });
  
  // Estados para selección múltiple de ingredientes
  const [selectedIngredients, setSelectedIngredients] = useState<Array<{
    inventory_item_id: number;
    quantity_per_unit: number;
    notes: string;
  }>>([]);

  // Fetch data
  const { data: recipes = [], isLoading } = useAdminRecipes({
    productId: filterProduct !== 0 ? filterProduct : undefined,
    searchQuery: searchQuery || undefined,
  });
  const { data: products = [] } = useAdminProducts();
  const { data: inventoryItems = [] } = useAdminInventoryItems();

  const createMutation = useCreateProductRecipe();
  const createBatchMutation = useCreateProductRecipesBatch();
  const updateMutation = useUpdateProductRecipe();
  const deleteMutation = useDeleteProductRecipe();

  // Agrupar recetas por producto
  const recipesByProduct = useMemo(() => {
    const grouped = new Map<number, ProductRecipe[]>();
    recipes.forEach(recipe => {
      const productId = recipe.product_id;
      if (!grouped.has(productId)) {
        grouped.set(productId, []);
      }
      grouped.get(productId)!.push(recipe);
    });
    return grouped;
  }, [recipes]);

  const handleOpenCreate = () => {
    setEditingRecipe(null);
    setFormData({
      product_id: filterProduct !== 0 ? filterProduct : 0,
      inventory_item_id: 0,
      quantity_per_unit: 0,
      notes: '',
    });
    setSelectedIngredients([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (recipe: ProductRecipe) => {
    setEditingRecipe(recipe);
    setFormData({
      product_id: recipe.product_id,
      inventory_item_id: recipe.inventory_item_id,
      quantity_per_unit: recipe.quantity_per_unit,
      notes: recipe.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRecipe) {
      // Modo edición: actualizar una receta existente
      if (!formData.quantity_per_unit || formData.quantity_per_unit <= 0) {
        toast.error('Por favor ingresa una cantidad válida');
        return;
      }

      try {
        await updateMutation.mutateAsync({
          id: editingRecipe.id,
          quantity_per_unit: formData.quantity_per_unit,
          notes: formData.notes || null,
        });
        setDialogOpen(false);
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    } else {
      // Modo creación: crear múltiples recetas
      if (!formData.product_id) {
        toast.error('Por favor selecciona un producto');
        return;
      }

      if (selectedIngredients.length === 0) {
        toast.error('Por favor selecciona al menos un ingrediente');
        return;
      }

      // Validar que todos los ingredientes tengan cantidad válida
      const invalidIngredients = selectedIngredients.filter(
        ing => !ing.quantity_per_unit || ing.quantity_per_unit <= 0
      );

      if (invalidIngredients.length > 0) {
        toast.error('Por favor ingresa una cantidad válida para todos los ingredientes');
        return;
      }

      try {
        // Crear todas las recetas en lote
        const recipesData: CreateProductRecipeData[] = selectedIngredients.map(ingredient => ({
          product_id: formData.product_id,
          inventory_item_id: ingredient.inventory_item_id,
          quantity_per_unit: ingredient.quantity_per_unit,
          notes: ingredient.notes || null,
        }));

        await createBatchMutation.mutateAsync(recipesData);
        setDialogOpen(false);
        setSelectedIngredients([]);
      } catch (error) {
        console.error('Error saving recipes:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  // Obtener ingredientes disponibles que no están ya en la receta del producto
  const getAvailableInventoryItems = (productId: number, currentInventoryItemId?: number) => {
    if (!productId) return inventoryItems;
    
    const productRecipes = recipes.filter(r => r.product_id === productId);
    const usedIds = productRecipes
      .filter(r => !currentInventoryItemId || r.inventory_item_id !== currentInventoryItemId)
      .map(r => r.inventory_item_id);
    
    return inventoryItems.filter(item => !usedIds.includes(item.id));
  };

  // Manejar selección/deselección de ingredientes
  const handleIngredientToggle = (itemId: number) => {
    setSelectedIngredients(prev => {
      const exists = prev.find(ing => ing.inventory_item_id === itemId);
      if (exists) {
        // Remover ingrediente
        return prev.filter(ing => ing.inventory_item_id !== itemId);
      } else {
        // Agregar ingrediente
        return [...prev, {
          inventory_item_id: itemId,
          quantity_per_unit: 0,
          notes: '',
        }];
      }
    });
  };

  // Actualizar cantidad de un ingrediente seleccionado
  const handleIngredientQuantityChange = (itemId: number, quantity: number) => {
    setSelectedIngredients(prev =>
      prev.map(ing =>
        ing.inventory_item_id === itemId
          ? { ...ing, quantity_per_unit: quantity }
          : ing
      )
    );
  };

  // Actualizar notas de un ingrediente seleccionado
  const handleIngredientNotesChange = (itemId: number, notes: string) => {
    setSelectedIngredients(prev =>
      prev.map(ing =>
        ing.inventory_item_id === itemId
          ? { ...ing, notes }
          : ing
      )
    );
  };

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
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Recetas de Productos"
          description="Gestiona las cantidades de ingredientes necesarios para cada producto"
          actionButton={{
            label: "Nueva Receta",
            onClick: handleOpenCreate,
            icon: Plus
          }}
        />

        {/* Filtros */}
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por producto o ingrediente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterProduct.toString()} onValueChange={(value) => setFilterProduct(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos los productos</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recetas agrupadas por producto */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#7d8768] mx-auto mb-4" />
            <p className="text-gray-600">Cargando recetas...</p>
          </div>
        )}

        {!isLoading && recipesByProduct.size === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay recetas</h3>
              <p className="text-gray-600 mb-6">
                {filterProduct !== 0 || searchQuery
                  ? 'No se encontraron recetas con los filtros seleccionados.'
                  : 'Comienza agregando recetas para tus productos.'}
              </p>
              <Button onClick={handleOpenCreate} className="bg-[#7d8768] hover:bg-[#6a7559]">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Receta
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && recipesByProduct.size > 0 && (
          <div className="space-y-4 md:space-y-6">
            {Array.from(recipesByProduct.entries()).map(([productId, productRecipes]) => {
              const product = products.find(p => p.id === productId);
              return (
                <Card key={productId}>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#7d8768]" />
                        <span className="text-base md:text-lg">{product?.name || `Producto ID: ${productId}`}</span>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {productRecipes.length} {productRecipes.length === 1 ? 'ingrediente' : 'ingredientes'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingrediente</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead>Cantidad por Unidad</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productRecipes.map((recipe) => (
                            <TableRow key={recipe.id}>
                              <TableCell className="font-medium">
                                {recipe.inventory_item?.name || 'N/A'}
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {recipe.inventory_item?.sku || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{recipe.inventory_item?.unit || 'N/A'}</Badge>
                              </TableCell>
                              <TableCell className="font-semibold">
                                {recipe.quantity_per_unit.toFixed(4)}
                              </TableCell>
                              <TableCell className="text-gray-500 text-sm">
                                {recipe.notes || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEdit(recipe)}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(recipe.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3 p-4">
                      {productRecipes.map((recipe) => (
                        <Card key={recipe.id} className="border-l-4 border-l-[#7d8768]">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                                    {recipe.inventory_item?.name || 'N/A'}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-gray-500">SKU: {recipe.inventory_item?.sku || 'N/A'}</span>
                                    <Badge variant="outline" className="text-[10px]">
                                      {recipe.inventory_item?.unit || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenEdit(recipe)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => handleDelete(recipe.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground text-[10px]">Cantidad por Unidad:</span>
                                  <p className="font-semibold text-sm mt-0.5">{recipe.quantity_per_unit.toFixed(4)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-[10px]">Notas:</span>
                                  <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
                                    {recipe.notes || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog para crear/editar receta */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col w-[95vw] md:w-full">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
              </DialogTitle>
              <DialogDescription>
                {editingRecipe 
                  ? 'Modifica la cantidad del ingrediente en esta receta.'
                  : 'Selecciona uno o más ingredientes y define la cantidad de cada uno necesaria para producir una unidad del producto.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
                <div>
                  <Label htmlFor="product_id">Producto *</Label>
                  <Select
                    value={formData.product_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, product_id: parseInt(value) })}
                    disabled={!!editingRecipe}
                  >
                    <SelectTrigger id="product_id">
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingRecipe ? (
                  // Modo edición: mostrar formulario simple
                  <>
                    <div>
                      <Label htmlFor="inventory_item_id">Ingrediente *</Label>
                      <Select
                        value={formData.inventory_item_id.toString()}
                        onValueChange={(value) => setFormData({ ...formData, inventory_item_id: parseInt(value) })}
                        disabled={true}
                      >
                        <SelectTrigger id="inventory_item_id">
                          <SelectValue placeholder="Selecciona un ingrediente del inventario" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems
                            .filter(item => item.id === formData.inventory_item_id)
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name} ({item.sku})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity_per_unit">Cantidad por Unidad *</Label>
                      <Input
                        id="quantity_per_unit"
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={formData.quantity_per_unit}
                        onChange={(e) => setFormData({ ...formData, quantity_per_unit: parseFloat(e.target.value) || 0 })}
                        placeholder="Ej: 0.5 (para 0.5 unidades por producto)"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Cantidad del ingrediente necesaria para producir 1 unidad del producto
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notas (opcional)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Observaciones sobre esta receta..."
                      />
                    </div>
                  </>
                ) : (
                  // Modo creación: mostrar selección múltiple
                  <>
                    <div>
                      <Label>Seleccionar Ingredientes *</Label>
                      <Card className="mt-2 max-h-64 overflow-y-auto">
                        <CardContent className="p-4">
                          {getAvailableInventoryItems(formData.product_id).length === 0 ? (
                            <div className="text-center py-4">
                              <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                {formData.product_id
                                  ? 'Todos los ingredientes ya están asignados a este producto'
                                  : 'Selecciona un producto primero'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {getAvailableInventoryItems(formData.product_id).map((item) => {
                                const isSelected = selectedIngredients.some(
                                  ing => ing.inventory_item_id === item.id
                                );
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <Checkbox
                                      id={`ingredient-${item.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => handleIngredientToggle(item.id)}
                                    />
                                    <Label
                                      htmlFor={`ingredient-${item.id}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="font-medium">{item.name}</div>
                                      <div className="text-sm text-gray-500">
                                        SKU: {item.sku} | Stock: {item.current_stock} {item.unit}
                                      </div>
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Lista de ingredientes seleccionados con cantidades */}
                    {selectedIngredients.length > 0 && (
                      <div>
                        <Label>Ingredientes Seleccionados ({selectedIngredients.length})</Label>
                        <div className="mt-2 space-y-3">
                          {selectedIngredients.map((selectedIng) => {
                            const item = inventoryItems.find(i => i.id === selectedIng.inventory_item_id);
                            if (!item) return null;

                            return (
                              <Card key={selectedIng.inventory_item_id} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">{item.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {item.sku} | {item.unit}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleIngredientToggle(selectedIng.inventory_item_id)}
                                      className="text-[#9d627b] hover:text-[#8d526b]"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div>
                                    <Label htmlFor={`qty-${selectedIng.inventory_item_id}`} className="text-sm">
                                      Cantidad por Unidad *
                                    </Label>
                                    <Input
                                      id={`qty-${selectedIng.inventory_item_id}`}
                                      type="number"
                                      step="0.0001"
                                      min="0.0001"
                                      value={selectedIng.quantity_per_unit || ''}
                                      onChange={(e) =>
                                        handleIngredientQuantityChange(
                                          selectedIng.inventory_item_id,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      placeholder="Ej: 0.5"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`notes-${selectedIng.inventory_item_id}`} className="text-sm">
                                      Notas (opcional)
                                    </Label>
                                    <Input
                                      id={`notes-${selectedIng.inventory_item_id}`}
                                      value={selectedIng.notes}
                                      onChange={(e) =>
                                        handleIngredientNotesChange(
                                          selectedIng.inventory_item_id,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Observaciones..."
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#7d8768] hover:bg-[#6a7559]"
                  disabled={createMutation.isPending || createBatchMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || createBatchMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    editingRecipe ? 'Actualizar' : `Crear ${selectedIngredients.length > 0 ? `${selectedIngredients.length} ${selectedIngredients.length === 1 ? 'receta' : 'recetas'}` : 'Receta'}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminRecipes;

