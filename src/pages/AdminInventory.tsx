import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Warehouse,
  History,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminInventoryItems,
  useAdminInventoryMovements,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useCreateInventoryMovement,
  InventoryItem,
  InventoryMovement,
  CreateInventoryItemData
} from '@/hooks/useAdminInventory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminInventory: React.FC = () => {
  const { user } = useAuth();

  // Estados para filtros
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para diálogo de items
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemFormData, setItemFormData] = useState<CreateInventoryItemData & { initial_stock?: number; current_stock?: number }>({
    name: '',
    sku: '',
    category: '',
    unit: 'unidad',
    description: '',
    min_stock: 0,
    cost_per_unit: 0,
    supplier: '',
    location: '',
    expiry_tracking: false,
    notes: '',
    active: true,
    initial_stock: 0,
  });

  // Estados para diálogo de movimientos
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [movementFormData, setMovementFormData] = useState({
    movement_type: 'entrada' as InventoryMovement['movement_type'],
    quantity: 0,
    unit_cost: 0,
    notes: '',
    movement_date: new Date().toISOString().split('T')[0],
  });

  // Estados para diálogo de historial
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);

  // Fetch items
  const { data: items = [], isLoading } = useAdminInventoryItems({
    category: filterCategory !== 'all' ? filterCategory : undefined,
    active: filterActive,
    lowStock: lowStockFilter,
    searchQuery: searchQuery || undefined,
  });

  // Fetch movimientos (solo si hay item seleccionado para movimiento)
  const { data: movements = [] } = useAdminInventoryMovements(
    selectedItemForMovement ? { inventoryItemId: selectedItemForMovement.id } : undefined
  );

  // Fetch movimientos para historial
  const { data: historyMovements = [], isLoading: historyLoading } = useAdminInventoryMovements(
    selectedItemForHistory ? { inventoryItemId: selectedItemForHistory.id } : undefined
  );

  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();
  const deleteItemMutation = useDeleteInventoryItem();
  const createMovementMutation = useCreateInventoryMovement();

  // KPIs
  const kpis = useMemo(() => {
    const total = items.length;
    const active = items.filter(i => i.active).length;
    const lowStock = items.filter(i => i.current_stock <= i.min_stock && i.active).length;
    const totalValue = items.reduce((sum, i) => sum + (i.current_stock * i.cost_per_unit), 0);
    const totalStock = items.reduce((sum, i) => sum + i.current_stock, 0);

    return {
      total,
      active,
      lowStock,
      totalValue,
      totalStock,
    };
  }, [items]);

  const unitOptions = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'kg', label: 'Kilogramo (kg)' },
    { value: 'g', label: 'Gramo (g)' },
    { value: 'L', label: 'Litro (L)' },
    { value: 'mL', label: 'Mililitro (mL)' },
    { value: 'm', label: 'Metro (m)' },
    { value: 'cm', label: 'Centímetro (cm)' },
    { value: 'caja', label: 'Caja' },
    { value: 'bolsa', label: 'Bolsa' },
  ];

  const movementTypeOptions = [
    { value: 'entrada', label: 'Entrada', icon: TrendingUp, color: 'text-[#7d8768]' },
    { value: 'salida', label: 'Salida', icon: TrendingDown, color: 'text-[#9d627b]' },
    { value: 'ajuste', label: 'Ajuste', icon: Package, color: 'text-[#7d8768]' },
    { value: 'produccion', label: 'Producción', icon: Package, color: 'text-[#9d627b]' },
    { value: 'venta', label: 'Venta', icon: TrendingDown, color: 'text-[#7a7539]' },
    { value: 'perdida', label: 'Pérdida', icon: TrendingDown, color: 'text-gray-600' },
  ];

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
    return cats.sort();
  }, [items]);

  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      sku: '',
      category: '',
      unit: 'unidad',
      description: '',
      min_stock: 0,
      current_stock: 0,
      cost_per_unit: 0,
      supplier: '',
      location: '',
      expiry_tracking: false,
      notes: '',
      active: true,
      initial_stock: 0,
    });
    setItemDialogOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      sku: item.sku,
      category: item.category || '',
      unit: item.unit,
      description: item.description || '',
      min_stock: item.min_stock,
      current_stock: item.current_stock,
      cost_per_unit: item.cost_per_unit,
      supplier: item.supplier || '',
      location: item.location || '',
      expiry_tracking: item.expiry_tracking,
      notes: item.notes || '',
      active: item.active,
      initial_stock: item.current_stock,
    });
    setItemDialogOpen(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Error', { description: 'No se pudo identificar al usuario' });
      return;
    }

    const { initial_stock, current_stock, ...itemData } = itemFormData;
    const submitData = {
      ...itemData,
      category: itemData.category || null,
      description: itemData.description || null,
      supplier: itemData.supplier || null,
      location: itemData.location || null,
      notes: itemData.notes || null,
    };

    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          ...submitData,
        });
      } else {
        // Crear el item
        const newItem = await createItemMutation.mutateAsync({
          ...submitData,
          created_by: user.id,
        });

        // Si hay stock inicial, crear un movimiento de ajuste
        if (initial_stock && initial_stock > 0) {
          try {
            await createMovementMutation.mutateAsync({
              inventory_item_id: newItem.id,
              movement_type: 'ajuste',
              quantity: initial_stock,
              unit_cost: itemData.cost_per_unit || null,
              notes: 'Stock inicial',
              movement_date: new Date().toISOString().split('T')[0],
              created_by: user.id,
            });
          } catch (movementError) {
            console.error('Error creating initial stock movement:', movementError);
            toast.warning('Item creado pero no se pudo registrar el stock inicial. Puedes registrarlo manualmente.');
          }
        }
      }
      setItemDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error submitting item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este item? Esta acción no se puede deshacer.')) {
      try {
        await deleteItemMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleOpenMovementDialog = (item: InventoryItem) => {
    setSelectedItemForMovement(item);
    setMovementFormData({
      movement_type: 'entrada',
      quantity: 0,
      unit_cost: item.cost_per_unit,
      notes: '',
      movement_date: new Date().toISOString().split('T')[0],
    });
    setMovementDialogOpen(true);
  };

  const handleOpenHistoryDialog = (item: InventoryItem) => {
    setSelectedItemForHistory(item);
    setHistoryDialogOpen(true);
  };

  const getMovementTypeInfo = (type: InventoryMovement['movement_type']) => {
    switch (type) {
      case 'entrada':
        return { label: 'Entrada', icon: ArrowUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
      case 'salida':
        return { label: 'Salida', icon: ArrowDown, color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'ajuste':
        return { label: 'Ajuste', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'produccion':
        return { label: 'Producción', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'venta':
        return { label: 'Venta', icon: TrendingDown, color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
      case 'perdida':
        return { label: 'Pérdida', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50' };
      default:
        return { label: type, icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !selectedItemForMovement) {
      toast.error('Error', { description: 'No se pudo identificar al usuario o el item' });
      return;
    }

    if (movementFormData.quantity <= 0) {
      toast.error('Error', { description: 'La cantidad debe ser mayor a 0' });
      return;
    }

    try {
      await createMovementMutation.mutateAsync({
        inventory_item_id: selectedItemForMovement.id,
        movement_type: movementFormData.movement_type,
        quantity: movementFormData.quantity,
        unit_cost: movementFormData.unit_cost || null,
        notes: movementFormData.notes || null,
        movement_date: movementFormData.movement_date,
        created_by: user.id,
      });
      setMovementDialogOpen(false);
      setSelectedItemForMovement(null);
    } catch (error) {
      console.error('Error submitting movement:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= item.min_stock) {
      return { label: 'Stock Bajo', color: 'bg-red-100 text-red-800 border-red-300' };
    } else if (item.current_stock <= item.min_stock * 1.5) {
      return { label: 'Atención', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    return { label: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
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
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title="Materia Prima BC"
          description="Gestiona el inventario de productos internos e ingredientes (materia prima)"
          actionButton={{
            label: "Nuevo Item",
            onClick: handleOpenCreateItem,
            icon: Plus
          }}
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
                </div>
                <Package className="h-8 w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-[#7d8768]">{kpis.active}</p>
                </div>
                <Warehouse className="h-8 w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-[#9d627b]">{kpis.lowStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-[#9d627b]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(kpis.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock Total</p>
                  <p className="text-2xl font-bold text-[#7d8768]">{kpis.totalStock.toFixed(2)}</p>
                </div>
                <Package className="h-8 w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por nombre, SKU, proveedor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
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
              <Select 
                value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'} 
                onValueChange={(val) => setFilterActive(val === 'all' ? undefined : val === 'active')}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={lowStockFilter ? 'default' : 'outline'}
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className={lowStockFilter ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stock Bajo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7d8768]" />
            <p className="text-gray-600 mt-2">Cargando inventario...</p>
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No hay items en el inventario.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Costo Unit.</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.category || '-'}</TableCell>
                        <TableCell>
                          <span className={item.current_stock <= item.min_stock ? 'font-bold text-red-600' : ''}>
                            {item.current_stock.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>{item.min_stock.toFixed(2)}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatCurrency(item.cost_per_unit)}</TableCell>
                        <TableCell>{formatCurrency(item.current_stock * item.cost_per_unit)}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                          {!item.active && (
                            <Badge variant="outline" className="ml-2">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenHistoryDialog(item)}
                              title="Ver historial"
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenMovementDialog(item)}
                              title="Registrar movimiento"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Dialog para crear/editar item */}
        <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-editorial-new">
                {editingItem ? 'Editar Item' : 'Nuevo Item de Inventario'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Actualiza la información del item' : 'Completa la información para crear un nuevo item'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={itemFormData.sku}
                    onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    placeholder="Ej: Ingrediente, Empaque, Material"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidad *</Label>
                  <Select
                    value={itemFormData.unit}
                    onValueChange={(value: InventoryItem['unit']) =>
                      setItemFormData({ ...itemFormData, unit: value })
                    }
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min_stock">Stock Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemFormData.min_stock}
                    onChange={(e) => setItemFormData({ ...itemFormData, min_stock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  {editingItem ? (
                    <>
                      <Label htmlFor="current_stock">Stock Actual</Label>
                      <Input
                        id="current_stock"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingItem.current_stock || 0}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        El stock actual se calcula automáticamente desde los movimientos
                      </p>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="initial_stock">Stock Inicial</Label>
                      <Input
                        id="initial_stock"
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemFormData.initial_stock || 0}
                        onChange={(e) => setItemFormData({ ...itemFormData, initial_stock: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Stock inicial del item (opcional)
                      </p>
                    </>
                  )}
                </div>
                <div>
                  <Label htmlFor="cost_per_unit">Costo por Unidad</Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemFormData.cost_per_unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={itemFormData.active}
                  onChange={(e) => setItemFormData({ ...itemFormData, active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="active">Activo</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Proveedor</Label>
                  <Input
                    id="supplier"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={itemFormData.location}
                    onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                    placeholder="Ej: Almacén A, Estante 3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={itemFormData.notes}
                  onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#7d8768] hover:bg-[#6a7559]">
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para registrar movimiento */}
        <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-editorial-new">
                Registrar Movimiento - {selectedItemForMovement?.name}
              </DialogTitle>
              <DialogDescription>
                Registra una entrada o salida de inventario para este item
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="movement_type">Tipo de Movimiento *</Label>
                  <Select
                    value={movementFormData.movement_type}
                    onValueChange={(value: InventoryMovement['movement_type']) =>
                      setMovementFormData({ ...movementFormData, movement_type: value })
                    }
                  >
                    <SelectTrigger id="movement_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {movementTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="movement_date">Fecha *</Label>
                  <Input
                    id="movement_date"
                    type="date"
                    value={movementFormData.movement_date}
                    onChange={(e) => setMovementFormData({ ...movementFormData, movement_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={movementFormData.quantity}
                    onChange={(e) => setMovementFormData({ ...movementFormData, quantity: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="unit_cost">Costo Unitario (opcional)</Label>
                    {selectedItemForMovement?.cost_per_unit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-[#7d8768] hover:text-[#6a7559]"
                        onClick={() => setMovementFormData({ 
                          ...movementFormData, 
                          unit_cost: selectedItemForMovement.cost_per_unit 
                        })}
                      >
                        Usar costo actual ({formatCurrency(selectedItemForMovement.cost_per_unit)})
                      </Button>
                    )}
                  </div>
                  <Input
                    id="unit_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={movementFormData.unit_cost}
                    onChange={(e) => setMovementFormData({ ...movementFormData, unit_cost: parseFloat(e.target.value) || 0 })}
                    placeholder={selectedItemForMovement?.cost_per_unit ? formatCurrency(selectedItemForMovement.cost_per_unit) : '0.00'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Útil para registrar el costo real del momento (puede diferir del costo promedio del item)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={movementFormData.notes}
                  onChange={(e) => setMovementFormData({ ...movementFormData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMovementDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#7d8768] hover:bg-[#6a7559]">
                  Registrar Movimiento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para ver historial de movimientos */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="font-editorial-new">
                Historial de Movimientos - {selectedItemForHistory?.name}
              </DialogTitle>
              <DialogDescription>
                Historial completo de entradas, salidas y ajustes de inventario
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#7d8768]" />
                  <p className="ml-3 text-gray-600">Cargando historial...</p>
                </div>
              ) : historyMovements.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay movimientos</h3>
                  <p className="text-gray-600">
                    Este item aún no tiene movimientos registrados en el inventario.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyMovements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.movement_type);
                    const Icon = typeInfo.icon;
                    const isPositive = movement.movement_type === 'entrada' || movement.movement_type === 'ajuste';
                    
                    return (
                      <Card key={movement.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                              <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={typeInfo.bgColor + ' ' + typeInfo.color}>
                                  {typeInfo.label}
                                </Badge>
                                <span className={`font-semibold ${isPositive ? 'text-[#7d8768]' : 'text-[#9d627b]'}`}>
                                  {isPositive ? '+' : '-'}{movement.quantity.toFixed(2)} {selectedItemForHistory?.unit || 'unidad'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {format(new Date(movement.movement_date), 'dd/MM/yyyy', { locale: es })}
                                  </span>
                                  {movement.created_at && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>
                                        {format(new Date(movement.created_at), 'HH:mm', { locale: es })}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {movement.batch && (
                                  <div className="flex items-center gap-2">
                                    <Package className="h-3 w-3" />
                                    <span>Batch: {movement.batch.batch_number}</span>
                                  </div>
                                )}
                                {movement.reference_type && movement.reference_id && (
                                  <div className="text-xs text-gray-500">
                                    Referencia: {movement.reference_type} #{movement.reference_id}
                                  </div>
                                )}
                                {movement.unit_cost && movement.unit_cost > 0 && (
                                  <div className="text-xs text-gray-500">
                                    Costo unitario: {formatCurrency(movement.unit_cost)}
                                  </div>
                                )}
                                {movement.notes && (
                                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    {movement.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-600">
                  {historyMovements.length > 0 && (
                    <span>
                      Total de movimientos: {historyMovements.length}
                    </span>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setHistoryDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;

