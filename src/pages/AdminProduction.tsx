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
import { 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Package,
  Factory,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminProductionBatches, 
  useCreateProductionBatch, 
  useUpdateProductionBatch, 
  useDeleteProductionBatch,
  ProductionBatch,
  CreateProductionBatchData
} from '@/hooks/useAdminProduction';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminProduction: React.FC = () => {
  const { user } = useAuth();

  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<string>('all');

  // Estados para diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [formData, setFormData] = useState<CreateProductionBatchData>({
    product_id: null,
    quantity: 1,
    production_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'en_produccion',
    location: '',
    notes: '',
  });

  // Fetch products para dropdown
  const { data: products = [] } = useAdminProducts();

  // Función para calcular fechas basadas en el rango seleccionado
  const getDateRange = (range: string): { startDate?: string; endDate?: string } => {
    if (range === 'all') {
      return {};
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date(now);

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        startDate.setMonth(now.getMonth() - 12);
        break;
      default:
        return {};
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const dateRangeObj = useMemo(() => getDateRange(dateRange), [dateRange]);

  // Fetch batches con filtros
  const { data: batches = [], isLoading } = useAdminProductionBatches({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    productId: filterProduct !== 0 ? filterProduct : undefined,
    searchQuery: searchQuery || undefined,
    dateFrom: dateRangeObj.startDate,
    dateTo: dateRangeObj.endDate,
  });

  const createMutation = useCreateProductionBatch();
  const updateMutation = useUpdateProductionBatch();
  const deleteMutation = useDeleteProductionBatch();

  // KPIs
  const kpis = useMemo(() => {
    const total = batches.length;
    const enProduccion = batches.filter(b => b.status === 'en_produccion').length;
    const completados = batches.filter(b => b.status === 'completado').length;
    const totalCantidad = batches.reduce((sum, b) => sum + b.quantity, 0);
    const enAlmacen = batches.filter(b => b.status === 'en_almacen').length;
    const agotados = batches.filter(b => b.status === 'agotado').length;

    return {
      total,
      enProduccion,
      completados,
      totalCantidad,
      enAlmacen,
      agotados,
    };
  }, [batches]);

  const statusOptions = [
    { value: 'en_produccion', label: 'En Producción', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'completado', label: 'Completado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'en_almacen', label: 'En Almacén', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { value: 'agotado', label: 'Agotado', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Todos los períodos' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Último mes' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '12m', label: 'Últimos 12 meses' },
  ];

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setFormData({
      product_id: null,
      quantity: 1,
      production_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      status: 'en_produccion',
      location: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (batch: ProductionBatch) => {
    setEditingBatch(batch);
    setFormData({
      batch_number: batch.batch_number,
      product_id: batch.product_id,
      quantity: batch.quantity,
      production_date: batch.production_date,
      expiry_date: batch.expiry_date || '',
      status: batch.status,
      location: batch.location || '',
      notes: batch.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Error', { description: 'No se pudo identificar al usuario' });
      return;
    }

    const submitData = {
      ...formData,
      expiry_date: formData.expiry_date || null,
      location: formData.location || null,
      notes: formData.notes || null,
    };

    try {
      if (editingBatch) {
        await updateMutation.mutateAsync({
          id: editingBatch.id,
          ...submitData,
        });
      } else {
        await createMutation.mutateAsync({
          ...submitData,
          created_by: user.id,
        });
      }
      setDialogOpen(false);
      setEditingBatch(null);
    } catch (error) {
      console.error('Error submitting batch:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este batch?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
  };

  const getStatusBadge = (status: ProductionBatch['status']) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusOption?.color || 'bg-gray-100 text-gray-800'}>
        {statusOption?.label || status}
      </Badge>
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
          title="Producción"
          description="Gestiona los batches de producción de productos"
          actionButton={{
            label: "Nuevo Batch",
            onClick: handleOpenCreate,
            icon: Plus
          }}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Batches</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{kpis.total}</p>
                </div>
                <Factory className="h-6 w-6 md:h-8 md:w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">En Producción</p>
                  <p className="text-xl md:text-2xl font-bold text-[#7a7539]">{kpis.enProduccion}</p>
                </div>
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-[#7a7539]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Completados</p>
                  <p className="text-xl md:text-2xl font-bold text-[#7d8768]">{kpis.completados}</p>
                </div>
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">En Almacén</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{kpis.enAlmacen}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Agotados</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-600">{kpis.agotados}</p>
                </div>
                <XCircle className="h-6 w-6 md:h-8 md:w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Cantidad</p>
                  <p className="text-xl md:text-2xl font-bold text-[#7d8768]">{kpis.totalCantidad.toLocaleString()}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                <Input
                  placeholder="Buscar por número de lote, producto, ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProduct.toString()} onValueChange={(val) => setFilterProduct(parseInt(val))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Producto" />
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
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7d8768]" />
            <p className="text-gray-600 mt-2">Cargando batches...</p>
          </Card>
        ) : batches.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No hay batches de producción registrados.</p>
          </Card>
        ) : (
          <Card>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Lote</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Fecha Producción</TableHead>
                    <TableHead>Fecha Caducidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batch_number}</TableCell>
                      <TableCell>
                        {batch.product ? (
                          <div>
                            <div className="font-medium">{batch.product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {batch.product.sku}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin producto</span>
                        )}
                      </TableCell>
                      <TableCell>{batch.quantity.toLocaleString()}</TableCell>
                      <TableCell>
                        {format(new Date(batch.production_date), 'd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {batch.expiry_date
                          ? format(new Date(batch.expiry_date), 'd MMM yyyy', { locale: es })
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>{batch.location || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(batch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(batch.id)}
                            className="text-red-600 hover:text-red-700"
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
            <div className="lg:hidden p-4 space-y-3">
              {batches.map((batch) => (
                <Card key={batch.id} className="border-l-4 border-l-[#7d8768]">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1">{batch.batch_number}</h3>
                          {batch.product ? (
                            <div className="mb-2">
                              <p className="font-medium text-sm">{batch.product.name}</p>
                              <p className="text-xs text-gray-500">SKU: {batch.product.sku}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mb-2">Sin producto</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(batch)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleDelete(batch.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Cantidad:</span>
                          <span className="font-semibold text-sm">{batch.quantity.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Estado:</span>
                          <div>{getStatusBadge(batch.status)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Fecha Producción:</span>
                          <span className="text-xs font-medium">
                            {format(new Date(batch.production_date), 'd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                        {batch.expiry_date && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Fecha Caducidad:</span>
                            <span className="text-xs font-medium">
                              {format(new Date(batch.expiry_date), 'd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                        )}
                        {batch.location && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Ubicación:</span>
                            <span className="text-xs font-medium">{batch.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Dialog para crear/editar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-editorial-new">
                {editingBatch ? 'Editar Batch' : 'Nuevo Batch de Producción'}
              </DialogTitle>
              <DialogDescription>
                {editingBatch
                  ? 'Actualiza la información del batch'
                  : 'Completa la información para crear un nuevo batch'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_id">Producto *</Label>
                  <Select
                    value={formData.product_id?.toString() || 'none'}
                    onValueChange={(val) => setFormData({ ...formData, product_id: val === 'none' ? null : parseInt(val) })}
                  >
                    <SelectTrigger id="product_id">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin producto</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="production_date">Fecha de Producción *</Label>
                  <Input
                    id="production_date"
                    type="date"
                    value={formData.production_date}
                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Fecha de Caducidad</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ProductionBatch['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Almacén A, Estante 3"
                  />
                </div>
              </div>

              {editingBatch && (
                <div>
                  <Label htmlFor="batch_number">Número de Lote</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Observaciones o notas sobre este batch..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#7d8768] hover:bg-[#6a7559]">
                  {editingBatch ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProduction;

