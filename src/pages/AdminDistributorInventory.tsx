import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Trash2,
  Loader2,
  Package,
  Search,
  Store,
  History,
  ArrowUp,
  ArrowDown,
  Calendar,
  Truck,
  RotateCcw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDistributors } from '@/hooks/useAdminDistributors';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import {
  useDistributorStock,
  useDistributorInventoryMovements,
  useCreateDistributorInventoryMovement,
  useDeleteDistributorInventoryMovement,
  DistributorStock,
  DistributorInventoryMovement
} from '@/hooks/useAdminDistributorInventory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminDistributorInventory: React.FC = () => {
  const { user } = useAuth();

  // Estados para filtros
  const [filterDistributor, setFilterDistributor] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para diálogo de movimiento
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<DistributorStock | null>(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [movementFormData, setMovementFormData] = useState({
    movement_type: 'envio' as 'envio' | 'devolucion',
    quantity: 0,
    notes: '',
    movement_date: new Date().toISOString().split('T')[0],
  });

  // Estados para diálogo de historial
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedStockForHistory, setSelectedStockForHistory] = useState<DistributorStock | null>(null);

  // Fetch datos
  const { data: distributors = [] } = useAdminDistributors();
  const { data: products = [] } = useAdminProducts();
  const { data: stock = [], isLoading: stockLoading } = useDistributorStock({
    distributorId: filterDistributor !== 'all' ? parseInt(filterDistributor) : undefined,
    productId: filterProduct !== 'all' ? parseInt(filterProduct) : undefined,
  });

  // Fetch movimientos para historial
  const { data: historyMovements = [], isLoading: historyLoading } = useDistributorInventoryMovements(
    selectedStockForHistory ? {
      distributorId: selectedStockForHistory.distributor_id,
      productId: selectedStockForHistory.product_id,
    } : undefined
  );

  const createMovementMutation = useCreateDistributorInventoryMovement();
  const deleteMovementMutation = useDeleteDistributorInventoryMovement();

  // Filtrar stock por búsqueda
  const filteredStock = useMemo(() => {
    let filtered = stock;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.product_name.toLowerCase().includes(query) ||
        s.product_sku.toLowerCase().includes(query) ||
        s.distributor_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [stock, searchQuery]);

  // KPIs
  const kpis = useMemo(() => {
    const totalDistributors = new Set(stock.map(s => s.distributor_id)).size;
    const totalProducts = new Set(stock.map(s => s.product_id)).size;
    const totalStock = stock.reduce((sum, s) => sum + s.current_stock, 0);
    const totalSent = stock.reduce((sum, s) => sum + s.total_sent, 0);
    const totalReturned = stock.reduce((sum, s) => sum + s.total_returned, 0);

    return {
      totalDistributors,
      totalProducts,
      totalStock,
      totalSent,
      totalReturned,
    };
  }, [stock]);

  const handleOpenMovementDialog = (stockItem: DistributorStock | null, type: 'envio' | 'devolucion', distributorId?: number, productId?: number) => {
    if (stockItem) {
      setSelectedStock(stockItem);
      setSelectedDistributorId(null);
      setSelectedProductId(null);
    } else {
      setSelectedStock(null);
      setSelectedDistributorId(distributorId || null);
      setSelectedProductId(productId || null);
    }
    setMovementFormData({
      movement_type: type,
      quantity: 0,
      notes: '',
      movement_date: new Date().toISOString().split('T')[0],
    });
    setMovementDialogOpen(true);
  };

  const handleOpenHistoryDialog = (stockItem: DistributorStock) => {
    setSelectedStockForHistory(stockItem);
    setHistoryDialogOpen(true);
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Error', { description: 'No se pudo identificar al usuario' });
      return;
    }

    const distributorId = selectedStock?.distributor_id || selectedDistributorId;
    const productId = selectedStock?.product_id || selectedProductId;

    if (!distributorId || !productId) {
      toast.error('Error', { description: 'Debes seleccionar un distribuidor y un producto' });
      return;
    }

    if (movementFormData.quantity <= 0) {
      toast.error('Error', { description: 'La cantidad debe ser mayor a 0' });
      return;
    }

    try {
      await createMovementMutation.mutateAsync({
        distributor_id: distributorId,
        product_id: productId,
        movement_type: movementFormData.movement_type,
        quantity: movementFormData.quantity,
        notes: movementFormData.notes || null,
        movement_date: movementFormData.movement_date,
        created_by: user.id,
      });
      setMovementDialogOpen(false);
      setSelectedStock(null);
      setSelectedDistributorId(null);
      setSelectedProductId(null);
    } catch (error) {
      console.error('Error submitting movement:', error);
    }
  };

  const handleDeleteMovement = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.')) {
      try {
        await deleteMovementMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting movement:', error);
      }
    }
  };

  const getMovementTypeInfo = (type: 'envio' | 'devolucion') => {
    if (type === 'envio') {
      return { label: 'Envío', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-50' };
    } else {
      return { label: 'Devolución', icon: RotateCcw, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
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
          title="Inventario de Distribuidores"
          description="Gestiona el stock de productos en cada distribuidor"
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Distribuidores</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{kpis.totalDistributors}</p>
                </div>
                <Store className="h-6 w-6 md:h-8 md:w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Productos</p>
                  <p className="text-xl md:text-2xl font-bold text-[#7d8768]">{kpis.totalProducts}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Stock Total</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{kpis.totalStock.toFixed(0)}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Enviado</p>
                  <p className="text-xl md:text-2xl font-bold text-indigo-600">{kpis.totalSent.toFixed(0)}</p>
                </div>
                <Truck className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Devuelto</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{kpis.totalReturned.toFixed(0)}</p>
                </div>
                <RotateCcw className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
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
                  placeholder="Buscar por producto, SKU o distribuidor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10"
                />
              </div>
              <Select value={filterDistributor} onValueChange={setFilterDistributor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Distribuidor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los distribuidores</SelectItem>
                  {distributors.map((distributor) => (
                    <SelectItem key={distributor.id} value={distributor.id.toString()}>
                      {distributor.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={() => handleOpenMovementDialog(null, 'envio')}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nuevo Envío</span>
                  <span className="sm:hidden">Envío</span>
                </Button>
                <Button
                  onClick={() => handleOpenMovementDialog(null, 'devolucion')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nueva Devolución</span>
                  <span className="sm:hidden">Devolución</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Stock */}
        {stockLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7d8768]" />
            <p className="text-gray-600 mt-2">Cargando inventario...</p>
          </Card>
        ) : filteredStock.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay stock registrado</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterDistributor !== 'all' || filterProduct !== 'all'
                ? 'No hay stock registrado para los filtros seleccionados.'
                : 'Aún no se han registrado movimientos de inventario. Comienza registrando un envío o devolución.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => handleOpenMovementDialog(null, 'envio')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Truck className="h-4 w-4 mr-2" />
                Registrar Primer Envío
              </Button>
              <Button
                onClick={() => handleOpenMovementDialog(null, 'devolucion')}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Registrar Primera Devolución
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distribuidor</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Total Enviado</TableHead>
                    <TableHead className="text-right">Total Devuelto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((stockItem) => (
                    <TableRow key={`${stockItem.distributor_id}-${stockItem.product_id}`}>
                      <TableCell className="font-medium">{stockItem.distributor_name}</TableCell>
                      <TableCell>{stockItem.product_name}</TableCell>
                      <TableCell className="font-mono text-sm">{stockItem.product_sku}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            stockItem.current_stock > 0
                              ? 'border-green-300 text-green-700 bg-green-50'
                              : 'border-gray-300 text-gray-700 bg-gray-50'
                          }
                        >
                          {stockItem.current_stock.toFixed(0)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{stockItem.total_sent.toFixed(0)}</TableCell>
                      <TableCell className="text-right">{stockItem.total_returned.toFixed(0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenHistoryDialog(stockItem)}
                            title="Ver historial"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenMovementDialog(stockItem, 'envio')}
                            title="Registrar envío"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenMovementDialog(stockItem, 'devolucion')}
                            title="Registrar devolución"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <RotateCcw className="h-4 w-4" />
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
              {filteredStock.map((stockItem) => (
                <Card key={`${stockItem.distributor_id}-${stockItem.product_id}`} className={`border-l-4 ${stockItem.current_stock > 0 ? 'border-l-green-500' : 'border-l-gray-400'}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1">{stockItem.product_name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{stockItem.distributor_name}</p>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded block w-fit mb-2">{stockItem.product_sku}</code>
                          <Badge
                            variant="outline"
                            className={
                              stockItem.current_stock > 0
                                ? 'border-green-300 text-green-700 bg-green-50 text-xs'
                                : 'border-gray-300 text-gray-700 bg-gray-50 text-xs'
                            }
                          >
                            Stock: {stockItem.current_stock.toFixed(0)}
                          </Badge>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600"
                            onClick={() => handleOpenHistoryDialog(stockItem)}
                            title="Ver historial"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => handleOpenMovementDialog(stockItem, 'envio')}
                            title="Registrar envío"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleOpenMovementDialog(stockItem, 'devolucion')}
                            title="Registrar devolución"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="pt-2 border-t space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground">Total Enviado:</span>
                            <p className="font-semibold text-sm">{stockItem.total_sent.toFixed(0)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Total Devuelto:</span>
                            <p className="font-semibold text-sm">{stockItem.total_returned.toFixed(0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Dialog para registrar movimiento */}
        <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-editorial-new">
                {movementFormData.movement_type === 'envio' ? 'Registrar Envío' : 'Registrar Devolución'}
                {selectedStock && ` - ${selectedStock.product_name}`}
              </DialogTitle>
              <DialogDescription>
                {selectedStock
                  ? movementFormData.movement_type === 'envio'
                    ? `Registra un envío de productos a ${selectedStock.distributor_name}`
                    : `Registra una devolución de productos de ${selectedStock.distributor_name}`
                  : movementFormData.movement_type === 'envio'
                  ? 'Registra un nuevo envío de productos a un distribuidor'
                  : 'Registra una nueva devolución de productos de un distribuidor'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitMovement} className="space-y-4">
              {!selectedStock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distributor">Distribuidor *</Label>
                    <Select
                      value={selectedDistributorId?.toString() || ''}
                      onValueChange={(value) => setSelectedDistributorId(parseInt(value))}
                      required
                    >
                      <SelectTrigger id="distributor">
                        <SelectValue placeholder="Selecciona un distribuidor" />
                      </SelectTrigger>
                      <SelectContent>
                        {distributors.map((distributor) => (
                          <SelectItem key={distributor.id} value={distributor.id.toString()}>
                            {distributor.store_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product">Producto *</Label>
                    <Select
                      value={selectedProductId?.toString() || ''}
                      onValueChange={(value) => setSelectedProductId(parseInt(value))}
                      required
                    >
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={movementFormData.notes}
                  onChange={(e) => setMovementFormData({ ...movementFormData, notes: e.target.value })}
                  rows={3}
                  placeholder="Información adicional sobre el movimiento..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMovementDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMovementMutation.isPending} className="bg-[#7d8768] hover:bg-[#6a7559]">
                  {createMovementMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Registrar {movementFormData.movement_type === 'envio' ? 'Envío' : 'Devolución'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para ver historial */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-4xl w-[95vw] md:w-full max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="font-editorial-new">
                Historial - {selectedStockForHistory?.product_name} en {selectedStockForHistory?.distributor_name}
              </DialogTitle>
              <DialogDescription>
                Historial completo de envíos y devoluciones
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
                    No se han registrado movimientos para este producto y distribuidor.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyMovements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.movement_type);
                    const Icon = typeInfo.icon;
                    const isEnvio = movement.movement_type === 'envio';

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
                                <span className={`font-semibold ${isEnvio ? 'text-blue-600' : 'text-green-600'}`}>
                                  {isEnvio ? '+' : '-'}{movement.quantity.toFixed(0)} unidades
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
                                {movement.notes && (
                                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    {movement.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMovement(movement.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
              <Button type="button" variant="outline" onClick={() => setHistoryDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDistributorInventory;

